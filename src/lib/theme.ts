import { create } from 'zustand'

type ThemeState = {
  isDark: boolean
  toggle: () => void
  hydrate: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: localStorage.getItem('kundago_admin_theme') === 'dark',

  toggle: () => {
    const next = !get().isDark
    localStorage.setItem('kundago_admin_theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
    set({ isDark: next })
  },

  hydrate: () => {
    const isDark = get().isDark
    document.documentElement.classList.toggle('dark', isDark)
  },
}))
