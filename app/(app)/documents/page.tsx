import { createClient } from '@/lib/supabase/server'
import { DocumentsView } from '@/features/documents/documents-view'
import { redirect } from 'next/navigation'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  return <DocumentsView initialDocuments={documents ?? []} userId={user.id} />
}
