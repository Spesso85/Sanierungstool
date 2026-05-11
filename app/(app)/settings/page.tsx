import { createClient } from '@/lib/supabase/server'
import { SettingsView } from '@/features/settings/settings-view'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: tasks }, { data: shopping }, { data: expenses }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('tasks').select('*, room:rooms(id,name), trade:trades(id,name)').order('created_at', { ascending: false }),
    supabase.from('shopping_items').select('*').order('created_at', { ascending: false }),
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <SettingsView
      profile={profile}
      userId={user.id}
      tasks={tasks ?? []}
      shopping={shopping ?? []}
      expenses={expenses ?? []}
    />
  )
}
