import { useState, useEffect } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import RecycleLogo from '../components/RecycleLogo'
import './Admin.css'

const ADMIN_EMAIL = 'admin@Tyajyadinda Tejassige.app'

export default function Admin() {
  const [authView, setAuthView] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [collabs, setCollabs] = useState([])
  const [rewards, setRewards] = useState([])
  const [myVendor, setMyVendor] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [vendorForm, setVendorForm] = useState({ business_name:'', description:'', category:'eco_products', website:'', contact_phone:'', location_city:'Bengaluru' })
  const [productForm, setProductForm] = useState({ name:'', description:'', price:'', original_price:'', category:'', unit:'piece', stock_quantity:'', eco_certified:false, eco_label:'', carbon_saved_kg:'', images:'' })
  const [rewardForm, setRewardForm] = useState({ title:'', description:'', points_required:'', reward_type:'discount', coupon_code:'', total_available:'', valid_until:'' })

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) detectRole(session.user)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (s) detectRole(s.user)
      else { setRole(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function detectRole(user) {
    setLoading(true)
    if (user.email === ADMIN_EMAIL) {
      setRole('admin')
      await loadAdminData()
      setLoading(false)
      return
    }
    const { data } = await supabase.from('vendors').select('*').eq('user_id', user.id).single()
    if (data) { setMyVendor(data); setRole('vendor'); await loadVendorData(data.id) }
    else setRole('new_vendor')
    setLoading(false)
  }

  async function loadAdminData() {
    const [{ data: v }, { data: c }, { data: r }] = await Promise.all([
      supabase.from('vendors').select('*').order('applied_at', { ascending: false }),
      supabase.from('collaboration_requests').select('*, vendors(business_name)').order('created_at', { ascending: false }),
      supabase.from('rewards').select('*, vendors(business_name)').order('created_at', { ascending: false }),
    ])
    setVendors(v || []); setCollabs(c || []); setRewards(r || [])
  }

  async function loadVendorData(vendorId) {
    const { data } = await supabase.from('products').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false })
    setProducts(data || [])
  }

  async function signIn() {
    if (!supabaseConfigured) return setMsg('Supabase not connected')
    setSubmitting(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    setSubmitting(false)
  }

  async function signUp() {
    if (!supabaseConfigured) return setMsg('Supabase not connected')
    setSubmitting(true); setMsg('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else setMsg('Check your email to confirm, then sign in.')
    setSubmitting(false)
  }

  async function applyAsVendor() {
    if (!vendorForm.business_name) return setMsg('Business name is required')
    setSubmitting(true); setMsg('')
    const { data, error } = await supabase.from('vendors').insert({ ...vendorForm, user_id: session.user.id, contact_email: session.user.email }).select().single()
    if (error) { setMsg(error.message); setSubmitting(false); return }
    setMyVendor(data); setRole('vendor')
    setMsg('Application submitted! Awaiting admin approval.')
    setSubmitting(false)
  }

  async function addProduct() {
    if (!productForm.name || !productForm.price) return setMsg('Name and price required')
    setSubmitting(true); setMsg('')
    const images = productForm.images ? productForm.images.split(',').map(s => s.trim()).filter(Boolean) : []
    const { error } = await supabase.from('products').insert({
      ...productForm, vendor_id: myVendor.id,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      stock_quantity: parseInt(productForm.stock_quantity) || 0,
      carbon_saved_kg: parseFloat(productForm.carbon_saved_kg) || 0,
      images
    })
    if (error) setMsg(error.message)
    else {
      setMsg('Product added!')
      setProductForm({ name:'', description:'', price:'', original_price:'', category:'', unit:'piece', stock_quantity:'', eco_certified:false, eco_label:'', carbon_saved_kg:'', images:'' })
      await loadVendorData(myVendor.id)
    }
    setSubmitting(false)
  }

  async function addReward() {
    if (!rewardForm.title || !rewardForm.points_required) return setMsg('Title and points required')
    setSubmitting(true); setMsg('')
    const { error } = await supabase.from('rewards').insert({
      ...rewardForm, vendor_id: myVendor.id,
      points_required: parseInt(rewardForm.points_required),
      total_available: rewardForm.total_available ? parseInt(rewardForm.total_available) : null
    })
    if (error) setMsg(error.message)
    else { setMsg('Reward added!'); setRewardForm({ title:'', description:'', points_required:'', reward_type:'discount', coupon_code:'', total_available:'', valid_until:'' }) }
    setSubmitting(false)
  }

  async function approveVendor(id) {
    await supabase.from('vendors').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id)
    await loadAdminData()
  }

  async function rejectVendor(id) {
    await supabase.from('vendors').update({ status: 'rejected' }).eq('id', id)
    await loadAdminData()
  }

  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    await loadVendorData(myVendor.id)
  }

  if (!supabaseConfigured) return (
    <div className="adm-root">
      <div className="adm-no-supabase">
        <RecycleLogo size={48}/>
        <h2>Admin Portal</h2>
        <p>Supabase is not connected. Configure your .env file to use the admin portal.</p>
      </div>
    </div>
  )

  if (loading) return (
    <div className="adm-root">
      <div className="adm-loading"><div className="spinner"><div/><div/><div/></div><p>Loading...</p></div>
    </div>
  )

  if (!session) return (
    <div className="adm-root">
      <div className="adm-auth">
        <div className="adm-auth-card">
          <div className="adm-auth-logo"><RecycleLogo size={36}/><span>Tyajyadinda Tejassige</span></div>
          <h2>{authView === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <p className="adm-auth-sub">{authView === 'login' ? 'Vendor & Admin Portal' : 'Register as a vendor'}</p>
          {msg && <div className={'adm-msg ' + (msg.includes('Check') ? 'success' : 'error')}>{msg}</div>}
          <div className="adm-form">
            <div className="adm-field"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"/></div>
            <div className="adm-field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/></div>
            <button className="adm-btn-primary" onClick={authView === 'login' ? signIn : signUp} disabled={submitting}>{submitting ? '...' : (authView === 'login' ? 'Sign In' : 'Create Account')}</button>
            <button className="adm-btn-link" onClick={() => { setAuthView(authView === 'login' ? 'signup' : 'login'); setMsg('') }}>{authView === 'login' ? 'New vendor? Create account' : 'Already have an account? Sign in'}</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (role === 'new_vendor') return (
    <div className="adm-root">
      <div className="adm-topbar"><div className="adm-topbar-brand"><RecycleLogo size={22}/><span>Vendor Application</span></div><button className="adm-signout" onClick={() => supabase.auth.signOut()}>Sign Out</button></div>
      <div className="adm-apply">
        <h2>Apply as a Vendor</h2>
        <p>Fill in your business details. Your application will be reviewed by our admin team.</p>
        {msg && <div className={'adm-msg ' + (msg.includes('submitted') ? 'success' : 'error')}>{msg}</div>}
        <div className="adm-form">
          <div className="adm-field"><label>Business Name *</label><input value={vendorForm.business_name} onChange={e => setVendorForm({...vendorForm, business_name: e.target.value})} placeholder="e.g. Green Earth Products"/></div>
          <div className="adm-field"><label>Description</label><textarea value={vendorForm.description} onChange={e => setVendorForm({...vendorForm, description: e.target.value})} rows={3} placeholder="Tell us about your eco-friendly business..."/></div>
          <div className="adm-field-row">
            <div className="adm-field"><label>Category</label>
              <select value={vendorForm.category} onChange={e => setVendorForm({...vendorForm, category: e.target.value})}>
                <option value="eco_products">Eco Products</option>
                <option value="recycled_goods">Recycled Goods</option>
                <option value="organic_food">Organic Food</option>
                <option value="upcycled">Upcycled Items</option>
                <option value="services">Services</option>
              </select>
            </div>
            <div className="adm-field"><label>City</label><input value={vendorForm.location_city} onChange={e => setVendorForm({...vendorForm, location_city: e.target.value})} placeholder="Bengaluru"/></div>
          </div>
          <div className="adm-field-row">
            <div className="adm-field"><label>Website</label><input value={vendorForm.website} onChange={e => setVendorForm({...vendorForm, website: e.target.value})} placeholder="https://..."/></div>
            <div className="adm-field"><label>Phone</label><input value={vendorForm.contact_phone} onChange={e => setVendorForm({...vendorForm, contact_phone: e.target.value})} placeholder="9XXXXXXXXX"/></div>
          </div>
          <button className="adm-btn-primary" onClick={applyAsVendor} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="adm-root">
      <div className="adm-topbar">
        <div className="adm-topbar-brand"><RecycleLogo size={22}/><span>{role === 'admin' ? 'Admin Panel' : 'Vendor Dashboard'}</span></div>
        <div className="adm-topbar-right">
          {role === 'vendor' && myVendor && <div className={'adm-status-badge ' + myVendor.status}>{myVendor.status}</div>}
          <button className="adm-signout" onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </div>

      <div className="adm-layout">
        <div className="adm-sidebar">
          {role === 'admin' ? (
            ['dashboard','vendors','collabs','rewards'].map(t => (
              <button key={t} className={'adm-nav-btn ' + (activeTab === t ? 'active' : '')} onClick={() => setActiveTab(t)}>
                {t === 'dashboard' ? 'Dashboard' : t === 'vendors' ? 'Vendor Requests' : t === 'collabs' ? 'Collaborations' : 'Rewards'}
              </button>
            ))
          ) : (
            ['overview','products','rewards_mgmt','collabs_req'].map(t => (
              <button key={t} className={'adm-nav-btn ' + (activeTab === t ? 'active' : '')} onClick={() => setActiveTab(t)}>
                {t === 'overview' ? 'My Store' : t === 'products' ? 'Products' : t === 'rewards_mgmt' ? 'Rewards' : 'Collaborations'}
              </button>
            ))
          )}
        </div>

        <div className="adm-content">
          {msg && <div className={'adm-msg ' + (msg.includes('!') || msg.includes('added') ? 'success' : 'error')}>{msg}</div>}

          {role === 'admin' && activeTab === 'dashboard' && (
            <div className="adm-dashboard">
              <h2>Dashboard</h2>
              <div className="adm-stats-grid">
                <div className="adm-stat"><strong>{vendors.length}</strong><span>Total Vendors</span></div>
                <div className="adm-stat"><strong>{vendors.filter(v => v.status === 'pending').length}</strong><span>Pending Approval</span></div>
                <div className="adm-stat"><strong>{vendors.filter(v => v.status === 'approved').length}</strong><span>Active Vendors</span></div>
                <div className="adm-stat"><strong>{collabs.length}</strong><span>Collab Requests</span></div>
              </div>
            </div>
          )}

          {role === 'admin' && activeTab === 'vendors' && (
            <div>
              <h2>Vendor Applications</h2>
              {vendors.length === 0 ? <p className="adm-empty">No vendor applications yet.</p> : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Business</th><th>Category</th><th>City</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {vendors.map(v => (
                        <tr key={v.id}>
                          <td><strong>{v.business_name}</strong><br/><small>{v.contact_email}</small></td>
                          <td>{v.category}</td>
                          <td>{v.location_city}</td>
                          <td>{new Date(v.applied_at).toLocaleDateString('en-IN')}</td>
                          <td><span className={'adm-status-badge ' + v.status}>{v.status}</span></td>
                          <td>
                            {v.status === 'pending' && (
                              <>
                                <button className="adm-approve-btn" onClick={() => approveVendor(v.id)}>Approve</button>
                                <button className="adm-reject-btn" onClick={() => rejectVendor(v.id)}>Reject</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {role === 'admin' && activeTab === 'collabs' && (
            <div>
              <h2>Collaboration Requests</h2>
              {collabs.length === 0 ? <p className="adm-empty">No collaboration requests yet.</p> : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Vendor</th><th>Type</th><th>Title</th><th>Budget</th><th>Status</th></tr></thead>
                    <tbody>
                      {collabs.map(c => (
                        <tr key={c.id}>
                          <td>{c.vendors?.business_name}</td>
                          <td>{c.type}</td>
                          <td>{c.title}</td>
                          <td>{c.budget_inr ? 'â‚¹' + c.budget_inr : 'â€”'}</td>
                          <td><span className={'adm-status-badge ' + c.status}>{c.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {role === 'admin' && activeTab === 'rewards' && (
            <div>
              <h2>Rewards</h2>
              {rewards.length === 0 ? <p className="adm-empty">No rewards yet.</p> : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th>Vendor</th><th>Title</th><th>Type</th><th>Points</th><th>Claimed</th><th>Status</th></tr></thead>
                    <tbody>
                      {rewards.map(r => (
                        <tr key={r.id}>
                          <td>{r.vendors?.business_name}</td>
                          <td>{r.title}</td>
                          <td>{r.reward_type}</td>
                          <td>{r.points_required}</td>
                          <td>{r.claimed_count}/{r.total_available || 'âˆž'}</td>
                          <td><span className={'adm-status-badge ' + r.status}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {role === 'vendor' && activeTab === 'overview' && myVendor && (
            <div>
              <h2>My Store</h2>
              {myVendor.status === 'pending' && <div className="adm-notice">Your application is under review. You will be notified once approved.</div>}
              {myVendor.status === 'rejected' && <div className="adm-notice error">Your application was rejected. Contact admin@Tyajyadinda Tejassige.app for details.</div>}
              <div className="adm-store-overview">
                <h3>{myVendor.business_name}</h3>
                <p>{myVendor.description}</p>
                <div className="adm-store-meta">
                  <span>Category: {myVendor.category}</span>
                  <span>City: {myVendor.location_city}</span>
                  <span>Products: {products.length}</span>
                  <span>Status: <strong>{myVendor.status}</strong></span>
                </div>
              </div>
            </div>
          )}

          {role === 'vendor' && activeTab === 'products' && (
            <div>
              <h2>Products</h2>
              {myVendor?.status !== 'approved' && <div className="adm-notice">You can add products after your vendor application is approved.</div>}
              {myVendor?.status === 'approved' && (
                <>
                  <div className="adm-form-section">
                    <h3>Add New Product</h3>
                    <div className="adm-form">
                      <div className="adm-field-row">
                        <div className="adm-field"><label>Product Name *</label><input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Bamboo Toothbrush"/></div>
                        <div className="adm-field"><label>Category</label><input value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} placeholder="e.g. Personal Care"/></div>
                      </div>
                      <div className="adm-field"><label>Description</label><textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={2} placeholder="Describe your product..."/></div>
                      <div className="adm-field-row">
                        <div className="adm-field"><label>Price (â‚¹) *</label><input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} placeholder="299"/></div>
                        <div className="adm-field"><label>Original Price (â‚¹)</label><input type="number" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} placeholder="399"/></div>
                        <div className="adm-field"><label>Stock</label><input type="number" value={productForm.stock_quantity} onChange={e => setProductForm({...productForm, stock_quantity: e.target.value})} placeholder="50"/></div>
                      </div>
                      <div className="adm-field-row">
                        <div className="adm-field"><label>Unit</label>
                          <select value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})}>
                            <option value="piece">Piece</option><option value="kg">kg</option><option value="litre">Litre</option><option value="pack">Pack</option>
                          </select>
                        </div>
                        <div className="adm-field"><label>COâ‚‚ Saved (kg)</label><input type="number" value={productForm.carbon_saved_kg} onChange={e => setProductForm({...productForm, carbon_saved_kg: e.target.value})} placeholder="0.5"/></div>
                      </div>
                      <div className="adm-field"><label>Image URLs (comma separated)</label><input value={productForm.images} onChange={e => setProductForm({...productForm, images: e.target.value})} placeholder="https://..."/></div>
                      <label className="adm-check"><input type="checkbox" checked={productForm.eco_certified} onChange={e => setProductForm({...productForm, eco_certified: e.target.checked})}/> Eco Certified</label>
                      {productForm.eco_certified && <div className="adm-field"><label>Eco Label</label><input value={productForm.eco_label} onChange={e => setProductForm({...productForm, eco_label: e.target.value})} placeholder="e.g. 100% Recycled"/></div>}
                      <button className="adm-btn-primary" onClick={addProduct} disabled={submitting}>{submitting ? 'Adding...' : 'Add Product'}</button>
                    </div>
                  </div>
                  <div className="adm-products-list">
                    <h3>My Products ({products.length})</h3>
                    {products.length === 0 ? <p className="adm-empty">No products yet.</p> : (
                      <div className="adm-table-wrap">
                        <table className="adm-table">
                          <thead><tr><th>Name</th><th>Price</th><th>Stock</th><th>Views</th><th>Actions</th></tr></thead>
                          <tbody>
                            {products.map(p => (
                              <tr key={p.id}>
                                <td><strong>{p.name}</strong>{p.eco_certified && <span className="adm-eco-tag"> ðŸŒ¿</span>}</td>
                                <td>â‚¹{p.price}</td>
                                <td>{p.stock_quantity}</td>
                                <td>{p.views || 0}</td>
                                <td><button className="adm-reject-btn" onClick={() => deleteProduct(p.id)}>Delete</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {role === 'vendor' && activeTab === 'rewards_mgmt' && (
            <div>
              <h2>Manage Rewards</h2>
              {myVendor?.status !== 'approved' && <div className="adm-notice">Available after approval.</div>}
              {myVendor?.status === 'approved' && (
                <div className="adm-form-section">
                  <h3>Add Reward</h3>
                  <div className="adm-form">
                    <div className="adm-field"><label>Title *</label><input value={rewardForm.title} onChange={e => setRewardForm({...rewardForm, title: e.target.value})} placeholder="e.g. 20% off on first order"/></div>
                    <div className="adm-field"><label>Description</label><textarea value={rewardForm.description} onChange={e => setRewardForm({...rewardForm, description: e.target.value})} rows={2}/></div>
                    <div className="adm-field-row">
                      <div className="adm-field"><label>Points Required *</label><input type="number" value={rewardForm.points_required} onChange={e => setRewardForm({...rewardForm, points_required: e.target.value})} placeholder="500"/></div>
                      <div className="adm-field"><label>Type</label>
                        <select value={rewardForm.reward_type} onChange={e => setRewardForm({...rewardForm, reward_type: e.target.value})}>
                          <option value="discount">Discount</option><option value="free_product">Free Product</option><option value="gift">Gift</option><option value="lucky_draw">Lucky Draw</option>
                        </select>
                      </div>
                      <div className="adm-field"><label>Total Available</label><input type="number" value={rewardForm.total_available} onChange={e => setRewardForm({...rewardForm, total_available: e.target.value})} placeholder="100"/></div>
                    </div>
                    <div className="adm-field-row">
                      <div className="adm-field"><label>Coupon Code</label><input value={rewardForm.coupon_code} onChange={e => setRewardForm({...rewardForm, coupon_code: e.target.value})} placeholder="ECO20"/></div>
                      <div className="adm-field"><label>Valid Until</label><input type="date" value={rewardForm.valid_until} onChange={e => setRewardForm({...rewardForm, valid_until: e.target.value})}/></div>
                    </div>
                    <button className="adm-btn-primary" onClick={addReward} disabled={submitting}>{submitting ? 'Adding...' : 'Add Reward'}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {role === 'vendor' && activeTab === 'collabs_req' && (
            <div>
              <h2>Collaboration Requests</h2>
              <p className="adm-empty">To feature your brand in Tyajyadinda Tejassige Tips, Community challenges, or as a reward sponsor, contact <strong>admin@Tyajyadinda Tejassige.app</strong>.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
