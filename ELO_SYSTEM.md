# ELO Rating System Documentation 🏆

## Overview

The **ELO Rating System** is a mathematical system for calculating the relative skill levels of players in competitive games. Originally designed for chess, we've adapted it for our coding battle platform to provide fair and accurate skill rankings.

---

## 📊 How It Works

### Core Concept

ELO ratings represent a player's skill level as a number. When two players battle:
- The **winner** gains rating points
- The **loser** loses rating points
- The amount exchanged depends on the **rating difference** between players

### Key Formula

```
Expected Score (E) = 1 / (1 + 10^((Opponent Rating - Player Rating) / 400))
New Rating (R') = Current Rating + K × (Actual Score - Expected Score)
```

Where:
- **E** = Expected score (0 to 1, representing win probability)
- **K** = K-factor (32 in our system)
- **Actual Score** = 1 for win, 0 for loss, 0.5 for draw
- **Rating Difference** = How many points separate the players

---

## ⚙️ System Configuration

```typescript
const DEFAULT_CONFIG = {
  kFactor: 32,          // Sensitivity of rating changes
  defaultRating: 1200,  // Starting rating for new players
}
```

### K-Factor Explained

The **K-factor** determines how much ratings change after each match:
- **Higher K** = More volatile ratings (bigger swings)
- **Lower K** = More stable ratings (smaller changes)
- We use **K=32** (standard for most online games)

---

## 🎯 Rating Tiers

Players are categorized into tiers based on their ELO rating:

| Rating Range | Tier | Color |
|-------------|------|-------|
| < 1000 | **Bronze** | #CD7F32 |
| 1000-1199 | **Silver** | #C0C0C0 |
| 1200-1399 | **Gold** | #FFD700 |
| 1400-1599 | **Platinum** | #E5E4E2 |
| 1600-1799 | **Diamond** | #B9F2FF |
| 1800-1999 | **Master** | #9B30FF |
| 2000+ | **Grandmaster** | #FF1493 |

---

## 📈 Example Calculations

### Scenario 1: Higher Rated Player Wins (Expected)

**Before Battle:**
- Winner: 1400 ELO
- Loser: 1200 ELO

**Win Probability:**
- Winner has **76%** chance to win

**After Battle:**
- Winner: 1400 → **1408** (+8)
- Loser: 1200 → **1192** (-8)

**Analysis:** Winner gained few points because victory was expected.

---

### Scenario 2: Lower Rated Player Wins (Upset!)

**Before Battle:**
- Winner: 1200 ELO
- Loser: 1400 ELO

**Win Probability:**
- Winner has only **24%** chance to win

**After Battle:**
- Winner: 1200 → **1224** (+24)
- Loser: 1400 → **1376** (-24)

**Analysis:** Winner gained many points for the upset victory!

---

### Scenario 3: Equal Rated Players

**Before Battle:**
- Winner: 1200 ELO
- Loser: 1200 ELO

**Win Probability:**
- Both have **50%** chance to win

**After Battle:**
- Winner: 1200 → **1216** (+16)
- Loser: 1200 → **1184** (-16)

**Analysis:** Standard 16-point exchange for equal matches.

---

### Scenario 4: Massive Skill Gap

**Before Battle:**
- Winner: 1800 ELO (Master)
- Loser: 1000 ELO (Silver)

**Win Probability:**
- Winner has **99%** chance to win

**After Battle:**
- Winner: 1800 → **1800** (+0)
- Loser: 1000 → **1000** (+0)

**Analysis:** Almost no rating change due to extreme mismatch.

---

## 🔧 API Reference

### Core Functions

#### `calculateExpectedScore(playerRating, opponentRating)`

Calculate the probability of a player winning.

```typescript
const expected = calculateExpectedScore(1400, 1200)
console.log(expected) // 0.76 (76% win chance)
```

**Parameters:**
- `playerRating` (number): Current rating of the player
- `opponentRating` (number): Current rating of the opponent

**Returns:** Number between 0 and 1 (win probability)

---

#### `calculateNewRating(currentRating, expectedScore, actualScore, kFactor)`

Calculate a player's new rating after a match.

```typescript
const expected = calculateExpectedScore(1400, 1200)
const newRating = calculateNewRating(1400, expected, 1, 32)
console.log(newRating) // 1408
```

**Parameters:**
- `currentRating` (number): Player's current rating
- `expectedScore` (number): Expected score from `calculateExpectedScore()`
- `actualScore` (number): 1 for win, 0 for loss, 0.5 for draw
- `kFactor` (number): K-factor (default: 32)

