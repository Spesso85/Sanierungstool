import { createClient } from '@/lib/supabase/server'
import { SettingsView } from '@/features/settings/settings-view'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // 1. Prüfen, ob der Nutzer angemeldet ist
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Alle Stammdaten für die Verwaltung parallel laden
  const [
    { data: profile },
    { data: rooms },
    { data: trades },
    { data: contractors }
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('rooms').select('*').order('name', { ascending: true }),
    supabase.from('trades').select('*').order('name', { ascending: true }),
    supabase.from('contractors').select('*, trade:trades(name)').order('name', { ascending: true }),
  ])

  // 3. Daten an die View übergeben
  return (
    <SettingsView
      profile={profile}
      userId={user.id}
      initialRooms={rooms ?? []}
      initialTrades={trades ?? []}
      initialContractors={contractors ?? []}
    />
  )
}