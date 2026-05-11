import { createClient } from '@/lib/supabase/client'
import type { CalendarEvent } from '@/types'

export async function getCalendarEvents() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*, trade:trades(id, name)')
    .order('start_date', { ascending: true })
  if (error) throw error
  return data as CalendarEvent[]
}

export async function createCalendarEvent(event: Partial<CalendarEvent>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('calendar_events').insert(event).select().single()
  if (error) throw error
  return data as CalendarEvent
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('calendar_events').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as CalendarEvent
}

export async function deleteCalendarEvent(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('calendar_events').delete().eq('id', id)
  if (error) throw error
}
