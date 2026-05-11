import { createClient } from '@/lib/supabase/server'
import { TasksView } from '@/features/tasks/tasks-view'

export default async function TasksPage() {
  const supabase = await createClient()

  const [
    { data: tasks },
    { data: rooms },
    { data: trades },
    { data: contractors },
  ] = await Promise.all([
    supabase.from('tasks').select('*, room:rooms(id,name), trade:trades(id,name), contractor:contractors(id,name,company)').order('created_at', { ascending: false }),
    supabase.from('rooms').select('*').order('name'),
    supabase.from('trades').select('*').order('name'),
    supabase.from('contractors').select('*').order('name'),
  ])

  return (
    <TasksView
      initialTasks={tasks ?? []}
      rooms={rooms ?? []}
      trades={trades ?? []}
      contractors={contractors ?? []}
    />
  )
}
