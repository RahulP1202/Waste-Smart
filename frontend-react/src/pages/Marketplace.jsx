import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './Marketplace.css'

const MATERIALS = ['All','Paper','Plastic','Metal','Glass','E-Waste','Cloth','Rubber','Cardboard','Copper','Aluminium','Steel']
const AREAS = ['All',
  // Bengaluru
  'Koramangala','Indiranagar','HSR Layout','Whitefield','Jayanagar','Malleshwaram','BTM Layout','Electronic City','Rajajinagar','Hebbal','Yelahanka','Banashankari','JP Nagar','Marathahalli','Bellandur','Sarjapur','Bommanahalli','Basavanagudi','Shivajinagar','Yeshwanthpur',
  // Mysuru
  'Mysuru City','Vijayanagar Mysuru','Kuvempunagar','Hebbal Mysuru','Nazarbad',
  // Mangaluru
  'Mangaluru City','Kadri','Bejai','Kankanady','Urwa',
  // Hubballi-Dharwad
  'Hubballi','Dharwad','Vidyanagar Hubballi','Keshwapur',
  // Belagavi
  'Belagavi City','Tilakwadi','Shahapur Belagavi',
  // Kalaburagi
  'Kalaburagi City','Aland Road',
  // Ballari
  'Ballari City','Toranagallu',
  // Shivamogga
  'Shivamogga City','Sagar',
  // Davanagere
  'Davanagere City','Harihara',
  // Tumakuru
  'Tumakuru City','Tiptur',
  // Hassan
  'Hassan City','Arsikere',
  // Udupi
  'Udupi City','Manipal','Kundapur',
  // Vijayapura
  'Vijayapura City','Bidar City',
  // Raichur
  'Raichur City','Sindhanur',
  // Chitradurga
  'Chitradurga City','Challakere',
  // Chikkamagaluru
  'Chikkamagaluru City','Kadur',
  // Kodagu
  'Madikeri','Kushalnagar',
  // Mandya
  'Mandya City','Maddur',
  // Chamarajanagar
  'Chamarajanagar City','Kollegal',
  // Ramanagara
  'Ramanagara City','Channapatna',
  // Kolar
  'Kolar City','KGF',
  // Chikkaballapur
  'Chikkaballapur City','Gauribidanur',
  // Bagalkot
  'Bagalkot City','Badami',
  // Gadag
  'Gadag City','Ron',
  // Haveri
  'Haveri City','Ranebennur',
  // Uttara Kannada
  'Karwar','Sirsi','Kumta',
  // Koppal
  'Koppal City','Gangavathi',
  // Yadgir
  'Yadgir City','Shorapur',
  // Vijayanagara
  'Hosapete','Kampli',
]
const MAT_COLORS = { Paper:'#f59e0b', Plastic:'#3b82f6', Metal:'#6366f1', Glass:'#10b981', 'E-Waste':'#ef4444', Cloth:'#8b5cf6', Rubber:'#64748b', Cardboard:'#f59e0b', Copper:'#f97316', Aluminium:'#6366f1', Steel:'#475569' }
const MAT_IMGS = {
  Paper:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80',
  Plastic:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80',
  Metal:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Glass:'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80',
  'E-Waste':'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=80',
  Cloth:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',
  Cardboard:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Copper:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Aluminium:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Steel:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
}

