import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './BarcodeScanner.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BIN_COLORS = { wet: '#10b981', dry: '#3b82f6', hazardous: '#ef4444' }

export default function BarcodeScanner() {
  const navigate = useNavigate()
  const { lang, t } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [camOpen, setCamOpen] = useState(false)
  const fileRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()

  const handleFile = useCallback((f) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError('')
    // Try browser BarcodeDetector API
    if ('BarcodeDetector' in window) {
      const img = new Image()
      img.onload = async () => {
        try {
          const detector = new window.BarcodeDetector()
          const codes = await detector.detect(img)
          if (codes.length > 0) setBarcode(codes[0].rawValue)
        } catch (e) { console.log('BarcodeDetector error:', e) }
      }
      img.src = URL.createObjectURL(f)
    }
  }, [])

  async function openCamera() {
    setCamOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch { alert('Camera access denied.'); setCamOpen(false) }
  }

  function capturePhoto() {
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob(blob => {
      handleFile(new File([blob], 'barcode.jpg', { type: 'image/jpeg' }))
      streamRef.current?.getTracks().forEach(t => t.stop())
      setCamOpen(false)
    }, 'image/jpeg', 0.95)
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCamOpen(false)
  }

  async function analyze() {
    if (!file && !barcode) return
    setLoading(true); setError('')
    try {
      let imageBase64 = null, imageMime = null
      if (file) {
        const buf = await file.arrayBuffer()
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
        imageMime = file.type
      }
      const res = await fetch(`${API_BASE}/api/barcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode, image_base64: imageBase64, image_mime: imageMime, language: lang })
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError('Analysis failed. Make sure the backend is running.')
    } finally { setLoading(false) }
  }

  function reset() { setFile(null); setPreview(null); setBarcode(''); setResult(null); setError('') }

  const binColor = result ? (BIN_COLORS[result.bin] || '#64748b') : '#10b981'

  return (
    <div className="bc-root">
      {camOpen && (
        <div className="camera-overlay">
          <video ref={videoRef} autoPlay playsInline className="camera-feed" />
          <canvas ref={canvasRef} hidden />
          <div className="bc-cam-guide">
            <div className="bc-cam-frame" />
            <p>{lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇರಿಸಿ' : 'Align barcode within the frame'}</p>
          </div>
          <div className="camera-controls">
            <button className="cam-btn capture-btn" onClick={capturePhoto}>
              {lang === 'kn' ? 'ಫೋಟೋ ತೆಗೆಯಿರಿ' : 'Capture'}
            </button>
            <button className="cam-btn close-btn" onClick={closeCamera}>
              {lang === 'kn' ? 'ಮುಚ್ಚಿ' : 'Close'}
            </button>
          </div>
        </div>
      )}

      <div className="bc-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {lang === 'kn' ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="bc-topbar-brand"><RecycleLogo size={22} /><span>{lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನರ್' : 'Barcode Scanner'}</span></div>
        <div style={{ width: 80 }} />
      </div>

      <div className="bc-container">
        {!result ? (
          <div className="bc-upload-panel">
            <div className="bc-hero">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
                <rect x="1" y="1" width="5" height="5" rx="1" /><rect x="1" y="9" width="5" height="5" rx="1" />
                <rect x="1" y="17" width="5" height="5" rx="1" /><rect x="9" y="1" width="2" height="22" />
                <rect x="13" y="1" width="1" height="22" /><rect x="16" y="1" width="3" height="22" />
                <rect x="21" y="1" width="2" height="22" />
              </svg>
              <h2>{lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಸ್ಕ್ಯಾನರ್' : 'Barcode Scanner'}</h2>
              <p>{lang === 'kn' ? 'ಉತ್ಪನ್ನದ ಫೋಟೋ ತೆಗೆಯಿರಿ ಅಥವಾ ಬಾರ್‌ಕೋಡ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ — ಅದು ಏನು ಮತ್ತು ಹೇಗೆ ವಿಲೇವಾರಿ ಮಾಡಬೇಕು ಎಂದು ತಿಳಿಯಿರಿ' : 'Take a photo of the product or enter the barcode number — find out what it is and how to dispose it properly'}</p>
              <div className="bc-tip-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {lang === 'kn' ? 'ಉತ್ತಮ ಫಲಿತಾಂಶಕ್ಕಾಗಿ ಉತ್ಪನ್ನದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ — AI ಲೇಬಲ್ ಓದಿ ನಿಖರ ಮಾಹಿತಿ ನೀಡುತ್ತದೆ' : 'For best results, upload a photo of the product — AI reads the label directly for accurate identification'}
              </div>
            </div>

            <div className="bc-input-methods">
              <button className="bc-method-btn" onClick={() => fileRef.current.click()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
                <span>{lang === 'kn' ? 'ಗ್ಯಾಲರಿಯಿಂದ ಅಪ್‌ಲೋಡ್' : 'Upload from Gallery'}</span>
                <small>{lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ' : 'Select barcode photo'}</small>
              </button>
              <button className="bc-method-btn" onClick={openCamera}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                </svg>
                <span>{lang === 'kn' ? 'ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ' : 'Open Camera'}</span>
                <small>{lang === 'kn' ? 'ನೇರವಾಗಿ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan directly'}</small>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />

            {preview && (
              <div className="bc-preview-wrap">
                <img src={preview} alt="barcode" className="bc-preview-img" />
                <button className="bc-remove" onClick={reset}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                {barcode && (
                  <div className="bc-detected">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಪತ್ತೆಯಾಯಿತು:' : 'Barcode detected:'} <strong>{barcode}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="bc-manual">
              <label>{lang === 'kn' ? 'ಅಥವಾ ಬಾರ್‌ಕೋಡ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ' : 'Or enter barcode number manually'}</label>
              <div className="bc-manual-row">
                <input type="text" placeholder={lang === 'kn' ? 'ಉದಾ: 8901030874544' : 'e.g. 8901030874544'}
                  value={barcode} onChange={e => setBarcode(e.target.value)}
                  className="bc-manual-input" />
              </div>
            </div>

            {error && <div className="bc-error">{error}</div>}

            <button className="bc-analyze-btn" disabled={(!file && !barcode) || loading} onClick={analyze}>
              {loading ? (
                <><span className="spin-ring" />{lang === 'kn' ? 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...' : 'Analyzing...'}</>
              ) : (
                lang === 'kn' ? 'ಉತ್ಪನ್ನ ವಿಶ್ಲೇಷಿಸಿ' : 'Analyze Product'
              )}
            </button>

            {loading && (
              <div className="loading-overlay">
                <div className="spinner"><div /><div /><div /></div>
                <p>{lang === 'kn' ? 'ಉತ್ಪನ್ನ ಗುರುತಿಸಲಾಗುತ್ತಿದೆ...' : 'Identifying product...'}</p>
                <span>{lang === 'kn' ? 'ಬಾರ್‌ಕೋಡ್ ಡೇಟಾ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ' : 'Checking barcode database'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bc-result">
            {result.demo_mode && (
              <div className="demo-badge">{lang === 'kn' ? 'ಡೆಮೊ ಮೋಡ್ — GROQ_API_KEY ಸೇರಿಸಿ' : 'Demo Mode — Add GROQ_API_KEY for real product lookup'}</div>
            )}

            {/* ── Hero label card ── */}
            <div className="bc-hero-card">
              <div className="bc-hero-banner" style={{ background: `${binColor}14` }}>
                {/* Ribbon */}
                <div className="bc-ribbon" style={{ background: binColor }}>
                  {result.bin_label?.[lang] || result.bin_label?.en}
                </div>

                {/* Product image */}
                <div className="bc-product-img-frame">
                  {preview
                    ? <img src={preview} alt="product" />
                    : <div className="bc-product-img-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={binColor} strokeWidth="1.5">
                          <rect x="1" y="1" width="5" height="5" rx="1"/><rect x="1" y="9" width="5" height="5" rx="1"/>
                          <rect x="1" y="17" width="5" height="5" rx="1"/><rect x="9" y="1" width="2" height="22"/>
                          <rect x="13" y="1" width="1" height="22"/><rect x="16" y="1" width="3" height="22"/>
                          <rect x="21" y="1" width="2" height="22"/>
                        </svg>
                      </div>
                  }
                </div>

                {/* Product info */}
                <div className="bc-hero-info">
                  <div className="bc-bin-pill" style={{ background: `${binColor}22`, color: binColor, border: `1px solid ${binColor}44` }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={binColor}><circle cx="12" cy="12" r="10"/></svg>
                    {result.bin_label?.[lang] || result.bin_label?.en}
                  </div>
                  <h2 className="bc-product-name">{result.product_name}</h2>
                  {result.brand && result.brand !== 'Unknown' && <p className="bc-brand">{result.brand}</p>}
                  {result.barcode && result.barcode !== 'N/A' && <p className="bc-barcode-num">#{result.barcode}</p>}
                </div>

                {/* Recyclable badge */}
                <div className="bc-recyclable-row">
                  <div className="bc-recyclable-badge" style={{
                    background: result.recyclable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                    color: result.recyclable ? '#10b981' : '#ef4444',
                    border: `1px solid ${result.recyclable ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.3)'}`
                  }}>
                    {result.recyclable
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> {lang === 'kn' ? 'ಮರುಬಳಕೆ ಯೋಗ್ಯ' : 'Recyclable'}</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> {lang === 'kn' ? 'ಮರುಬಳಕೆ ಅಲ್ಲ' : 'Not Recyclable'}</>
                    }
                  </div>
                  <div className="bc-recyclable-badge" style={{ background: 'var(--bg2)', color: 'var(--muted)', border: '1px solid var(--border2)' }}>
                    {result.waste_category}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Materials ── */}
            <div className="bc-section">
              <div className="bc-section-title">
                <svg className="bc-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                {lang === 'kn' ? 'ಪ್ಯಾಕೇಜಿಂಗ್ ವಸ್ತುಗಳು' : 'Packaging Materials'}
              </div>
              <div className="bc-materials">
                {(result.packaging_materials || []).map((m, i) => (
                  <span key={i} className="bc-material-tag">{m}</span>
                ))}
              </div>
            </div>

            {/* ── Stats bars ── */}
            <div className="bc-stats-bars">
              <div className="bc-section-title" style={{ marginBottom: 4 }}>
                <svg className="bc-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                {lang === 'kn' ? 'ಪರಿಸರ ಅಂಕಿಅಂಶಗಳು' : 'Environmental Stats'}
              </div>
              {[
                { label: lang === 'kn' ? 'CO₂ ಹೆಜ್ಜೆಗುರುತು' : 'Carbon Footprint', value: `${result.carbon_footprint_kg} kg`, pct: Math.min(100, (result.carbon_footprint_kg / 2) * 100), color: '#f59e0b' },
                { label: lang === 'kn' ? 'ಕೊಳೆಯಲು ಸಮಯ' : 'Decomposition Time', value: result.decomposition_time, pct: result.recyclable ? 30 : 85, color: result.recyclable ? '#10b981' : '#ef4444' },
                { label: lang === 'kn' ? 'ಮರುಬಳಕೆ ಸಾಮರ್ಥ್ಯ' : 'Recyclability', value: result.recyclable ? (lang === 'kn' ? 'ಹೌದು' : 'Yes') : (lang === 'kn' ? 'ಇಲ್ಲ' : 'No'), pct: result.recyclable ? 80 : 20, color: result.recyclable ? '#10b981' : '#ef4444' },
              ].map((s, i) => (
                <div key={i} className="bc-stat-bar-row">
                  <div className="bc-stat-bar-header">
                    <span className="bc-stat-bar-label">{s.label}</span>
                    <span className="bc-stat-bar-value">{s.value}</span>
                  </div>
                  <div className="bc-stat-bar-track">
                    <div className="bc-stat-bar-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ── Environmental impact ── */}
            <div className="bc-info-card">
              <div className="bc-info-card-header">
                <div className="bc-info-card-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span className="bc-info-card-title">{lang === 'kn' ? 'ಪರಿಸರ ಪ್ರಭಾವ' : 'Environmental Impact'}</span>
              </div>
              <p>{result.environmental_impact?.[lang] || result.environmental_impact?.en}</p>
            </div>

            {/* ── Disposal steps ── */}
            <div className="bc-info-card">
              <div className="bc-info-card-header">
                <div className="bc-info-card-icon" style={{ background: `${binColor}18` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={binColor} strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span className="bc-info-card-title">{lang === 'kn' ? 'ವಿಲೇವಾರಿ ಹಂತಗಳು' : 'How to Dispose'}</span>
              </div>
              <ol className="bc-steps">
                {(result.disposal_steps?.[lang] || result.disposal_steps?.en || []).map((s, i) => (
                  <li key={i}>
                    <span className="bc-step-num" style={{ background: binColor }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Eco tips ── */}
            <div className="bc-info-card">
              <div className="bc-info-card-header">
                <div className="bc-info-card-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 19.5c1.1-1.1 2.5-1.5 4.18-1.5C10 18 12 20 15 20c3.87 0 7-3.13 7-7 0-2.5-1.5-4.5-3.5-5.5"/><path d="M12 12c0 0-2-4 2-8"/></svg>
                </div>
                <span className="bc-info-card-title">{lang === 'kn' ? 'ಪರಿಸರ ಸಲಹೆಗಳು' : 'Eco Tips'}</span>
              </div>
              <ul className="bc-tips">
                {(result.eco_tips?.[lang] || result.eco_tips?.en || []).map((tip, i) => (
                  <li key={i}>
                    <svg className="bc-tip-leaf" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8C8 10 5.9 16.17 3.82 19.5c1.1-1.1 2.5-1.5 4.18-1.5C10 18 12 20 15 20c3.87 0 7-3.13 7-7 0-2.5-1.5-4.5-3.5-5.5"/></svg>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <button className="bc-analyze-btn secondary" onClick={reset}>
              {lang === 'kn' ? 'ಇನ್ನೊಂದು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' : 'Scan Another'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
