'use client'

import { useState } from 'react'
import { deleteExpense } from '@/app/actions'
import type { Expense } from '@/lib/types'

type ExpenseWithEmail = Expense & { email?: string }

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default function ExpenseList({
  expenses,
  currentUserId,
}: {
  expenses: ExpenseWithEmail[]
  currentUserId: string
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteExpense(id)
    setDeletingId(null)
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center">
        <p className="text-sm text-zinc-500">No expenses this month.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
      <ul className="divide-y divide-zinc-100">
        {expenses.map((exp) => (
          <li key={exp.id} className="flex items-center gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{exp.description}</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                {formatDate(exp.date)}
                {exp.email && <span> · {exp.email}</span>}
              </p>
            </div>
            <span className="text-sm font-semibold text-zinc-900 shrink-0">
              {fmt(exp.amount)}
            </span>
            {exp.user_id === currentUserId && (
              <button
                onClick={() => handleDelete(exp.id)}
                disabled={deletingId === exp.id}
                className="text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-50 text-lg leading-none shrink-0"
                title="Delete"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
