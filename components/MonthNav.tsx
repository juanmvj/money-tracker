'use client'

import { useRouter, useSearchParams } from 'next/navigation'

function formatLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function MonthNav({ year, month }: { year: number; month: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function navigate(deltaMonths: number) {
    let m = month + deltaMonths
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    const params = new URLSearchParams(searchParams.toString())
    params.set('y', String(y))
    params.set('m', String(m))
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
      >
        ←
      </button>
      <span className="text-base font-semibold text-zinc-900">{formatLabel(year, month)}</span>
      <button
        onClick={() => navigate(1)}
        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
      >
        →
      </button>
    </div>
  )
}
