# 🎮 Real-Time Battle System - Implementation Guide

## 🎉 What We've Built So Far

### ✅ Phase 1: WebSocket Infrastructure (COMPLETED)

**Files Created:**
1. `lib/socket-server.ts` - Socket.IO server with battle room management
2. `server.ts` - Custom Next.js server with Socket.IO integration
3. `lib/use-battle-socket.ts` - React hook for Socket.IO client

**Features Implemented:**
- ✅ WebSocket server with authentication
- ✅ Battle room creation and management
- ✅ Real-time participant tracking
- ✅ Live chat system
- ✅ Code submission notifications
- ✅ Battle state management (waiting/active/completed)
- ✅ Automatic room cleanup

**Socket Events:**
- `auth` - Authenticate user with JWT token
- `join_battle` - Join a battle room
- `leave_battle` - Leave a battle room
- `start_battle` - Start the battle (host only)
- `code_submit` - Submit code for execution
- `code_update` - Live code updates (for spectators)
- `complete_battle` - Mark battle as complete
- `chat_message` - Send chat messages

---

## 🎯 Next Steps

### Phase 2: Battle Room UI

Create the battle room interface with:
1. **Monaco Code Editor** - Already installed!
2. **Participant List** - Show all players in the battle
3. **Timer** - Countdown timer for the battle
4. **Chat Panel** - Real-time chat
5. **Test Results** - Show test case results
6. **Submit Button** - Submit code for execution

**File to Create:**
`app/match/[id]/page.tsx` - Battle room page

### Phase 3: Judge0 Integration

Connect the battle system with Judge0:
1. Submit code when user clicks "Submit"
2. Execute against problem test cases
3. Show results in real-time
4. Determine winner automatically
5. Update match status in database

**File to Update:**
`lib/socket-server.ts` - Add Judge0 execution logic

### Phase 4: ELO System

Implement competitive ranking:
1. Calculate ELO changes based on match results
2. Update user rankings after each battle
3. Save match results to database
4. Show rating changes on results screen

**Files to Create:**
- `lib/elo.ts` - ELO calculation functions
- `app/match/[id]/results/page.tsx` - Results screen

---

## 📋 Current Server Configuration

**Updated Scripts:**
```json
"dev": "tsx watch server.ts"  // Now runs custom server with Socket.IO
"dev:next": "next dev"         // Original Next.js dev server (no WebSocket)
```

**Server Features:**
- HTTP server for Next.js pages
- WebSocket server on same port (3000)
- Socket.IO path: `/socket.io/`
- Auto-reload with `tsx watch`

---

## 🔌 How to Use the Battle Socket

### In Your React Component:

```typescript
"use client"

import { useBattleSocket } from '@/lib/use-battle-socket'

export default function BattlePage({ params }: { params: { id: string } }) {
  const {
    connected,
    battleState,
    messages,
    submissions,
    startBattle,
    submitCode,
    sendMessage,
  } = useBattleSocket(params.id)

  if (!connected) {
    return <div>Connecting to battle...</div>
  }

  return (
    <div>
      <h1>Battle Room</h1>
      <p>Status: {battleState?.status}</p>
      <p>Participants: {battleState?.participants.length}</p>
      
      {/* Your battle UI here */}
    </div>
  )
}
```

---

## 🎮 Battle Flow

### 1. Create Match
```typescript
POST /api/matches
{
  "problemId": 1,
  "type": "1v1",
  "roomCode": "ABC123" // optional, for group battles
}
```

### 2. Join Match
```typescript
POST /api/matches/[id]/join
{
  "userId": "user_id"
}
```

### 3. WebSocket Connection
```typescript
const socket = io('http://localhost:3000')
socket.emit('auth', token)
socket.emit('join_battle', { matchId })
```

### 4. Start Battle
```typescript
socket.emit('start_battle', { matchId })
// Server broadcasts 'battle_started' to all participants
```

### 5. Submit Code
```typescript
socket.emit('code_submit', {
  matchId,
  code: userCode,
  language: 'python'
})
// Server executes code with Judge0
// Broadcasts results to all participants
```

### 6. Complete Battle
```typescript
socket.emit('complete_battle', {
  matchId,
  winnerId: 'user_id'
})
// Server updates match status
// Calculates ELO changes
// Saves results to database
```

---

## 🛠️ Testing the WebSocket Server

### 1. Start the Server
```bash
npm run dev
```

### 2. Check Logs
You should see:
```
✅ Socket.IO server initialized
> Ready on http://localhost:3000
> Socket.IO ready on ws://localhost:3000/socket.io/
```

### 3. Test Connection (Browser Console)
```javascript
// Open http://localhost:3000
// Open DevTools Console

const socket = io('http://localhost:3000')

socket.on('connect', () => {
  console.log('✅ Connected!')
  
  // Get auth token from cookie
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1]
  
  // Authenticate
  socket.emit('auth', token)
})

socket.on('auth_success', (data) => {
  console.log('✅ Authenticated:', data)
  
  // Join a test battle
  socket.emit('join_battle', { matchId: 'test-match-123' })
})

socket.on('room_state', (state) => {
  console.log('📊 Room state:', state)
})
```

---

## 📁 File Structure

```
Battle-IDE/
├── server.ts                          # Custom server with Socket.IO
├── lib/
│   ├── socket-server.ts               # Socket.IO battle server
│   ├── use-battle-socket.ts           # React hook for Socket.IO
│   ├── judge0.ts                      # Code execution (existing)
│   └── elo.ts                         # TODO: ELO calculations
├── app/
│   ├── api/
│   │   └── matches/
│   │       ├── route.ts               # List/Create matches
│   │       └── [id]/
│   │           ├── route.ts           # Get/Update match
│   │           └── join/
│   │               └── route.ts       # Join match
│   └── match/
│       └── [id]/
│           ├── page.tsx               # TODO: Battle room UI
│           └── results/
│               └── page.tsx           # TODO: Results screen
```

---

## 🎨 Battle Room UI Components Needed

### 1. Header
- Match ID
- Problem title
- Timer countdown
- Participant count

### 2. Code Editor Area
- Monaco Editor (already installed)
- Language selector
- Submit button
- Run test cases button

### 3. Sidebar
- **Participants Panel:**
  - List of players
  - Their status (connected/submitted/completed)
  - ELO ratings
  
- **Chat Panel:**
  - Real-time messages
  - Input field
  - Auto-scroll

- **Test Results:**
  - Test case status
  - Execution time
  - Memory usage
  - Error messages

### 4. Footer
- Leave battle button
- Report problem button

---

## 🔥 Quick Implementation Checklist

- [x] Socket.IO server setup
- [x] WebSocket authentication
- [x] Room management
- [x] Real-time updates
- [x] Chat system
- [x] Submission tracking
- [ ] Battle room UI
- [ ] Monaco editor integration
- [ ] Judge0 execution
- [ ] Test result display
- [ ] Winner determination
- [ ] ELO calculation
- [ ] Results screen
- [ ] Match history

---

## 🚀 Ready to Continue!

The WebSocket infrastructure is complete and ready. Next, we'll build the **Battle Room UI** where users can:
- See other participants in real-time
- Write code in Monaco Editor
- Chat with opponents
- Submit code and see results instantly
- Win battles and gain ELO points!

---

**Server Status:** Starting up with `npm run dev`
**Next Task:** Create the Battle Room UI page

Let me know when you're ready to build the UI! 💪
