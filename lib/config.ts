export const TEAMS = [
  { name: 'Arizona',    espnName: 'Arizona Wildcats',              cost: 26500 },
  { name: 'Illinois',   espnName: 'Illinois Fighting Illini',      cost: 8300  },
  { name: 'Gonzaga',    espnName: 'Gonzaga Bulldogs',              cost: 5500  },
  { name: 'UCLA',       espnName: 'UCLA Bruins',                   cost: 2300  },
  { name: 'Ohio State', espnName: 'Ohio State Buckeyes',           cost: 1300  },
  { name: 'Texas',      espnName: 'Texas Longhorns',               cost: 1100  },
  { name: 'Long Island',espnName: 'Long Island University Sharks', cost: 225   },
]

export const PAYOUT_TABLE: Record<number, number> = {
  0: 0,
  1: 1538,
  2: 4176,
  3: 10110,
  4: 18242,
  5: 30330,
  6: 47913,
}

export const TOTAL_TEAM_SPEND = 45225
export const USER_CONTRIBUTION = 500

// All possible tournament game dates
export const TOURNAMENT_DATES = [
  '20260318', // Play-in games
  '20260319', // First Round Day 1
  '20260320', // First Round Day 2
  '20260321', // Second Round Day 1
  '20260322', // Second Round Day 2
  '20260326', // Sweet 16 Day 1
  '20260327', // Sweet 16 Day 2
  '20260328', // Elite 8 Day 1
  '20260329', // Elite 8 Day 2
  '20260404', // Final Four
  '20260406', // Championship
]
