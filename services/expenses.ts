import { createClient } from '@/lib/supabase/client'
import type { Expense } from '@/types'

export async function getExpenses() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('expenses')
    .select('*, trade:trades(id, name), document:documents(id, title)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Expense[]
}

export async function createExpense(expense: Partial<Expense>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('expenses').insert(expense).select().single()
  if (error) throw error
  return data as Expense
}

export async function updateExpense(id: string, updates: Partial<Expense>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Expense
}

export async function deleteExpense(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export function sumExpenses(expenses: Expense[]) {
  return {
    total: expenses.reduce((s, e) => s + e.amount, 0),
    paid: expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0),
    unpaid: expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0),
  }
}
