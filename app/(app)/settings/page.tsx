import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { monthKey } from '@/lib/types'
import HouseholdSection from '@/components/HouseholdSection'
import BudgetSection from '@/components/BudgetSection'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch membership then household separately (avoids relational query typing issues)
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  const { data: household } = membership
    ? await supabase
        .from('households')
        .select('id, name, invite_code')
        .eq('id', membership.household_id)
        .single()
    : { data: null }

  // Fetch current month's budget if household exists
  let currentBudget: number | null = null
  const now = new Date()
  const month = monthKey(now.getFullYear(), now.getMonth() + 1)
  if (household) {
    const { data: budget } = await supabase
      .from('budgets')
      .select('amount')
      .eq('household_id', household.id)
      .eq('month', month)
      .single()
    currentBudget = budget?.amount ?? null
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
      <HouseholdSection household={household} userId={user.id} />
      {household && (
        <BudgetSection
          householdId={household.id}
          month={month}
          currentBudget={currentBudget}
        />
      )}
    </div>
  )
}
