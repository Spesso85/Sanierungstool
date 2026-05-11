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
import { createShoppingItem, updateShoppingItem, deleteShoppingItem, toggleShoppingItem } from '@/services/shopping'
import { toast } from '@/hooks/use-toast'
import type { ShoppingItem } from '@/types'
import { Plus, Trash2, Search, ShoppingCart, Package, Filter } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  quantity: z.string().min(1, 'Menge erforderlich'),
  unit: z.string().optional(),
  category: z.string().optional(),
  store: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialItems: ShoppingItem[]
}

const CATEGORIES = ['Baumarkt', 'Fliesen', 'Sanitär', 'Elektro', 'Holz', 'Farbe', 'Werkzeug', 'Sonstiges']

export function ShoppingView({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showPurchased, setShowPurchased] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const filtered = useMemo(() => {
    return items.filter(item => {
      if (!showPurchased && item.purchased) return false
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && item.category !== categoryFilter) return false
      return true
    })
  }, [items, search, categoryFilter, showPurchased])

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      const key = item.category || 'Sonstiges'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as Record<string, ShoppingItem[]>)
  }, [filtered])

  const openCount = items.filter(i => !i.purchased).length
  const purchasedCount = items.filter(i => i.purchased).length

  async function onSubmit(data: FormData) {
    try {
      const item = await createShoppingItem({
        name: data.name,
        quantity: parseFloat(data.quantity),
        unit: data.unit || null,
        category: data.category || null,
        store: data.store || null,
        purchased: false,
      })
      setItems(prev => [item, ...prev])
      reset()
      setDialogOpen(false)
      toast({ title: 'Artikel hinzugefügt' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleToggle(id: string, purchased: boolean) {
    try {
      await toggleShoppingItem(id, !purchased)
      setItems(prev => prev.map(i => i.id === id ? { ...i, purchased: !purchased } : i))
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteShoppingItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
      toast({ title: 'Artikel entfernt' })
    } catch {
      toast({ title: 'Fehler', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Einkaufsliste</h1>
          <p className="text-stone-500 text-sm">
            {openCount} offen · {purchasedCount} erledigt
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Artikel hinzufügen</span>
              <span className="sm:hidden">Neu</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Artikel hinzufügen</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-2">
              <div className="space-y-1.5">
                <Label>Artikel *</Label>
                <Input placeholder="z.B. Ytong-Steine" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Menge *</Label>
                  <Input type="number" step="0.1" min="0" placeholder="10" {...register('quantity')} />
                  {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Einheit</Label>
                  <Input placeholder="Stück, m², kg" {...register('unit')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Kategorie</Label>
                  <select className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" {...register('category')}>
                    <option value="">Wählen...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Bezugsquelle</Label>
                  <Input placeholder="OBI, Bauhaus..." {...register('store')} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" className="flex-1">Hinzufügen</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-stone-600 font-medium">Fortschritt</span>
            <span className="text-stone-500">{purchasedCount}/{items.length} erledigt</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${items.length > 0 ? (purchasedCount / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input placeholder="Suchen..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm focus:outline-none"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">Alle Kategorien</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setShowPurchased(!showPurchased)}
          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
            showPurchased ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          Erledigt
        </button>
      </div>

      {/* Grouped Items */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">Einkaufsliste ist leer</p>
          <p className="text-stone-400 text-sm mt-1">Füge deinen ersten Artikel hinzu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                {category}
                <span className="text-stone-300">({catItems.length})</span>
              </h3>
              <div className="space-y-2">
                {catItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border p-3.5 flex items-center gap-3 transition-all ${
                      item.purchased ? 'border-stone-100 opacity-50' : 'border-stone-200'
                    }`}
                  >
                    <Checkbox
                      checked={item.purchased}
                      onCheckedChange={() => handleToggle(item.id, item.purchased)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-stone-900 ${item.purchased ? 'line-through' : ''}`}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-stone-500">
                          {item.quantity} {item.unit || 'Stück'}
                        </span>
                        {item.store && (
                          <span className="text-xs text-stone-400">· {item.store}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
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
