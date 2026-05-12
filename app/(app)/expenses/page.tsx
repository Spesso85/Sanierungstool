import { createClient } from '@/lib/supabase/server'
import { ExpensesView } from '@/features/expenses/expenses-view'
import { redirect } from 'next/navigation'

export default async function ExpensesPage() {
  const supabase = await createClient()

  // 1. Sicherheit: Nutzer prüfen
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Daten laden
  const [
    { data: expenses }, 
    { data: trades }
  ] = await Promise.all([
    // Wichtig: Wir holen uns hier direkt den Namen des Gewerks mit (trade:trades(name))
    supabase
      .from('expenses')
      .select('*, trade:trades(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('trades')
      .select('*')
      .order('name', { ascending: true }),
  ])

  return (
    <ExpensesView 
      initialExpenses={expenses ?? []} 
      trades={trades ?? []} 
    />
  )
}