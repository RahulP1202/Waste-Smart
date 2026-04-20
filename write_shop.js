const fs = require('fs');

const shop = `import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './Shop.css'

const CAT_ICONS = { eco_products:'🌿', recycled_goods:'♻️', organic_food:'🥦', upcycled:'🎨', services:'🛠️' }
const CAT_LABELS = { eco_products:'Eco Products', recycled_goods:'Recycled Goods', organic_food:'Organic Food', upcycled:'Upcycled', services:'Services' }

function StarRating({ rating, count }) {
  return (
    <div className="star-row">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i<=Math.round(rating)?'#f59e0b':'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      {count > 0 && <span>({count})</span>}
    </div>
  )
}

export default function Shop({ session }) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [view, setView] = useState('stores') // stores, store_detail, product_detail, rewards
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [rewards, setRewards] = useState([])
  const [winners, setWinners] = useState([])
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('All')
  const [searchQ, setSearchQ] = useState('')
  const [claimMsg, setClaimMsg] = useState('')

  const userId = session?.user?.id
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'User'

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    if (!supabaseConfigured) { setLoading(false); return }
    try {
      const [{ data: v }, { data: r }, { data: w }] = await Promise.all([
        supabase.from('vendors').select('*').eq('status','approved').order('is_featured',{ascending:false}),
        supabase.from('rewards').select('*, vendors(business_name,logo_url)').eq('status','active'),
        supabase.from('impact_winners').select('*').order('month',{ascending:false}).limit(3),
      ])
      setVendors(v||[])
      setRewards(r||[])
      setWinners(w||[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  async function loadVendorProducts(vendor) {
    setSelectedVendor(vendor)
    setView('store_detail')
    if (!supabaseConfigured) return
    try {
      const { data } = await supabase.from('products').select('*').eq('vendor_id', vendor.id).eq('status','active').order('created_at',{ascending:false})
      setProducts(data||[])
    } catch(e) {}
  }

  async function viewProduct(product) {
    setSelectedProduct(product)
    setView('product_detail')
    if (!supabaseConfigured) return
    await supabase.from('products').update({ views: (product.views||0)+1 }).eq('id', product.id)
  }

  async function claimReward(reward) {
    if (!userId) return setClaimMsg('Sign in to claim rewards')
    if (!supabaseConfigured) return setClaimMsg('Connect Supabase to claim rewards')
    try {
      const { error } = await supabase.from('reward_claims').insert({
        reward_id: reward.id, user_id: userId, user_name: userName,
        points_spent: reward.points_required, coupon_code: reward.coupon_code, status: 'claimed'
      })
      if (error) throw error
      setClaimMsg('Reward claimed! Check your profile for the coupon code.')
    } catch(e) { setClaimMsg(e.message.includes('unique') ? 'Already claimed this reward!' : e.message) }
  }

  const filteredVendors = vendors.filter(v => {
    const cOk = catFilter === 'All' || v.category === catFilter
    const sOk = !searchQ || v.business_name.toLowerCase().includes(searchQ.toLowerCase())
    return cOk && sOk
  })

  return (
    <div className="shop-root">
      <div className="shop-topbar">
        <button className="scan-back" onClick={() => view==='stores' ? navigate('/') : setView(view==='product_detail'?'store_detail':'stores')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {lang==='kn'?'ಹಿಂದೆ':'Back'}
        </button>
        <div className="shop-topbar-brand">
          <RecycleLogo size={22}/>
          <span>{lang==='kn'?'ಇಕೋ ಶಾಪ್':'Eco Shop'}</span>
        </div>
        <button className="shop-rewards-btn" onClick={()=>setView('rewards')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
          {lang==='kn'?'ಬಹುಮಾನ':'Rewards'}
        </button>
      </div>

      {/* STORES LIST */}
      {view==='stores' && (
        <div className="shop-home">
          <div className="shop-hero">
            <div className="shop-hero-text">
              <div className="shop-hero-tag">{lang==='kn'?'ಪರಿಸರ ಸ್ನೇಹಿ ಮಾರುಕಟ್ಟೆ':'Eco-Friendly Marketplace'}</div>
              <h1>{lang==='kn'?'ಸ್ಥಿರ ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ':'Shop Sustainable Products'}</h1>
              <p>{lang==='kn'?'ಕರ್ನಾಟಕದ ಪರಿಸರ ಸ್ನೇಹಿ ಬ್ರಾಂಡ್‌ಗಳಿಂದ ನೇರವಾಗಿ ಖರೀದಿಸಿ':'Buy directly from verified eco-friendly brands across Karnataka'}</p>
            </div>
            <div className="shop-hero-stats">
              <div><strong>{vendors.length}</strong><small>{lang==='kn'?'ಅಂಗಡಿಗಳು':'Stores'}</small></div>
              <div><strong>{rewards.length}</strong><small>{lang==='kn'?'ಬಹುಮಾನಗಳು':'Rewards'}</small></div>
              <div><strong>{winners.length > 0 ? winners[0]?.user_name?.split(' ')[0] : '—'}</strong><small>{lang==='kn'?'ಈ ತಿಂಗಳ ವಿಜೇತ':'This Month Winner'}</small></div>
            </div>
          </div>

          {/* Search + filter */}
          <div className="shop-filters">
            <div className="shop-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder={lang==='kn'?'ಅಂಗಡಿ ಹುಡುಕಿ...':'Search stores...'} value={searchQ} onChange={e=>setSearchQ(e.target.value)} className="shop-search"/>
            </div>
            <div className="shop-cats">
              {['All',...Object.keys(CAT_LABELS)].map(c=>(
                <button key={c} className={'shop-cat-btn '+(catFilter===c?'active':'')} onClick={()=>setCatFilter(c)}>
                  {c==='All'?(lang==='kn'?'ಎಲ್ಲಾ':'All'):(CAT_ICONS[c]+' '+CAT_LABELS[c])}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="shop-loading"><div className="spinner"><div/><div/><div/></div><p>Loading stores...</p></div>
          ) : filteredVendors.length === 0 ? (
            <div className="shop-empty">
              <div className="shop-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಅಂಗಡಿಗಳಿಲ್ಲ':'No stores yet'}</h3>
              <p>{lang==='kn'?'ಪರಿಸರ ಸ್ನೇಹಿ ಬ್ರಾಂಡ್‌ಗಳು ಶೀಘ್ರದಲ್ಲೇ ಸೇರಲಿವೆ. ನೀವು ಮಾರಾಟಗಾರರಾಗಲು ಬಯಸುವಿರಾ?':'Eco-friendly brands are joining soon. Want to become a vendor?'}</p>
              <a href="/admin" className="shop-vendor-cta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {lang==='kn'?'ಮಾರಾಟಗಾರರಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ':'Apply as a Vendor'}
              </a>
            </div>
          ) : (
            <div className="shop-stores-grid">
              {filteredVendors.map(v => (
                <div key={v.id} className={'shop-store-card '+(v.is_featured?'featured':'')} onClick={()=>loadVendorProducts(v)}>
                  {v.is_featured && <div className="shop-featured-badge">{lang==='kn'?'ವೈಶಿಷ್ಟ್ಯ':'Featured'}</div>}
                  <div className="shop-store-banner" style={{background:v.banner_url?'none':'linear-gradient(135deg,#10b981,#059669)'}}>
                    {v.banner_url && <img src={v.banner_url} alt="" className="shop-store-banner-img"/>}
                  </div>
                  <div className="shop-store-body">
                    <div className="shop-store-logo-wrap">
                      {v.logo_url ? <img src={v.logo_url} alt={v.business_name} className="shop-store-logo"/> : <div className="shop-store-logo-placeholder">{v.business_name[0]}</div>}
                    </div>
                    <h3>{v.business_name}</h3>
                    <div className="shop-store-cat">{CAT_ICONS[v.category]} {CAT_LABELS[v.category]||v.category}</div>
                    {v.description && <p className="shop-store-desc">{v.description}</p>}
                    <div className="shop-store-meta">
                      <span>{v.total_products} {lang==='kn'?'ಉತ್ಪನ್ನಗಳು':'products'}</span>
                      <span>{v.location_city}</span>
                      {v.rating > 0 && <StarRating rating={v.rating} count={v.review_count}/>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vendor CTA */}
          <div className="shop-vendor-banner">
            <div>
              <h3>{lang==='kn'?'ನಿಮ್ಮ ಇಕೋ ಬ್ರಾಂಡ್ ಇಲ್ಲಿ ಪ್ರದರ್ಶಿಸಿ':'Feature Your Eco Brand Here'}</h3>
              <p>{lang==='kn'?'WasteSmart ಬಳಕೆದಾರರಿಗೆ ನಿಮ್ಮ ಸ್ಥಿರ ಉತ್ಪನ್ನಗಳನ್ನು ಮಾರಿ':'Sell your sustainable products to WasteSmart users across Karnataka'}</p>
            </div>
            <a href="/admin" className="shop-vendor-cta">{lang==='kn'?'ಮಾರಾಟಗಾರರಾಗಿ':'Become a Vendor'}</a>
          </div>
        </div>
      )}

      {/* STORE DETAIL */}
      {view==='store_detail' && selectedVendor && (
        <div className="shop-store-detail">
          <div className="shop-store-detail-header" style={{background:selectedVendor.banner_url?'none':'linear-gradient(135deg,#10b981,#059669)'}}>
            {selectedVendor.banner_url && <img src={selectedVendor.banner_url} alt="" className="shop-detail-banner-img"/>}
            <div className="shop-detail-header-overlay"/>
            <div className="shop-detail-header-content">
              {selectedVendor.logo_url ? <img src={selectedVendor.logo_url} alt="" className="shop-detail-logo"/> : <div className="shop-detail-logo-placeholder">{selectedVendor.business_name[0]}</div>}
              <div>
                <h2>{selectedVendor.business_name}</h2>
                <div className="shop-store-cat">{CAT_ICONS[selectedVendor.category]} {CAT_LABELS[selectedVendor.category]}</div>
                {selectedVendor.description && <p>{selectedVendor.description}</p>}
                <div className="shop-detail-meta">
                  {selectedVendor.location_city && <span>📍 {selectedVendor.location_city}, {selectedVendor.location_state}</span>}
                  {selectedVendor.website && <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer">🌐 Website</a>}
                  {selectedVendor.contact_phone && <a href={'tel:'+selectedVendor.contact_phone}>📞 {selectedVendor.contact_phone}</a>}
                </div>
              </div>
            </div>
          </div>

          <div className="shop-products-section">
            <h3>{lang==='kn'?'ಉತ್ಪನ್ನಗಳು':'Products'} {products.length > 0 && <span>({products.length})</span>}</h3>
            {products.length === 0 ? (
              <div className="shop-no-products">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <p>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳಿಲ್ಲ':'No products listed yet'}</p>
              </div>
            ) : (
              <div className="shop-products-grid">
                {products.map(p => (
                  <div key={p.id} className="shop-product-card" onClick={()=>viewProduct(p)}>
                    <div className="shop-product-img-wrap">
                      {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="shop-product-img"/> : <div className="shop-product-img-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
                      {p.eco_certified && <div className="shop-eco-badge">🌿 {p.eco_label||'Eco'}</div>}
                      {p.stock_quantity === 0 && <div className="shop-oos-badge">{lang==='kn'?'ಸ್ಟಾಕ್ ಇಲ್ಲ':'Out of Stock'}</div>}
                    </div>
                    <div className="shop-product-body">
                      <h4>{p.name}</h4>
                      <div className="shop-product-price">
                        <span className="shop-price">₹{p.price}</span>
                        {p.original_price && p.original_price > p.price && <span className="shop-original-price">₹{p.original_price}</span>}
                        {p.original_price && p.original_price > p.price && <span className="shop-discount">{Math.round((1-p.price/p.original_price)*100)}% off</span>}
                      </div>
                      {p.rating > 0 && <StarRating rating={p.rating} count={p.review_count}/>}
                      {p.carbon_saved_kg > 0 && <div className="shop-carbon-tag">🌍 Saves {p.carbon_saved_kg}kg CO₂</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL */}
      {view==='product_detail' && selectedProduct && (
        <div className="shop-product-detail">
          <div className="shop-product-detail-img">
            {selectedProduct.images?.[0] ? <img src={selectedProduct.images[0]} alt={selectedProduct.name}/> : <div className="shop-product-img-placeholder large"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>}
            {selectedProduct.eco_certified && <div className="shop-eco-badge large">🌿 {selectedProduct.eco_label||'Eco Certified'}</div>}
          </div>
          <div className="shop-product-detail-body">
            <h2>{selectedProduct.name}</h2>
            <div className="shop-product-price large">
              <span className="shop-price">₹{selectedProduct.price}</span>
              {selectedProduct.original_price > selectedProduct.price && <>
                <span className="shop-original-price">₹{selectedProduct.original_price}</span>
                <span className="shop-discount">{Math.round((1-selectedProduct.price/selectedProduct.original_price)*100)}% off</span>
              </>}
            </div>
            {selectedProduct.rating > 0 && <StarRating rating={selectedProduct.rating} count={selectedProduct.review_count}/>}
            {selectedProduct.description && <p className="shop-product-desc">{selectedProduct.description}</p>}
            <div className="shop-product-info-grid">
              {selectedProduct.unit && <div className="shop-pinfo"><span>Unit</span><strong>{selectedProduct.unit}</strong></div>}
              {selectedProduct.stock_quantity > 0 && <div className="shop-pinfo"><span>In Stock</span><strong style={{color:'#10b981'}}>{selectedProduct.stock_quantity}</strong></div>}
              {selectedProduct.carbon_saved_kg > 0 && <div className="shop-pinfo"><span>CO₂ Saved</span><strong style={{color:'#10b981'}}>{selectedProduct.carbon_saved_kg}kg</strong></div>}
            </div>
            {selectedProduct.tags?.length > 0 && <div className="shop-tags">{selectedProduct.tags.map(t=><span key={t} className="shop-tag">{t}</span>)}</div>}
            <div className="shop-contact-vendor">
              <p>{lang==='kn'?'ಖರೀದಿಸಲು ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ':'Contact the vendor to purchase'}</p>
              {selectedVendor?.contact_phone && <a href={'tel:'+selectedVendor.contact_phone} className="shop-contact-btn phone">📞 {lang==='kn'?'ಕರೆ ಮಾಡಿ':'Call Vendor'}</a>}
              {selectedVendor?.website && <a href={selectedVendor.website} target="_blank" rel="noopener noreferrer" className="shop-contact-btn web">🌐 {lang==='kn'?'ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ':'Visit Website'}</a>}
            </div>
          </div>
        </div>
      )}

      {/* REWARDS */}
      {view==='rewards' && (
        <div className="shop-rewards-page">
          <div className="shop-rewards-hero">
            <h2>{lang==='kn'?'ಬಹುಮಾನ ಕೇಂದ್ರ':'Rewards Center'}</h2>
            <p>{lang==='kn'?'ತ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಂಕಗಳು ಗಳಿಸಿ, ಇಕೋ ಬ್ರಾಂಡ್‌ಗಳಿಂದ ಬಹುಮಾನ ಪಡೆಯಿರಿ':'Earn points by scanning waste, redeem for rewards from eco brands'}</p>
          </div>

          {claimMsg && <div className="shop-claim-msg">{claimMsg}</div>}

          {/* Monthly winners */}
          {winners.length > 0 && (
            <div className="shop-winners-section">
              <h3>{lang==='kn'?'ಪ್ರಭಾವ ವಿಜೇತರು':'Impact Winners'}</h3>
              <div className="shop-winners-grid">
                {winners.map((w,i) => (
                  <div key={w.id} className="shop-winner-card">
                    <div className="shop-winner-rank">{i===0?'🥇':i===1?'🥈':'🥉'}</div>
                    <div className="shop-winner-avatar">{(w.user_name||'U')[0].toUpperCase()}</div>
                    <div>
                      <strong>{w.user_name}</strong>
                      <p>{new Date(w.month).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</p>
                      <p>{w.total_scans} scans · {(w.total_carbon_saved||0).toFixed(1)}kg CO₂</p>
                      {w.prize_description && <div className="shop-prize-tag">🎁 {w.prize_description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rewards catalog */}
          <div className="shop-rewards-section">
            <h3>{lang==='kn'?'ಬಹುಮಾನ ಕ್ಯಾಟಲಾಗ್':'Rewards Catalog'}</h3>
            {rewards.length === 0 ? (
              <div className="shop-empty">
                <div className="shop-empty-icon"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" strokeWidth="1.2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg></div>
                <h3>{lang==='kn'?'ಇನ್ನೂ ಯಾವುದೇ ಬಹುಮಾನಗಳಿಲ್ಲ':'No rewards yet'}</h3>
                <p>{lang==='kn'?'ಬ್ರಾಂಡ್‌ಗಳು ಸೇರಿದ ನಂತರ ಬಹುಮಾನಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ':'Rewards will appear here once brands join'}</p>
              </div>
            ) : (
              <div className="shop-rewards-grid">
                {rewards.map(r => (
                  <div key={r.id} className="shop-reward-card">
                    {r.image_url && <img src={r.image_url} alt={r.title} className="shop-reward-img"/>}
                    <div className="shop-reward-body">
                      <div className="shop-reward-type-badge">{r.reward_type==='lucky_draw'?'🎲 Lucky Draw':r.reward_type==='free_product'?'🎁 Free Product':'🏷️ Discount'}</div>
                      <h4>{r.title}</h4>
                      {r.description && <p>{r.description}</p>}
                      {r.vendors && <div className="shop-reward-vendor">by {r.vendors.business_name}</div>}
                      <div className="shop-reward-footer">
                        <div className="shop-reward-pts"><strong>{r.points_required}</strong> pts</div>
                        {r.valid_until && <span className="shop-reward-expiry">Expires {new Date(r.valid_until).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>}
                        <button className="shop-claim-btn" onClick={()=>claimReward(r)} disabled={r.claimed_count>=r.total_available}>
                          {r.claimed_count>=r.total_available?(lang==='kn'?'ಮುಗಿದಿದೆ':'Sold Out'):(lang==='kn'?'ಪಡೆಯಿರಿ':'Claim')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync('wastesmart-main/frontend-react/src/pages/Shop.jsx', shop);
console.log('Shop.jsx done');
