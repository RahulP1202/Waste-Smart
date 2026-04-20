import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './History.css'

const BIN_COLORS = { wet: '#10b981', dry: '#3b82f6', hazardous: '#ef4444' }
const TABS = ['all', 'daily', 'weekly', 'monthly']

function formatDay(dateStr, lang) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const days = lang === 'kn'
    ? ['ಭಾನುವಾರ','ಸೋಮವಾರ','ಮಂಗಳವಾರ','ಬುಧವಾರ','ಗುರುವಾರ','ಶುಕ್ರವಾರ','ಶನಿವಾರ']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const months = lang === 'kn'
    ? ['ಜನ','ಫೆಬ್','ಮಾರ್','ಏಪ್ರಿ','ಮೇ','ಜೂನ್','ಜುಲೈ','ಆಗ','ಸೆಪ್','ಅಕ್ಟೋ','ನವೆ','ಡಿಸೆ']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dateLabel = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  if (d.toDateString() === today.toDateString()) return lang === 'kn' ? `ಇಂದು — ${dateLabel}` : `Today — ${dateLabel}`
  if (d.toDateString() === yesterday.toDateString()) return lang === 'kn' ? `ನಿನ್ನೆ — ${dateLabel}` : `Yesterday — ${dateLabel}`
  return dateLabel
}

function getWeekLabel(dateStr, lang) {
  const d = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24))
  if (diffDays < 7) return lang === 'kn' ? 'ಈ ವಾರ' : 'This Week'
  if (diffDays < 14) return lang === 'kn' ? 'ಕಳೆದ ವಾರ' : 'Last Week'
  const months = lang === 'kn'
    ? ['ಜನ','ಫೆಬ್','ಮಾರ್','ಏಪ್ರಿ','ಮೇ','ಜೂನ್','ಜುಲೈ','ಆಗ','ಸೆಪ್','ಅಕ್ಟೋ','ನವೆ','ಡಿಸೆ']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const weekStart = new Date(d.setDate(diff))
  return lang === 'kn'
    ? `${weekStart.getDate()} ${months[weekStart.getMonth()]} ವಾರ`
    : `Week of ${weekStart.getDate()} ${months[weekStart.getMonth()]}`
}

function getMonthLabel(dateStr, lang) {
  const d = new Date(dateStr)
  const months = lang === 'kn'
    ? ['ಜನವರಿ','ಫೆಬ್ರವರಿ','ಮಾರ್ಚ್','ಏಪ್ರಿಲ್','ಮೇ','ಜೂನ್','ಜುಲೈ','ಆಗಸ್ಟ್','ಸೆಪ್ಟೆಂಬರ್','ಅಕ್ಟೋಬರ್','ನವೆಂಬರ್','ಡಿಸೆಂಬರ್']
    : ['January','February','March','April','May','June','July','August','September','October','November','December']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

function groupBy(scans, tab, lang) {
  const groups = {}
  scans.forEach(s => {
    let key
    if (tab === 'daily') key = new Date(s.scanned_at).toDateString()
    else if (tab === 'weekly') key = getWeekLabel(s.scanned_at, lang)
    else if (tab === 'monthly') key = getMonthLabel(s.scanned_at, lang)
    else key = new Date(s.scanned_at).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  })
  return groups
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="hist-stat">
      <div className="hist-stat-val" style={{ color }}>{value}</div>
      <div className="hist-stat-lbl">{label}</div>
      {sub && <div className="hist-stat-sub">{sub}</div>}
    </div>
  )
}

