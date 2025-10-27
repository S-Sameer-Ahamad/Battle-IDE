import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyFriendRequest, notifyFriendRequestAccepted } from '@/lib/notifications'
import { battleSocket } from '@/lib/socket-server'

// GET: Fetch friend requests for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'received' // received, sent, or accepted

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let friendRequests

    if (type === 'accepted') {
      // Get accepted friend requests (friends list)
      friendRequests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId, status: 'accepted' },
            { receiverId: userId, status: 'accepted' },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              elo: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              elo: true,
            },
          },
        },
      })

      // Map to friends list
      const friends = friendRequests.map((req) => {
        const friend = req.senderId === userId ? req.receiver : req.sender
        return {
          id: friend.id,
          username: friend.username,
          elo: friend.elo,
          online: false, // TODO: Implement real-time presence tracking
        }
      })

      return NextResponse.json({ friends })
    } else if (type === 'sent') {
      // Get sent requests
      friendRequests = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: 'pending',
        },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
              elo: true,
            },
          },
        },
      })

      const requests = friendRequests.map((req) => ({
        id: req.id,
        userId: req.receiver.id,
        username: req.receiver.username,
        elo: req.receiver.elo,
        createdAt: req.createdAt,
      }))

      return NextResponse.json({ requests })
    } else {
      // Get received requests
      friendRequests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'pending',
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              elo: true,
            },
          },
        },
      })

      const requests = friendRequests.map((req) => ({
        id: req.id,
        userId: req.sender.id,
        username: req.sender.username,
        elo: req.sender.elo,
        createdAt: req.createdAt,
      }))

      return NextResponse.json({ requests })
    }
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    )
  }
}

// POST: Send a friend request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId } = body

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if friend request already exists
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Friend request already exists' },
        { status: 400 }
      )
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    // Create notification for receiver with friend request ID
    try {
      await notifyFriendRequest(
        receiverId, 
        friendRequest.sender.username, 
        senderId,
        friendRequest.id
      )
    } catch (error) {
      console.error('Failed to create notification:', error)
    }

    // Emit Socket.IO event to notify receiver
    battleSocket.sendFriendRequestNotification(receiverId, {
      id: friendRequest.id,
      userId: friendRequest.sender.id,
      username: friendRequest.sender.username,
      senderUsername: friendRequest.sender.username,
      createdAt: friendRequest.createdAt,
    })

    return NextResponse.json({ friendRequest })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    )
  }
}

// PATCH: Accept or decline friend request
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, action } = body // action: 'accept' or 'decline'

    if (!requestId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Update friend request status
    const friendRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    // Create notification for sender if accepted
    if (action === 'accept') {
      try {
        await notifyFriendRequestAccepted(
          friendRequest.senderId,
          friendRequest.receiver.username,
          friendRequest.receiverId
        )
      } catch (error) {
        console.error('Failed to create notification:', error)
      }

      // Emit Socket.IO event to notify sender
      battleSocket.sendFriendRequestAccepted(friendRequest.senderId, {
        userId: friendRequest.receiver.id,
        username: friendRequest.receiver.username,
      })
    }

    return NextResponse.json({ friendRequest })
  } catch (error) {
    console.error('Error updating friend request:', error)
    return NextResponse.json(
      { error: 'Failed to update friend request' },
      { status: 500 }
    )
  }
}
