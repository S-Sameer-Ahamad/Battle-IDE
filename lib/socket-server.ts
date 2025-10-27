import { Server as HTTPServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import { verifyToken } from './jwt'
import { PrismaClient } from '@prisma/client'
import { executeBattleSubmission, parseTestCases, type BattleExecutionResult } from './judge0-battle'
import { calculateBattleElo, type EloResult } from './elo'

const prisma = new PrismaClient()

export interface SocketUser {
  userId: string
  username: string
  email: string
  socketId: string
}

export interface BattleRoom {
  matchId: string
  participants: Map<string, SocketUser>
  status: 'waiting' | 'active' | 'completed'
  winnerId?: string
  createdAt: Date
  startedAt?: Date
  problem?: any
}

class BattleSocketServer {
  private io: SocketServer | null = null
  private rooms: Map<string, BattleRoom> = new Map()
  private onlineUsers: Map<string, string> = new Map() // userId -> socketId
  private userSockets: Map<string, string> = new Map() // socketId -> userId

  initialize(httpServer: HTTPServer) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const allowedOrigins = [
      appUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://localhost:3000',
      'https://127.0.0.1:3000',
    ]

    this.io = new SocketServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
      path: '/socket.io/',
    })

    this.setupConnectionHandlers()
    console.log('✅ Socket.IO server initialized')
  }

  private setupConnectionHandlers() {
    if (!this.io) return

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)

      // Get auth from handshake (passed during connection)
      const authData = socket.handshake.auth
      if (authData && authData.userId && authData.username) {
        socket.data.user = {
          userId: authData.userId,
          username: authData.username,
          email: authData.email || '',
          socketId: socket.id,
        }
        console.log(`✅ User authenticated via handshake: ${authData.username}`)
        
        // Track online user
        this.onlineUsers.set(authData.userId, socket.id)
        this.userSockets.set(socket.id, authData.userId)
        
        // Notify user's friends that they are online
        this.notifyFriendsOnlineStatus(authData.userId, authData.username, true)
        
        // Send list of online friends to this user
        this.sendOnlineFriendsList(socket, authData.userId)
      }

      // Authenticate socket connection (legacy support for token-based auth)
      socket.on('auth', async (token: string) => {
        try {
          const payload = verifyToken(token)
          if (!payload) {
            socket.emit('auth_error', 'Invalid token')
            socket.disconnect()
            return
          }

          // Store user data in socket
          socket.data.user = {
            userId: payload.userId,
            username: payload.username,
            email: payload.email,
            socketId: socket.id,
          }

          socket.emit('auth_success', { username: payload.username })
          console.log(`✅ User authenticated: ${payload.username}`)
        } catch (error) {
          console.error('Auth error:', error)
          socket.emit('auth_error', 'Authentication failed')
          socket.disconnect()
        }
      })

      // Join a battle room
      socket.on('join_battle', async ({ matchId }: { matchId: string }) => {
        try {
          if (!socket.data.user) {
            socket.emit('error', 'Not authenticated')
            return
          }

          const user = socket.data.user as SocketUser

          // Join socket room
          await socket.join(matchId)

          // Add to our room tracking
          if (!this.rooms.has(matchId)) {
            this.rooms.set(matchId, {
              matchId,
              participants: new Map(),
              status: 'waiting',
              createdAt: new Date(),
            })
          }

          const room = this.rooms.get(matchId)!
          room.participants.set(user.userId, user)

          // Notify everyone in the room
          this.io!.to(matchId).emit('user_joined', {
            user: {
              userId: user.userId,
              username: user.username,
            },
            participantCount: room.participants.size,
          })

          // Send current room state to the new user
          socket.emit('room_state', {
            matchId,
            participants: Array.from(room.participants.values()).map(p => ({
              userId: p.userId,
              username: p.username,
            })),
            status: room.status,
          })

          console.log(`👥 ${user.username} joined battle ${matchId}`)
        } catch (error) {
          console.error('Join battle error:', error)
          socket.emit('error', 'Failed to join battle')
        }
      })

      // Leave battle room
      socket.on('leave_battle', ({ matchId }: { matchId: string }) => {
        this.handleLeaveBattle(socket, matchId)
      })

      // Start battle (host only)
      socket.on('start_battle', ({ matchId }: { matchId: string }) => {
        const room = this.rooms.get(matchId)
        if (!room) {
          socket.emit('error', 'Room not found')
          return
        }

        // If already active or completed, ignore duplicate starts
        if (room.status !== 'waiting') {
          return
        }

        room.status = 'active'
        room.startedAt = new Date()

        // Persist start time and status to DB for consistency across refreshes
        prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'active',
            startedAt: room.startedAt,
          },
        }).catch(err => console.error('Failed to persist match start:', err))

        this.io!.to(matchId).emit('battle_started', {
          startedAt: room.startedAt,
        })

        console.log(`🎮 Battle ${matchId} started`)
      })

      // Submit code during battle
      socket.on('code_submit', async ({ matchId, code, language }: { 
        matchId: string
        code: string
        language: string
      }) => {
        try {
          if (!socket.data.user) {
            socket.emit('error', 'Not authenticated')
            return
          }

          const user = socket.data.user as SocketUser
          console.log(`📝 ${user.username} submitting code in ${matchId}`)

          // Fetch match and problem from database
          const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
              problem: true,
            },
          })

          if (!match || !match.problem) {
            socket.emit('submission_error', { error: 'Match or problem not found' })
            return
          }

          // Parse test cases
          const testCases = parseTestCases(match.problem.testCases)
          console.log(`🧪 Running ${testCases.length} test cases`)

          // Emit submission started
          this.io!.to(matchId).emit('submission_started', {
            userId: user.userId,
            username: user.username,
            timestamp: new Date(),
          })

          // Execute code against test cases
          const result: BattleExecutionResult = await executeBattleSubmission(
            code,
            language,
            testCases
          )

          console.log(`✅ Execution complete: ${result.passedTests}/${result.totalTests} passed`)

          // Save submission to database
          const submission = await prisma.submission.create({
            data: {
              matchId,
              userId: user.userId,
              code,
              language,
              passedTests: result.passedTests,
              totalTests: result.totalTests,
              executionTime: result.executionTime,
              memory: result.memory,
              status: result.success ? 'Accepted' : 'Wrong Answer',
            },
          })

          // Broadcast submission result to all participants
          this.io!.to(matchId).emit('submission_completed', {
            userId: user.userId,
            username: user.username,
            language,
            passedTests: result.passedTests,
            totalTests: result.totalTests,
            executionTime: result.executionTime,
            memory: result.memory,
            success: result.success,
            timestamp: new Date(),
            result: result.success ? 'Accepted' : `Wrong Answer (${result.passedTests}/${result.totalTests})`,
          })

          // If all tests passed, check if this is the first to complete
          if (result.success) {
            const room = this.rooms.get(matchId)
            if (room && !room.winnerId) {
              room.winnerId = user.userId
              room.status = 'completed'

              // Get all participants for ELO calculation
              const participants = await prisma.matchParticipant.findMany({
                where: { matchId },
                include: { user: true },
              })

              // For 1v1 matches, calculate ELO changes
              let eloResults: EloResult[] | null = null
              if (match.type === '1v1' && participants.length === 2) {
                const winner = participants.find(p => p.userId === user.userId)
                const loser = participants.find(p => p.userId !== user.userId)

                if (winner && loser) {
                  const [winnerEloResult, loserEloResult] = calculateBattleElo({
                    winnerId: winner.userId,
                    winnerRating: winner.user.elo,
                    loserId: loser.userId,
                    loserRating: loser.user.elo,
                  })

                  eloResults = [winnerEloResult, loserEloResult]

                  // Update both players' ELO and win/loss records
                  await prisma.user.update({
                    where: { id: winner.userId },
                    data: {
                      elo: winnerEloResult.newRating,
                      wins: { increment: 1 },
                    },
                  })

                  await prisma.user.update({
                    where: { id: loser.userId },
                    data: {
                      elo: loserEloResult.newRating,
                      losses: { increment: 1 },
                    },
                  })

                  console.log(`📊 ELO updated: ${winner.user.username} ${winnerEloResult.oldRating} → ${winnerEloResult.newRating} (${winnerEloResult.change >= 0 ? '+' : ''}${winnerEloResult.change})`)
                  console.log(`📊 ELO updated: ${loser.user.username} ${loserEloResult.oldRating} → ${loserEloResult.newRating} (${loserEloResult.change >= 0 ? '+' : ''}${loserEloResult.change})`)
                }
              }

              // Update match in database
              await prisma.match.update({
                where: { id: matchId },
                data: {
                  status: 'completed',
                  winnerId: user.userId,
                  endedAt: new Date(),
                },
              })

              // Broadcast winner with ELO changes
              this.io!.to(matchId).emit('battle_completed', {
                winnerId: user.userId,
                winnerUsername: user.username,
                eloChanges: eloResults,
              })

              console.log(`🏆 ${user.username} won battle ${matchId}!`)
            }
          }

          // Send detailed result back to submitter
          socket.emit('submission_result', {
            success: result.success,
            testResults: result.testResults,
            passedTests: result.passedTests,
            totalTests: result.totalTests,
            executionTime: result.executionTime,
            memory: result.memory,
          })

        } catch (error) {
          console.error('Code submit error:', error)
          socket.emit('submission_error', { 
            error: error instanceof Error ? error.message : 'Failed to execute code' 
          })
        }
      })

      // Live code updates (optional - for spectator mode)
      socket.on('code_update', ({ matchId, code }: { matchId: string; code: string }) => {
        if (!socket.data.user) return

        socket.to(matchId).emit('participant_code_update', {
          userId: socket.data.user.userId,
          code,
        })
      })

      // Battle completion
      socket.on('complete_battle', ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
        const room = this.rooms.get(matchId)
        if (!room) return

        room.status = 'completed'

        this.io!.to(matchId).emit('battle_completed', {
          winnerId,
          completedAt: new Date(),
        })

        console.log(`🏆 Battle ${matchId} completed. Winner: ${winnerId}`)
      })

      // Chat messages in battle
      socket.on('chat_message', ({ matchId, message }: { matchId: string; message: string }) => {
        if (!socket.data.user) return

        const user = socket.data.user as SocketUser

        this.io!.to(matchId).emit('chat_message', {
          userId: user.userId,
          username: user.username,
          message,
          timestamp: new Date(),
        })
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`)

        // Get userId before cleanup
        const userId = this.userSockets.get(socket.id)
        
        // Remove from all rooms
        this.rooms.forEach((room, matchId) => {
          if (socket.data.user) {
            const user = socket.data.user as SocketUser
            if (room.participants.has(user.userId)) {
              this.handleLeaveBattle(socket, matchId)
            }
          }
        })
        
        // Remove from online tracking and notify friends
        if (userId && socket.data.user) {
          this.onlineUsers.delete(userId)
          this.userSockets.delete(socket.id)
          this.notifyFriendsOnlineStatus(userId, socket.data.user.username, false)
        }
      })

      // User online announcement
      socket.on('user_online', ({ userId, username }: { userId: string; username: string }) => {
        this.onlineUsers.set(userId, socket.id)
        this.userSockets.set(socket.id, userId)
        this.notifyFriendsOnlineStatus(userId, username, true)
        this.sendOnlineFriendsList(socket, userId)
      })

      // Typing indicators
      socket.on('typing', ({ conversationId }: { conversationId: string }) => {
        if (!socket.data.user) return
        const user = socket.data.user as SocketUser
        
        // Emit to the conversation partner
        socket.broadcast.emit('user_typing', {
          userId: user.userId,
          conversationId,
        })
      })

      socket.on('stop_typing', ({ conversationId }: { conversationId: string }) => {
        if (!socket.data.user) return
        const user = socket.data.user as SocketUser
        
        socket.broadcast.emit('user_stopped_typing', {
          userId: user.userId,
          conversationId,
        })
      })

      // Real-time message sending
      socket.on('send_message', async (data: {
        receiverId: string
        content: string
        conversationId?: string
      }) => {
        if (!socket.data.user) return
        const user = socket.data.user as SocketUser
        
        // Send to receiver if they're online
        const receiverSocketId = this.onlineUsers.get(data.receiverId)
        if (receiverSocketId) {
          this.io!.to(receiverSocketId).emit('new_message', {
            senderId: user.userId,
            senderUsername: user.username,
            content: data.content,
            conversationId: data.conversationId,
            timestamp: new Date(),
          })
        }
      })

      // Read receipts: notify partner when user reads messages
      socket.on('messages_read', (data: { partnerId: string }) => {
        if (!socket.data.user) return
        const user = socket.data.user as SocketUser
        const partnerSocketId = this.onlineUsers.get(data.partnerId)
        if (partnerSocketId) {
          this.io!.to(partnerSocketId).emit('messages_read', {
            readerId: user.userId,
            timestamp: new Date().toISOString(),
          })
        }
      })

      // Join/leave generic rooms (for group features)
      socket.on('join_room', ({ roomId }: { roomId: string }) => {
        socket.join(roomId)
        console.log(`User ${socket.data.user?.username} joined room ${roomId}`)
      })

      socket.on('leave_room', ({ roomId }: { roomId: string }) => {
        socket.leave(roomId)
        console.log(`User ${socket.data.user?.username} left room ${roomId}`)
      })
    })
  }

  // Helper method to notify friends when user goes online/offline
  private async notifyFriendsOnlineStatus(userId: string, username: string, isOnline: boolean) {
    try {
      // Fetch user's friends from database
      const friendRequests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId, status: 'accepted' },
            { receiverId: userId, status: 'accepted' },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
      })

      // Get friend IDs
      const friendIds = friendRequests.map((req) =>
        req.senderId === userId ? req.receiverId : req.senderId
      )

      // Notify each online friend
      friendIds.forEach((friendId) => {
        const friendSocketId = this.onlineUsers.get(friendId)
        if (friendSocketId) {
          this.io!.to(friendSocketId).emit(isOnline ? 'friend_online' : 'friend_offline', {
            userId,
            username,
          })
        }
      })

      console.log(`📢 Notified ${friendIds.length} friends that ${username} is ${isOnline ? 'online' : 'offline'}`)
    } catch (error) {
      console.error('Error notifying friends of online status:', error)
    }
  }

  // Helper method to send list of online friends to a user
  private async sendOnlineFriendsList(socket: Socket, userId: string) {
    try {
      // Fetch user's friends
      const friendRequests = await prisma.friendRequest.findMany({
        where: {
          OR: [
            { senderId: userId, status: 'accepted' },
            { receiverId: userId, status: 'accepted' },
          ],
        },
        include: {
          sender: true,
          receiver: true,
        },
      })

      // Get friend IDs
      const friendIds = friendRequests.map((req) =>
        req.senderId === userId ? req.receiverId : req.senderId
      )

      // Filter for online friends
      const onlineFriendIds = friendIds.filter((friendId) => this.onlineUsers.has(friendId))

      // Send to user
      socket.emit('online_friends_list', { friendIds: onlineFriendIds })
      console.log(`👥 Sent online friends list to ${socket.data.user?.username}: ${onlineFriendIds.length} online`)
    } catch (error) {
      console.error('Error sending online friends list:', error)
    }
  }

  // Method to send notification to a specific user
  public sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.onlineUsers.get(userId)
    if (socketId && this.io) {
      this.io.to(socketId).emit('new_notification', notification)
      console.log(`🔔 Sent notification to user ${userId}`)
    }
  }

  // Method to send a direct chat message to a specific user (used from API fallback)
  public sendDirectMessage(receiverId: string, payload: any) {
    const socketId = this.onlineUsers.get(receiverId)
    if (socketId && this.io) {
      this.io.to(socketId).emit('new_message', payload)
      console.log(`💬 Sent direct message to user ${receiverId}`)
    }
  }

  // Method to send friend request notification
  public sendFriendRequestNotification(receiverId: string, request: any) {
    const socketId = this.onlineUsers.get(receiverId)
    if (socketId && this.io) {
      this.io.to(socketId).emit('new_friend_request', request)
      console.log(`👋 Sent friend request notification to user ${receiverId}`)
    }
  }

  // Method to notify when friend request is accepted
  public sendFriendRequestAccepted(userId: string, data: any) {
    const socketId = this.onlineUsers.get(userId)
    if (socketId && this.io) {
      this.io.to(socketId).emit('friend_request_accepted', data)
      console.log(`✅ Sent friend request accepted notification to user ${userId}`)
    }
  }

  // Method to send match invitation
  public sendMatchInvitation(userId: string, invitation: any) {
    const socketId = this.onlineUsers.get(userId)
    if (socketId && this.io) {
      this.io.to(socketId).emit('match_invitation', invitation)
      console.log(`⚔️ Sent match invitation to user ${userId}`)
    }
  }

  private handleLeaveBattle(socket: Socket, matchId: string) {
    const room = this.rooms.get(matchId)
    if (!room || !socket.data.user) return

    const user = socket.data.user as SocketUser
    room.participants.delete(user.userId)

    // Leave socket room
    socket.leave(matchId)

    // Notify others
    this.io!.to(matchId).emit('user_left', {
      userId: user.userId,
      username: user.username,
      participantCount: room.participants.size,
    })

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(matchId)
      console.log(`🗑️  Room ${matchId} deleted (empty)`)
    }

    console.log(`👋 ${user.username} left battle ${matchId}`)
  }

  getIO() {
    return this.io
  }

  getRoomInfo(matchId: string) {
    return this.rooms.get(matchId)
  }
}

// Singleton instance
export const battleSocket = new BattleSocketServer()