**Returns:** New rating (rounded integer)

---

#### `calculateBattleElo(outcome, config?)`

Calculate ELO changes for both players in a battle.

```typescript
const outcome = {
  winnerId: 'user1',
  winnerRating: 1400,
  loserId: 'user2',
  loserRating: 1200,
}

const [winnerResult, loserResult] = calculateBattleElo(outcome)

console.log(winnerResult)
// {
//   playerId: 'user1',
//   oldRating: 1400,
//   newRating: 1408,
//   change: +8,
//   expectedScore: 0.76
// }
```

**Parameters:**
- `outcome` (BattleOutcome): Battle result with IDs and ratings
- `config` (EloConfig, optional): Custom K-factor and defaults

**Returns:** `[EloResult, EloResult]` for winner and loser

---

### Utility Functions

#### `formatEloChange(change)`

Format rating change with +/- prefix.

```typescript
formatEloChange(15)  // "+15"
formatEloChange(-8)  // "-8"
formatEloChange(0)   // "+0"
```

---

#### `getRatingTier(rating)`

Get tier name for a rating.

```typescript
getRatingTier(800)   // "Bronze"
getRatingTier(1400)  // "Platinum"
getRatingTier(2000)  // "Grandmaster"
```

---

#### `getRatingColor(rating)`

Get hex color for a rating tier.

```typescript
getRatingColor(1400)  // "#E5E4E2" (Platinum)
getRatingColor(1800)  // "#9B30FF" (Master)
```

---

#### `getWinProbability(playerRating, opponentRating)`

Get formatted win probability percentage.

```typescript
getWinProbability(1400, 1200)  // "76%"
getWinProbability(1200, 1400)  // "24%"
```

---

#### `isValidRating(rating)`

Validate a rating value.

```typescript
isValidRating(1200)  // true
isValidRating(-100)  // false
isValidRating(5001)  // false
```

---

## 🔌 Integration with Socket.IO

The ELO system is automatically integrated with the battle completion event:

```typescript
// When a battle completes (in socket-server.ts)
socket.on('code_submit', async ({ matchId, code, language }) => {
  // ... execute code against test cases ...
  
  if (result.success) {
    // Calculate ELO changes for 1v1 matches
    const [winnerEloResult, loserEloResult] = calculateBattleElo({
      winnerId: winner.userId,
      winnerRating: winner.user.elo,
      loserId: loser.userId,
      loserRating: loser.user.elo,
    })
    
    // Update both players' ELO in database
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
    
    // Broadcast ELO changes to all participants
    io.to(matchId).emit('battle_completed', {
      winnerId: user.userId,
      winnerUsername: user.username,
      eloChanges: [winnerEloResult, loserEloResult],
    })
  }
})
```

---

## 📱 Frontend Usage

### In Battle Room

```typescript
import { useBattleSocket } from '@/lib/use-battle-socket'

function BattleRoom({ matchId }) {
  const { eloChanges, battleState } = useBattleSocket(matchId)
  
  if (battleState?.status === 'completed' && eloChanges) {
    return (
      <div>
        <h2>Battle Complete!</h2>
        {eloChanges.map(change => (
          <div key={change.playerId}>
            <span>{change.playerId === battleState.winnerId ? '🏆' : '💔'}</span>
            <span>{change.oldRating} → {change.newRating}</span>
            <span className={change.change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {change.change >= 0 ? '+' : ''}{change.change}
            </span>
          </div>
        ))}
      </div>
    )
  }
}
```

---

## 🧪 Testing

Run the ELO system tests:

```bash
npx tsx test-elo-system.ts
```

**Test Coverage:**
- ✅ Expected score calculation
- ✅ New rating calculation
- ✅ Full battle ELO calculation
- ✅ Rating tiers
- ✅ Win probability display
- ✅ Rating validation
- ✅ Realistic battle scenarios

**Test Results:**
```
📊 Test 7: Realistic Battle Scenarios
==================================================

  Newcomer vs Newcomer:
  Before: Winner 1200 vs Loser 1200
  After:  Winner 1216 (+16) vs Loser 1184 (-16)
  Winner had 50% chance to win

  Experienced vs Newcomer:
  Before: Winner 1500 vs Loser 1200
  After:  Winner 1505 (+5) vs Loser 1195 (-5)
  Winner had 85% chance to win

  Major Upset:
  Before: Winner 1000 vs Loser 1700
  After:  Winner 1031 (+31) vs Loser 1669 (-31)
  Winner had 2% chance to win

  Top Players Battle:
  Before: Winner 1900 vs Loser 1850
  After:  Winner 1914 (+14) vs Loser 1836 (-14)
  Winner had 57% chance to win
```

