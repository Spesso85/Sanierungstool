import { createClient } from '@/lib/supabase/server'
import { ExpensesView } from '@/features/expenses/expenses-view'

export default async function ExpensesPage() {
  const supabase = await createClient()
  const [{ data: expenses }, { data: trades }] = await Promise.all([
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    supabase.from('trades').select('*').order('name'),
  ])
  return <ExpensesView initialExpenses={expenses ?? []} trades={trades ?? []} />
}
