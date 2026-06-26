'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createSSRClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types'

function randomInviteCode(): string {
  const words = ['WOLF', 'HAWK', 'BEAR', 'DEER', 'FISH', 'CROW', 'LION', 'FROG']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = String(Math.floor(1000 + Math.random() * 9000))
  return `${word}-${num}`
}

// Service role client — bypasses RLS. Safe because this file only runs server-side.
// Auth is enforced manually by verifying the user before every mutation.
function adminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getUser() {
  const ssrClient = await createSSRClient()
  const { data: { user } } = await ssrClient.auth.getUser()
  return user
}

export async function createHousehold(name: string): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = adminClient()
  const code = randomInviteCode()

  const { data: h, error: hErr } = await db
    .from('households')
    .insert({ name: name.trim(), invite_code: code })
    .select()
    .single()

  if (hErr || !h) return { error: hErr?.message ?? 'Failed to create household' }

  const { error: mErr } = await db
    .from('household_members')
    .insert({ household_id: h.id, user_id: user.id })

  if (mErr) return { error: mErr.message }

  revalidatePath('/settings')
  return {}
}

export async function joinHousehold(inviteCode: string): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = adminClient()

  const { data: h, error: hErr } = await db
    .from('households')
    .select('id')
    .eq('invite_code', inviteCode.trim().toUpperCase())
    .single()

  if (hErr || !h) return { error: 'Invite code not found. Check the code and try again.' }

  // Prevent joining a household you're already in
  const { data: existing } = await db
    .from('household_members')
    .select('id')
    .eq('household_id', h.id)
    .eq('user_id', user.id)
    .single()

  if (existing) return { error: 'You are already a member of this household.' }

  const { error: mErr } = await db
    .from('household_members')
    .insert({ household_id: h.id, user_id: user.id })

  if (mErr) return { error: mErr.message }

  revalidatePath('/settings')
  return {}
}

export async function upsertBudget(
  householdId: string,
  month: string,
  amount: number,
): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify user belongs to this household
  const db = adminClient()
  const { data: membership } = await db
    .from('household_members')
    .select('id')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'Not a member of this household' }

  const { error } = await db
    .from('budgets')
    .upsert({ household_id: householdId, month, amount }, { onConflict: 'household_id,month' })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/settings')
  return {}
}

export async function deleteExpense(id: string): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = adminClient()

  // Verify user owns this expense
  const { data: exp } = await db
    .from('expenses')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!exp) return { error: 'Expense not found' }
  if (exp.user_id !== user.id) return { error: 'Not your expense' }

  const { error } = await db.from('expenses').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}

export async function addExpense(
  householdId: string,
  amount: number,
  description: string,
  date: string,
): Promise<{ error?: string }> {
  const user = await getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = adminClient()

  // Verify user belongs to this household
  const { data: membership } = await db
    .from('household_members')
    .select('id')
    .eq('household_id', householdId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'Not a member of this household' }

  const { error } = await db.from('expenses').insert({
    household_id: householdId,
    user_id: user.id,
    amount,
    description: description.trim(),
    date,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return {}
}
