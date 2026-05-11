'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { HardHat, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Bitte gültige E-Mail eingeben'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      toast({ title: 'Fehler', description: 'E-Mail oder Passwort falsch.', variant: 'destructive' })
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-4">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Sanierungs-Cockpit</h1>
          <p className="text-stone-500 text-sm mt-1">Dein Bauprojekt im Griff</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900 mb-5">Anmelden</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-Mail</Label>
              <Input id="email" type="email" placeholder="name@beispiel.de" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Passwort</Label>
                <Link href="/auth/reset-password" className="text-xs text-stone-500 hover:text-stone-900">
                  Vergessen?
                </Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Anmelden
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500 mt-4">
          Noch kein Konto?{' '}
          <Link href="/auth/register" className="text-stone-900 font-medium hover:underline">
            Registrieren
          </Link>
        </p>
      </div>
    </div>
  )
}
