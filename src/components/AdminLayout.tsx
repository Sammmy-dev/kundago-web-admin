import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { useThemeStore } from '../lib/theme'
import {
  LayoutDashboard, ShoppingBag, Package, Truck, Users,
  Settings, LogOut, Menu, Moon, Sun,
} from 'lucide-react'

const navItems = [
  { id: '', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'parcels', label: 'Parcels', icon: Truck },
  { id: 'users', label: 'Users', icon: Users },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const activePath = location.pathname.split('/').filter(Boolean)[0] || ''
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNav = (path: string) => {
    navigate(path)
    setSidebarOpen(false)
  }

  return (
      <div className="app-layout">
      <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-header">
          <img src="/kungaGo_logo.png" alt="Kundago" style={{ height: 32, width: 'auto' }} />
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--color-primary)' }}>Kunda</span>
            <span style={{ color: '#ef4444' }}>Go</span>
          </span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`sidebar-link ${activePath === item.id ? 'active' : ''}`}
                onClick={() => handleNav(`/${item.id}`)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
          <div className="sidebar-section-label" style={{ marginTop: 16 }}>System</div>
          <button className={`sidebar-link`} onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />} <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className={`sidebar-link ${activePath === 'settings' ? 'active' : ''}`} onClick={() => {}}>
            <Settings size={18} /> <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px' }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
              {user?.fullName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'A'}
            </div>
            <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName || 'Admin'}</div>
              <div style={{ fontSize: 12, color: 'var(--color-secondary-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
            </div>
            <button className="icon-button" onClick={handleLogout} title="Logout" style={{ color: 'var(--color-secondary-400)', flexShrink: 0 }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="top-header">
          <div className="top-header-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen((o) => !o)} title="Toggle sidebar">
              <Menu size={20} />
            </button>
            <span className="headline-md" style={{ fontSize: 20, textTransform: 'capitalize' }}>
              Admin Dashboard
            </span>
          </div>
          <div className="top-header-right">
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
