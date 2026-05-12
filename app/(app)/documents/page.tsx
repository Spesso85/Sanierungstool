import { createClient } from '@/lib/supabase/server'
import { DocumentsView } from '@/features/documents/documents-view'
import { redirect } from 'next/navigation'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  // 1. Nutzer prüfen
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // 2. Dokumente UND Gewerke gleichzeitig laden
  const [
    { data: documents },
    { data: trades }
  ] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('trades')
      .select('*')
      .order('name', { ascending: true })
  ])

  // 3. Beides an die View übergeben
  return (
    <DocumentsView 
      initialDocuments={documents ?? []} 
      trades={trades ?? []} 
      userId={user.id} 
    />
  )
}