import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { monthKey } from '@/lib/types'
import MonthNav from '@/components/MonthNav'
import BudgetProgress from '@/components/BudgetProgress'
import ExpenseList from '@/components/ExpenseList'
import { Suspense } from 'react'

type SearchParams = Promise<{ y?: string; m?: string }>

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const now = new Date()
  const year = parseInt(params.y ?? String(now.getFullYear()))
  const month = parseInt(params.m ?? String(now.getMonth() + 1))
  const monthStart = monthKey(year, month)
  const nextYear = month === 12 ? year + 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const monthEnd = monthKey(nextYear, nextMonth)

  // Get household
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500 mb-4">You are not part of a household yet.</p>
        <Link
          href="/settings"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Settings
        </Link>
      </div>
    )
  }

  const householdId = membership.household_id

  // Fetch budget and expenses in parallel
  const [{ data: budget }, { data: expenses }] = await Promise.all([
    supabase
      .from('budgets')
      .select('amount')
      .eq('household_id', householdId)
      .eq('month', monthStart)
      .single(),
    supabase
      .from('expenses')
      .select('*')
      .eq('household_id', householdId)
      .gte('date', monthStart)
      .lt('date', monthEnd)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
  ])

  // Fetch member emails for display
  const { data: members } = await supabase
    .from('household_members')
    .select('user_id')
    .eq('household_id', householdId)

  // Get emails from auth via RPC isn't available on client; use user metadata approach
  // We'll enrich expenses with "you" vs partner label
  const expensesWithEmail = (expenses ?? []).map((exp) => ({
    ...exp,
    email: exp.user_id === user.id ? 'You' : 'Partner',
  }))

  const totalSpent = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <Suspense>
        <MonthNav year={year} month={month} />
      </Suspense>

      <BudgetProgress budget={budget?.amount ?? null} spent={totalSpent} />

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-700">Expenses</h2>
        <Link
          href="/expenses/new"
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          + Add
        </Link>
      </div>

      <ExpenseList expenses={expensesWithEmail} currentUserId={user.id} />
    </div>
  )
}
