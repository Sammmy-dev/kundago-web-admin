import { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Loader2, Search } from 'lucide-react'

type Parcel = {
  _id: string
  userId: { _id: string; fullName: string; email: string; phone?: string } | string
  pickupName: string
  pickupAddress: string
  pickupPhone: string
  dropoffName: string
  dropoffAddress: string
  dropoffPhone: string
  packageSize: string
  notes?: string
  paymentMethod: string
  status: string
  createdAt: string
}

const statusOptions = ['PENDING', 'PICKED', 'DELIVERED']

export default function ParcelsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data: parcels, isLoading } = useQuery({
    queryKey: ['admin', 'parcels', statusFilter],
    queryFn: () => api.get('/admin/parcels', { params: statusFilter ? { status: statusFilter } : {} }).then((r) => r.data.data?.parcels || []),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/parcels/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'parcels'] }),
  })

  const filtered = (parcels ?? []).filter((p: Parcel) => {
    if (!search) return true
    const q = search.toLowerCase()
    const user = typeof p.userId === 'object' ? p.userId : null
    return p._id.toLowerCase().includes(q) || p.pickupName.toLowerCase().includes(q) || p.dropoffName.toLowerCase().includes(q) || user?.fullName.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="headline-md">Parcels</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-400)' }} />
            <input className="input-field" placeholder="Search parcels..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 240 }} />
          </div>
          <select className="select-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
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
                  <th>Parcel ID</th>
                  <th>Pickup</th>
                  <th>Dropoff</th>
                  <th>Size</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>
                    <Loader2 size={24} className="spin" />
                  </td></tr>
                ) : filtered?.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--color-secondary-400)' }}>
                    No parcels found
                  </td></tr>
                ) : (
                  filtered?.map((parcel: Parcel) => {
                    const isOpen = expanded === parcel._id
                    return (
                      <Fragment key={parcel._id}>
                        <tr onClick={() => setExpanded(isOpen ? null : parcel._id)} style={{ cursor: 'pointer' }}>
                          <td>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: 'transform 0.2s', color: 'var(--color-secondary-400)' }}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontSize: 13 }}>#KG-{parcel._id.slice(-4).toUpperCase()}</td>
                          <td>{parcel.pickupName}</td>
                          <td>{parcel.dropoffName}</td>
                          <td><span className="badge badge-secondary">{parcel.packageSize}</span></td>
                          <td>{parcel.paymentMethod}</td>
                          <td>
                            <span className={`badge ${parcel.status === 'DELIVERED' ? 'badge-success' : parcel.status === 'PICKED' ? 'badge-primary' : 'badge-secondary'}`}>
                              {parcel.status}
                            </span>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--color-secondary-500)' }}>{new Date(parcel.createdAt).toLocaleDateString()}</td>
                          <td>
                            {parcel.status !== 'DELIVERED' && (
                              <select
                                className="select-field"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateStatus.mutate({ id: parcel._id, status: e.target.value })
                                    e.target.value = ''
                                  }
                                }}
                                style={{ width: 130, padding: '4px 8px', fontSize: 13 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Update</option>
                                {statusOptions.filter((s) => {
                                  const idx = statusOptions.indexOf(parcel.status)
                                  return statusOptions.indexOf(s) > idx
                                }).map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${parcel._id}-detail`}>
                            <td colSpan={9} style={{ padding: '16px 24px', backgroundColor: 'var(--color-secondary-50)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Pickup Details</h4>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Name:</strong> {parcel.pickupName}</p>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Address:</strong> {parcel.pickupAddress}</p>
                                  <p className="body-md"><strong>Phone:</strong> {parcel.pickupPhone}</p>
                                </div>
                                <div>
                                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Dropoff Details</h4>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Name:</strong> {parcel.dropoffName}</p>
                                  <p className="body-md" style={{ marginBottom: 4 }}><strong>Address:</strong> {parcel.dropoffAddress}</p>
                                  <p className="body-md"><strong>Phone:</strong> {parcel.dropoffPhone}</p>
                                </div>
                              </div>
                              {parcel.notes && (
                                <div style={{ marginTop: 12 }}>
                                  <h4 style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Notes</h4>
                                  <p className="body-md">{parcel.notes}</p>
                                </div>
                              )}
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
