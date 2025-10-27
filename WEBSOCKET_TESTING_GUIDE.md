# WebSocket Testing Guide 🧪

This guide explains how to test real-time WebSocket features by yourself during development.

## Quick Start: Test With 2 Browser Windows

### Step 1: Setup Two Users

You need 2 test accounts. Use the seeded users:

```
User 1: alice@test.com / password123
User 2: bob@test.com / password123
```

### Step 2: Open Two Browser Sessions

**Method A: Incognito Window (Recommended)**
1. **Window 1 (Normal)**: 
   - Open `http://localhost:3000`
   - Login as Alice

2. **Window 2 (Incognito)**:
   - Press `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)
   - Go to `http://localhost:3000`
   - Login as Bob

**Method B: Different Browsers**
1. **Chrome**: Login as Alice
2. **Firefox/Edge**: Login as Bob

### Step 3: Join Same Match

**Option 1: Create Match from Window 1**
1. Window 1: Go to `/matchmaking`
2. Click "Find Match" → Creates a match
3. Note the Match ID from URL (e.g., `/match/cm...`)
4. Window 2: Navigate to same URL

**Option 2: Use Seeded Match**
Both windows navigate to:
```
http://localhost:3000/match/cmh2a7plx00061knsri9h0nr7
```

### Step 4: Test Real-Time Features

#### Test 1: Connection Status
- ✅ Both windows should show **"Live"** badge (green)
- ❌ If showing "API Mode" (yellow), check auth token in cookies

#### Test 2: Code Submission
1. Window 1: Write some code, click Submit
2. Window 2: Should see submission appear in Activity feed instantly
3. Reverse: Submit from Window 2 → Should appear in Window 1

#### Test 3: Chat (if implemented)
1. Window 1: Send a chat message
2. Window 2: Should receive message instantly

#### Test 4: Timer Sync
- Both windows should show the same countdown timer
- If match has started, timer should count down in sync

## Using the Debug Panel 🔧

A **Socket Debug Panel** appears in the bottom-right corner (development mode only).

### Features:
1. **Connection Status**: Real-time socket connection state
2. **Test Code Submission**: Quick submit test code
3. **Test Chat**: Send test messages
4. **Submissions Log**: Last 5 submissions
5. **Messages Log**: Last 5 chat messages

### How to Use:
1. Click **"🔧 Debug"** button in bottom-right
2. Panel opens with all socket information
3. Use "Test Code Submission" to quickly test without typing in editor
4. Monitor logs to see real-time updates

## Troubleshooting

### "Not authenticated" Error
**Problem**: Socket shows disconnected, "API Mode" badge appears

**Solution**:
1. Check cookies: DevTools → Application → Cookies → `auth_token`
2. If missing, logout and login again
3. Refresh the page

### Submissions Not Appearing Real-Time
**Problem**: Submit from one window, other window doesn't update

**Checklist**:
- [ ] Both windows show "Live" badge?
- [ ] Both windows in same match? (check URL)
- [ ] Both users authenticated? (check auth_token)
- [ ] Server running? (check terminal)
- [ ] Socket.IO server initialized? (check console logs)

### Timer Not Syncing
**Problem**: Timers show different values in each window

**Reason**: This is expected if you refreshed at different times
- Timer calculates from `match.startedAt`
- Small differences (<1 second) are normal due to refresh timing

## Advanced Testing

### Test With Browser DevTools

**Monitor WebSocket Events:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Click on socket.io connection
5. Go to **Messages** tab
6. See all socket events in real-time

**Common Events to Look For:**
- `connect` - Socket connected
- `auth` - Authentication request
- `auth_success` - Authentication succeeded
- `join_battle` - Joined match room
- `room_state` - Received initial room state
- `submission_started` - Someone started submitting
- `submission_completed` - Submission finished
- `chat_message` - Chat message sent/received

### Test Socket.IO Endpoints Directly

You can also test using the Socket.IO client in browser console:

```javascript
// Open browser console and run:
const socket = io('http://localhost:3000')

socket.on('connect', () => {
  console.log('Connected:', socket.id)
  
  // Authenticate
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1]
  
  socket.emit('auth', token)
})

socket.on('auth_success', (data) => {
  console.log('Authenticated:', data)
  
  // Join battle
  socket.emit('join_battle', { matchId: 'YOUR_MATCH_ID' })
})

socket.on('room_state', (state) => {
  console.log('Room state:', state)
})
```

## Testing Checklist

Before considering WebSocket implementation complete:

- [ ] Two users can join same match
- [ ] Both show "Live" connection status
- [ ] Submissions appear in real-time on both sides
- [ ] Activity feed updates instantly
- [ ] Timer syncs between windows
- [ ] Chat messages (if implemented) sync
- [ ] Graceful fallback to API mode when disconnected
- [ ] No console errors when submitting
- [ ] Debug panel shows correct data

## Next Steps

Once basic WebSocket is working:

1. **Add More Real-Time Features**:
   - Live code sharing/viewing
   - Typing indicators
   - Real-time ELO changes
   - Match countdown timer

2. **Improve UX**:
   - Reconnection toasts
   - Connection quality indicator
   - Retry logic for failed submissions

3. **Production Readiness**:
   - Add rate limiting
   - Add spam protection
   - Add authentication refresh
   - Add room cleanup logic
   - Add heartbeat/ping mechanism

## Need Help?

- Check server logs in terminal
- Check browser console for errors
- Use Debug Panel to monitor events
- Check DATABASE_SEEDED.md for test accounts
