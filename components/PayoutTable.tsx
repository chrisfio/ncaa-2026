'use client'

import { useState } from 'react'
import { PAYOUT_TABLE } from '@/lib/config'

const ROUND_LABELS: Record<number, string> = {
  0: 'No wins',
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite 8',
  5: 'Final Four',
  6: 'Championship',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export default function PayoutTable() {
  const [open, setOpen] = useState(false)

  return (
    <div className="text-xs text-gray-500">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 hover:text-gray-300 transition-colors cursor-pointer"
      >
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        Payout table
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-gray-800 overflow-hidden w-64">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-gray-400">
                <th className="text-left px-3 py-2 font-medium">Round</th>
                <th className="text-right px-3 py-2 font-medium">Wins</th>
                <th className="text-right px-3 py-2 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {Object.entries(PAYOUT_TABLE)
                .filter(([wins]) => Number(wins) > 0)
                .map(([wins, payout]) => (
                  <tr key={wins} className="bg-gray-950">
                    <td className="px-3 py-1.5 text-gray-400">{ROUND_LABELS[Number(wins)]}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{wins}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-green-400">{fmt(payout)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
