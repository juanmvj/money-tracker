'use client'

import { useState } from 'react'
import { upsertBudget, getBudget } from '@/app/actions'
import { monthKey } from '@/lib/types'

function formatLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function BudgetSection({
  householdId,
  initialYear,
  initialMonth,
  initialBudget,
}: {
  householdId: string
  initialYear: number
  initialMonth: number
  initialBudget: number | null
}) {
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [amount, setAmount] = useState(initialBudget?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [saved, setSaved] = useState(false)

  async function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }

    setFetching(true)
    setSaved(false)
    setError(null)
    const result = await getBudget(householdId, monthKey(y, m))
    setYear(y)
    setMonth(m)
    setAmount(result.amount?.toString() ?? '')
    setFetching(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)
    const result = await upsertBudget(householdId, monthKey(year, month), parseFloat(amount))
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h2 className="text-base font-semibold text-zinc-900 mb-4">Monthly budget</h2>

      {/* Month navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          disabled={fetching}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-40"
        >
          ←
        </button>
        <span className="text-sm font-semibold text-zinc-800 w-32 text-center">
          {formatLabel(year, month)}
        </span>
        <button
          onClick={() => navigate(1)}
          disabled={fetching}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors disabled:opacity-40"
        >
          →
        </button>
        {fetching && <span className="text-xs text-zinc-400">Loading…</span>}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-xs">
        <div className="flex-1">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">$</span>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setSaved(false) }}
              className="w-full rounded-lg border border-zinc-300 pl-7 pr-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || fetching}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-2 text-sm text-green-600">Budget saved for {formatLabel(year, month)}!</p>}
    </section>
  )
}
