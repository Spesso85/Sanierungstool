import { createClient } from '@/lib/supabase/client'
import type { ShoppingItem } from '@/types'

export async function getShoppingItems() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*, task:tasks(id, title)')
    .order('purchased', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as (ShoppingItem & { task?: { id: string; title: string } })[]
}

export async function createShoppingItem(item: Partial<ShoppingItem>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('shopping_items').insert(item).select().single()
  if (error) throw error
  return data as ShoppingItem
}

export async function updateShoppingItem(id: string, updates: Partial<ShoppingItem>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('shopping_items').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as ShoppingItem
}

export async function toggleShoppingItem(id: string, purchased: boolean) {
  return updateShoppingItem(id, { purchased })
}

export async function deleteShoppingItem(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('shopping_items').delete().eq('id', id)
  if (error) throw error
}

export function groupByCategory(items: ShoppingItem[]) {
  return items.reduce((acc, item) => {
    const key = item.category || 'Sonstiges'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, ShoppingItem[]>)
}
