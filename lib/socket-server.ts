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

  initialize(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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

      // Authenticate socket connection
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

        room.status = 'active'
        room.startedAt = new Date()

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

        // Remove from all rooms
        this.rooms.forEach((room, matchId) => {
          if (socket.data.user) {
            const user = socket.data.user as SocketUser
            if (room.participants.has(user.userId)) {
              this.handleLeaveBattle(socket, matchId)
            }
          }
        })
      })
    })
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
