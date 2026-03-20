import { cacheLife } from 'next/cache'
import { TEAMS, PAYOUT_TABLE, TOURNAMENT_DATES, TOTAL_TEAM_SPEND, USER_CONTRIBUTION } from './config'

export type TeamResult = {
  name: string
  cost: number
  wins: number
  payout: number
  eliminated: boolean
  lastGame?: string  // e.g. "W 92-58 vs Long Island"
}

export type TrackerData = {
  teams: TeamResult[]
  totalPayout: number
  userEarnings: number
  userNet: number
  userRoi: number
  userOwnershipPct: number
  lastUpdated: string
}

interface ESPNCompetitor {
  team: { displayName: string }
  score: string
  winner?: boolean
}

interface ESPNEvent {
  status: { type: { completed: boolean } }
  competitions: Array<{ competitors: ESPNCompetitor[] }>
}

export async function getTrackerData(): Promise<TrackerData> {
  'use cache'
  cacheLife({ revalidate: 120, stale: 60, expire: 86400 })

  const wins: Record<string, number> = {}
  const eliminated: Record<string, boolean> = {}
  const lastGame: Record<string, string> = {}

  for (const t of TEAMS) {
    wins[t.name] = 0
    eliminated[t.name] = false
  }

  // Fetch all tournament dates in parallel
  const responses = await Promise.all(
    TOURNAMENT_DATES.map(date =>
      fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?groups=100&limit=100&dates=${date}`
      )
        .then(r => r.json())
        .catch(() => ({ events: [] }))
    )
  )

  for (const data of responses) {
    for (const event of (data.events ?? []) as ESPNEvent[]) {
      if (!event.status.type.completed) continue

      const competitors = event.competitions[0]?.competitors ?? []
      const winner = competitors.find(c => c.winner)
      const loser = competitors.find(c => !c.winner)
      if (!winner || !loser) continue

      for (const team of TEAMS) {
        if (winner.team.displayName === team.espnName) {
          wins[team.name]++
          lastGame[team.name] = `W ${winner.score}-${loser.score} vs ${loser.team.displayName}`
        } else if (loser.team.displayName === team.espnName) {
          eliminated[team.name] = true
          lastGame[team.name] = `L ${loser.score}-${winner.score} vs ${winner.team.displayName}`
        }
      }
    }
  }

  const teams: TeamResult[] = TEAMS.map(t => {
    const w = wins[t.name]
    return {
      name: t.name,
      cost: t.cost,
      wins: w,
      payout: PAYOUT_TABLE[w] ?? 0,
      eliminated: eliminated[t.name],
      lastGame: lastGame[t.name],
    }
  }).sort((a, b) => b.cost - a.cost)

  const totalPayout = teams.reduce((sum, t) => sum + t.payout, 0)
  const userOwnershipPct = USER_CONTRIBUTION / TOTAL_TEAM_SPEND
  const userEarnings = totalPayout * userOwnershipPct
  const userNet = userEarnings - USER_CONTRIBUTION
  const userRoi = (userNet / USER_CONTRIBUTION) * 100

  return {
    teams,
    totalPayout,
    userEarnings,
    userNet,
    userRoi,
    userOwnershipPct,
    lastUpdated: new Date().toISOString(),
  }
}
