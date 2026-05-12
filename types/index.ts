export type UserRole = 'admin' | 'editor' | 'viewer'

export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export interface Room {
  id: string
  name: string
  created_at: string
}

export interface Trade {
  id: string
  name: string
  created_at: string
}

export interface Contractor {
  id: string
  name: string
  trade_id?: string | null // Neu hinzugefügt
  phone: string | null
  created_at: string
  // Optionale Felder falls du sie später nutzen willst
  company?: string | null
  email?: string | null
  notes?: string | null
  trade?: Trade // Für den Join
}

export interface Task {
  id: string
  title: string
  description: string | null
  room_id: string | null
  trade_id: string | null
  contractor_id: string | null
  status: TaskStatus
  due_date: string | null
  start_date: string | null
  end_date: string | null
  duration_days: number | null
  blocked_reason: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  room?: Room
  trade?: Trade
  contractor?: Contractor
  dependencies?: Task[]
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
}

export interface Document {
  id: string
  title: string
  file_url: string
  file_type: string | null
  uploaded_by: string | null
  trade_id?: string | null // HIER: Das hat Vercel gefehlt!
  created_at: string
}

export interface DocumentLink {
  id: string
  document_id: string
  task_id: string | null
  trade_id: string | null
  room_id: string | null
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string | null
  category: string | null
  store: string | null
  purchased: boolean
  linked_task_id: string | null
  created_at: string
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string | null
  paid: boolean
  document_id: string | null
  trade_id: string | null
  store_name?: string | null // Neu hinzugefügt
  receipt_url?: string | null // Neu hinzugefügt
  created_at: string
  trade?: Trade // Für den Join
}

export interface CalendarEvent {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  related_trade_id: string | null
  created_at: string
}

export interface DashboardStats {
  openTasks: number
  blockedTasks: number
  dueSoonTasks: number
  openShoppingItems: number
  totalExpenses: number
  paidExpenses: number
  recentDocuments: Document[]
  activeTrades: Trade[]
}