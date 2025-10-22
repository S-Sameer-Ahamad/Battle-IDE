/**
 * ELO Rating System
 * 
 * Implements the standard ELO rating algorithm used in competitive games.
 * Used to calculate skill rating changes after 1v1 coding battles.
 * 
 * Formula:
 * - Expected Score: E_A = 1 / (1 + 10^((R_B - R_A) / 400))
 * - New Rating: R'_A = R_A + K * (S_A - E_A)
 * 
 * Where:
 * - R_A, R_B = Current ratings of players A and B
 * - E_A = Expected score for player A (0 to 1)
 * - S_A = Actual score (1 for win, 0 for loss)
 * - K = K-factor (sensitivity of rating changes)
 */

/**
 * ELO rating change result for a player
 */
export interface EloResult {
  playerId: string
  oldRating: number
  newRating: number
  change: number // Can be positive or negative
  expectedScore: number // Probability of winning (0-1)
}

/**
 * Battle outcome for ELO calculation
 */
export interface BattleOutcome {
  winnerId: string
  winnerRating: number
  loserId: string
  loserRating: number
}

/**
 * Configuration for ELO calculations
 */
export interface EloConfig {
  kFactor: number // Default: 32
  defaultRating: number // Default: 1200
}

/**
 * Default ELO configuration
 */
const DEFAULT_CONFIG: EloConfig = {
  kFactor: 32,
  defaultRating: 1200,
}

/**
 * Calculate expected score (win probability) for a player
 * 
 * @param playerRating - Current rating of the player
 * @param opponentRating - Current rating of the opponent
 * @returns Expected score between 0 and 1 (probability of winning)
 * 
 * @example
 * // Player with 1400 rating vs opponent with 1200 rating
 * const expected = calculateExpectedScore(1400, 1200)
 * console.log(expected) // ~0.76 (76% chance to win)
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  const exponent = (opponentRating - playerRating) / 400
  const expectedScore = 1 / (1 + Math.pow(10, exponent))
  return expectedScore
}

/**
 * Calculate new ELO rating after a match
 * 
 * @param currentRating - Player's current rating
 * @param expectedScore - Expected score (from calculateExpectedScore)
 * @param actualScore - Actual score (1 for win, 0 for loss, 0.5 for draw)
 * @param kFactor - K-factor (sensitivity of rating change)
 * @returns New rating after the match
 * 
 * @example
 * const expected = calculateExpectedScore(1400, 1200)
 * const newRating = calculateNewRating(1400, expected, 1, 32)
 * console.log(newRating) // ~1408 (gained 8 points for expected win)
 */
export function calculateNewRating(
  currentRating: number,
  expectedScore: number,
  actualScore: number,
  kFactor: number = DEFAULT_CONFIG.kFactor
): number {
  const ratingChange = kFactor * (actualScore - expectedScore)
  const newRating = Math.round(currentRating + ratingChange)
  return newRating
}

/**
 * Calculate ELO rating changes for both players after a battle
 * 
 * @param outcome - Battle outcome with winner/loser IDs and ratings
 * @param config - Optional ELO configuration (uses defaults if not provided)
 * @returns Array of EloResult for winner and loser
 * 
 * @example
 * const outcome = {
 *   winnerId: 'user1',
 *   winnerRating: 1400,
 *   loserId: 'user2',
 *   loserRating: 1200,
 * }
 * 
 * const results = calculateBattleElo(outcome)
 * console.log(results[0]) // Winner: { oldRating: 1400, newRating: 1408, change: +8 }
 * console.log(results[1]) // Loser: { oldRating: 1200, newRating: 1192, change: -8 }
 */
