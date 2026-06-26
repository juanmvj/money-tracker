function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function BudgetProgress({
  budget,
  spent,
}: {
  budget: number | null
  spent: number
}) {
  if (!budget) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <p className="text-sm text-zinc-500">
          No budget set for this month.{' '}
          <a href="/settings" className="text-indigo-600 hover:underline font-medium">
            Set one in Settings
          </a>
          .
        </p>
        <p className="mt-2 text-2xl font-bold text-zinc-900">{fmt(spent)} spent</p>
      </div>
    )
  }

  const remaining = budget - spent
  const pct = Math.min((spent / budget) * 100, 100)
  const over = spent > budget

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-sm text-zinc-500">Spent</p>
          <p className="text-3xl font-bold text-zinc-900">{fmt(spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-500">{over ? 'Over by' : 'Remaining'}</p>
          <p className={`text-3xl font-bold ${over ? 'text-red-600' : 'text-emerald-600'}`}>
            {fmt(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-400 text-right">
        {fmt(budget)} total budget
      </p>
    </div>
  )
}
