import { create } from 'zustand'
import { api } from './api'

export type User = {
  _id: string
  fullName: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
  profileImage?: string | null
}

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('kundago_admin_token'),
  user: (() => {
    try {
      const stored = localStorage.getItem('kundago_admin_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  loading: !!localStorage.getItem('kundago_admin_token'),

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email: email.toLowerCase(), password })
    const { token, user } = res.data.data
    if (user.role !== 'ADMIN') {
      throw new Error('Access denied. Admin credentials required.')
    }
    localStorage.setItem('kundago_admin_token', token)
    localStorage.setItem('kundago_admin_user', JSON.stringify(user))
    set({ token, user, loading: false })
  },

  logout: () => {
    localStorage.removeItem('kundago_admin_token')
    localStorage.removeItem('kundago_admin_user')
    set({ token: null, user: null, loading: false })
  },

  hydrate: async () => {
    const { token, user } = get()
    if (!token) {
      set({ loading: false })
      return
    }
    if (user) {
      set({ loading: false })
      return
    }
    try {
      const res = await api.get('/auth/me')
      const u = res.data.data?.user || res.data.user
      if (u.role !== 'ADMIN') throw new Error('Not authorized')
      localStorage.setItem('kundago_admin_user', JSON.stringify(u))
      set({ user: u, loading: false })
    } catch {
      localStorage.removeItem('kundago_admin_token')
      localStorage.removeItem('kundago_admin_user')
      set({ token: null, user: null, loading: false })
    }
  },
}))
