'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createHousehold, joinHousehold } from '@/app/actions'

type Household = { id: string; name: string; invite_code: string } | null

export default function HouseholdSection({
  household,
}: {
  household: Household
  userId: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'create' | 'join'>('idle')
  const [householdName, setHouseholdName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await createHousehold(householdName)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await joinHousehold(inviteCode)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (household) {
    return (
      <section className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4">Household</h2>
        <p className="text-sm text-zinc-600 mb-1">
          <span className="font-medium text-zinc-800">{household.name}</span>
        </p>
        <p className="text-sm text-zinc-500">
          Invite code:{' '}
          <span className="font-mono font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded">
            {household.invite_code}
          </span>
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          Share this code with your partner so they can join.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl border border-zinc-200 p-6">
      <h2 className="text-base font-semibold text-zinc-900 mb-1">Household</h2>
      <p className="text-sm text-zinc-500 mb-4">
        Create a new household or join one with an invite code.
      </p>

      {mode === 'idle' && (
        <div className="flex gap-3">
          <button
            onClick={() => setMode('create')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Create household
          </button>
          <button
            onClick={() => setMode('join')}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Join with code
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Household name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Smith Family"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('idle'); setError(null) }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="flex flex-col gap-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Invite code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HAWK-4921"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 font-mono uppercase outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Joining…' : 'Join'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('idle'); setError(null) }}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
