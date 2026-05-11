import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/features/calendar/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  const [{ data: events }, { data: trades }] = await Promise.all([
    supabase.from('calendar_events').select('*').order('start_date'),
    supabase.from('trades').select('*').order('name'),
  ])
  return <CalendarView initialEvents={events ?? []} trades={trades ?? []} />
}
