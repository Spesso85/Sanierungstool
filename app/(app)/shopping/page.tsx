import { createClient } from '@/lib/supabase/server'
import { ShoppingView } from '@/features/shopping/shopping-view'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('shopping_items')
    .select('*')
    .order('purchased', { ascending: true })
    .order('created_at', { ascending: false })
  return <ShoppingView initialItems={items ?? []} />
}
