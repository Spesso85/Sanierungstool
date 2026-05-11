'use client'
import { usePathname } from 'next/navigation'
import { Menu, HardHat } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, CheckSquare, FileText, ShoppingCart,
  DollarSign, Calendar, BarChart2, Settings, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Aufgaben',
  '/gantt': 'Gantt',
  '/documents': 'Dokumente',
  '/shopping': 'Einkauf',
  '/expenses': 'Kosten',
  '/calendar': 'Kalender',
  '/settings': 'Einstellungen',
}

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Aufgaben', icon: CheckSquare },
  { href: '/gantt', label: 'Gantt', icon: BarChart2 },
  { href: '/documents', label: 'Dokumente', icon: FileText },
  { href: '/shopping', label: 'Einkauf', icon: ShoppingCart },
  { href: '/expenses', label: 'Kosten', icon: DollarSign },
  { href: '/calendar', label: 'Kalender', icon: Calendar },
  { href: '/settings', label: 'Einstellungen', icon: Settings },
]

export function Topbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const title = pageNames[pathname] ?? pageNames[Object.keys(pageNames).find(k => pathname.startsWith(k)) ?? ''] ?? ''

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-900 text-sm">{title}</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-stone-100">
          <Menu className="h-5 w-5 text-stone-700" />
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-y-0 right-0 w-64 bg-white shadow-xl border-l border-stone-200 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-100">
              <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
                <HardHat className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-stone-900">Menü</span>
            </div>
            <nav className="space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                    pathname === href ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-stone-100">
              <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-600 hover:bg-stone-100 w-full">
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
