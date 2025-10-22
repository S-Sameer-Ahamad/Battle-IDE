# Battle Room Testing Guide

## 🎯 What We Just Built

The **Battle Room Page** (`app/match/[id]/page.tsx`) is now fully integrated with WebSockets and real database data!

## ✅ Features Implemented

### Real-Time WebSocket Integration
- ✅ Connected/Disconnected status indicator
- ✅ Live participant tracking
- ✅ Real-time code submission updates
- ✅ Chat functionality
- ✅ Battle state synchronization

### Problem Integration
- ✅ Fetches actual problems from database
- ✅ Displays problem title, difficulty, description
- ✅ Shows examples from database
- ✅ Shows time and memory constraints
- ✅ Language-specific code templates

### Code Editor
- ✅ Monaco Editor integration
- ✅ Multi-language support (Python, JavaScript, Java, C++)
- ✅ Real-time code synchronization (debounced 1 second)
- ✅ Submit button with battle state validation

### Live Battle Info
- ✅ Countdown timer (from match timeLimit)
- ✅ Match status (waiting, in_progress, completed)
- ✅ Opponent information with avatar
- ✅ Your progress tracker
- ✅ Participant list with real usernames
- ✅ Activity feed showing submissions

### Tabs
- **Editor**: Code editing with Monaco
- **Submissions**: View all submissions with timestamps
- **Chat**: Send and receive messages

## 🧪 How to Test

### 1. Start the Server
```bash
cd C:\CursorIDE\Battle-IDE
pnpm dev
```

**Expected Output:**
```
✅ Socket.IO server initialized
✅ Socket.IO ready on ws://localhost:3000/socket.io/
▲ Next.js 15.2.4
- Local: http://localhost:3000
```

### 2. Create a Test Match

First, you need a match in the database. Here's how to create one via API:

**Using PowerShell:**
```powershell
$problem = (Invoke-RestMethod -Uri "http://localhost:3000/api/problems").problems[0]
$body = @{
  problemId = $problem.id
  timeLimit = 15
  maxParticipants = 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/matches" -Method POST -Body $body -ContentType "application/json"
```

**Or using cURL:**
```bash
curl http://localhost:3000/api/problems
# Copy a problem ID from the response

curl -X POST http://localhost:3000/api/matches \
  -H "Content-Type: application/json" \
  -d '{"problemId":"PROBLEM_ID_HERE","timeLimit":15,"maxParticipants":2}'
```

### 3. Navigate to Battle Room

After creating a match, note the `id` in the response. Then navigate to:
```
http://localhost:3000/match/{MATCH_ID}
```

### 4. Test Features

#### Test WebSocket Connection
- ✅ Green dot should appear next to "Connected"
- ✅ Status should show current match state

#### Test Problem Display
- ✅ Problem title should be "Two Sum" (or another seeded problem)
- ✅ Difficulty badge should match problem
- ✅ Description should be fully visible
- ✅ Examples should be displayed

#### Test Code Editor
- ✅ Switch languages - code template should update
- ✅ Type code - should persist
- ✅ Check console - code should sync after 1 second

#### Test Chat
- ✅ Go to Chat tab
- ✅ Type a message and press Enter
- ✅ Message should appear in chat (currently you'll only see your own)

#### Test Submissions
- ✅ Click Submit button
- ✅ Go to Submissions tab
- ✅ Your submission should appear

### 5. Test with Multiple Users (Advanced)

To fully test real-time features, open the same match in **2 different browsers** (or incognito):

1. **Browser 1**: Navigate to `http://localhost:3000/match/{MATCH_ID}`
2. **Browser 2**: Navigate to `http://localhost:3000/match/{MATCH_ID}` (same ID)

**Expected Behavior:**
- ✅ Both browsers show "2 participants"
- ✅ Each sees the other in the opponent section
- ✅ Chat messages appear in both browsers
- ✅ Submissions appear in both activity feeds
- ✅ Code changes sync (with 1s delay)

## 🔍 Debugging

### Check WebSocket Connection
Open browser DevTools → Network → WS (WebSocket)
- Should see connection to `ws://localhost:3000/socket.io/`
- Should see events: `auth`, `battle_state_update`, `participant_joined`, etc.

### Check Console Logs
Browser console should show:
```
WebSocket connected
Joining battle: {matchId}
Battle state updated: {...}
```

### Server Logs
Terminal should show:
```
Socket.IO client connected: {...}
User joined battle: {...}
```

## 🐛 Known Issues to Fix Next

### 1. **Submit Code Not Executing** (NEXT PRIORITY)
- Currently just sends WebSocket event
- Need to integrate Judge0 API
- Need to validate against test cases
- **Task #2: Integrate Judge0 with Battle Submissions**

### 2. **No Match Creation UI**
- Currently requires API calls
- Need matchmaking page
- **Task #3: Build Matchmaking Page**

### 3. **No Winner Determination**
- Battle doesn't determine winner
- Need ELO system
- **Task #4: Implement ELO System**

## 📝 File Structure

```
app/match/[id]/page.tsx         - ✅ Battle room UI (COMPLETE)
lib/use-battle-socket.ts        - ✅ WebSocket client hook (COMPLETE)
lib/socket-server.ts            - ✅ WebSocket server (COMPLETE)
server.ts                       - ✅ Custom Next.js server (COMPLETE)
prisma/seed-problems.ts         - ✅ Problem seeder (COMPLETE)
```

## 🎮 Next Steps

1. **Integrate Judge0**: Make code submissions actually execute
2. **Build Matchmaking**: UI to create and join battles
3. **Winner Detection**: Determine winner based on test results
4. **ELO System**: Calculate rating changes
5. **Results Page**: Show battle outcome

## 📊 Database State

Run this to see your problems:
```bash
cd C:\CursorIDE\Battle-IDE
npx tsx -e "import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.problem.findMany().then(console.log)"
```

Should show 5 problems:
- Two Sum (Easy)
- Palindrome Number (Easy)
- Reverse String (Easy)
- FizzBuzz (Easy)
- Valid Parentheses (Medium)

---

**Status**: Battle Room is READY for live testing! 🎉
**Next**: Integrate Judge0 for real code execution
