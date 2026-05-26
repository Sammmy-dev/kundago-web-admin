import { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Loader2, ChevronDown, Search } from 'lucide-react'

type Order = {
  _id: string
  userId: { _id: string; fullName: string; email: string; phone?: string } | string
  items: { productId: string; quantity: number; priceAtTime: number }[]
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  deliveryAddress: string
  createdAt: string
}

const statusOptions = ['PENDING', 'CONFIRMED', 'DELIVERED']

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin', 'orders', statusFilter],
    queryFn: () => api.get('/admin/orders', { params: statusFilter ? { status: statusFilter } : {} }).then((r) => r.data.data?.orders || []),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/orders/${id}/status`, { orderStatus: status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })

  const filtered = (orders ?? []).filter((o: Order) => {
    if (!search) return true
    const q = search.toLowerCase()
    const displayId = `#KG-${o._id.slice(-4).toUpperCase()}`
    const user = typeof o.userId === 'object' ? o.userId : null
    return displayId.toLowerCase().includes(q) || o._id.toLowerCase().includes(q) || user?.fullName?.toLowerCase().includes(q) || user?.email?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        {/* <h1 className="headline-md">Orders</h1> */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-400)' }} />
            <input
              className="input-field"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, width: 240 }}
            />
          </div>
          <select
            className="select-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32 }}>
                    <Loader2 size={24} className="spin" />
                  </td></tr>
                ) : filtered?.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--color-secondary-400)' }}>
                    No orders found
                  </td></tr>
                ) : (
                  filtered?.map((order: Order) => {
                    const user = typeof order.userId === 'object' ? order.userId : null
                    const isOpen = expanded === order._id
                    return (
                      <Fragment key={order._id}>
                        <tr onClick={() => setExpanded(isOpen ? null : order._id)} style={{ cursor: 'pointer' }}>
                          <td>
                            <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s', color: 'var(--color-secondary-400)' }} />
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>#KG-{order._id.slice(-4).toUpperCase()}</td>
                          <td>{user ? user.fullName : '—'}</td>
                          <td>D {order.totalAmount.toLocaleString()}</td>
                          <td>{order.paymentMethod}</td>
                          <td>
                            <span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-success' : order.orderStatus === 'CONFIRMED' ? 'badge-primary' : 'badge-secondary'}`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--color-secondary-500)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            {order.orderStatus !== 'DELIVERED' && (
                              <select
                                className="select-field"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateStatus.mutate({ id: order._id, status: e.target.value })
                                    e.target.value = ''
                                  }
                                }}
                                style={{ width: 130, padding: '4px 8px', fontSize: 13 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Update</option>
                                {statusOptions.filter((s) => {
                                  const idx = statusOptions.indexOf(order.orderStatus)
                                  return statusOptions.indexOf(s) > idx
                                }).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${order._id}-detail`}>
                            <td colSpan={8} style={{ padding: '16px 24px', backgroundColor: 'var(--color-secondary-50)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Customer Details</h4>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Name:</strong> {user?.fullName || '—'}</p>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Email:</strong> {user?.email || '—'}</p>
                                  <p className="body-md"><strong>Phone:</strong> {user?.phone || '—'}</p>
                                </div>
                                <div>
                                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Order Details</h4>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Payment:</strong> {order.paymentMethod} — {order.paymentStatus}</p>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Delivery:</strong> {order.deliveryAddress || '—'}</p>
                                  <p className="body-md"><strong>Items:</strong> {order.items.reduce((s, i) => s + i.quantity, 0)} units</p>
                                </div>
                              </div>
                              <div style={{ marginTop: 12 }}>
                                <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Items</h4>
                                <table className="data-table">
                                  <thead>
                                    <tr>
                                      <th>Product ID</th>
                                      <th>Qty</th>
                                      <th>Unit Price</th>
                                      <th>Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, i) => (
                                      <tr key={i}>
                                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{typeof item.productId === 'object' ? item.productId.name : item.productId}</td>
                                        <td>{item.quantity}</td>
                                        <td>D {item.priceAtTime.toLocaleString()}</td>
                                        <td>D {(item.priceAtTime * item.quantity).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td style={{ padding: '12px 16px', fontWeight: 700, borderTop: '2px solid var(--color-secondary-200)' }} colSpan={3}>Total</td>
                                      <td style={{ padding: '12px 16px', fontWeight: 700, borderTop: '2px solid var(--color-secondary-200)' }}>D {order.totalAmount.toLocaleString()}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
