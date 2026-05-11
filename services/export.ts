import { formatDate, formatCurrency, getStatusLabel } from '@/lib/utils'
import type { Task, ShoppingItem, Expense } from '@/types'

export function exportTasksToCSV(tasks: Task[]): void {
  const headers = ['Titel', 'Status', 'Raum', 'Gewerk', 'Handwerker', 'Fällig', 'Beschreibung']
  const rows = tasks.map(t => [
    t.title,
    getStatusLabel(t.status),
    t.room?.name ?? '',
    t.trade?.name ?? '',
    t.contractor?.name ?? '',
    formatDate(t.due_date),
    t.description ?? '',
  ])
  downloadCSV([headers, ...rows], 'aufgaben.csv')
}

export function exportShoppingToCSV(items: ShoppingItem[]): void {
  const headers = ['Artikel', 'Menge', 'Einheit', 'Kategorie', 'Bezugsquelle', 'Gekauft']
  const rows = items.map(i => [
    i.name,
    i.quantity.toString(),
    i.unit ?? '',
    i.category ?? '',
    i.store ?? '',
    i.purchased ? 'Ja' : 'Nein',
  ])
  downloadCSV([headers, ...rows], 'einkaufsliste.csv')
}

export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = ['Beschreibung', 'Betrag', 'Kategorie', 'Bezahlt', 'Datum']
  const rows = expenses.map(e => [
    e.title,
    e.amount.toFixed(2),
    e.category ?? '',
    e.paid ? 'Ja' : 'Nein',
    formatDate(e.created_at),
  ])
  downloadCSV([headers, ...rows], 'kosten.csv')
}

function downloadCSV(data: string[][], filename: string): void {
  const bom = '﻿'
  const csv = bom + data.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportExpensesToXLSX(expenses: Expense[]): Promise<void> {
  const { utils, writeFile } = await import('xlsx')
  const ws = utils.aoa_to_sheet([
    ['Beschreibung', 'Betrag (€)', 'Kategorie', 'Bezahlt', 'Datum'],
    ...expenses.map(e => [
      e.title,
      e.amount,
      e.category ?? '',
      e.paid ? 'Ja' : 'Nein',
      formatDate(e.created_at),
    ]),
    [],
    ['Gesamt', expenses.reduce((s, e) => s + e.amount, 0)],
    ['Bezahlt', expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)],
    ['Offen', expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0)],
  ])
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Kosten')
  writeFile(wb, 'kosten.xlsx')
}
