import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isPast, isWithinInterval, addDays } from 'date-fns'
import { de } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'dd.MM.yyyy', { locale: de })
}

export function formatDateRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  return isPast(new Date(date))
}

export function isDueSoon(date: string | null | undefined, days = 7): boolean {
  if (!date) return false
  const d = new Date(date)
  return isWithinInterval(d, { start: new Date(), end: addDays(new Date(), days) })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open': return 'text-gray-600 bg-gray-100'
    case 'in_progress': return 'text-blue-700 bg-blue-100'
    case 'blocked': return 'text-orange-700 bg-orange-100'
    case 'done': return 'text-green-700 bg-green-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'open': return 'Offen'
    case 'in_progress': return 'In Arbeit'
    case 'blocked': return 'Blockiert'
    case 'done': return 'Erledigt'
    default: return status
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin': return 'Admin'
    case 'editor': return 'Bearbeiter'
    case 'viewer': return 'Leser'
    default: return role
  }
}
