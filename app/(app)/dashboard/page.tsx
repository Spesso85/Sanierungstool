import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/features/dashboard/dashboard-content'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTask = any

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: tasks },
    { data: shoppingItems },
    // Die Zeile mit "expenses" wurde hier gelöscht
    { data: documents },
    { data: trades },
    { data: events },
  ] = await Promise.all([
    supabase.from('tasks').select('id, title, status, due_date, trade:trades(name)').order('created_at', { ascending: false }),
    supabase.from('shopping_items').select('id, purchased').eq('purchased', false),
    // Die Zeile mit "from('expenses')" wurde hier gelöscht
    supabase.from('documents').select('id, title, file_type, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('trades').select('id, name').limit(6),
    supabase.from('calendar_events').select('id, title, start_date').gte('start_date', new Date().toISOString().split('T')[0]).order('start_date').limit(5),
  ])

  return (
    <DashboardContent
      tasks={(tasks ?? []) as AnyTask[]}
      openShoppingCount={shoppingItems?.length ?? 0}
      // Wir übergeben keine Expenses mehr (oder eine leere Liste [])
      recentDocuments={documents ?? []}
      trades={trades ?? []}
      upcomingEvents={events ?? []}
    />
  )
}