function ScanItem({ scan, lang }) {
  const [expanded, setExpanded] = useState(false)
  const binColor = BIN_COLORS[scan.bin] || '#64748b'
  const time = new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const score = scan.sustainability_score || 0
  const scoreColor = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const item = scan.full_result || {}
  const kn = lang === 'kn'

  const binLabel = kn
    ? { wet: 'ಹಸಿ ತ್ಯಾಜ್ಯ', dry: 'ಒಣ ತ್ಯಾಜ್ಯ', hazardous: 'ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ' }[scan.bin] || scan.bin
    : (scan.bin?.charAt(0).toUpperCase() + scan.bin?.slice(1) + ' Waste')

  return (
    <div className="scan-item">
      <button className="scan-item-header" onClick={() => setExpanded(e => !e)}>
        <div className="scan-item-left">
          <div className="scan-bin-dot" style={{ background: binColor }}/>
          <div>
            <span className="scan-item-name">{scan.waste_subtype}</span>
            <span className="scan-item-type">{scan.waste_type}</span>
          </div>
        </div>
        <div className="scan-item-right">
          <span className="scan-item-time">{time}</span>
          <span className="scan-item-score" style={{ color: scoreColor }}>{score}</span>
          <svg className={`scan-chevron ${expanded ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="scan-item-body">
          <div className="scan-detail-grid">
            <div className="scan-detail">
              <span>{kn ? 'ಬಿನ್' : 'Bin'}</span>
              <strong style={{ color: binColor }}>{binLabel}</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಮರುಬಳಕೆ' : 'Recyclability'}</span>
              <strong>{scan.recyclability ?? 0}/5</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಕಾಂಪೋಸ್ಟ್' : 'Compostable'}</span>
              <strong>{scan.compostable ? (kn ? 'ಹೌದು' : 'Yes') : (kn ? 'ಇಲ್ಲ' : 'No')}</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಮರುಬಳಕೆ' : 'Reuse'}</span>
              <strong>{scan.reuse_potential ?? 0}/5</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಕಾರ್ಬನ್' : 'Carbon'}</span>
              <strong>{scan.carbon_footprint_kg} kg CO₂</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಉಳಿತಾಯ' : 'Saved'}</span>
              <strong style={{ color: '#10b981' }}>{scan.carbon_saved_if_recycled_kg} kg</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಕೊಳೆಯುವಿಕೆ' : 'Decomposes'}</span>
              <strong>{scan.decomposition_time || '—'}</strong>
            </div>
            <div className="scan-detail">
              <span>{kn ? 'ಮಾರಾಟ' : 'Sellable'}</span>
              <strong>{scan.can_sell ? `${kn ? 'ಹೌದು' : 'Yes'} — ${scan.sell_price}` : (kn ? 'ಇಲ್ಲ' : 'No')}</strong>
            </div>
          </div>

          {item.description && (
            <p className="scan-item-desc">{item.description[lang] || item.description.en}</p>
          )}

          {item.disposal_steps && (
            <div className="scan-item-steps">
              <span>{kn ? 'ವಿಲೇವಾರಿ:' : 'Disposal:'}</span>
              <ol>{(item.disposal_steps[lang] || item.disposal_steps.en || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
            </div>
          )}

          {item.diy_ideas && (
            <div className="scan-item-diy">
              <span>{kn ? 'DIY ಆಲೋಚನೆಗಳು:' : 'DIY Ideas:'}</span>
              <ul>{(item.diy_ideas[lang] || item.diy_ideas.en || []).map((d, i) => <li key={i}>{d}</li>)}</ul>
            </div>
          )}

          {scan.demo_mode && <div className="scan-demo-tag">{kn ? 'ಡೆಮೊ ಸ್ಕ್ಯಾನ್' : 'Demo scan'}</div>}
        </div>
      )}
    </div>
  )
}

export default function History({ session }) {
  const navigate = useNavigate()
  const { t, lang } = useApp()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('daily')
  const [filter, setFilter] = useState('all') // all, wet, dry, hazardous

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    setLoading(true)
    if (!supabaseConfigured || !supabase) {
      setScans([])
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(200)
      if (error) {
        console.error('History load error:', JSON.stringify(error))
        // Table might not exist yet
        setScans([])
      } else {
        setScans(data || [])
      }
    } catch (e) {
      console.error('History load exception:', e)
      setScans([])
    }
    setLoading(false)
  }

  async function deleteScan(id) {
    if (!supabase) return
    await supabase.from('scan_history').delete().eq('id', id)
    setScans(prev => prev.filter(s => s.id !== id))
  }

  const filtered = filter === 'all' ? scans : scans.filter(s => s.bin === filter)
  const groups = groupBy(filtered, tab, lang)
  const kn = lang === 'kn'

  // Stats
  const totalScans = scans.length
  const totalCarbon = scans.reduce((a, s) => a + (s.carbon_footprint_kg || 0), 0).toFixed(2)
  const totalSaved = scans.reduce((a, s) => a + (s.carbon_saved_if_recycled_kg || 0), 0).toFixed(2)
  const totalPoints = scans.reduce((a, s) => a + (s.points_earned || 0), 0)
  const avgScore = totalScans > 0 ? Math.round(scans.reduce((a, s) => a + (s.sustainability_score || 0), 0) / totalScans) : 0

  // Bin breakdown
  const wetCount = scans.filter(s => s.bin === 'wet').length
  const dryCount = scans.filter(s => s.bin === 'dry').length
  const hazCount = scans.filter(s => s.bin === 'hazardous').length

  // Most scanned
  const typeCounts = {}
  scans.forEach(s => { typeCounts[s.waste_type] = (typeCounts[s.waste_type] || 0) + 1 })
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

  // Impact calculations
  const treesEquivalent = (parseFloat(totalSaved) / 21).toFixed(2)
  const carKmEquivalent = (parseFloat(totalSaved) * 4.6).toFixed(1)
  const thisMonthScans = scans.filter(s => {
    const d = new Date(s.scanned_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const thisMonthSaved = thisMonthScans.reduce((a, s) => a + (s.carbon_saved_if_recycled_kg || 0), 0).toFixed(2)
  const thisMonthScansCount = thisMonthScans.length
  const streak = (() => {
    if (!scans.length) return 0
    let s = 1, prev = new Date(scans[0].scanned_at).toDateString()
    for (let i = 1; i < scans.length; i++) {
      const cur = new Date(scans[i].scanned_at).toDateString()
      if (cur !== prev) { s++; prev = cur }
      else break
    }
    return s
  })()

  return (
    <div className="hist-root">
      {/* Topbar */}
      <div className="hist-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {kn ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="hist-topbar-brand"><RecycleLogo size={22}/><span>{kn ? 'ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ' : 'Scan History'}</span></div>
        <button className="hist-refresh" onClick={loadHistory}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>

      <div className="hist-container">
        {!supabaseConfigured ? (
          <div className="hist-no-auth">
            <RecycleLogo size={48}/>
            <h3>{kn ? 'ಇತಿಹಾಸ ನೋಡಲು ಲಾಗಿನ್ ಮಾಡಿ' : 'Sign in to view history'}</h3>
            <p>{kn ? 'ನೀವು ಲಾಗಿನ್ ಆದಾಗ ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್ ಇತಿಹಾಸ ಉಳಿಸಲಾಗುತ್ತದೆ.' : "Your scan history is saved when you're logged in with Supabase."}</p>
            <button onClick={() => navigate('/login')}>{kn ? 'ಲಾಗಿನ್' : 'Sign In'}</button>
          </div>
        ) : loading ? (
          <div className="hist-loading">
            <div className="spinner"><div/><div/><div/></div>
            <p>{kn ? 'ನಿಮ್ಮ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...' : 'Loading your history...'}</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="hist-empty">
            <RecycleLogo size={56}/>
            <h3>{kn ? 'ಇನ್ನೂ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ' : 'No scans yet'}</h3>
            <p>{kn ? 'ತ್ಯಾಜ್ಯ ವಸ್ತುಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನಿಮ್ಮ ಇತಿಹಾಸ ನಿರ್ಮಿಸಿ.' : 'Start scanning waste items to build your history.'}</p>
            <button onClick={() => navigate('/scan')}>{kn ? 'ಈಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Now'}</button>
          </div>
        ) : (
          <>
            {/* Overview stats */}
            <div className="hist-stats-grid">
              <StatCard label={kn ? 'ಒಟ್ಟು ಸ್ಕ್ಯಾನ್' : 'Total Scans'} value={totalScans} color="#10b981"/>
              <StatCard label={kn ? 'ಸರಾಸರಿ ಅಂಕ' : 'Avg Score'} value={avgScore} color={avgScore >= 70 ? '#10b981' : avgScore >= 40 ? '#f59e0b' : '#ef4444'} sub="/100"/>
              <StatCard label={kn ? 'CO₂ ಉತ್ಪಾದನೆ' : 'CO₂ Generated'} value={`${totalCarbon}kg`} color="#f59e0b"/>
              <StatCard label={kn ? 'CO₂ ಉಳಿತಾಯ' : 'CO₂ Saved'} value={`${totalSaved}kg`} color="#10b981"/>
              <StatCard label={kn ? 'ಅಂಕಗಳು' : 'Points Earned'} value={totalPoints} color="#6366f1"/>
              {topType && <StatCard label={kn ? 'ಹೆಚ್ಚು ಸ್ಕ್ಯಾನ್' : 'Most Scanned'} value={topType[0]} color="#8b5cf6" sub={`${topType[1]}x`}/>}
            </div>

            {/* Bin breakdown bar */}
            <div className="hist-bin-bar">
              <div className="hist-bin-bar-title">{kn ? 'ತ್ಯಾಜ್ಯ ವಿಭಜನೆ' : 'Waste Breakdown'}</div>
              <div className="hist-bin-track">
                {wetCount > 0 && <div className="hist-bin-seg" style={{ width: `${(wetCount/totalScans)*100}%`, background: '#10b981' }} title={`Wet: ${wetCount}`}/>}
                {dryCount > 0 && <div className="hist-bin-seg" style={{ width: `${(dryCount/totalScans)*100}%`, background: '#3b82f6' }} title={`Dry: ${dryCount}`}/>}
                {hazCount > 0 && <div className="hist-bin-seg" style={{ width: `${(hazCount/totalScans)*100}%`, background: '#ef4444' }} title={`Hazardous: ${hazCount}`}/>}
              </div>
              <div className="hist-bin-legend">
                <span><i style={{background:'#10b981'}}/> {kn ? 'ಹಸಿ' : 'Wet'} ({wetCount})</span>
                <span><i style={{background:'#3b82f6'}}/> {kn ? 'ಒಣ' : 'Dry'} ({dryCount})</span>
                <span><i style={{background:'#ef4444'}}/> {kn ? 'ಅಪಾಯಕಾರಿ' : 'Hazardous'} ({hazCount})</span>
              </div>
            </div>

            {/* Impact Dashboard */}
            <div className="impact-dashboard">
              <div className="impact-header">
                <div>
                  <h3>{kn ? 'ನಿಮ್ಮ ಪರಿಸರ ಪ್ರಭಾವ' : 'Your Environmental Impact'}</h3>
                  <p>{kn ? `ನಿಮ್ಮ ${totalScans} ಸ್ಕ್ಯಾನ್ ಆಧಾರದ ಮೇಲೆ — ನಿಜವಾದ ಡೇಟಾ` : `Based on your ${totalScans} scan${totalScans !== 1 ? 's' : ''} — real data, real difference`}</p>
                </div>
              </div>

              {/* Hero impact stat */}
              <div className="impact-hero-row">
                <div className="impact-hero-card" style={{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))'}}>
                  <div className="impact-hero-icon" style={{background:'rgba(16,185,129,0.15)'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8">
                      <path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="impact-hero-val" style={{color:'#10b981'}}>{totalSaved} kg</div>
                    <div className="impact-hero-lbl">{kn ? 'ಮರುಬಳಕೆಯಿಂದ CO₂ ಉಳಿತಾಯ' : 'CO₂ Saved by Recycling'}</div>
                    <div className="impact-hero-eq">= {treesEquivalent} {kn ? 'ಮರಗಳು ನೆಟ್ಟಂತೆ' : 'trees planted'}</div>
                  </div>
                </div>
                <div className="impact-hero-card" style={{background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(99,102,241,0.06))'}}>
                  <div className="impact-hero-icon" style={{background:'rgba(99,102,241,0.15)'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8">
                      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="impact-hero-val" style={{color:'#6366f1'}}>{carKmEquivalent} km</div>
                    <div className="impact-hero-lbl">{kn ? 'ಕಾರು ಪ್ರಯಾಣ ಸರಿದೂಗಿಸಿದೆ' : 'Car Travel Offset'}</div>
                    <div className="impact-hero-eq">{kn ? 'ಸಮಾನ CO₂ ಹೊರಸೂಸಲಿಲ್ಲ' : 'equivalent CO₂ not emitted'}</div>
                  </div>
                </div>
              </div>

              {/* This month */}
              <div className="impact-month-card">
                <div className="impact-month-header">
                  <span>{kn ? 'ಈ ತಿಂಗಳು' : 'This Month'}</span>
                  <span className="impact-month-badge">{new Date().toLocaleString(kn ? 'kn-IN' : 'default',{month:'long',year:'numeric'})}</span>
                </div>
                <div className="impact-month-stats">
                  <div className="impact-month-stat">
                    <strong style={{color:'#10b981'}}>{thisMonthScansCount}</strong>
                    <small>{kn ? 'ಸ್ಕ್ಯಾನ್' : 'Scans'}</small>
                  </div>
                  <div className="impact-month-stat">
                    <strong style={{color:'#f59e0b'}}>{thisMonthSaved} kg</strong>
                    <small>{kn ? 'CO₂ ಉಳಿತಾಯ' : 'CO₂ Saved'}</small>
                  </div>
                  <div className="impact-month-stat">
                    <strong style={{color:'#6366f1'}}>{streak}</strong>
                    <small>{kn ? 'ದಿನ ಸ್ಟ್ರೀಕ್' : 'Day Streak'}</small>
                  </div>
                  <div className="impact-month-stat">
                    <strong style={{color:'#8b5cf6'}}>{totalPoints}</strong>
                    <small>{kn ? 'ಅಂಕಗಳು' : 'Points'}</small>
                  </div>
                </div>
                {/* Progress bar toward monthly goal of 20 scans */}
                <div className="impact-goal">
                  <div className="impact-goal-label">
                    <span>{kn ? 'ಮಾಸಿಕ ಗುರಿ' : 'Monthly Goal'}</span>
                    <span>{thisMonthScansCount}/20 {kn ? 'ಸ್ಕ್ಯಾನ್' : 'scans'}</span>
                  </div>
                  <div className="impact-goal-track">
                    <div className="impact-goal-fill" style={{width:`${Math.min(100,(thisMonthScansCount/20)*100)}%`}}/>
                  </div>
                </div>
              </div>

              {/* Emotional message */}
              <div className="impact-message">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <p>
                  {parseFloat(totalSaved) >= 1
                    ? (kn
                        ? `ನೀವು ${totalSaved} kg CO₂ ಉಳಿಸಿದ್ದೀರಿ — ${treesEquivalent} ಮರಗಳನ್ನು ನೆಟ್ಟಂತೆ. ಪ್ರತಿ ಸ್ಕ್ಯಾನ್ ಕರ್ನಾಟಕದ ಪರಿಸರಕ್ಕೆ ನಿಜವಾದ ಕೊಡುಗೆ.`
                        : `You've saved ${totalSaved} kg of CO₂ — that's like planting ${treesEquivalent} trees. Every scan you make is a real action for Karnataka's environment.`)
                    : (kn
                        ? 'ತ್ಯಾಜ್ಯ ವಸ್ತುಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ನಿಮ್ಮ ಪರಿಸರ ಪ್ರಭಾವ ನೋಡಿ. ಪ್ರತಿ ಸ್ಕ್ಯಾನ್ ವ್ಯತ್ಯಾಸ ಮಾಡುತ್ತದೆ.'
                        : 'Start scanning waste items to see your environmental impact grow. Every item you scan and dispose correctly makes a real difference.')
                  }
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="hist-tabs">
              {[
                { key: 'all', en: 'All', kn: 'ಎಲ್ಲ' },
                { key: 'daily', en: 'Daily', kn: 'ದಿನ' },
                { key: 'weekly', en: 'Weekly', kn: 'ವಾರ' },
                { key: 'monthly', en: 'Monthly', kn: 'ತಿಂಗಳು' },
              ].map(tb => (
                <button key={tb.key} className={`hist-tab ${tab === tb.key ? 'active' : ''}`} onClick={() => setTab(tb.key)}>
                  {kn ? tb.kn : tb.en}
                </button>
              ))}
            </div>

            {/* Filter */}
            <div className="hist-filters">
              {[
                { key: 'all', en: 'All Types', kn: 'ಎಲ್ಲ ವಿಧ' },
                { key: 'wet', en: 'Wet Waste', kn: 'ಹಸಿ ತ್ಯಾಜ್ಯ' },
                { key: 'dry', en: 'Dry Waste', kn: 'ಒಣ ತ್ಯಾಜ್ಯ' },
                { key: 'hazardous', en: 'Hazardous Waste', kn: 'ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ' },
              ].map(f => (
                <button key={f.key} className={`hist-filter ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                  style={filter === f.key && f.key !== 'all' ? { borderColor: BIN_COLORS[f.key], color: BIN_COLORS[f.key] } : {}}>
                  {kn ? f.kn : f.en}
                </button>
              ))}
            </div>

            {/* Grouped scan list */}
            {Object.keys(groups).length === 0 ? (
              <div className="hist-empty-filter">{kn ? 'ಈ ಫಿಲ್ಟರ್‌ಗೆ ಯಾವುದೇ ಸ್ಕ್ಯಾನ್ ಇಲ್ಲ.' : 'No scans match this filter.'}</div>
            ) : (
              Object.entries(groups).map(([groupKey, groupScans]) => (
                <div key={groupKey} className="hist-group">
                  <div className="hist-group-header">
                    <span className="hist-group-label">
                      {tab === 'daily' ? formatDay(groupScans[0].scanned_at, lang) : groupKey}
                    </span>
                    <span className="hist-group-count">{groupScans.length} {kn ? 'ಸ್ಕ್ಯಾನ್' : `scan${groupScans.length !== 1 ? 's' : ''}`}</span>
                  </div>
                  <div className="hist-group-body">
                    {groupScans.map(scan => (
                      <ScanItem key={scan.id} scan={scan} lang={lang}/>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}