// Demo listings shown when Supabase not configured
const DEMO_LISTINGS = [
  { id:'d1', seller_name:'Ravi Kumar', title:'Old Newspapers Bundle', material_type:'Paper', quantity_kg:25, price_per_kg:13, total_price:325, negotiable:true, condition:'good', description:'Clean dry newspapers collected over 3 months. Ready for pickup.', location_area:'Koramangala', location_city:'Bengaluru', contact_phone:'9880123456', contact_whatsapp:'9880123456', image_url:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', views:34, created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id:'d2', seller_name:'Priya S', title:'PET Bottles — Crushed', material_type:'Plastic', quantity_kg:15, price_per_kg:8, total_price:120, negotiable:true, condition:'good', description:'Crushed PET bottles, caps removed. Collected from apartment complex.', location_area:'HSR Layout', location_city:'Bengaluru', contact_phone:'9900112233', contact_whatsapp:'9900112233', image_url:'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80', views:21, created_at: new Date(Date.now()-1*86400000).toISOString() },
  { id:'d3', seller_name:'Mohammed A', title:'Aluminium Cans — 8kg', material_type:'Aluminium', quantity_kg:8, price_per_kg:90, total_price:720, negotiable:false, condition:'good', description:'Clean aluminium beverage cans. Crushed and ready.', location_area:'Indiranagar', location_city:'Bengaluru', contact_phone:'9845001122', contact_whatsapp:'9845001122', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', views:56, created_at: new Date(Date.now()-3*86400000).toISOString() },
  { id:'d4', seller_name:'Sunita R', title:'Old Clothes & Fabric', material_type:'Cloth', quantity_kg:12, price_per_kg:10, total_price:120, negotiable:true, condition:'fair', description:'Mixed cotton and synthetic clothes. Washed and sorted.', location_area:'Jayanagar', location_city:'Bengaluru', contact_phone:'9741234567', contact_whatsapp:'9741234567', image_url:'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80', views:18, created_at: new Date(Date.now()-4*86400000).toISOString() },
  { id:'d5', seller_name:'Kiran B', title:'Copper Wire Scrap', material_type:'Copper', quantity_kg:3, price_per_kg:420, total_price:1260, negotiable:true, condition:'good', description:'Stripped copper wire from old electrical work. High purity.', location_area:'Whitefield', location_city:'Bengaluru', contact_phone:'9632145678', contact_whatsapp:'9632145678', image_url:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', views:89, created_at: new Date(Date.now()-5*86400000).toISOString() },
  { id:'d6', seller_name:'Ananya M', title:'Cardboard Boxes — Flat', material_type:'Cardboard', quantity_kg:30, price_per_kg:9, total_price:270, negotiable:true, condition:'good', description:'Flattened cardboard from online deliveries. Dry and clean.', location_area:'BTM Layout', location_city:'Bengaluru', contact_phone:'9876543210', contact_whatsapp:'9876543210', image_url:'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80', views:42, created_at: new Date(Date.now()-6*86400000).toISOString() },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff/3600000), d = Math.floor(diff/86400000)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return 'Just now'
}

function ListingCard({ listing, lang, onContact, onView }) {
  const color = MAT_COLORS[listing.material_type] || '#10b981'
  const img = listing.image_url || MAT_IMGS[listing.material_type] || MAT_IMGS.Paper
  return (
    <div className="mp-card" onClick={() => onView(listing)}>
      <div className="mp-card-img-wrap">
        <img src={img} alt={listing.title} className="mp-card-img" loading="lazy"/>
        <div className="mp-card-img-overlay"/>
        <div className="mp-mat-badge" style={{background:color}}>{listing.material_type}</div>
        {listing.negotiable && <div className="mp-neg-badge">{lang==='kn'?'ಮಾತುಕತೆ':'Negotiable'}</div>}
        <div className="mp-views">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {listing.views || 0}
        </div>
      </div>
      <div className="mp-card-body">
        <h3 className="mp-card-title">{listing.title}</h3>
        <div className="mp-card-price">
          <span className="mp-price-big">₹{listing.total_price}</span>
          {listing.quantity_kg && <span className="mp-price-sub">({listing.quantity_kg}kg @ ₹{listing.price_per_kg}/kg)</span>}
        </div>
        <div className="mp-card-meta">
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {listing.location_area}, {listing.location_city}
          </span>
          <span>{timeAgo(listing.created_at)}</span>
        </div>
        <div className="mp-card-seller">
          <div className="mp-seller-avatar">{(listing.seller_name||'U')[0].toUpperCase()}</div>
          <span>{listing.seller_name || 'Anonymous'}</span>
        </div>
        <button className="mp-contact-btn" style={{background:color}} onClick={e=>{e.stopPropagation();onContact(listing)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          {lang==='kn'?'ಸಂಪರ್ಕಿಸಿ':'Contact Seller'}
        </button>
      </div>
    </div>
  )
}

export default function Marketplace({ session }) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [view, setView] = useState('browse') // browse, sell, detail, contact
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [matFilter, setMatFilter] = useState('All')
  const [areaFilter, setAreaFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [msg, setMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef()

  // Sell form
  const [form, setForm] = useState({ title:'', material_type:'Paper', quantity_kg:'', price_per_kg:'', negotiable:true, condition:'good', description:'', location_area:'Koramangala', contact_phone:'', contact_whatsapp:'', image_url:'' })

  const userId = session?.user?.id
  const userName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Seller'

  useEffect(() => { loadListings() }, [])

  async function loadListings() {
    setLoading(true)
    if (!supabaseConfigured) { setListings(DEMO_LISTINGS); setLoading(false); return }
    try {
      const { data } = await supabase.from('marketplace_listings').select('*').eq('status','active').order('created_at',{ascending:false}).limit(100)
      setListings(data?.length ? data : DEMO_LISTINGS)
    } catch { setListings(DEMO_LISTINGS) }
    setLoading(false)
  }

  async function submitListing() {
    if (!form.title || !form.contact_phone) return setMsg('Fill in title and contact number')
    setSubmitting(true); setMsg('')
    try {
      const total = form.quantity_kg && form.price_per_kg ? parseFloat(form.quantity_kg) * parseFloat(form.price_per_kg) : null
      const { error } = await supabase.from('marketplace_listings').insert({
        user_id: userId, seller_name: userName,
        title: form.title, material_type: form.material_type,
        quantity_kg: form.quantity_kg ? parseFloat(form.quantity_kg) : null,
        price_per_kg: form.price_per_kg ? parseFloat(form.price_per_kg) : null,
        total_price: total, negotiable: form.negotiable,
        condition: form.condition, description: form.description,
        location_area: form.location_area, location_city: 'Bengaluru',
        contact_phone: form.contact_phone, contact_whatsapp: form.contact_whatsapp || form.contact_phone,
        image_url: form.image_url || MAT_IMGS[form.material_type] || ''
      })
      if (error) throw error
      setMsg('Listed successfully!')
      await loadListings()
      setView('browse')
      setForm({ title:'', material_type:'Paper', quantity_kg:'', price_per_kg:'', negotiable:true, condition:'good', description:'', location_area:'Koramangala', contact_phone:'', contact_whatsapp:'', image_url:'' })
    } catch(e) { setMsg(e.message) }
    setSubmitting(false)
  }

  async function viewListing(listing) {
    setSelectedListing(listing)
    setView('detail')
    if (supabaseConfigured && listing.id && !listing.id.startsWith('d')) {
      await supabase.from('marketplace_listings').update({ views: (listing.views||0)+1 }).eq('id', listing.id)
    }
  }

  function contactSeller(listing) { setSelectedListing(listing); setView('contact') }

  const filtered = listings.filter(l => {
    const mOk = matFilter === 'All' || l.material_type === matFilter
    const aOk = areaFilter === 'All' || l.location_area === areaFilter
    return mOk && aOk
  }).sort((a,b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'price_low') return (a.total_price||0) - (b.total_price||0)
    if (sortBy === 'price_high') return (b.total_price||0) - (a.total_price||0)
    return 0
  })

  return (
    <div className="mp-root">
      <div className="mp-topbar">
        <button className="scan-back" onClick={() => view==='browse' ? navigate('/') : setView('browse')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {lang==='kn'?'ಹಿಂದೆ':'Back'}
        </button>
        <div className="mp-topbar-brand"><RecycleLogo size={22}/><span>{lang==='kn'?'ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರುಕಟ್ಟೆ':'Scrap Marketplace'}</span></div>
        {view==='browse' && userId && (
          <button className="mp-sell-btn" onClick={()=>setView('sell')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {lang==='kn'?'ಮಾರಿ':'Sell'}
          </button>
        )}
        {view!=='browse' && <div style={{width:80}}/>}
      </div>

      {/* BROWSE */}
      {view==='browse' && (
        <div className="mp-browse">
          <div className="mp-hero">
            <div className="mp-hero-content">
              <h1>{lang==='kn'?'ನಿಮ್ಮ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರಿ, ಹಣ ಗಳಿಸಿ':'Sell Your Scrap, Earn Money'}</h1>
              <p>{lang==='kn'?'ಬೆಂಗಳೂರಿನ ಅತ್ಯಂತ ದೊಡ್ಡ ಸ್ಕ್ರ್ಯಾಪ್ ಮಾರುಕಟ್ಟೆ — ನೇರ ಖರೀದಿದಾರರಿಗೆ ಮಾರಿ':'Bengaluru\'s scrap marketplace — sell directly to buyers and kabadiwalas'}</p>
              <div className="mp-hero-stats">
                <div><strong>{listings.length}</strong><small>{lang==='kn'?'ಪಟ್ಟಿಗಳು':'Listings'}</small></div>
                <div><strong>{new Set(listings.map(l=>l.location_area)).size}</strong><small>{lang==='kn'?'ಪ್ರದೇಶಗಳು':'Areas'}</small></div>
                <div><strong>₹{listings.reduce((a,l)=>a+(l.total_price||0),0).toLocaleString()}</strong><small>{lang==='kn'?'ಒಟ್ಟು ಮೌಲ್ಯ':'Total Value'}</small></div>
              </div>
            </div>
          </div>

          {msg && <div className="mp-msg success" style={{margin:'0 20px'}}>{msg}</div>}

          <div className="mp-filters-bar">
            <select value={matFilter} onChange={e=>setMatFilter(e.target.value)} className="mp-select">
              {MATERIALS.map(m=><option key={m} value={m}>{m==='All'?(lang==='kn'?'ಎಲ್ಲಾ ವಸ್ತುಗಳು':'All Materials'):m}</option>)}
            </select>
            <select value={areaFilter} onChange={e=>setAreaFilter(e.target.value)} className="mp-select">
              {AREAS.map(a=><option key={a} value={a}>{a==='All'?(lang==='kn'?'ಎಲ್ಲಾ ಪ್ರದೇಶಗಳು':'All Areas'):a}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} className="mp-select">
              <option value="newest">{lang==='kn'?'ಹೊಸದು ಮೊದಲು':'Newest First'}</option>
              <option value="price_low">{lang==='kn'?'ಕಡಿಮೆ ಬೆಲೆ':'Price: Low to High'}</option>
              <option value="price_high">{lang==='kn'?'ಹೆಚ್ಚು ಬೆಲೆ':'Price: High to Low'}</option>
            </select>
            <span className="mp-count">{filtered.length} {lang==='kn'?'ಫಲಿತಾಂಶಗಳು':'results'}</span>
          </div>

          {loading ? (
            <div className="mp-loading"><div className="spinner"><div/><div/><div/></div><p>Loading listings...</p></div>
          ) : filtered.length === 0 ? (
            <div className="mp-empty"><h3>No listings found</h3><p>Try changing your filters</p></div>
          ) : (
            <div className="mp-grid">
              {filtered.map(l=><ListingCard key={l.id} listing={l} lang={lang} onContact={contactSeller} onView={viewListing}/>)}
            </div>
          )}
        </div>
      )}

      {/* SELL FORM */}
      {view==='sell' && (
        <div className="mp-form-container">
          <h2>{lang==='kn'?'ಹೊಸ ಪಟ್ಟಿ ಸೇರಿಸಿ':'Create New Listing'}</h2>
          {msg && <div className={`mp-msg ${msg.includes('success')?'success':'error'}`}>{msg}</div>}
          <div className="mp-form">
            <div className="mp-field"><label>{lang==='kn'?'ಶೀರ್ಷಿಕೆ':'Title'} *</label><input placeholder={lang==='kn'?'ಉದಾ: ಹಳೆ ಪೇಪರ್ ಬಂಡಲ್':'e.g. Old newspaper bundle'} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
            <div className="mp-field-row">
              <div className="mp-field"><label>{lang==='kn'?'ವಸ್ತು ವಿಧ':'Material'}</label>
                <select value={form.material_type} onChange={e=>setForm({...form,material_type:e.target.value})} className="mp-select-full">
                  {MATERIALS.filter(m=>m!=='All').map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="mp-field"><label>{lang==='kn'?'ಸ್ಥಿತಿ':'Condition'}</label>
                <select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})} className="mp-select-full">
                  <option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option>
                </select>
              </div>
            </div>
            <div className="mp-field-row">
              <div className="mp-field"><label>{lang==='kn'?'ತೂಕ (kg)':'Weight (kg)'}</label><input type="number" placeholder="e.g. 25" value={form.quantity_kg} onChange={e=>setForm({...form,quantity_kg:e.target.value})}/></div>
              <div className="mp-field"><label>{lang==='kn'?'ಬೆಲೆ (₹/kg)':'Price (₹/kg)'}</label><input type="number" placeholder="e.g. 12" value={form.price_per_kg} onChange={e=>setForm({...form,price_per_kg:e.target.value})}/></div>
            </div>
            {form.quantity_kg && form.price_per_kg && <div className="mp-total-preview">Total: ₹{(parseFloat(form.quantity_kg||0)*parseFloat(form.price_per_kg||0)).toFixed(0)}</div>}
            <div className="mp-field"><label>{lang==='kn'?'ವಿವರಣೆ':'Description'}</label><textarea placeholder={lang==='kn'?'ವಸ್ತುವಿನ ಬಗ್ಗೆ ಹೇಳಿ...':'Describe your scrap...'} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3}/></div>
            <div className="mp-field"><label>{lang==='kn'?'ಪ್ರದೇಶ':'Area'}</label>
              <select value={form.location_area} onChange={e=>setForm({...form,location_area:e.target.value})} className="mp-select-full">
                {AREAS.filter(a=>a!=='All').map(a=><option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="mp-field-row">
              <div className="mp-field"><label>{lang==='kn'?'ಫೋನ್ ನಂಬರ್':'Phone'} *</label><input type="tel" placeholder="9XXXXXXXXX" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}/></div>
              <div className="mp-field"><label>WhatsApp</label><input type="tel" placeholder="9XXXXXXXXX" value={form.contact_whatsapp} onChange={e=>setForm({...form,contact_whatsapp:e.target.value})}/></div>
            </div>
            <label className="mp-negotiable-check">
              <input type="checkbox" checked={form.negotiable} onChange={e=>setForm({...form,negotiable:e.target.checked})}/>
              <span>{lang==='kn'?'ಬೆಲೆ ಮಾತುಕತೆ ಸಾಧ್ಯ':'Price is negotiable'}</span>
            </label>
            <button className="mp-submit-btn" onClick={submitListing} disabled={submitting}>
              {submitting?'Posting...':(lang==='kn'?'ಪಟ್ಟಿ ಪ್ರಕಟಿಸಿ':'Post Listing')}
            </button>
          </div>
        </div>
      )}

      {/* DETAIL */}
      {view==='detail' && selectedListing && (
        <div className="mp-detail-container">
          <div className="mp-detail-img-wrap">
            <img src={selectedListing.image_url || MAT_IMGS[selectedListing.material_type] || MAT_IMGS.Paper} alt={selectedListing.title} className="mp-detail-img"/>
            <div className="mp-detail-mat-badge" style={{background:MAT_COLORS[selectedListing.material_type]||'#10b981'}}>{selectedListing.material_type}</div>
          </div>
          <div className="mp-detail-body">
            <div className="mp-detail-top">
              <div>
                <h2>{selectedListing.title}</h2>
                <div className="mp-detail-price">₹{selectedListing.total_price} {selectedListing.negotiable && <span className="mp-neg-tag">{lang==='kn'?'ಮಾತುಕತೆ':'Negotiable'}</span>}</div>
                {selectedListing.quantity_kg && <p className="mp-detail-qty">{selectedListing.quantity_kg}kg @ ₹{selectedListing.price_per_kg}/kg</p>}
              </div>
            </div>
            <div className="mp-detail-info-grid">
              <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span>{selectedListing.location_area}, {selectedListing.location_city}</span></div>
              <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>{timeAgo(selectedListing.created_at)}</span></div>
              <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg><span>{selectedListing.views||0} views</span></div>
              <div className="mp-dinfo"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>{selectedListing.condition} condition</span></div>
            </div>
            {selectedListing.description && <p className="mp-detail-desc">{selectedListing.description}</p>}
            <div className="mp-detail-seller">
              <div className="mp-seller-avatar-lg">{(selectedListing.seller_name||'U')[0].toUpperCase()}</div>
              <div><strong>{selectedListing.seller_name||'Anonymous'}</strong><p>Seller</p></div>
            </div>
            <button className="mp-contact-btn-lg" style={{background:MAT_COLORS[selectedListing.material_type]||'#10b981'}} onClick={()=>contactSeller(selectedListing)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {lang==='kn'?'ಮಾರಾಟಗಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ':'Contact Seller'}
            </button>
          </div>
        </div>
      )}

      {/* CONTACT */}
      {view==='contact' && selectedListing && (
        <div className="mp-form-container">
          <h2>{lang==='kn'?'ಮಾರಾಟಗಾರರ ಸಂಪರ್ಕ':'Seller Contact'}</h2>
          <div className="mp-contact-card">
            <div className="mp-contact-listing-preview">
              <img src={selectedListing.image_url||MAT_IMGS[selectedListing.material_type]||MAT_IMGS.Paper} alt="" className="mp-contact-thumb"/>
              <div><h4>{selectedListing.title}</h4><p>₹{selectedListing.total_price} · {selectedListing.location_area}</p></div>
            </div>
            <div className="mp-contact-seller-info">
              <div className="mp-seller-avatar-lg">{(selectedListing.seller_name||'U')[0].toUpperCase()}</div>
              <div><strong>{selectedListing.seller_name||'Anonymous'}</strong><p>{selectedListing.location_area}, Bengaluru</p></div>
            </div>
            <div className="mp-contact-methods">
              <a href={`tel:${selectedListing.contact_phone}`} className="mp-contact-method phone">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <div><strong>{lang==='kn'?'ಕರೆ ಮಾಡಿ':'Call Now'}</strong><span>{selectedListing.contact_phone}</span></div>
              </a>
              {selectedListing.contact_whatsapp && (
                <a href={`https://wa.me/91${selectedListing.contact_whatsapp}?text=Hi, I'm interested in your listing: ${selectedListing.title} on SmartWaste`} target="_blank" rel="noopener noreferrer" className="mp-contact-method whatsapp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <div><strong>WhatsApp</strong><span>{selectedListing.contact_whatsapp}</span></div>
                </a>
              )}
            </div>
            <div className="mp-contact-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {lang==='kn'?'ಭೇಟಿ ಮಾಡುವ ಮೊದಲು ಬೆಲೆ ಮತ್ತು ಸ್ಥಳ ದೃಢಪಡಿಸಿ':'Confirm price and location before meeting. Stay safe.'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
