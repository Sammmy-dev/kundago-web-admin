import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Loader2, Package, ShoppingCart, Truck, TrendingUp, Users, AlertCircle } from 'lucide-react'

type RecentOrder = {
  _id: string
  userId: { fullName: string; email: string } | string
  items: { productId: string; quantity: number; priceAtTime: number }[]
  totalAmount: number
  orderStatus: string
  paymentMethod: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: metrics, isLoading: mLoading, error: mError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/orders/metrics/dashboard').then((r) => r.data.data?.metrics),
  })

  const { data: recentOrders, isLoading: oLoading, error: oError } = useQuery({
    queryKey: ['admin', 'orders', 'latest'],
    queryFn: () => api.get('/admin/orders/latest').then((r) => r.data.data?.orders || []),
  })

  const stats = [
    { label: 'Monthly Revenue', value: metrics ? `D ${(metrics.monthlyRevenue || 0).toLocaleString()}` : '—', icon: TrendingUp, color: 'var(--color-primary)' },
    { label: "Today's Orders", value: metrics?.dailyOrders ?? '—', icon: ShoppingCart, color: 'var(--color-secondary)' },
    { label: 'Pending Orders', value: metrics?.pendingOrders ?? '—', icon: Package, color: 'var(--color-tertiary)' },
    { label: 'Completed Orders', value: metrics?.completedOrders ?? '—', icon: Truck, color: 'var(--color-primary)' },
    { label: 'Total Users', value: metrics?.totalUsers ?? '—', icon: Users, color: 'var(--color-secondary)' },
  ]

  return (
    <div>
      {/* <div className="page-header">
        <h1 className="headline-md">Dashboard</h1>
      </div> */}

      {mError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-error-container)', color: 'var(--color-error)', marginBottom: 20, fontSize: 14 }}>
          <AlertCircle size={18} />
          <span>Metrics: {(mError as any)?.response?.data?.message || (mError as any)?.message || 'Failed to load'}</span>
        </div>
      )}

      {oError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-error-container)', color: 'var(--color-error)', marginBottom: 20, fontSize: 14 }}>
          <AlertCircle size={18} />
          <span>Orders: {(oError as any)?.response?.data?.message || (oError as any)?.message || 'Failed to load'}</span>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{s.label}</span>
                <Icon size={22} color={s.color} />
              </div>
              <span className="stat-value">
                {mLoading ? <Loader2 size={24} className="spin" /> : s.value}
              </span>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Orders</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {oLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                    <Loader2 size={24} className="spin" />
                  </td></tr>
                ) : (recentOrders ?? []).length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-secondary-400)' }}>
                    No orders yet
                  </td></tr>
                ) : (
                  (recentOrders ?? []).map((order: RecentOrder) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>#KG-{order._id.slice(-4).toUpperCase()}</td>
                      <td>{typeof order.userId === 'string' ? '—' : order.userId.fullName}</td>
                      <td>D {order.totalAmount.toLocaleString()}</td>
                      <td>{order.paymentMethod}</td>
                      <td><span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-success' : order.orderStatus === 'PENDING' ? 'badge-secondary' : 'badge-primary'}`}>{order.orderStatus}</span></td>
                      <td style={{ fontSize: 13, color: 'var(--color-secondary-500)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
