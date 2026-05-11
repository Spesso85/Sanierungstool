'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Task, Room, Trade, Contractor } from '@/types'
import { Loader2, Lightbulb, X } from 'lucide-react'
import { getTaskSuggestions } from '@/lib/task-suggestions'

const schema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'blocked', 'done']),
  room_id: z.string().optional(),
  trade_id: z.string().optional(),
  contractor_id: z.string().optional(),
  due_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration_days: z.string().optional(),
  blocked_reason: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  task?: Task | null
  rooms: Room[]
  trades: Trade[]
  contractors: Contractor[]
  onSubmit: (data: Partial<Task>) => Promise<void>
  onClose: () => void
}

export function TaskForm({ task, rooms, trades, contractors, onSubmit, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'open',
      room_id: task?.room_id ?? undefined,
      trade_id: task?.trade_id ?? undefined,
      contractor_id: task?.contractor_id ?? undefined,
      due_date: task?.due_date ?? '',
      start_date: task?.start_date ?? '',
      end_date: task?.end_date ?? '',
      duration_days: task?.duration_days?.toString() ?? '',
      blocked_reason: task?.blocked_reason ?? '',
    },
  })

  const title = watch('title')
  const status = watch('status')

  useEffect(() => {
    if (!task && title.length > 2) {
      const s = getTaskSuggestions(title)
      setSuggestions(s)
      setShowSuggestions(s.length > 0)
    }
  }, [title, task])

  async function onFormSubmit(data: FormData) {
    setLoading(true)
    await onSubmit({
      ...data,
      room_id: data.room_id || null,
      trade_id: data.trade_id || null,
      contractor_id: data.contractor_id || null,
      due_date: data.due_date || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      duration_days: data.duration_days ? parseInt(data.duration_days) : null,
      blocked_reason: data.blocked_reason || null,
    })
    setLoading(false)
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-lg">
      <DialogHeader>
        <DialogTitle>{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label>Titel *</Label>
          <Input placeholder="z.B. Fenster einbauen" {...register('title')} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Vorschläge */}
        {showSuggestions && !task && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                <Lightbulb className="h-3.5 w-3.5" />
                Vorschläge für Abhängigkeiten
              </div>
              <button onClick={() => setShowSuggestions(false)} className="text-amber-600">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map(s => (
                <span key={s} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded border border-amber-200">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-700 mt-2">Diese Aufgaben kannst du danach als Abhängigkeiten hinzufügen.</p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Beschreibung</Label>
          <Textarea placeholder="Optionale Details..." rows={2} {...register('description')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={v => setValue('status', v as FormData['status'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Arbeit</SelectItem>
                <SelectItem value="blocked">Blockiert</SelectItem>
                <SelectItem value="done">Erledigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fällig am</Label>
            <Input type="date" {...register('due_date')} />
          </div>
        </div>

        {status === 'blocked' && (
          <div className="space-y-1.5">
            <Label>Grund für Blockierung</Label>
            <Input placeholder="z.B. Warte auf Lieferung" {...register('blocked_reason')} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Raum</Label>
            <Select onValueChange={v => setValue('room_id', v)}>
              <SelectTrigger><SelectValue placeholder="Raum wählen" /></SelectTrigger>
              <SelectContent>
                {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Gewerk</Label>
            <Select onValueChange={v => setValue('trade_id', v)}>
              <SelectTrigger><SelectValue placeholder="Gewerk wählen" /></SelectTrigger>
              <SelectContent>
                {trades.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Handwerker</Label>
            <Select onValueChange={v => setValue('contractor_id', v)}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                {contractors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Dauer (Tage)</Label>
            <Input type="number" min="1" placeholder="z.B. 3" {...register('duration_days')} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Startdatum</Label>
            <Input type="date" {...register('start_date')} />
          </div>
          <div className="space-y-1.5">
            <Label>Enddatum</Label>
            <Input type="date" {...register('end_date')} />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Abbrechen</Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {task ? 'Speichern' : 'Erstellen'}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
