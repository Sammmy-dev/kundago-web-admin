import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Loader2, Search, Eye, EyeOff } from 'lucide-react'

type User = {
  _id: string
  fullName: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data.data?.users || []),
  })

  const toggleActive = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  const filtered = (users ?? []).filter((u: User) => {
    if (!search) return true
    const q = search.toLowerCase()
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone?.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="headline-md">Users</h1>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-400)' }} />
          <input className="input-field" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 240 }} />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}>
                    <Loader2 size={24} className="spin" />
                  </td></tr>
                ) : filtered?.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-secondary-400)' }}>
                    No users found
                  </td></tr>
                ) : (
                  filtered?.map((user: User) => (
                    <tr key={user._id}>
                      <td style={{ fontWeight: 500 }}>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '—'}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-secondary-500)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="icon-button" title={user.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive.mutate(user._id)}>
                          {user.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </td>
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
