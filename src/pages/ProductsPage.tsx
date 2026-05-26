import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Loader2, Plus, Search, Eye, EyeOff, Trash2, X, Upload } from 'lucide-react'

type Product = {
  _id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  stock: number
  isActive: boolean
  createdAt: string
}

const CATEGORIES = ['Groceries', 'Household/Electronics', 'Construction', 'Pharmacy & Health']

const emptyProduct = { name: '', description: '', price: 0, category: '', stock: 0, images: [] as string[] }

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => api.get('/admin/products').then((r) => r.data.data?.products || []),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/products', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); closeForm() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => api.put(`/admin/products/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); closeForm() },
  })

  const toggleActive = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/products/${id}/soft-delete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
  })

  const closeForm = () => {
    setShowForm(false); setEditing(null); setForm(emptyProduct)
    setSelectedCategory(''); setCustomCategory('')
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({ name: product.name, description: product.description, price: product.price, category: product.category, stock: product.stock, images: product.images })
    const cat = CATEGORIES.includes(product.category) ? product.category : 'Custom'
    setSelectedCategory(cat)
    setCustomCategory(cat === 'Custom' ? product.category : '')
    setShowForm(true)
  }


  const handleRemoveImage = (url: string) => {
    setForm({ ...form, images: form.images.filter((img) => img !== url) })
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    if (value !== 'Custom') {
      setForm({ ...form, category: value })
    }
  }

  const handleCustomCategoryChange = (value: string) => {
    setCustomCategory(value)
    setForm({ ...form, category: value })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        if (dataUrl && !form.images.includes(dataUrl)) {
          setForm((prev) => ({ ...prev, images: [...prev.images, dataUrl] }))
        }
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      updateMutation.mutate({ id: editing._id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const filtered = (products ?? []).filter((p: Product) => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-400)' }} />
            <input className="input-field" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, width: 240 }} />
          </div>
          <button className="btn-primary" onClick={() => { setEditing(null); setForm(emptyProduct); setShowForm(true) }}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn-ghost" onClick={closeForm} style={{ padding: '4px 8px', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="login-label">Name</label>
                  <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="login-label">Description</label>
                  <textarea className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="login-label">Price (D)</label>
                    <input className="input-field" type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label className="login-label">Stock</label>
                    <input className="input-field" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
                  </div>
                </div>
                <div>
                  <label className="login-label">Category</label>
                  <select className="select-field" value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="Custom">Custom...</option>
                  </select>
                  {selectedCategory === 'Custom' && (
                    <input
                      className="input-field"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={(e) => handleCustomCategoryChange(e.target.value)}
                      style={{ marginTop: 8 }}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="login-label">Images</label>
                  {form.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                      {form.images.map((url, i) => (
                        <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-secondary-200)' }}>
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn-primary" onClick={() => fileInputRef.current?.click()} style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
                      <Upload size={18} /> Upload Images
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-secondary-400)', marginTop: 6 }}>
                    Supports JPG, PNG, WebP. Multiple files allowed.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <Loader2 size={18} className="spin" /> : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32 }}>
                    <Loader2 size={24} className="spin" />
                  </td></tr>
                ) : filtered?.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-secondary-400)' }}>
                    No products found
                  </td></tr>
                ) : (
                  filtered?.map((product: Product) => (
                    <tr key={product._id} style={{ opacity: product.isActive ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                          {product.images?.[0] && (
                            <img src={product.images[0]} alt="" style={{ width: 36, height: 36, minWidth: 36, borderRadius: 4, objectFit: 'cover' }} />
                          )}
                          <span style={{ fontWeight: 500 }}>{product.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-secondary">{product.category}</span></td>
                      <td>D {product.price.toLocaleString()}</td>
                      <td>{product.stock}</td>
                      <td>
                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--color-secondary-500)' }}>{new Date(product.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="icon-button" title={product.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleActive.mutate(product._id)}>
                            {product.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button className="icon-button" title="Edit" onClick={() => openEdit(product)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="icon-button" title="Delete" onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product._id) }}>
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
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
