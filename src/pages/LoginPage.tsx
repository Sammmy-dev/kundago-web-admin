import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/kungaGo_logo.png" alt="Kundago" className="login-logo" />
          <span className="login-brand-text">
            <span className="text-primary">Kunda</span>
            <span style={{ color: '#ef4444' }}>Go</span>
          </span>
        </div>
        <p className="login-subtitle">Admin Dashboard</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email Address</label>
            <input
              type="email"
              placeholder="admin@kundago.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`login-input ${focusedField === 'email' ? 'input-focused' : ''}`}
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`login-input ${focusedField === 'password' ? 'input-focused' : ''}`}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((p) => !p)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="login-submit">
            {loading ? <Loader2 size={20} className="spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
