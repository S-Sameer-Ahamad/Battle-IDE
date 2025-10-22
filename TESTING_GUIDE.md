# 🧪 Battle-IDE Route Testing Guide

This guide provides a quick reference for testing all routes and features in the Battle-IDE platform.

## 🚀 Quick Start

### 1. Start Development Server
```powershell
cd C:\CursorIDE\Battle-IDE
npm run dev
```

Server runs on: `http://localhost:3000`

---

## 📍 Route Testing Checklist

### Public Routes (No Auth Required)

#### ✅ Landing Page
- **URL:** `http://localhost:3000/`
- **Expected:** Landing page with features swiper
- **Test:**
  - ✅ Logo displays
  - ✅ "Get Started" button works
  - ✅ Features carousel scrolls
  - ✅ Footer links work

#### ✅ Login Page
- **URL:** `http://localhost:3000/auth/login`
- **Expected:** Login form with validation
- **Test:**
  ```javascript
  Email: test@example.com
  Password: Test@123456
  ```
  - ✅ Form validation works
  - ✅ Error messages display
  - ✅ "Forgot Password?" link works
  - ✅ "Sign Up" link navigates to register
  - ✅ Successful login redirects to dashboard

#### ✅ Register Page
- **URL:** `http://localhost:3000/auth/register`
- **Expected:** Registration form with validation
- **Test:**
  ```javascript
  Username: testuser123
  Email: test123@example.com
  Password: Test@123456
  Confirm Password: Test@123456
  ```
  - ✅ Username validation (alphanumeric, 3-20 chars)
  - ✅ Email validation (valid format)
  - ✅ Password strength indicator
  - ✅ Password confirmation match
  - ✅ Successful registration redirects

#### ✅ Forgot Password
- **URL:** `http://localhost:3000/auth/forgot-password`
- **Expected:** Email input form
- **Test:**
  ```javascript
  Email: test@example.com
  ```
  - ✅ Email validation
  - ✅ Success message displays
  - ✅ "Back to Login" link works

#### ✅ Terms of Service
- **URL:** `http://localhost:3000/terms`
- **Expected:** Terms content
- **Test:**
  - ✅ Content displays
  - ✅ Back button works

#### ✅ Privacy Policy
- **URL:** `http://localhost:3000/privacy`
- **Expected:** Privacy content
- **Test:**
  - ✅ Content displays
  - ✅ Back button works

---

### Protected Routes (Auth Required)

#### ✅ Dashboard
- **URL:** `http://localhost:3000/dashboard`
- **Auth:** Required (redirects to login if not authenticated)
- **Expected:** User dashboard with stats and quick actions
- **Test:**
  - ✅ User stats display (ELO, wins, losses)
  - ✅ "Quick Match" button opens modal
  - ✅ "Custom Room" card works
  - ✅ "Friend Challenge" button works
  - ✅ Header navigation works

#### ✅ Matchmaking
- **URL:** `http://localhost:3000/matchmaking`
- **Auth:** Required
- **Expected:** Matchmaking hub with 3 options
- **Test:**
  - ✅ **Quick Play** button works
  - ✅ **Create Match** form displays
    - Problem selection dropdown
    - Time limit slider
    - Match type selection
    - Create button
  - ✅ **Join with Code** input works
  - ✅ Available matches list displays
  - ✅ Filter by difficulty works
  - ✅ Join match button works

#### ✅ Battle Room
- **URL:** `http://localhost:3000/match/[matchId]`
- **Auth:** Required
- **Dynamic:** Replace `[matchId]` with actual match ID
- **Expected:** Real-time coding battle interface
- **Test:**
  - ✅ Problem description displays
  - ✅ Monaco editor loads
  - ✅ Language selector works (10 languages)
  - ✅ Code submission works
  - ✅ Test results display
  - ✅ Real-time updates show
  - ✅ Participant list updates
  - ✅ Timer counts down
  - ✅ Chat panel works
  - ✅ Winner detection triggers

**Sample Test Code (JavaScript):**
```javascript
// For "Two Sum" problem
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
```

