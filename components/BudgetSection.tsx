'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { upsertBudget } from '@/app/actions'

export default function BudgetSection({
  householdId,
  month,
  currentBudget,
}: {
  householdId: string
  month: string
  currentBudget: number | null
}) {
  const router = useRouter()
  const [amount, setAmount] = useState(currentBudget?.toString() ?? '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const label = new Date(month + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)
    const result = await upsertBudget(householdId, month, parseFloat(amount))
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Monthly budget</h2>
      <p className="text-sm text-zinc-500 mb-4">Budget for {label}</p>

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
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 pl-7 pr-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {saved && <p className="mt-2 text-sm text-green-600">Budget saved!</p>}
    </section>
  )
}
