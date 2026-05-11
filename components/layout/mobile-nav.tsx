'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, ShoppingCart, DollarSign, Calendar } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Aufgaben', icon: CheckSquare },
  { href: '/shopping', label: 'Einkauf', icon: ShoppingCart },
  { href: '/expenses', label: 'Kosten', icon: DollarSign },
  { href: '/calendar', label: 'Kalender', icon: Calendar },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200">
      <div className="flex">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-stone-900' : 'text-stone-400'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
