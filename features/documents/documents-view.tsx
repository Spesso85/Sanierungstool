'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadDocument, deleteDocument } from '@/services/documents'
import { toast } from '@/hooks/use-toast'
import type { Document, Trade } from '@/types'
import { formatDate } from '@/lib/utils'
import { Upload, FileText, Image, Trash2, Download, Search, Loader2, Plus, Tag } from 'lucide-react'

interface Props {
  initialDocuments: Document[]
  trades: Trade[]
  userId: string
}

export function DocumentsView({ initialDocuments, trades, userId }: Props) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [selectedTradeId, setSelectedTradeId] = useState<string>('')
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
      // Wir übergeben jetzt auch die selectedTradeId an den Service
      const doc = await uploadDocument(file, docTitle, userId, selectedTradeId)
      setDocuments(prev => [doc, ...prev])
      setTitle('')
      setSelectedTradeId('')
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
      <div className="bg-white rounded-xl border border-stone-200 border-dashed p-5 mb-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400 ml-1">Bezeichnung</label>
            <Input
              placeholder="z.B. Rechnung Heizung"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400 ml-1">Gewerk zuordnen</label>
            <select
              value={selectedTradeId}
              onChange={(e) => setSelectedTradeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="">Kein Gewerk</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            className="w-full flex items-center justify-center gap-2" 
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
                <Upload className="h-4