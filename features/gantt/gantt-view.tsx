'use client'
import { useMemo, useRef, useState } from 'react'
import type { Task } from '@/types'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, differenceInDays, format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

interface Props {
  tasks: Task[]
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-gray-300',
  in_progress: 'bg-blue-400',
  blocked: 'bg-orange-400',
  done: 'bg-green-400',
}

export function GanttView({ tasks }: Props) {
  const [offset, setOffset] = useState(0)
  const today = new Date()
  const rangeStart = addDays(today, offset - 3)
  const days = Array.from({ length: 28 }, (_, i) => addDays(rangeStart, i))

  const tasksWithDates = useMemo(() =>
    tasks.filter(t => t.start_date || t.end_date || t.due_date),
    [tasks]
  )

  function getBar(task: Task) {
    const start = task.start_date ? new Date(task.start_date) : task.due_date ? new Date(task.due_date) : null
    const end = task.end_date ? new Date(task.end_date) : task.due_date ? new Date(task.due_date) : start
    if (!start || !end) return null

    const left = differenceInDays(start, rangeStart)
    const width = Math.max(1, differenceInDays(end, start) + 1)
    return { left, width }
  }

  const DAY_W = 32 // px per day

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Gantt</h1>
          <p className="text-stone-500 text-sm">{tasksWithDates.length} Aufgaben mit Terminen</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(o => o - 14)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(0)} className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 hover:bg-stone-50">
            Heute
          </button>
          <button onClick={() => setOffset(o => o + 14)} className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tasksWithDates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500">Noch keine Aufgaben mit Terminen.</p>
          <p className="text-stone-400 text-sm mt-1">Trage Start- und Enddaten in den Aufgaben ein.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="flex border-b border-stone-200">
            <div className="w-48 md:w-64 shrink-0 px-4 py-3 border-r border-stone-200">
              <span className="text-xs font-semibold text-stone-500 uppercase">Aufgabe</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <div className="flex" style={{ minWidth: days.length * DAY_W }}>
                {days.map((day, i) => (
                  <div
                    key={i}
                    style={{ width: DAY_W }}
                    className={`text-center py-2 shrink-0 border-r border-stone-100 ${isToday(day) ? 'bg-blue-50' : ''}`}
                  >
                    <div className="text-xs text-stone-400">{format(day, 'EE', { locale: de })}</div>
                    <div className={`text-xs font-medium ${isToday(day) ? 'text-blue-600' : 'text-stone-700'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {tasksWithDates.map(task => {
            const bar = getBar(task)
            return (
              <div key={task.id} className="flex border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                <div className="w-48 md:w-64 shrink-0 px-4 py-3 border-r border-stone-200">
                  <p className="text-sm font-medium text-stone-900 truncate">{task.title}</p>
                  {task.trade && <p className="text-xs text-stone-400">{task.trade.name}</p>}
                </div>
                <div className="flex-1 overflow-x-auto">
                  <div className="relative" style={{ minWidth: days.length * DAY_W, height: 52 }}>
                    {/* Day grid lines */}
                    {days.map((day, i) => (
                      <div
                        key={i}
                        className={`absolute top-0 bottom-0 border-r border-stone-100 ${isToday(day) ? 'bg-blue-50/40' : ''}`}
                        style={{ left: i * DAY_W, width: DAY_W }}
                      />
                    ))}
                    {/* Bar */}
                    {bar && bar.left < days.length && bar.left + bar.width > 0 && (
                      <div
                        className={`absolute top-3 h-6 rounded-md ${STATUS_COLORS[task.status]} opacity-90 flex items-center px-2`}
                        style={{
                          left: Math.max(0, bar.left) * DAY_W,
                          width: Math.min(bar.width, days.length - Math.max(0, bar.left)) * DAY_W - 2,
                        }}
                        title={`${task.title} · ${formatDate(task.start_date)} – ${formatDate(task.end_date || task.due_date)}`}
                      >
                        <span className="text-xs text-white font-medium truncate">{task.title}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {[['open', 'Offen'], ['in_progress', 'In Arbeit'], ['blocked', 'Blockiert'], ['done', 'Erledigt']].map(([s, l]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${STATUS_COLORS[s]}`} />
            <span className="text-xs text-stone-500">{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
