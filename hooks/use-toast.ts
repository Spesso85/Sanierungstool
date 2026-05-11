'use client'
import * as React from 'react'

interface ToastState {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  open: boolean
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: Omit<ToastState, 'id' | 'open'> }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'REMOVE_TOAST'; id: string }

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function reducer(state: ToastState[], action: ToastAction): ToastState[] {
  switch (action.type) {
    case 'ADD_TOAST':
      return [{ ...action.toast, id: genId(), open: true }, ...state].slice(0, 3)
    case 'DISMISS_TOAST':
      return state.map(t => t.id === action.id ? { ...t, open: false } : t)
    case 'REMOVE_TOAST':
      return state.filter(t => t.id !== action.id)
    default:
      return state
  }
}

const listeners: Array<(state: ToastState[]) => void> = []
let memoryState: ToastState[] = []

function dispatch(action: ToastAction) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => listener(memoryState))
}

export function toast(props: Omit<ToastState, 'id' | 'open'>) {
  dispatch({ type: 'ADD_TOAST', toast: props })
  const id = (count).toString()
  setTimeout(() => dispatch({ type: 'DISMISS_TOAST', id }), 4000)
  setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4500)
}

export function useToast() {
  const [state, setState] = React.useState<ToastState[]>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state, toast, dismiss: (id: string) => dispatch({ type: 'DISMISS_TOAST', id }) }
}
