'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { HardHat, Loader2, ArrowLeft } from 'lucide-react'

const schema = z.object({ email: z.string().email('Bitte gültige E-Mail eingeben') })
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' })
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-xl flex items-center justify-center mb-4">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Passwort zurücksetzen</h1>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <p className="text-sm text-stone-700">Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen geschickt.</p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full mt-2">Zurück zum Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-stone-600">Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen.</p>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="name@beispiel.de" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Link senden
              </Button>
            </form>
          )}
        </div>

        <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-stone-900 mt-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Zurück zum Login
        </Link>
      </div>
    </div>
  )
}
