import { createClient } from '@/lib/supabase/client'
import type { Room, Trade, Contractor } from '@/types'

export async function getRooms() {
  const supabase = createClient()
  const { data, error } = await supabase.from('rooms').select('*').order('name')
  if (error) throw error
  return data as Room[]
}

export async function getTrades() {
  const supabase = createClient()
  const { data, error } = await supabase.from('trades').select('*').order('name')
  if (error) throw error
  return data as Trade[]
}

export async function getContractors() {
  const supabase = createClient()
  const { data, error } = await supabase.from('contractors').select('*').order('name')
  if (error) throw error
  return data as Contractor[]
}

export async function createRoom(name: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('rooms').insert({ name }).select().single()
  if (error) throw error
  return data as Room
}

export async function createTrade(name: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('trades').insert({ name }).select().single()
  if (error) throw error
  return data as Trade
}

export async function createContractor(contractor: Partial<Contractor>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('contractors').insert(contractor).select().single()
  if (error) throw error
  return data as Contractor
}

export async function updateContractor(id: string, updates: Partial<Contractor>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('contractors').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Contractor
}

export async function deleteContractor(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('contractors').delete().eq('id', id)
  if (error) throw error
}
