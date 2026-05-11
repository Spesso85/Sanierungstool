'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { exportTasksToCSV, exportShoppingToCSV, exportExpensesToCSV, exportExpensesToXLSX } from '@/services/export'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { Task, ShoppingItem, Expense } from '@/types'
import { Download, User, Shield, FileSpreadsheet, FileText } from 'lucide-react'

interface Props {
  profile: { id: string; name: string; email: string; role: string } | null
  userId: string
  tasks: Task[]
  shopping: ShoppingItem[]
  expenses: Expense[]
}

export function SettingsView({ profile, tasks, shopping, expenses }: Props) {
  const [name, setName] = useState(profile?.name ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('users').update({ name }).eq('id', profile?.id)
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Profil gespeichert' })
    }
    setSaving(false)
  }

  async function handleExportXLSX() {
    try {
      await exportExpensesToXLSX(expenses)
      toast({ title: 'Excel-Export erstellt' })
    } catch {
      toast({ title: 'Fehler beim Export', variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-stone-900 md:text-2xl">Einstellungen</h1>
        <p className="text-stone-500 text-sm">Profil und Exporte verwalten</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>E-Mail</Label>
            <Input value={profile?.email ?? ''} disabled className="bg-stone-50" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Rolle:</span>
            <span className="text-sm font-medium text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              {profile?.role === 'admin' ? 'Admin' : profile?.role === 'editor' ? 'Bearbeiter' : 'Leser'}
            </span>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Speichert...' : 'Speichern'}
          </Button>
        </CardContent>
      </Card>

      {/* Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Daten exportieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50">
              <div>
                <p className="text-sm font-medium text-stone-900">Aufgaben</p>
                <p className="text-xs text-stone-500">{tasks.length} Einträge · CSV</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { exportTasksToCSV(tasks); toast({ title: 'CSV exportiert' }) }}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50">
              <div>
                <p className="text-sm font-medium text-stone-900">Einkaufsliste</p>
                <p className="text-xs text-stone-500">{shopping.length} Artikel · CSV</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { exportShoppingToCSV(shopping); toast({ title: 'CSV exportiert' }) }}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50">
              <div>
                <p className="text-sm font-medium text-stone-900">Kosten</p>
                <p className="text-xs text-stone-500">{expenses.length} Ausgaben · CSV oder Excel</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { exportExpensesToCSV(expenses); toast({ title: 'CSV exportiert' }) }}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportXLSX}>
                  <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                  Excel
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-5">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-stone-900">Sanierungs-Cockpit</p>
            <p className="text-xs text-stone-400">Dein privates Bauprojekt im Griff</p>
            <p className="text-xs text-stone-300 mt-2">Next.js · Supabase · Tailwind CSS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
