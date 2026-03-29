'use client'

import { useState } from 'react'
import { PAYOUT_TABLE, TOTAL_TEAM_SPEND } from '@/lib/config'
import type { TrackerData, FinalFourGame, FinalFourSlot } from '@/lib/espn'

type Mode = 'team' | 'mine'

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

type EffSlot = { name: string; isOurs: boolean }

function BracketCard({
  title,
  subtitle,
  slots,
  pick,
  isCompleted,
  onPick,
  hint,
  callout,
}: {
  title: string
  subtitle?: string
  slots: EffSlot[]
  pick: string | null
  isCompleted: boolean
  onPick?: (name: string) => void
  hint?: string
  callout?: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border overflow-hidden ${callout ? 'border-yellow-600/40' : 'border-gray-800'}`}>
      <div className="bg-gray-900 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{title}</span>
          {subtitle && <span className="text-xs text-gray-600">{subtitle}</span>}
        </div>
        {callout}
      </div>
      <div className="divide-y divide-gray-800">
        {slots.map((slot, i) => {
          const isPicked = pick === slot.name
          const canClick = !isCompleted && !!onPick

          return (
            <button
              key={i}
              onClick={canClick ? () => onPick!(slot.name) : undefined}
              disabled={!canClick}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${
                isPicked
                  ? isCompleted
                    ? 'bg-yellow-500/10 text-white'
                    : 'bg-blue-600/20 text-white'
                  : isCompleted
                  ? 'text-gray-500 cursor-default'
                  : 'text-gray-300 hover:bg-gray-800/60 cursor-pointer active:bg-gray-800/80'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 flex-none ${
                slot.isOurs ? 'bg-green-500' : 'border border-gray-600'
              }`} />
              <span className={`font-medium truncate ${slot.isOurs ? 'text-white' : ''}`}>
                {slot.name}
              </span>
              {isPicked && (
                <span className="ml-auto shrink-0 text-xs font-medium">
                  {isCompleted
                    ? <span className="text-yellow-400">Won</span>
                    : <span className="text-blue-400">✓</span>
                  }
                </span>
              )}
            </button>
          )
        })}
      </div>
      {hint && <p className="px-4 py-1.5 text-[11px] text-gray-600">{hint}</p>}
    </div>
  )
}

function toEffSlot(slot: FinalFourSlot): EffSlot {
  return { name: slot.teamName, isOurs: slot.isOurs }
}

