'use client'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createCalendarEvent, deleteCalendarEvent } from '@/services/calendar'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent, Trade } from '@/types'
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, isSameDay, addMonths, subMonths, parseISO
} from 'date-fns'
import { de } from 'date-fns/locale'

const schema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  description: z.string().optional(),
  start_date: z.string().min(1, 'Datum erforderlich'),
  end_date: z.string().optional(),
  related_trade_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialEvents: CalendarEvent[]
  trades: Trade[]
}

export function CalendarView({ initialEvents, trades }: Props) {
  const [events, setEvents] = useState(initialEvents)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const days = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const allDays = eachDayOfInterval({ start, end })
    const startPadding = start.getDay() === 0 ? 6 : start.getDay() - 1
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null)
    return [...paddedDays, ...allDays]
  }, [currentDate])

  const eventsForDay = (day: Date) =>
    events.filter(e => isSameDay(parseISO(e.start_date), day))

  const selectedDayEvents = selectedDate ? eventsForDay(selectedDate) : []

  async function onSubmit(data: FormData) {
    try {
      const event = await createCalendarEvent({
        title: data.title,
        description: data.description || null,
        start_date: data.start_date,
        end_date: data.end_date || null,
        related_trade_id: data.related_trade_id || null,
      })
      setEvents(prev => [...prev, event])
      reset()
      setDialogOpen(false)
      toast({ title: 'Termin erstellt' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCalendarEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
      toast({ title: 'Termin gelöscht' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  const upcomingEvents = events
    .filter(e => new Date(e.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 8)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Kalender</h1>
          <p className="text-stone-500 text-sm">{events.length} Termine</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Termin hinzufügen</span>
              <span className="sm:hidden">Neu</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Termin hinzufügen</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label>Titel *</Label>
                <Input placeholder="z.B. Fliesenleger vor Ort" {...register('title')} />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Beschreibung</Label>
                <Textarea rows={2} placeholder="Details..." {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Datum *</Label>
                  <Input type="date" {...register('start_date')} defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined} />
                  {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Bis (optional)</Label>
                  <Input type="date" {...register('end_date')} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Gewerk</Label>
                <select className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:outline-none" {...register('related_trade_id')}>
                  <option value="">Keines</option>
                  {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                <Button type="submit" className="flex-1">Speichern</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-4">
        {/* Calendar Grid */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-stone-100">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold text-stone-900">
              {format(currentDate, 'MMMM yyyy', { locale: de })}
            </span>
            <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="p-1.5 rounded-lg hover:bg-stone-100">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-stone-100">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
              <div key={d} className="text-center py-2 text-xs font-medium text-stone-400">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} className="aspect-square border-r border-b border-stone-50" />
              const dayEvents = eventsForDay(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const todayDay = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : day)}
                  className={`aspect-square p-1 border-r border-b border-stone-50 flex flex-col items-center hover:bg-stone-50 transition-colors ${
                    isSelected ? 'bg-stone-900 hover:bg-stone-900' : ''
                  }`}
                >
                  <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                    isSelected ? 'text-white' :
                    todayDay ? 'bg-blue-500 text-white' :
                    !isSameMonth(day, currentDate) ? 'text-stone-300' :
                    'text-stone-700'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayEvents.slice(0, 3).map((_, ei) => (
                        <div key={ei} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day or Upcoming */}
        <div className="space-y-4">
          {selectedDate && (
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">
                {format(selectedDate, 'EEEE, d. MMMM', { locale: de })}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-stone-400">Keine Termine</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setDialogOpen(true)}>
                    Termin hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map(event => (
                    <div key={event.id} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{event.title}</p>
                        {event.description && <p className="text-xs text-stone-500 mt-0.5">{event.description}</p>}
                      </div>
                      <button onClick={() => handleDelete(event.id)} className="text-stone-300 hover:text-red-500 p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 p-4">
            <h3 className="text-sm font-semibold text-stone-900 mb-3">Nächste Termine</h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">Keine anstehenden Termine</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-3.5 w-3.5 text-stone-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{event.title}</p>
                      <p className="text-xs text-stone-400">{formatDate(event.start_date)}</p>
                    </div>
                    <button onClick={() => handleDelete(event.id)} className="text-stone-300 hover:text-red-500 p-1">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setDialogOpen(true)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
