import { prisma } from './prisma'
import { battleSocket } from './socket-server'

interface CreateNotificationParams {
  userId: string
  type: 'friend_request' | 'match_invite' | 'match_result'
  title: string
  message: string
  data?: Record<string, any>
}

/**
 * Helper function to create a notification
 * This can be called from any API route or server function
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data ? JSON.stringify(params.data) : null,
      },
    })

    // Emit Socket.IO event to notify user in real-time
    battleSocket.sendNotificationToUser(params.userId, notification)

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Create notification for friend request received
 */
export async function notifyFriendRequest(
  receiverId: string, 
  senderUsername: string, 
  senderId: string,
  friendRequestId: string
) {
  return createNotification({
    userId: receiverId,
    type: 'friend_request',
    title: 'New friend request',
    message: `${senderUsername} wants to be friends`,
    data: { senderId, senderUsername, friendRequestId },
  })
}

/**
 * Create notification for friend request accepted
 */
export async function notifyFriendRequestAccepted(senderId: string, accepterUsername: string, accepterId: string) {
  return createNotification({
    userId: senderId,
    type: 'friend_request',
    title: 'Friend request accepted',
    message: `${accepterUsername} accepted your friend request`,
    data: { accepterId, accepterUsername },
  })
}

/**
 * Create notification for match invitation
 */
export async function notifyMatchInvite(receiverId: string, inviterUsername: string, matchId: string) {
  return createNotification({
    userId: receiverId,
    type: 'match_invite',
    title: 'Match invitation',
    message: `${inviterUsername} challenged you to a 1v1 battle`,
    data: { matchId, inviterUsername },
  })
}

/**
 * Create notification for match result
 */
export async function notifyMatchResult(
  userId: string,
  result: 'won' | 'lost' | 'draw',
  opponentUsername: string,
  eloChange: number,
  matchId: string
) {
  const titles = {
    won: 'Victory! 🏆',
    lost: 'Match completed',
    draw: 'Match drawn',
  }

  const messages = {
    won: `You won against ${opponentUsername} (${eloChange > 0 ? '+' : ''}${eloChange} ELO)`,
    lost: `You lost against ${opponentUsername} (${eloChange} ELO)`,
    draw: `Match against ${opponentUsername} ended in a draw`,
  }

  return createNotification({
    userId,
    type: 'match_result',
    title: titles[result],
    message: messages[result],
    data: { matchId, opponentUsername, eloChange, result },
  })
}
