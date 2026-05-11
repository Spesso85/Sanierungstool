'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadDocument, deleteDocument } from '@/services/documents'
import { toast } from '@/hooks/use-toast'
import type { Document } from '@/types'
import { formatDate } from '@/lib/utils'
import { Upload, FileText, Image, Trash2, Download, Search, Loader2, Plus } from 'lucide-react'

interface Props {
  initialDocuments: Document[]
  userId: string
}

export function DocumentsView({ initialDocuments, userId }: Props) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = documents.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const docTitle = title || file.name.replace(/\.[^/.]+$/, '')
    setUploading(true)
    try {
      const doc = await uploadDocument(file, docTitle, userId)
      setDocuments(prev => [doc, ...prev])
      setTitle('')
      toast({ title: 'Dokument hochgeladen' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload fehlgeschlagen.'
      toast({ title: 'Fehler', description: msg, variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm('Dokument wirklich löschen?')) return
    try {
      await deleteDocument(doc.id, doc.file_url)
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
      toast({ title: 'Dokument gelöscht' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  function getFileIcon(type: string | null) {
    if (!type) return <FileText className="h-5 w-5 text-stone-500" />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type.toLowerCase())) {
      return <Image className="h-5 w-5 text-blue-500" />
    }
    if (type.toLowerCase() === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    return <FileText className="h-5 w-5 text-stone-500" />
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Dokumente</h1>
          <p className="text-stone-500 text-sm">{documents.length} Dokumente</p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-xl border border-stone-200 border-dashed p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Dokumententitel (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1"
          />
          <div className="relative">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button 
              type="button"
              className="w-full sm:w-auto flex items-center gap-2" 
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Wird hochgeladen...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> 
                  Datei auswählen
                </span>
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-stone-400 mt-2">PDF, Bilder, Word, Excel — max. 50 MB</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <Input 
          placeholder="Dokumente suchen..." 
          className="pl-9" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">Noch keine Dokumente</p>
          <p className="text-stone-400 text-sm mt-1">Lade dein erstes Dokument hoch</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                  {getFileIcon(doc.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 truncate">{doc.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {doc.file_type?.toUpperCase() ?? 'Datei'} · {formatDate(doc.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <div className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                  </a>
                  <button onClick={() => handleDelete(doc)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {/* Image Preview */}
              {doc.file_type && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(doc.file_type.toLowerCase()) && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img src={doc.file_url} alt={doc.title} className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button 
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-14 h-14 bg-stone-900 text-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </div>
  )
}