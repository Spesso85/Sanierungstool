'use client'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createExpense, deleteExpense, updateExpense } from '@/services/expenses'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Expense, Trade } from '@/types'
import { Plus, Trash2, Euro, TrendingUp, Check, X } from 'lucide-react'

const schema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  amount: z.string().min(1, 'Betrag erforderlich'),
  category: z.string().optional(),
  trade_id: z.string().optional(),
  paid: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialExpenses: Expense[]
  trades: Trade[]
}

const CATEGORIES = ['Material', 'Handwerker', 'Werkzeug', 'Transport', 'Planung', 'Sonstiges']

export function ExpensesView({ initialExpenses, trades }: Props) {
  const [expenses, setExpenses] = useState(initialExpenses)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('')

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paid: false },
  })

  const paid = watch('paid')

  const filtered = useMemo(() =>
    expenses.filter(e => !categoryFilter || e.category === categoryFilter),
    [expenses, categoryFilter]
  )

  const totals = useMemo(() => ({
    total: expenses.reduce((s, e) => s + e.amount, 0),
    paid: expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0),
    unpaid: expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0),
  }), [expenses])

  const byCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      const key = e.category || 'Sonstiges'
      acc[key] = (acc[key] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  }, [expenses])

  async function onSubmit(data: FormData) {
    try {
      const expense = await createExpense({
        title: data.title,
        amount: parseFloat(data.amount),
        category: data.category || null,
        trade_id: data.trade_id || null,
        paid: data.paid ?? false,
      })
      setExpenses(prev => [expense, ...prev])
      reset()
      setDialogOpen(false)
      toast({ title: 'Ausgabe erfasst' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleTogglePaid(id: string, currentPaid: boolean) {
    try {
      const updated = await updateExpense(id, { paid: !currentPaid })
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, paid: !currentPaid } : e))
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Ausgabe wirklich löschen?')) return
    try {
      await deleteExpense(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
      toast({ title: 'Ausgabe gelöscht' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Kosten</h1>
          <p className="text-stone-500 text-sm">{expenses.length} Ausgaben</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ausgabe erfassen</span>
              <span className="sm:hidden">Neu</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ausgabe erfassen</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label>Beschreibung *</Label>
                <Input placeholder="z.B. Fensterlieferung" {...register('title')} />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Betrag (€) *</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...register('amount')} />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Kategorie</Label>
                  <select className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:outline-none" {...register('category')}>
                    <option value="">Wählen...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Gewerk (optional)</Label>
                <select className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:outline-none" {...register('trade_id')}>
                  <option value="">Keines</option>
                  {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={!!paid} onCheckedChange={v => setValue('paid', !!v)} />
                <Label>Bereits bezahlt</Label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                <Button type="submit" className="flex-1">Speichern</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-stone-900 text-white rounded-xl p-4">
          <p className="text-stone-400 text-xs">Gesamt</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(totals.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-stone-500 text-xs">Bezahlt</p>
          <p className="text-lg font-bold text-green-600 mt-0.5">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-stone-500 text-xs">Offen</p>
          <p className="text-lg font-bold text-orange-600 mt-0.5">{formatCurrency(totals.unpaid)}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
          <p className="text-sm font-semibold text-stone-700 mb-3">Nach Kategorie</p>
          <div className="space-y-2">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="text-stone-700">{cat}</span>
                    <span className="text-stone-900 font-medium">{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-700 rounded-full"
                      style={{ width: `${totals.total > 0 ? (amount / totals.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !categoryFilter ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
          }`}
        >
          Alle
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c === categoryFilter ? '' : c)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === c ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Euro className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">Noch keine Ausgaben</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(expense => (
            <div key={expense.id} className={`bg-white rounded-xl border p-4 flex items-center gap-3 ${
              expense.paid ? 'border-stone-100' : 'border-stone-200'
            }`}>
              <button
                onClick={() => handleTogglePaid(expense.id, expense.paid)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  expense.paid ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400 hover:bg-green-50 hover:text-green-500'
                }`}
              >
                {expense.paid ? <Check className="h-4 w-4" /> : <Euro className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-stone-900 truncate ${expense.paid ? 'line-through opacity-60' : ''}`}>
                  {expense.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {expense.category && (
                    <span className="text-xs text-stone-400">{expense.category}</span>
                  )}
                  <span className="text-xs text-stone-300">·</span>
                  <span className="text-xs text-stone-400">{formatDate(expense.created_at)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-semibold ${expense.paid ? 'text-green-600' : 'text-stone-900'}`}>
                  {formatCurrency(expense.amount)}
                </p>
                <p className="text-xs text-stone-400">{expense.paid ? 'bezahlt' : 'offen'}</p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <Button size="lg" className="rounded-full w-14 h-14 shadow-lg" onClick={() => setDialogOpen(true)}>
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