---

## 💡 Design Decisions

### Why K=32?

- **Standard for online games** (Chess uses 10-40)
- **Balanced volatility** - Not too stable, not too chaotic
- **Faster skill discovery** for new players
- **Noticeable progress** without wild swings

### Why Default 1200?

- **Industry standard** (used by Lichess, Chess.com)
- **Room for growth** both up and down
- **Psychological benefit** - feels better than starting at 0
- **Matches Gold tier** - intermediate starting point

### Group Battles

Currently, ELO is only calculated for **1v1 matches**. Group battles (3+ players) will use a different system in the future:
- **Placement-based** - Points based on finish position
- **Multi-opponent** - Calculate against each opponent
- **Tournament-style** - Swiss or round-robin ELO

---

## 🎮 Player Progression Examples

### Beginner → Intermediate (1000 → 1400)

| Match | Opponent | Result | Change | New Rating |
|-------|----------|--------|--------|------------|
| 1 | 1000 | Win | +16 | 1016 |
| 2 | 1050 | Win | +17 | 1033 |
| 3 | 1100 | Win | +18 | 1051 |
| ... | ... | ... | ... | ... |
| 25 | 1350 | Win | +12 | 1400 |

**Total Wins Needed:** ~25-30 consecutive wins against similar opponents

---

### Maintaining Master Rank (1800)

| Match | Opponent | Result | Change | New Rating |
|-------|----------|--------|--------|------------|
| 1 | 1750 | Win | +14 | 1814 |
| 2 | 1800 | Loss | -16 | 1798 |
| 3 | 1850 | Win | +18 | 1816 |
| 4 | 1600 | Win | +7 | 1823 |

**To maintain:** Need ~50% win rate against similar-skilled opponents

---

## 🚀 Future Enhancements

### Planned Features

1. **Rating Decay**
   - Reduce ratings for inactive players
   - Encourages regular play

2. **Provisional Ratings**
   - Higher K-factor (K=40) for first 10-20 games
   - Faster convergence to true skill level

3. **Glicko-2 System**
   - More sophisticated than ELO
   - Accounts for rating reliability
   - Used by Lichess, Rocket League

4. **Seasonal Resets**
   - Soft reset each season
   - Keeps ladder competitive

5. **Rating Floors**
   - Prevent falling below certain thresholds
   - Based on peak rating achieved

---

## 📚 Resources

### Mathematical Background
- [ELO Rating System - Wikipedia](https://en.wikipedia.org/wiki/Elo_rating_system)
- [Chess Rating Systems](https://en.chessbase.com/post/elo-rating-system-explained)

### Implementation References
- **Lichess** - Open source chess platform using Glicko-2
- **Rocket League** - Uses modified ELO for team games
- **League of Legends** - Started with ELO, now uses MMR

### Online Calculators
- [ELO Calculator](https://www.omnicalculator.com/sports/elo)
- [Expected Score Calculator](https://ratings.fide.com/calculator_rtg.phtml)

---

## ✅ Status

**Implementation Status:** ✅ **COMPLETE**

- ✅ Core ELO calculation functions
- ✅ Rating tier system
- ✅ Socket.IO integration
- ✅ Database updates (User.elo, wins, losses)
- ✅ Comprehensive test suite
- ✅ Frontend hook integration
- ✅ Documentation complete

**Next Step:** Build the Results Page to display ELO changes in a beautiful UI! 🎨

---

## 🎯 Quick Reference

```typescript
// Import the ELO system
import {
  calculateBattleElo,
  formatEloChange,
  getRatingTier,
  getRatingColor,
  getWinProbability,
} from './lib/elo'

// Calculate battle outcome
const [winner, loser] = calculateBattleElo({
  winnerId: 'alice',
  winnerRating: 1400,
  loserId: 'bob',
  loserRating: 1200,
})

// Display results
console.log(`Winner: ${winner.oldRating} → ${winner.newRating}`)
console.log(`Change: ${formatEloChange(winner.change)}`)
console.log(`Tier: ${getRatingTier(winner.newRating)}`)
console.log(`Color: ${getRatingColor(winner.newRating)}`)
```

**That's it! Your competitive coding platform now has a professional ELO rating system!** 🏆
