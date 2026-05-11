import { createClient } from '@/lib/supabase/client'
import type { Document } from '@/types'

export async function getDocuments() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Document[]
}

export async function uploadDocument(file: File, title: string, uploadedBy: string) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

  const { data, error } = await supabase
    .from('documents')
    .insert({ title, file_url: publicUrl, file_type: ext, uploaded_by: uploadedBy })
    .select()
    .single()
  if (error) throw error
  return data as Document
}

export async function deleteDocument(id: string, fileUrl: string) {
  const supabase = createClient()
  const path = fileUrl.split('/').pop()
  if (path) await supabase.storage.from('documents').remove([path])
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}

export async function getSignedUrl(fileUrl: string) {
  const supabase = createClient()
  const path = fileUrl.split('/documents/')[1]
  if (!path) return fileUrl
  const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
  return data?.signedUrl ?? fileUrl
}
