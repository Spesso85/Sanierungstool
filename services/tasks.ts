import { createClient } from '@/lib/supabase/client'
import type { Task, TaskStatus } from '@/types'

export async function getTasks() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      room:rooms(id, name),
      trade:trades(id, name),
      contractor:contractors(id, name, company, phone)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Task[]
}

export async function getTask(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      room:rooms(id, name),
      trade:trades(id, name),
      contractor:contractors(id, name, company, phone)
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Task
}

export async function createTask(task: Partial<Task>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('tasks').insert(task).select().single()
  if (error) throw error
  return data as Task
}

export async function updateTask(id: string, updates: Partial<Task>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Task
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return updateTask(id, { status })
}

export async function deleteTask(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function getTaskDependencies(taskId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('task_dependencies')
    .select('*, depends_on:tasks!depends_on_task_id(id, title, status)')
    .eq('task_id', taskId)
  if (error) throw error
  return data
}

export async function addTaskDependency(taskId: string, dependsOnTaskId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('task_dependencies')
    .insert({ task_id: taskId, depends_on_task_id: dependsOnTaskId })
  if (error) throw error
}

export async function removeTaskDependency(taskId: string, dependsOnTaskId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('task_dependencies')
    .delete()
    .eq('task_id', taskId)
    .eq('depends_on_task_id', dependsOnTaskId)
  if (error) throw error
}