#### ✅ Results Page
- **URL:** `http://localhost:3000/match/[matchId]/results`
- **Auth:** Required
- **Dynamic:** Replace `[matchId]` with completed match ID
- **Expected:** Battle results with confetti (for winner)
- **Test:**
  - ✅ Winner announcement displays
  - ✅ Confetti animation plays (if you won)
  - ✅ Match statistics show:
    - Duration
    - Total submissions
    - Match type
  - ✅ ELO changes display:
    - Winner card (green border) with +rating
    - Loser card (red border) with -rating
    - Rating tier badges with colors
  - ✅ Code comparison shows:
    - Winner's code (left, green border)
    - Loser's code (right, red border)
    - Syntax highlighting
    - Test results
    - Performance metrics
  - ✅ Submission history displays
  - ✅ **Rematch** button creates new match
  - ✅ **Back to Matchmaking** button works
  - ✅ **View Leaderboard** button works

#### ✅ Leaderboard
- **URL:** `http://localhost:3000/leaderboard`
- **Auth:** Required
- **Expected:** Global player rankings
- **Test:**
  - ✅ Top players list displays
  - ✅ ELO ratings show
  - ✅ Win/loss records display
  - ✅ Rating tier badges with colors:
    - 👑 Grandmaster (gold)
    - ⚔️ Master (purple)
    - 💠 Diamond (cyan)
    - 💎 Platinum (blue)
    - 🥇 Gold (yellow)
    - 🥈 Silver (gray)
    - 🥉 Bronze (brown)
  - ✅ Search functionality works
  - ✅ Pagination works (if many users)

#### ✅ User Profile
- **URL:** `http://localhost:3000/profile/[userId]`
- **Auth:** Required
- **Dynamic:** Replace `[userId]` with user ID
- **Expected:** User profile page
- **Test:**
  - ✅ Username displays
  - ✅ ELO rating shows
  - ✅ Win/loss record displays
  - ✅ Rating tier badge shows
  - ✅ Recent matches display (if any)

#### ✅ Settings
- **URL:** `http://localhost:3000/settings`
- **Auth:** Required
- **Expected:** User settings page
- **Test:**
  - ✅ Account settings section
  - ✅ Preferences section
  - ✅ Security section
  - ✅ Save buttons work

---

### Admin Routes

#### ✅ Admin Dashboard
- **URL:** `http://localhost:3000/admin`
- **Auth:** Required (admin only)
- **Expected:** Admin dashboard
- **Test:**
  - ✅ Admin navigation works
  - ✅ Links to problem management

#### ✅ Problem Management
- **URL:** `http://localhost:3000/admin/problems`
- **Auth:** Required (admin only)
- **Expected:** List of problems
- **Test:**
  - ✅ Problems list displays
  - ✅ "Create New" button works

#### ✅ Create Problem
- **URL:** `http://localhost:3000/admin/problems/new`
- **Auth:** Required (admin only)
- **Expected:** Problem creation form
- **Test:**
  - ✅ Title input works
  - ✅ Description textarea works
  - ✅ Difficulty selector works
  - ✅ Test cases input works
  - ✅ Solution textarea works
  - ✅ Save button works

---

## 🔌 API Route Testing

### Authentication APIs

#### Register User
```powershell
$body = @{
  email='newuser@example.com'
  username='newuser'
  password='Test@123456'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/register' `
  -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "username": "newuser",
    "email": "newuser@example.com",
    "elo": 1200
  }
}
```

#### Login
```powershell
$body = @{
  email='test@example.com'
  password='Test@123456'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' `
  -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "elo": 1200
  }
}
```

#### Get Current User
```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/me' `
  -Method GET -UseBasicParsing -SessionVariable session
```

#### Logout
```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/logout' `
  -Method POST -UseBasicParsing
```

---

### Match APIs

#### Get All Matches
```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/matches' `
  -Method GET -UseBasicParsing
