'use client'

import { useState, Fragment } from 'react'
import { PAYOUT_TABLE, TOTAL_TEAM_SPEND, USER_CONTRIBUTION } from '@/lib/config'
import type { TrackerData, NextGame } from '@/lib/espn'

const ROUND_LABELS: Record<number, string> = {
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite 8',
  5: 'Final Four',
  6: 'Championship',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

function formatGameTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })
}

function NextGameBadge({ next }: { next: NextGame }) {
  const live = next.statusName === 'STATUS_IN_PROGRESS'
  const halftime = next.statusName === 'STATUS_HALFTIME'
  const isActive = live || halftime

  if (isActive) {
    const our = Number(next.ourScore ?? 0)
    const their = Number(next.theirScore ?? 0)
    const scoreColor = our > their ? 'text-green-400' : our < their ? 'text-red-400' : 'text-gray-300'

    return (
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
        <span className="text-gray-300 font-medium">
          {next.detail ?? (halftime ? 'Halftime' : 'Live')} ·{' '}
          <span className={scoreColor}>{next.ourScore}-{next.theirScore}</span>
          {' '}vs {next.opponent}
        </span>
      </span>
    )
  }

  return (
    <span className="text-gray-300">
      vs {next.opponent} · {formatGameTime(next.time)}
    </span>
  )
}

function NetBadge({ value }: { value: number }) {
  const color = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
  return <span className={`font-medium tabular-nums ${color}`}>{fmt(value)}</span>
}

function StatusDot({ eliminated, wins }: { eliminated: boolean; wins: number }) {
  if (wins === 6) return <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0 inline-block" />
  if (eliminated) return <span className="w-2 h-2 rounded-full bg-gray-600 shrink-0 inline-block" />
  return <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 inline-block" />
}

