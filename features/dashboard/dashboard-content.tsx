'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, isDueSoon } from '@/lib/utils'
import {
  CheckSquare, AlertTriangle, Clock, ShoppingCart,
  Euro, FileText, Wrench, ChevronRight, Calendar, TrendingUp
} from 'lucide-react'

interface Task { id: string; title: string; status: string; due_date: string | null; trade?: { name: string } | null }
interface Expense { id: string; amount: number; paid: boolean }
interface Document { id: string; title: string; file_type: string | null; created_at: string }
interface Trade { id: string; name: string }
interface Event { id: string; title: string; start_date: string }

interface Props {
  tasks: Task[]
  openShoppingCount: number
  expenses: Expense[]
  recentDocuments: Document[]
  trades: Trade[]
  upcomingEvents: Event[]
}

export function DashboardContent({ tasks, openShoppingCount, expenses, recentDocuments, trades, upcomingEvents }: Props) {
  const openTasks = tasks.filter(t => t.status === 'open').length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length
  const dueSoonTasks = tasks.filter(t => isDueSoon(t.due_date)).length
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const paidExpenses = expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-0.5">Übersicht über dein Bauprojekt</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Offene Aufgaben"
          value={openTasks + inProgressTasks}
          icon={<CheckSquare className="h-4 w-4" />}
          color="blue"
          href="/tasks"
        />
        <StatCard
          label="Blockiert"
          value={blockedTasks}
          icon={<AlertTriangle className="h-4 w-4" />}
          color={blockedTasks > 0 ? 'orange' : 'gray'}
          href="/tasks?status=blocked"
        />
        <StatCard
          label="Bald fällig"
          value={dueSoonTasks}
          icon={<Clock className="h-4 w-4" />}
          color={dueSoonTasks > 0 ? 'orange' : 'gray'}
          href="/tasks"
        />
        <StatCard
          label="Einkäufe offen"
          value={openShoppingCount}
          icon={<ShoppingCart className="h-4 w-4" />}
          color="gray"
          href="/shopping"
        />
      </div>

      {/* Kosten Banner */}
      <div className="bg-stone-900 text-white rounded-xl p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wide">Gesamtkosten</p>
            <p className="text-2xl font-bold mt-0.5">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 text-xs">Bezahlt</p>
            <p className="text-lg font-semibold text-green-400">{formatCurrency(paidExpenses)}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 text-xs">Offen</p>
            <p className="text-lg font-semibold text-orange-400">{formatCurrency(totalExpenses - paidExpenses)}</p>
          </div>
        </div>
        {totalExpenses > 0 && (
          <div className="mt-3">
            <div className="h-1.5 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (paidExpenses / totalExpenses) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-1">{Math.round((paidExpenses / totalExpenses) * 100)}% bezahlt</p>
          </div>
        )}
        <Link href="/expenses">
          <Button variant="outline" size="sm" className="mt-3 border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white bg-transparent">
            Kostenübersicht <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Aktuelle Aufgaben</CardTitle>
              <Link href="/tasks" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-0.5">
                Alle <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckSquare className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">Noch keine Aufgaben</p>
                <Link href="/tasks"><Button variant="outline" size="sm" className="mt-3">Erste Aufgabe erstellen</Button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map(task => (
                  <Link key={task.id} href={`/tasks`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-stone-50 group">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === 'done' ? 'bg-green-500' :
                        task.status === 'in_progress' ? 'bg-blue-500' :
                        task.status === 'blocked' ? 'bg-orange-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{task.title}</p>
                        {task.trade && <p className="text-xs text-stone-400">{task.trade.name}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events + Recent Docs */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Nächste Termine</CardTitle>
                <Link href="/calendar" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-0.5">
                  Kalender <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-stone-400">Keine anstehenden Termine</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar className="h-3.5 w-3.5 text-stone-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{event.title}</p>
                        <p className="text-xs text-stone-400">{formatDate(event.start_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Letzte Dokumente</CardTitle>
                <Link href="/documents" className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-0.5">
                  Alle <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentDocuments.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-4">Noch keine Dokumente</p>
              ) : (
                <div className="space-y-2">
                  {recentDocuments.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="h-3.5 w-3.5 text-stone-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{doc.title}</p>
                        <p className="text-xs text-stone-400">{doc.file_type?.toUpperCase()} · {formatDate(doc.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trades */}
      {trades.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Gewerke</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {trades.map(trade => (
                <span key={trade.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-lg text-sm text-stone-700">
                  <Wrench className="h-3.5 w-3.5" />
                  {trade.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color, href }: {
  label: string; value: number; icon: React.ReactNode; color: string; href: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    orange: 'bg-orange-50 text-orange-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-stone-100 text-stone-600',
  }
  return (
    <Link href={href}>
      <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
          {icon}
        </div>
        <div className="text-2xl font-bold text-stone-900">{value}</div>
        <div className="text-xs text-stone-500 mt-0.5">{label}</div>
      </div>
    </Link>
  )
}