export default function WhatIfBracket({
  data,
  mode,
  ownershipPct,
  contribution,
}: {
  data: TrackerData
  mode: Mode
  ownershipPct: number
  contribution: number
}) {
  const finalFour = data.finalFour ?? []
  const [ff1Pick, setFf1Pick] = useState<string | null>(null)
  const [ff2Pick, setFf2Pick] = useState<string | null>(null)
  const [champPick, setChampPick] = useState<string | null>(null)

  if (finalFour.length === 0) return null

  const game1 = finalFour[0]
  const game2 = finalFour[1] ?? null

  // Effective winners: real result if completed, else user pick
  const eff1: string | null = game1.completed ? (game1.winnerName ?? null) : ff1Pick
  const eff2: string | null = game2
    ? game2.completed ? (game2.winnerName ?? null) : ff2Pick
    : null

  const handleGame1Pick = (name: string) => {
    setFf1Pick(p => p === name ? null : name)
    setChampPick(null)
  }
  const handleGame2Pick = (name: string) => {
    setFf2Pick(p => p === name ? null : name)
    setChampPick(null)
  }
  const handleChampPick = (name: string) => {
    setChampPick(p => p === name ? null : name)
  }

  // Find slot info by team name across all games
  const findSlot = (name: string): EffSlot => {
    for (const g of finalFour) {
      if (g.slot1.teamName === name) return toEffSlot(g.slot1)
      if (g.slot2.teamName === name) return toEffSlot(g.slot2)
    }
    return { name, isOurs: false }
  }

  // Championship participants
  const champ1: EffSlot | null = eff1 ? findSlot(eff1) : null
  const champ2: EffSlot | null = eff2 ? findSlot(eff2) : null
  const showChamp = champ1 !== null && (game2 ? champ2 !== null : true)
  const bothOursInChamp = showChamp && champ1?.isOurs && champ2?.isOurs

  // Projected payout (naturally equals current payout when no picks are active).
  // When both our teams are in the championship the total is guaranteed regardless
  // of who wins: one team earns PAYOUT_TABLE[6] and the other PAYOUT_TABLE[5].
  const projectedPayout = data.teams.reduce((sum, t) => {
    let wins = t.wins
    if (eff1 === t.name) wins++
    if (eff2 === t.name) wins++
    // Don't count champPick when the outcome is already guaranteed
    if (!bothOursInChamp && champPick === t.name) wins++
    return sum + (PAYOUT_TABLE[wins] ?? 0)
  }, 0) + (bothOursInChamp ? (PAYOUT_TABLE[6]! - PAYOUT_TABLE[5]!) : 0)

  const projTeamNet = projectedPayout - TOTAL_TEAM_SPEND
  const projUserEarnings = projectedPayout * ownershipPct
  const projUserNet = projUserEarnings - contribution

  const champSlots: EffSlot[] = [
    ...(champ1 ? [champ1] : []),
    ...(champ2 ? [champ2] : []),
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">What If</h2>
        <span className="text-xs text-gray-600">Tap teams to advance</span>
      </div>

      <div className="space-y-3">
        {/* Final Four games */}
        <div className={`grid gap-3 ${game2 ? 'sm:grid-cols-2' : ''}`}>
          <BracketCard
            title="Final Four"
            subtitle="· Apr 4"
            slots={[toEffSlot(game1.slot1), toEffSlot(game1.slot2)]}
            pick={game1.completed ? (game1.winnerName ?? null) : ff1Pick}
            isCompleted={game1.completed}
            onPick={game1.completed ? undefined : handleGame1Pick}
            hint={!game1.completed ? 'Tap to select winner' : undefined}
          />
          {game2 && (
            <BracketCard
              title="Final Four"
              subtitle="· Apr 4"
              slots={[toEffSlot(game2.slot1), toEffSlot(game2.slot2)]}
              pick={game2.completed ? (game2.winnerName ?? null) : ff2Pick}
              isCompleted={game2.completed}
              onPick={game2.completed ? undefined : handleGame2Pick}
              hint={!game2.completed ? 'Tap to select winner' : undefined}
            />
          )}
        </div>

        {/* Championship */}
        {showChamp && champSlots.length > 0 && (
          <BracketCard
            title="Championship"
            subtitle="· Apr 6"
            slots={champSlots}
            pick={champPick}
            isCompleted={false}
            onPick={handleChampPick}
            hint={bothOursInChamp
              ? 'Either way, the money is ours — pick your champion for fun'
              : 'Tap to select champion'
            }
            callout={bothOursInChamp
              ? <span className="text-yellow-400 text-[11px] font-semibold shrink-0">💰 Guaranteed!</span>
              : undefined
            }
          />
        )}

        {/* Scenario earnings — always visible */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2.5">
            {bothOursInChamp ? 'Guaranteed' : eff1 !== null || eff2 !== null ? 'Projected' : 'Current'}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {mode === 'team' ? (
              <>
                <span className="text-gray-400">Invested</span>
                <span className="text-right text-gray-400 tabular-nums">{fmt(TOTAL_TEAM_SPEND)}</span>
                <span className="text-gray-400">Earned</span>
                <span className="text-right text-green-400 font-medium tabular-nums">{fmt(projectedPayout)}</span>
                <span className="text-gray-400">Team Net</span>
                <span className={`text-right font-medium tabular-nums ${projTeamNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {projTeamNet >= 0 ? '+' : ''}{fmt(projTeamNet)}
                </span>
              </>
            ) : (
              <>
                <span className="text-gray-400">Invested</span>
                <span className="text-right text-gray-400 tabular-nums">{fmt(contribution)}</span>
                <span className="text-gray-400">Earned</span>
                <span className="text-right text-green-400 font-medium tabular-nums">{fmt(projUserEarnings)}</span>
                <span className="text-gray-400">Net</span>
                <span className={`text-right font-medium tabular-nums ${projUserNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {projUserNet >= 0 ? '+' : ''}{fmt(projUserNet)}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