function SummaryCard({ label, value, sub, positive }: {
  label: string; value: string; sub?: string; positive?: boolean
}) {
  const color = positive === undefined ? 'text-white' : positive ? 'text-green-400' : 'text-red-400'
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

function PayoutTableSection() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        Payout table
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                <th className="text-left px-4 py-2.5 font-medium">Round</th>
                <th className="text-right px-4 py-2.5 font-medium">Wins</th>
                <th className="text-right px-4 py-2.5 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {Object.entries(PAYOUT_TABLE)
                .filter(([w]) => Number(w) > 0)
                .map(([wins, payout]) => (
                  <tr key={wins} className="bg-gray-950">
                    <td className="px-4 py-2 text-gray-300">{ROUND_LABELS[Number(wins)]}</td>
                    <td className="px-4 py-2 text-right tabular-nums">{wins}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-green-400">{fmt(payout)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

type Mode = 'team' | 'mine'

export default function TrackerView({ data }: { data: TrackerData }) {
  const [mode, setMode] = useState<Mode>('team')
  const [contribution, setContribution] = useState(USER_CONTRIBUTION)
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const { teams, totalPayout } = data

  const userOwnershipPct = contribution / TOTAL_TEAM_SPEND
  const userEarnings = totalPayout * userOwnershipPct
  const userNet = userEarnings - contribution
  const userRoi = contribution > 0 ? (userNet / contribution) * 100 : 0

  const totalTeamNet = totalPayout - TOTAL_TEAM_SPEND
  const totalTeamRoi = (totalTeamNet / TOTAL_TEAM_SPEND) * 100

  const aliveCount = teams.filter(t => !t.eliminated && t.wins < 6).length
  const eliminatedCount = teams.filter(t => t.eliminated).length

  const updated = new Date(data.lastUpdated).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  })

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-bold tracking-tight sm:text-xl">2026 March Madness</h1>
            <p className="text-xs text-gray-400 mt-0.5">Auction Pool Tracker</p>
          </div>
          <span className="text-xs text-gray-500 shrink-0">Updated {updated}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-gray-900 border border-gray-700 p-1 gap-1">
            {(['mine', 'team'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {m === 'mine' ? 'My Share' : 'Team Total'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <section>
          {mode === 'mine' && (
            <div className="flex items-center gap-2 mb-3">
              <label className="text-xs text-gray-400 shrink-0">My contribution</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={contribution}
                  onChange={e => setContribution(Math.max(0, Number(e.target.value)))}
                  className="bg-gray-900 border border-gray-700 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white w-32 focus:outline-none focus:border-blue-500 tabular-nums"
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {mode === 'mine' ? (
              <>
                <SummaryCard label="Invested" value={fmt(contribution)} sub={`${(userOwnershipPct * 100).toFixed(2)}% ownership`} />
                <SummaryCard label="Earned" value={fmt(userEarnings)} sub={`of ${fmt(totalPayout)} total`} />
                <SummaryCard label="Net" value={fmt(userNet)} sub={fmtPct(userRoi)} positive={userNet >= 0} />
                <SummaryCard label="ROI" value={fmtPct(userRoi)} positive={userRoi >= 0} />
              </>
            ) : (
              <>
                <SummaryCard label="Spent" value={fmt(TOTAL_TEAM_SPEND)} sub="7 teams" />
                <SummaryCard label="Earned" value={fmt(totalPayout)} sub="from wins so far" />
                <SummaryCard label="Net" value={fmt(totalTeamNet)} positive={totalTeamNet >= 0} />
                <SummaryCard label="ROI" value={fmtPct(totalTeamRoi)} positive={totalTeamRoi >= 0} />
              </>
            )}
          </div>
        </section>

        {/* Team Table */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Teams</h2>
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium">Team</th>
                  <th className="text-right px-3 py-2.5 sm:px-4 sm:py-3 font-medium hidden sm:table-cell">Cost</th>
                  <th className="text-right px-3 py-2.5 sm:px-4 sm:py-3 font-medium">Wins</th>
                  <th className="text-right px-3 py-2.5 sm:px-4 sm:py-3 font-medium hidden sm:table-cell">Payout</th>
                  <th className="text-right px-3 py-2.5 sm:px-4 sm:py-3 font-medium">Net</th>
                  <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium hidden sm:table-cell">Last Game</th>
                  <th className="text-left px-3 py-2.5 sm:px-4 sm:py-3 font-medium hidden sm:table-cell">Next Game</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {teams.map(team => {
                  const teamNet = team.payout - team.cost
                  const myNet = userOwnershipPct * teamNet
                  const isExpanded = expandedTeam === team.name

                  return (
                    <Fragment key={team.name}>
                      {/* Main row — tappable on mobile */}
                      <tr
                        onClick={() => setExpandedTeam(isExpanded ? null : team.name)}
                        className={`transition-colors cursor-pointer sm:cursor-default ${
                          team.eliminated ? 'opacity-50' : 'hover:bg-gray-900/50'
                        } ${isExpanded ? 'bg-gray-900/50' : ''}`}
                      >
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                          <div className="flex items-center gap-2">
                            <StatusDot eliminated={team.eliminated} wins={team.wins} />
                            <span className="font-medium">{team.name}</span>
                            {/* Expand chevron — mobile only */}
                            <svg
                              className={`w-3.5 h-3.5 text-gray-500 ml-auto transition-transform sm:hidden ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right text-gray-300 hidden sm:table-cell">
                          {fmt(team.cost)}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right font-mono">{team.wins}</td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right text-green-400 font-medium hidden sm:table-cell">
                          {team.payout > 0 ? fmt(team.payout) : '—'}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                          <NetBadge value={mode === 'mine' ? myNet : teamNet} />
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs text-gray-400 hidden sm:table-cell">
                          {team.lastGame ?? (team.eliminated ? '—' : 'Not yet played')}
                        </td>
                        <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs hidden sm:table-cell">
                          {team.nextGame
                            ? <NextGameBadge next={team.nextGame} />
                            : <span className="text-gray-500">{team.eliminated ? '—' : 'TBD'}</span>
                          }
                        </td>
                      </tr>

                      {/* Expanded detail row — mobile only */}
                      {isExpanded && (
                        <tr className="sm:hidden bg-gray-900/30">
                          <td colSpan={3} className="px-4 py-3">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Auction cost</span>
                                <span className="text-gray-200">{fmt(team.cost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Payout earned</span>
                                <span className="text-green-400">{team.payout > 0 ? fmt(team.payout) : '—'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Team net</span>
                                <NetBadge value={teamNet} />
                              </div>
                              {team.lastGame && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400 shrink-0">Last game</span>
                                  <span className="text-gray-200 text-right">{team.lastGame}</span>
                                </div>
                              )}
                              {team.nextGame && (
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400 shrink-0">Next game</span>
                                  <span className="text-right text-xs leading-snug">
                                    <NextGameBadge next={team.nextGame} />
                                  </span>
                                </div>
                              )}
                              {!team.nextGame && !team.eliminated && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Next game</span>
                                  <span className="text-gray-500">TBD</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 border-t border-gray-700 font-semibold text-sm">
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-gray-300">Total</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right text-gray-300 hidden sm:table-cell">{fmt(TOTAL_TEAM_SPEND)}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">{teams.reduce((s, t) => s + t.wins, 0)}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right text-green-400 hidden sm:table-cell">{fmt(totalPayout)}</td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                    <NetBadge value={mode === 'mine' ? userNet : totalTeamNet} />
                  </td>
                  <td className="hidden sm:table-cell" />
                  <td className="hidden sm:table-cell" />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Footer */}
        <section className="space-y-4 pb-6">
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              {aliveCount} alive
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
              {eliminatedCount} eliminated
            </span>
          </div>
          <PayoutTableSection />
        </section>

      </main>
    </div>
  )
}
