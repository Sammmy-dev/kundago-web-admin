import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kundago_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginRequest = err.config?.url === '/auth/login'
    if (err.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('kundago_admin_token')
      localStorage.removeItem('kundago_admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)
