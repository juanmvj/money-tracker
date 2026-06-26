import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ExpenseForm from '@/components/ExpenseForm'

export default async function NewExpensePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/settings')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Add expense</h1>
      <ExpenseForm householdId={membership.household_id} userId={user.id} />
    </div>
  )
}
