'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { 
  Trash2, Plus, Wrench, Home, HardHat, User, LogOut, Phone, Tag 
} from 'lucide-react'

interface Props {
  profile: any
  userId: string
  initialRooms: any[]
  initialTrades: any[]
  initialContractors: any[]
}

export function SettingsView({ 
  profile, 
  userId, 
  initialRooms, 
  initialTrades, 
  initialContractors 
}: Props) {
  const supabase = createClient()
  const [rooms, setRooms] = useState(initialRooms)
  const [trades, setTrades] = useState(initialTrades)
  const [contractors, setContractors] = useState(initialContractors)

  // States für neue Einträge
  const [newRoom, setNewRoom] = useState('')
  const [newTrade, setNewTrade] = useState('')
  const [newContractor, setNewContractor] = useState({ name: '', trade_id: '', phone: '' })

  // --- LOGIK: HINZUFÜGEN ---
  async function handleAddRoom() {
    if (!newRoom) return
    const { data, error } = await supabase.from('rooms').insert({ name: newRoom }).select().single()
    if (error) return toast({ title: 'Fehler', variant: 'destructive' })
    setRooms([...rooms, data])
    setNewRoom('')
    toast({ title: 'Raum hinzugefügt' })
  }

  async function handleAddTrade() {
    if (!newTrade) return
    const { data, error } = await supabase.from('trades').insert({ name: newTrade }).select().single()
    if (error) return toast({ title: 'Fehler', variant: 'destructive' })
    setTrades([...trades, data])
    setNewTrade('')
    toast({ title: 'Gewerk hinzugefügt' })
  }

  async function handleAddContractor() {
    if (!newContractor.name) return
    const { data, error } = await supabase
      .from('contractors')
      .insert(newContractor)
      .select('*, trade:trades(name)')
      .single()
    if (error) return toast({ title: 'Fehler', variant: 'destructive' })
    setContractors([...contractors, data])
    setNewContractor({ name: '', trade_id: '', phone: '' })
    toast({ title: 'Handwerker hinzugefügt' })
  }

  // --- LOGIK: LÖSCHEN ---
  async function handleDelete(id: string, table: string, setter: any, state: any[]) {
    if (!confirm('Möchtest du diesen Eintrag wirklich löschen?')) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    
    if (error) {
      return toast({ 
        title: 'Löschen nicht möglich', 
        description: 'Dieser Eintrag wird wahrscheinlich noch in einer Aufgabe oder einem Dokument verwendet.', 
        variant: 'destructive' 
      })
    }
    
    setter(state.filter(item => item.id !== id))
    toast({ title: 'Eintrag entfernt' })
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-stone-900">Einstellungen</h1>

      {/* Profil-Karte */}
      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-stone-500" /> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-stone-900">{profile?.full_name || 'Benutzer'}</p>
            <p className="text-sm text-stone-500">{profile?.email}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => supabase.auth.signOut()}
            className="text-red-600 border-red-100 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" /> Abmelden
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Räume verwalten */}
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Home className="h-4 w-4 text-stone-500" /> Räume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Raumname (z.B. Küche)" 
                value={newRoom} 
                onChange={e => setNewRoom(e.target.value)} 
              />
              <Button size="icon" onClick={handleAddRoom}><Plus className="h-4 w-4"/></Button>
            </div>
            <div className="space-y-1.5">
              {rooms.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-stone-50 px-3 py-2 rounded-lg text-sm group">
                  <span className="text-stone-700 font-medium">{r.name}</span>
                  <button onClick={() => handleDelete(r.id, 'rooms', setRooms, rooms)} className="text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gewerke verwalten */}
        <Card className="border-stone-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4 text-stone-500" /> Gewerke
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="z.B. Sanitär" 
                value={newTrade} 
                onChange={e => setNewTrade(e.target.value)} 
              />
              <Button size="icon" onClick={handleAddTrade}><Plus className="h-4 w-4"/></Button>
            </div>
            <div className="space-y-1.5">
              {trades.map(t => (
                <div key={t.id} className="flex justify-between items-center bg-stone-50 px-3 py-2 rounded-lg text-sm group">
                  <span className="text-stone-700 font-medium">{t.name}</span>
                  <button onClick={() => handleDelete(t.id, 'trades', setTrades, trades)} className="text-stone-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4"/>
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Handwerker / Kontakte */}
      <Card className="border-stone-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <HardHat className="h-4 w-4 text-stone-500" /> Handwerker & Kontakte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Name</label>
              <Input 
                placeholder="Firma / Name" 
                value={newContractor.name} 
                onChange={e => setNewContractor({...newContractor, name: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Gewerk</label>
              <select 
                className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-stone-400 outline-none"
                value={newContractor.trade_id}
                onChange={e => setNewContractor({...newContractor, trade_id: e.target.value})}
              >
                <option value="">Wählen...</option>
                {trades.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase ml-1">Telefon / Kontakt</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="0176..." 
                  value={newContractor.phone} 
                  onChange={e => setNewContractor({...newContractor, phone: e.target.value})} 
                />
                <Button onClick={handleAddContractor} className="shrink-0"><Plus className="h-4 w-4"/></Button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {contractors.map(c => (
              <div key={c.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-stone-400" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">{c.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1"><Tag className="h-2.5 w-2.5"/> {c.trade?.name || 'Allgemein'}</span>
                      {c.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5"/> {c.phone}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c.id, 'contractors', setContractors, contractors)} className="text-stone-300 hover:text-red-500 p-1">
                  <Trash2 className="h-4 w-4"/>
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}