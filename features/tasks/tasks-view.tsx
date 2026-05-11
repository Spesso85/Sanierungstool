'use client'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TaskForm } from './task-form'
import { toast } from '@/hooks/use-toast'
import { createTask, updateTask, deleteTask, updateTaskStatus } from '@/services/tasks'
import { formatDate, getStatusColor, getStatusLabel, isDueSoon, isOverdue } from '@/lib/utils'
import type { Task, Room, Trade, Contractor, TaskStatus } from '@/types'
import { Plus, Search, Filter, Trash2, Edit2, AlertTriangle, Clock, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  initialTasks: Task[]
  rooms: Room[]
  trades: Trade[]
  contractors: Contractor[]
}

const STATUS_OPTIONS = [
  { value: '', label: 'Alle Status' },
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Arbeit' },
  { value: 'blocked', label: 'Blockiert' },
  { value: 'done', label: 'Erledigt' },
]

export function TasksView({ initialTasks, rooms, trades, contractors }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tradeFilter, setTradeFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const router = useRouter()

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && t.status !== statusFilter) return false
      if (tradeFilter && t.trade_id !== tradeFilter) return false
      return true
    })
  }, [tasks, search, statusFilter, tradeFilter])

  async function handleCreate(data: Partial<Task>) {
    try {
      const created = await createTask(data)
      setTasks(prev => [created, ...prev])
      setDialogOpen(false)
      toast({ title: 'Aufgabe erstellt' })
    } catch {
      toast({ title: 'Fehler', description: 'Aufgabe konnte nicht erstellt werden.', variant: 'destructive' })
    }
  }

  async function handleUpdate(data: Partial<Task>) {
    if (!editTask) return
    try {
      const updated = await updateTask(editTask.id, data)
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...updated } : t))
      setEditTask(null)
      toast({ title: 'Aufgabe aktualisiert' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    try {
      await updateTaskStatus(id, status)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Aufgabe wirklich löschen?')) return
    try {
      await deleteTask(id)
      setTasks(prev => prev.filter(t => t.id !== id))
      toast({ title: 'Aufgabe gelöscht' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  const counts = {
    open: tasks.filter(t => t.status === 'open').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Aufgaben</h1>
          <p className="text-stone-500 text-sm">{tasks.length} Aufgaben insgesamt</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Neue Aufgabe</span>
              <span className="sm:hidden">Neu</span>
            </Button>
          </DialogTrigger>
          <TaskForm rooms={rooms} trades={trades} contractors={contractors} onSubmit={handleCreate} onClose={() => setDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Status Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {opt.label}
            {opt.value && <span className="ml-1 opacity-70">({counts[opt.value as keyof typeof counts] ?? 0})</span>}
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input placeholder="Aufgaben suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400"
          value={tradeFilter}
          onChange={e => setTradeFilter(e.target.value)}
        >
          <option value="">Alle Gewerke</option>
          {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Plus className="h-6 w-6 text-stone-400" />
          </div>
          <p className="text-stone-500 font-medium">Keine Aufgaben gefunden</p>
          <p className="text-stone-400 text-sm mt-1">Erstelle deine erste Aufgabe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onEdit={() => setEditTask(task)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editTask && (
        <Dialog open={!!editTask} onOpenChange={open => !open && setEditTask(null)}>
          <TaskForm task={editTask} rooms={rooms} trades={trades} contractors={contractors} onSubmit={handleUpdate} onClose={() => setEditTask(null)} />
        </Dialog>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}

function TaskCard({ task, onStatusChange, onEdit, onDelete }: {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const overdue = isOverdue(task.due_date) && task.status !== 'done'
  const dueSoon = isDueSoon(task.due_date) && task.status !== 'done'

  return (
    <div className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
      task.status === 'blocked' ? 'border-orange-200 bg-orange-50/30' :
      task.status === 'done' ? 'border-stone-100 opacity-60' :
      'border-stone-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
          task.status === 'done' ? 'bg-green-500' :
          task.status === 'in_progress' ? 'bg-blue-500' :
          task.status === 'blocked' ? 'bg-orange-500' : 'bg-gray-300'
        }`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={`font-medium text-stone-900 ${task.status === 'done' ? 'line-through' : ''}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status Selector */}
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}
              >
                {getStatusLabel(task.status)}
                <ChevronDown className="h-3 w-3" />
              </button>
              {statusMenuOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                  {(['open', 'in_progress', 'blocked', 'done'] as TaskStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(task.id, s); setStatusMenuOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 ${task.status === s ? 'font-semibold' : ''}`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {task.trade && (
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{task.trade.name}</span>
            )}
            {task.room && (
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{task.room.name}</span>
            )}

            {task.due_date && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                overdue ? 'bg-red-100 text-red-700' :
                dueSoon ? 'bg-orange-100 text-orange-700' :
                'bg-stone-100 text-stone-500'
              }`}>
                <Clock className="h-3 w-3" />
                {formatDate(task.due_date)}
                {overdue && ' (überfällig)'}
              </span>
            )}

            {task.status === 'blocked' && task.blocked_reason && (
              <span className="flex items-center gap-1 text-xs text-orange-700">
                <AlertTriangle className="h-3 w-3" />
                {task.blocked_reason}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