```

**Expected Response:**
```json
{
  "matches": [
    {
      "id": "...",
      "problemId": 1,
      "type": "1v1",
      "status": "waiting",
      "participants": [...],
      "problem": {...}
    }
  ]
}
```

#### Create Match
```powershell
$body = @{
  problemId=1
  timeLimit=15
  type='1v1'
  maxParticipants=2
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/api/matches' `
  -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

#### Get Match Details
```powershell
# Replace [matchId] with actual match ID
Invoke-WebRequest -Uri 'http://localhost:3000/api/matches/[matchId]' `
  -Method GET -UseBasicParsing
```

#### Join Match
```powershell
# Replace [matchId] with actual match ID
Invoke-WebRequest -Uri 'http://localhost:3000/api/matches/[matchId]/join' `
  -Method POST -UseBasicParsing
```

---

### Problem APIs

#### Get All Problems
```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/problems' `
  -Method GET -UseBasicParsing
```

**Expected Response:**
```json
{
  "problems": [
    {
      "id": 1,
      "title": "Two Sum",
      "difficulty": "Easy",
      "description": "...",
      "examples": "..."
    }
  ]
}
```

#### Get Problem Details
```powershell
# Replace [problemId] with actual problem ID
Invoke-WebRequest -Uri 'http://localhost:3000/api/problems/1' `
  -Method GET -UseBasicParsing
```

---

### Leaderboard API

#### Get Leaderboard
```powershell
Invoke-WebRequest -Uri 'http://localhost:3000/api/leaderboard?limit=10' `
  -Method GET -UseBasicParsing
```

**Expected Response:**
```json
{
  "leaderboard": [
    {
      "id": "...",
      "username": "topplayer",
      "elo": 1850,
      "wins": 25,
      "losses": 5,
      "rank": 1
    }
  ]
}
```

---

### Submission API

#### Submit Code
```powershell
$body = @{
  matchId='...'
  code='function twoSum(nums, target) { ... }'
  language='javascript'
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:3000/api/submissions' `
  -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

**Expected Response:**
```json
{
  "success": true,
  "submission": {
    "id": "...",
    "status": "Accepted",
    "passedTests": 10,
    "totalTests": 10,
    "executionTime": 23.5,
    "memory": 512
  }
}
```

---

## 🧪 Socket.IO Testing

### Connect to Battle Room

**Using Browser Console:**
```javascript
// Open browser console on battle page
const socket = io();

// Listen for events
socket.on('participant_joined', (data) => {
  console.log('New participant:', data);
});

socket.on('submission_completed', (data) => {
  console.log('Submission result:', data);
});

socket.on('battle_completed', (data) => {
  console.log('Battle winner:', data);
  console.log('ELO changes:', data.eloChanges);
});

// Join a match
socket.emit('join_match', { matchId: 'your-match-id' });

// Submit code
socket.emit('code_submit', {
  matchId: 'your-match-id',
  code: 'function twoSum(nums, target) { ... }',
  language: 'javascript'
});
```

### Expected Socket Events

**Server → Client:**
- `participant_joined` - New player joined
- `participant_left` - Player disconnected
- `match_started` - Battle started
- `submission_started` - Code execution started
- `submission_completed` - Execution finished
- `submission_error` - Execution failed
- `battle_completed` - Winner determined (includes ELO changes)

**Client → Server:**
- `join_match` - Join battle room
- `code_submit` - Submit code for execution

---

## 🎯 Feature Testing Scenarios

### Scenario 1: Complete Battle Flow

1. **User A:** Register → Login → Dashboard
2. **User A:** Click "Quick Match" → Create match
3. **User B:** Register → Login → Matchmaking
4. **User B:** See User A's match → Click "Join"
5. **Both:** See each other in participants list
6. **User A:** Write solution → Submit code
7. **User B:** See "Opponent is submitting..." message
8. **User A:** Tests pass (10/10) → Winner banner shows
9. **Both:** Redirected to results page
10. **Both:** See ELO changes (+rating for A, -rating for B)
11. **Both:** See code comparison side-by-side
12. **User A:** See confetti animation
13. **User A:** Click "Rematch" → New match created
14. **Both:** Back in battle room

### Scenario 2: ELO System Test

1. Create two users with different ELO ratings
2. Complete a battle
3. Verify ELO changes:
   - Higher-rated winner gains fewer points
   - Lower-rated winner gains more points (upset)
   - Loser loses inversely
4. Check leaderboard updates
5. Verify rating tier changes (if tier boundary crossed)

### Scenario 3: Code Execution Test

**Test All Languages:**
1. JavaScript - `console.log('Hello')`
2. Python - `print('Hello')`
3. C++ - `#include <iostream>\nint main() { std::cout << "Hello"; return 0; }`
4. Java - `public class Main { public static void main(String[] args) { System.out.println("Hello"); } }`
5. TypeScript - `console.log('Hello')`
6. Go - `package main\nimport "fmt"\nfunc main() { fmt.Println("Hello") }`
7. Rust - `fn main() { println!("Hello"); }`
8. Ruby - `puts 'Hello'`
9. PHP - `<?php echo 'Hello'; ?>`
10. C# - `using System; class Program { static void Main() { Console.WriteLine("Hello"); } }`

**Expected:** All execute successfully with correct output

---

## ✅ Verification Checklist

### Frontend
- [ ] All pages load without errors
- [ ] All buttons and links work
- [ ] Forms validate correctly
- [ ] Error messages display properly
- [ ] Success messages display properly
- [ ] Navigation works across all pages
- [ ] Monaco editor loads and syntax highlights
- [ ] Confetti animation plays on results page
- [ ] Real-time updates appear in battle room
- [ ] Chat panel sends/receives messages

### Backend
- [ ] All API routes return correct responses
- [ ] Authentication works (login/register/logout)
- [ ] JWT tokens are set correctly
- [ ] Protected routes redirect to login
- [ ] Database queries execute successfully
- [ ] Prisma Client generates without errors
- [ ] Socket.IO server connects properly
- [ ] Judge0 API executes code correctly
- [ ] ELO calculations are accurate
- [ ] Winner detection works correctly

### Real-Time Features
- [ ] Socket.IO connection establishes
- [ ] Participants list updates in real-time
- [ ] Code submissions broadcast to all users
- [ ] Battle completion triggers redirect
- [ ] ELO changes broadcast correctly
- [ ] Reconnection works after disconnect

### Performance
- [ ] Pages load quickly (< 2s)
- [ ] Code execution completes in reasonable time
- [ ] No memory leaks in Socket.IO
- [ ] Database queries are optimized
- [ ] No console errors in browser

---

## 🐛 Common Issues & Solutions

### Issue: "Database not found"
**Solution:**
```powershell
cd C:\CursorIDE\Battle-IDE
npx prisma migrate dev
```

### Issue: "Prisma Client not generated"
**Solution:**
```powershell
npx prisma generate
```

### Issue: "Socket.IO not connecting"
**Solution:**
- Check if dev server is running
- Check console for CORS errors
- Verify NEXT_PUBLIC_SOCKET_URL in .env

### Issue: "Judge0 API failing"
**Solution:**
- Check JUDGE0_API_KEY in .env
- Verify RapidAPI subscription is active
- Check Judge0 API status

### Issue: "TypeScript errors in VS Code"
**Solution:**
```powershell
# Restart TypeScript server
# In VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or regenerate Prisma Client
npx prisma generate
```

---

## 📊 Success Criteria

A fully working Battle-IDE should have:

✅ Users can register and login  
✅ Users can create and join matches  
✅ Real-time battle room works with live updates  
✅ Code executes in multiple languages (Judge0)  
✅ Test results display correctly  
✅ Winner is detected automatically  
✅ ELO ratings update after battle  
✅ Results page shows confetti, ELO changes, and code comparison  
✅ Leaderboard displays ranked players  
✅ All navigation works smoothly  
✅ No console errors in browser  
✅ No build errors in terminal  

---

**Last Updated:** October 22, 2025  
**Version:** 1.0.0
