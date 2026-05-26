import { useEffect } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './lib/auth'
import { useThemeStore } from './lib/theme'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import OrdersPage from './pages/OrdersPage'
import ParcelsPage from './pages/ParcelsPage'
import ProductsPage from './pages/ProductsPage'
import UsersPage from './pages/UsersPage'
import { Loader2 } from 'lucide-react'

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const loading = useAuthStore((s) => s.loading)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <Loader2 size={32} className="spin" color="var(--color-primary)" />
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const themeHydrate = useThemeStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
    themeHydrate()
  }, [hydrate, themeHydrate])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="parcels" element={<ParcelsPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
