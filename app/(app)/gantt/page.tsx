import { createClient } from '@/lib/supabase/server'
import { GanttView } from '@/features/gantt/gantt-view'

export default async function GanttPage() {
  const supabase = await createClient()
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, trade:trades(id,name)')
    .order('start_date', { ascending: true, nullsFirst: false })
  return <GanttView tasks={tasks ?? []} />
}