export function calculateBattleElo(
  outcome: BattleOutcome,
  config: Partial<EloConfig> = {}
): [EloResult, EloResult] {
  const { kFactor = DEFAULT_CONFIG.kFactor } = config

  // Calculate expected scores for both players
  const winnerExpected = calculateExpectedScore(
    outcome.winnerRating,
    outcome.loserRating
  )
  const loserExpected = calculateExpectedScore(
    outcome.loserRating,
    outcome.winnerRating
  )

  // Calculate new ratings (winner gets 1, loser gets 0)
  const winnerNewRating = calculateNewRating(
    outcome.winnerRating,
    winnerExpected,
    1, // Win
    kFactor
  )
  const loserNewRating = calculateNewRating(
    outcome.loserRating,
    loserExpected,
    0, // Loss
    kFactor
  )

  // Calculate rating changes
  const winnerChange = winnerNewRating - outcome.winnerRating
  const loserChange = loserNewRating - outcome.loserRating

  // Return results for both players
  const winnerResult: EloResult = {
    playerId: outcome.winnerId,
    oldRating: outcome.winnerRating,
    newRating: winnerNewRating,
    change: winnerChange,
    expectedScore: winnerExpected,
  }

  const loserResult: EloResult = {
    playerId: outcome.loserId,
    oldRating: outcome.loserRating,
    newRating: loserNewRating,
    change: loserChange,
    expectedScore: loserExpected,
  }

  return [winnerResult, loserResult]
}

/**
 * Format ELO change for display (with + or - prefix)
 * 
 * @param change - Rating change value
 * @returns Formatted string with sign
 * 
 * @example
 * formatEloChange(15) // "+15"
 * formatEloChange(-8) // "-8"
 * formatEloChange(0) // "+0"
 */
export function formatEloChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change}`
}

/**
 * Get rating tier/rank name based on ELO rating
 * 
 * @param rating - Current ELO rating
 * @returns Tier name
 * 
 * @example
 * getRatingTier(800) // "Bronze"
 * getRatingTier(1400) // "Gold"
 * getRatingTier(2000) // "Master"
 */
export function getRatingTier(rating: number): string {
  if (rating < 1000) return 'Bronze'
  if (rating < 1200) return 'Silver'
  if (rating < 1400) return 'Gold'
  if (rating < 1600) return 'Platinum'
  if (rating < 1800) return 'Diamond'
  if (rating < 2000) return 'Master'
  return 'Grandmaster'
}

/**
 * Get color for rating tier (for UI display)
 * 
 * @param rating - Current ELO rating
 * @returns Hex color code
 */
export function getRatingColor(rating: number): string {
  if (rating < 1000) return '#CD7F32' // Bronze
  if (rating < 1200) return '#C0C0C0' // Silver
  if (rating < 1400) return '#FFD700' // Gold
  if (rating < 1600) return '#E5E4E2' // Platinum
  if (rating < 1800) return '#B9F2FF' // Diamond
  if (rating < 2000) return '#9B30FF' // Master
  return '#FF1493' // Grandmaster (Deep Pink)
}

/**
 * Calculate win probability percentage for display
 * 
 * @param playerRating - Current rating of the player
 * @param opponentRating - Current rating of the opponent
 * @returns Win probability as percentage string
 * 
 * @example
 * getWinProbability(1400, 1200) // "76%"
 * getWinProbability(1200, 1400) // "24%"
 */
export function getWinProbability(
  playerRating: number,
  opponentRating: number
): string {
  const expected = calculateExpectedScore(playerRating, opponentRating)
  const percentage = Math.round(expected * 100)
  return `${percentage}%`
}

/**
 * Validate ELO rating value
 * 
 * @param rating - Rating to validate
 * @returns True if valid rating
 */
export function isValidRating(rating: number): boolean {
  return (
    typeof rating === 'number' &&
    !isNaN(rating) &&
    rating >= 0 &&
    rating <= 5000
  )
}

/**
 * Default export with all ELO functions
 */
export default {
  calculateExpectedScore,
  calculateNewRating,
  calculateBattleElo,
  formatEloChange,
  getRatingTier,
  getRatingColor,
  getWinProbability,
  isValidRating,
  DEFAULT_CONFIG,
}
