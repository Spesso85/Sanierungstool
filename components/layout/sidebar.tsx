'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, CheckSquare, FileText, ShoppingCart,
  DollarSign, Calendar, BarChart2, Settings, HardHat, LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-stone-200 h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-stone-100">
        <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
          <HardHat className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-stone-900 text-sm">Sanierungs-Cockpit</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-stone-100">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-stone-900 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Abmelden
        </button>
      </div>
    </aside>
  )
}
