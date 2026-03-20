import { Suspense } from 'react'
import { getTrackerData } from '@/lib/espn'
import { USER_CONTRIBUTION, TOTAL_TEAM_SPEND } from '@/lib/config'
import PayoutTable from '@/components/PayoutTable'
import AutoRefresh from '@/components/AutoRefresh'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

async function TrackerContent() {
  const data = await getTrackerData()
  const { teams, totalPayout, userEarnings, userNet, userRoi, userOwnershipPct } = data

  const updated = new Date(data.lastUpdated).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  const aliveTeams = teams.filter(t => !t.eliminated && t.wins < 6)
  const eliminatedTeams = teams.filter(t => t.eliminated)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <AutoRefresh />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">2026 March Madness Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">Auction Pool · Team Portfolio</p>
          </div>
          <span className="text-xs text-gray-500">Updated {updated}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* My Summary */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">My Position</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Invested" value={fmt(USER_CONTRIBUTION)} sub={`${(userOwnershipPct * 100).toFixed(2)}% ownership`} />
            <SummaryCard label="Earnings" value={fmt(userEarnings)} sub={`of ${fmt(totalPayout)} total`} />
            <SummaryCard
              label="Net"
              value={fmt(userNet)}
              sub={fmtPct(userRoi)}
              positive={userNet >= 0}
            />
            <SummaryCard label="Team Spend" value={fmt(TOTAL_TEAM_SPEND)} sub="7 teams" />
          </div>
        </section>

        {/* Team Results */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Team Results</h2>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Team</th>
                  <th className="text-right px-4 py-3 font-medium">Cost</th>
                  <th className="text-right px-4 py-3 font-medium">Wins</th>
                  <th className="text-right px-4 py-3 font-medium">Payout</th>
                  <th className="text-right px-4 py-3 font-medium">My Share</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Last Game</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {teams.map(team => {
                  const myShare = team.payout * userOwnershipPct
                  return (
                    <tr key={team.name} className={`transition-colors ${team.eliminated ? 'opacity-50' : 'hover:bg-gray-900/50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusDot eliminated={team.eliminated} wins={team.wins} />
                          <span className="font-medium">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300">{fmt(team.cost)}</td>
                      <td className="px-4 py-3 text-right font-mono">{team.wins}</td>
                      <td className="px-4 py-3 text-right text-green-400 font-medium">
                        {team.payout > 0 ? fmt(team.payout) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-blue-400 font-medium">
                        {myShare > 0 ? fmt(myShare) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                        {team.lastGame ?? (team.eliminated ? '—' : 'Not yet played')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 border-t border-gray-700 font-semibold">
                  <td className="px-4 py-3 text-gray-300">Total</td>
                  <td className="px-4 py-3 text-right text-gray-300">{fmt(TOTAL_TEAM_SPEND)}</td>
                  <td className="px-4 py-3 text-right">{teams.reduce((s, t) => s + t.wins, 0)}</td>
                  <td className="px-4 py-3 text-right text-green-400">{fmt(totalPayout)}</td>
                  <td className="px-4 py-3 text-right text-blue-400">{fmt(userEarnings)}</td>
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Status summary */}
        <section className="flex items-start justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> {aliveTeams.length} alive</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-600 inline-block" /> {eliminatedTeams.length} eliminated</span>
          </div>
          <PayoutTable />
        </section>

      </main>
    </div>
  )
}

function SummaryCard({
  label, value, sub, positive,
}: {
  label: string; value: string; sub?: string; positive?: boolean
}) {
  const valueColor = positive === undefined
    ? 'text-white'
    : positive
    ? 'text-green-400'
    : 'text-red-400'

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function StatusDot({ eliminated, wins }: { eliminated: boolean; wins: number }) {
  if (wins === 6) return <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" title="Champion" />
  if (eliminated) return <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" title="Eliminated" />
  return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" title="Still alive" />
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TrackerContent />
    </Suspense>
  )
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading tournament data…</p>
    </div>
  )
}
