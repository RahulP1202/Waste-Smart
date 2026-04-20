import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import './ScanAnalyze.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const BIN_COLORS = { wet: '#10b981', dry: '#3b82f6', hazardous: '#ef4444' }

const CHAT_SUGGESTIONS = {
  en: ['How to compost this?', 'Where to recycle nearby?', 'Carbon impact?', 'More DIY ideas?'],
  kn: ['How to compost this?', 'Where to recycle nearby?', 'Carbon impact?', 'More DIY ideas?']
}

function speakText(text, lang) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = lang === 'kn' ? 'kn-IN' : 'en-US'
  utt.rate = 0.88; utt.pitch = 1.15; utt.volume = 1
  const pick = () => {
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') ||
      v.name.includes('Google UK English Female') || v.name.includes('Microsoft Zira') ||
      v.name.includes('Microsoft Aria') || (v.lang.startsWith('en') && v.name.toLowerCase().includes('female')))
      || voices.find(v => v.lang.startsWith(lang === 'kn' ? 'kn' : 'en'))
    if (v) utt.voice = v
    window.speechSynthesis.speak(utt)
  }
  window.speechSynthesis.getVoices().length > 0 ? pick() : (window.speechSynthesis.onvoiceschanged = pick)
}

function ScoreRing({ score }) {
  const c = 220, r = 35
  const offset = c - (score / 100) * c
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="score-ring">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--border2)" strokeWidth="6"/>
        <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 38 38)" style={{transition:'stroke-dashoffset 1s ease'}}/>
      </svg>
      <span style={{color, fontSize:16, fontWeight:800}}>{score}</span>
    </div>
  )
}

function ChatPanel({ lang, t, contextItems }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [chatImage, setChatImage] = useState(null)
  const [chatImagePreview, setChatImagePreview] = useState(null)
  const [camOpen, setCamOpen] = useState(false)
  const bottomRef = useRef()
  const chatFileRef = useRef()
  const chatVideoRef = useRef()
  const chatCanvasRef = useRef()
  const streamRef = useRef()

  useEffect(() => {
    const ctx = contextItems && contextItems.length > 0
      ? (lang === 'kn'
        ? 'I have analyzed the items. Ask me anything.'
        : 'I have analyzed ' + contextItems.map(i => i.waste_subtype).join(', ') + '. Ask me anything.')
      : (lang === 'kn' ? 'Hello! Ask me anything about waste management.' : 'Hello! Ask me anything about waste management.')
    setMessages([{ role: 'assistant', content: ctx }])
  }, [lang, contextItems])

  useEffect(() => { bottomRef.current && bottomRef.current.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  async function openChatCam() {
    setCamOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (chatVideoRef.current) chatVideoRef.current.srcObject = stream
    } catch (e) { alert('Camera access denied.'); setCamOpen(false) }
  }

  function captureChatPhoto() {
    const v = chatVideoRef.current, c = chatCanvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob(function(blob) {
      const f = new File([blob], 'chat.jpg', { type: 'image/jpeg' })
      setChatImage(f); setChatImagePreview(URL.createObjectURL(f))
      if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop() })
      setCamOpen(false)
    }, 'image/jpeg', 0.92)
  }

  function closeChatCam() {
    if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop() })
    setCamOpen(false)
  }

  async function send(text) {
    const content = (text || input).trim()
    if (!content && !chatImage) return
    setInput('')
    const userMsg = { role: 'user', content: content || 'Analyze this image', image: chatImagePreview }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setLoading(true)
    try {
      let imageBase64 = null, imageMime = null
      if (chatImage) {
        const buf = await chatImage.arrayBuffer()
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
        imageMime = chatImage.type
        setChatImage(null); setChatImagePreview(null)
      }
      const res = await fetch(API_BASE + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs.slice(-8).map(function(m) { return { role: m.role, content: m.content } }),
          language: lang, image_base64: imageBase64, image_mime: imageMime
        })
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, could not process that.'
      setMessages(function(prev) { return [...prev, { role: 'assistant', content: reply }] })
      setSpeaking(true)
      speakText(reply, lang)
      setTimeout(function() { setSpeaking(false) }, reply.length * 60)
    } catch (e) {
      setMessages(function(prev) { return [...prev, { role: 'assistant', content: 'Connection error. Make sure the backend is running.' }] })
    } finally { setLoading(false) }
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return alert('Voice input requires Chrome or Edge.')
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        stream.getTracks().forEach(function(t) { t.stop() })
        setRecording(true)
        const r = new SR()
        r.lang = lang === 'kn' ? 'kn-IN' : 'en-US'
        r.interimResults = false
        r.onresult = function(e) { const txt = e.results[0][0].transcript; setInput(txt); send(txt) }
        r.onerror = function(e) {
          setRecording(false)
          if (e.error === 'no-speech') alert('No speech detected. Please try again.')
          else if (e.error === 'not-allowed') alert('Microphone blocked. Allow it in browser settings.')
          else alert('Speech error: ' + e.error)
        }
        r.onend = function() { setRecording(false) }
        r.start()
      })
      .catch(function() { alert('Microphone access denied. Allow it in browser address bar.') })
  }

  return (
    <div className="chat-panel">
      {camOpen && (
        <div className="chat-cam-overlay">
          <video ref={chatVideoRef} autoPlay playsInline className="chat-cam-feed"/>
          <canvas ref={chatCanvasRef} hidden/>
          <div className="chat-cam-btns">
            <button className="cam-btn capture-btn" onClick={captureChatPhoto}>{t('capture')}</button>
            <button className="cam-btn close-btn" onClick={closeChatCam}>{t('close_camera')}</button>
          </div>
        </div>
      )}
      <div className="chat-header">
        <RecycleLogo size={18}/>
        <span>{lang === 'kn' ? 'AI Assistant' : 'AI Assistant'}</span>
        <div className="chat-online"/>
        {speaking && (
          <button className="stop-speak-btn" onClick={stopSpeaking}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
            Stop
          </button>
        )}
      </div>
      <div className="chat-msgs">
        {messages.map(function(m, i) {
          return (
            <div key={i} className={'cmsg ' + m.role}>
              {m.role === 'assistant' && <div className="cmsg-av"><RecycleLogo size={14}/></div>}
              <div className="cmsg-bubble">
                {m.image && <img src={m.image} alt="" className="cmsg-img"/>}
                <p>{m.content}</p>
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="cmsg assistant">
            <div className="cmsg-av"><RecycleLogo size={14}/></div>
            <div className="cmsg-bubble typing"><span/><span/><span/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      {messages.length <= 1 && (
        <div className="chat-chips">
          {(CHAT_SUGGESTIONS[lang] || CHAT_SUGGESTIONS.en).map(function(s, i) {
            return <button key={i} className="chat-chip" onClick={function() { send(s) }}>{s}</button>
          })}
        </div>
      )}
      {chatImagePreview && (
        <div className="chat-attach">
          <img src={chatImagePreview} alt=""/>
          <button onClick={function() { setChatImage(null); setChatImagePreview(null) }}>x</button>
        </div>
      )}
      <div className="chat-input-row">
        <button className="ci-btn" onClick={function() { chatFileRef.current.click() }} title="Image">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <button className="ci-btn" onClick={openChatCam} title="Camera">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <input ref={chatFileRef} type="file" accept="image/*" hidden
          onChange={function(e) { if (e.target.files[0]) { setChatImage(e.target.files[0]); setChatImagePreview(URL.createObjectURL(e.target.files[0])) } }}/>
        <input className="ci-text"
          placeholder="Type a message..."
          value={input} onChange={function(e) { setInput(e.target.value) }}
          onKeyDown={function(e) { if (e.key === 'Enter' && !e.shiftKey) send() }}/>
        <button className={'ci-btn ' + (recording ? 'recording' : '')} onClick={startVoice} title="Voice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <button className="ci-send" onClick={function() { send() }} disabled={(!input.trim() && !chatImage) || loading}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default function ScanAnalyze() {
  const navigate = useNavigate()
  const { t, lang } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [points, setPoints] = useState(0)
  const [camOpen, setCamOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(0)
  const fileRef = useRef()
  const videoRef = useRef()
  const canvasRef = useRef()
  const streamRef = useRef()

  const handleFile = useCallback(function(f) {
    if (!f.type.startsWith('image/')) return alert('Please upload an image.')
    if (f.size > 10 * 1024 * 1024) return alert('Max 10MB.')
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null)
  }, [])

  async function openCamera() {
    setCamOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (e) { alert('Camera access denied.'); setCamOpen(false) }
  }

  function capturePhoto() {
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    c.toBlob(function(blob) {
      handleFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }))
      if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop() })
      setCamOpen(false)
    }, 'image/jpeg', 0.92)
  }

  function closeCamera() {
    if (streamRef.current) streamRef.current.getTracks().forEach(function(t) { t.stop() })
    setCamOpen(false)
  }

  async function analyze() {
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append('image', file); fd.append('language', lang)
    try {
      const res = await fetch(API_BASE + '/api/analyze', { method: 'POST', body: fd })
      if (!res.ok) throw new Error((await res.json()).detail)
      const data = await res.json()
      setResult(data); setActiveItem(0)
      setPoints(function(p) { return p + (data.points_earned || 10) })

      // Save each item to Supabase history
      if (supabaseConfigured && supabase) {
        try {
          const { data: authData } = await supabase.auth.getUser()
          const userId = authData?.user?.id
          console.log('Saving history — userId:', userId, 'items:', data.items?.length)
          if (userId && data.items) {
            for (const item of data.items) {
              const { error } = await supabase.from('scan_history').insert({
                user_id: userId,
                waste_type: item.waste_type,
                waste_subtype: item.waste_subtype,
                bin: item.bin,
                sustainability_score: item.sustainability_score || 0,
                carbon_footprint_kg: item.carbon_footprint_kg || 0,
                carbon_saved_if_recycled_kg: item.carbon_saved_if_recycled_kg || 0,
                recyclability: item.recyclability || 0,
                compostable: item.compostable || false,
                reuse_potential: item.reuse_potential || 0,
                decomposition_time: item.decomposition_time || '',
                can_sell: item.can_sell || false,
                sell_price: item.sell_price || '',
                points_earned: data.points_earned || 10,
                full_result: item,
                demo_mode: data.demo_mode || false,
              })
              if (error) console.error('History insert error:', JSON.stringify(error))
              else console.log('History saved OK for:', item.waste_subtype)
            }
          } else {
            console.log('No userId or no items — not saving. userId:', userId)
          }
        } catch (e) {
          console.error('History save exception:', e)
        }
      } else {
        console.log('Supabase not configured — history not saved')
      }
    } catch (e) { alert('Analysis failed: ' + e.message) }
    finally { setLoading(false) }
  }

  function reset() { setFile(null); setPreview(null); setResult(null) }

  const item = result && result.items && result.items[activeItem]
  const binColor = item ? (BIN_COLORS[item.bin] || '#64748b') : '#10b981'
  const totalCarbon = result ? (result.total_carbon_footprint_kg || 0) : 0
  const treesNeeded = (totalCarbon / 21).toFixed(3)

  return (
    <div className="scan-root">
      {camOpen && (
        <div className="camera-overlay">
          <video ref={videoRef} autoPlay playsInline className="camera-feed"/>
          <canvas ref={canvasRef} hidden/>
          <div className="camera-controls">
            <button className="cam-btn capture-btn" onClick={capturePhoto}>{t('capture')}</button>
            <button className="cam-btn close-btn" onClick={closeCamera}>{t('close_camera')}</button>
          </div>
        </div>
      )}
      <div className="scan-topbar">
        <button className="scan-back" onClick={function() { navigate('/') }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {t('back')}
        </button>
        <div className="scan-topbar-brand"><RecycleLogo size={22}/><span>Tyajyadinda Tejassige</span></div>
        {points > 0 && <div className="scan-points">+{points} {t('points_earned')}</div>}
      </div>
      <div className="scan-layout">
        <div className="scan-left">
          {!result ? (
            <div className="upload-panel">
              <h2 className="scan-title">{t('identify')}</h2>
              <p className="scan-subtitle">{t('identify_sub')}</p>
              <div className="upload-btns">
                <button className="upload-opt" onClick={function() { fileRef.current.click() }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                  </svg>
                  {t('upload_gallery')}
                </button>
                <button className="upload-opt" onClick={openCamera}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  {t('open_camera')}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={function(e) { if (e.target.files[0]) handleFile(e.target.files[0]) }}/>
              {preview ? (
                <div className="preview-wrap">
                  <img src={preview} alt="preview" className="preview-img"/>
                  <button className="remove-btn" onClick={reset}>x</button>
                </div>
              ) : (
                <div className="upload-drop" onClick={function() { fileRef.current.click() }}
                  onDragOver={function(e) { e.preventDefault() }}
                  onDrop={function(e) { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>{t('upload_text')}</p>
                  <span>{t('upload_hint')}</span>
                </div>
              )}
              <button className="analyze-btn" disabled={!file || loading} onClick={analyze}>
                {loading
                  ? <><div className="spin-ring"/>{t('analyzing')}</>
                  : <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>{t('analyze_btn')}</>
                }
              </button>
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner"><div/><div/><div/></div>
                  <p>{t('analyzing')}</p><span>{t('analyzing_sub')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="results-panel">
              {result.demo_mode && <div className="demo-badge">{t('demo_mode')}</div>}
              {result.items && result.items.length > 1 && (
                <div className="item-tabs">
                  {result.items.map(function(it, i) {
                    return (
                      <button key={i} className={'item-tab ' + (activeItem === i ? 'active' : '')}
                        onClick={function() { setActiveItem(i) }}
                        style={activeItem === i ? { borderColor: BIN_COLORS[it.bin], color: BIN_COLORS[it.bin] } : {}}>
                        {it.waste_subtype}
                      </button>
                    )
                  })}
                </div>
              )}
              {item && (
                <>
                  <div className="result-hero" style={{ borderTop: '3px solid ' + binColor }}>
                    <div className="result-hero-left">
                      {preview && <img src={preview} alt="scanned" className="result-thumb"/>}
                      <div>
                        <div className="result-bin-pill" style={{ background: binColor + '18', color: binColor, border: '1px solid ' + binColor + '44' }}>
                          {(item.bin_label && (item.bin_label[lang] || item.bin_label.en)) || item.bin}
                        </div>
                        <h3 className="result-name">{item.waste_subtype}</h3>
                        <p className="result-type">{item.waste_type}</p>
                        <p className="result-desc">{(item.description && (item.description[lang] || item.description.en)) || ''}</p>
                      </div>
                    </div>
                    <ScoreRing score={item.sustainability_score || 0}/>
                  </div>
                  <div className="stats-row">
                    {[
                      { val: (item.recyclability != null ? item.recyclability : 0) + '/5', lbl: t('recyclability') },
                      { val: item.compostable ? t('yes') : t('no'), lbl: t('compostable') },
                      { val: (item.reuse_potential != null ? item.reuse_potential : 0) + '/5', lbl: t('reuse') },
                      { val: item.decomposition_time || '-', lbl: t('decompose') },
                    ].map(function(s) {
                      return (
                        <div key={s.lbl} className="stat-box">
                          <strong>{s.val}</strong><small>{s.lbl}</small>
                        </div>
                      )
                    })}
                  </div>
                  <div className="cards-grid">
                    <div className="info-card">
                      <div className="info-card-title">{t('bin_label')}</div>
                      <p className="info-where">{(item.where_to_dispose && (item.where_to_dispose[lang] || item.where_to_dispose.en)) || ''}</p>
                      <ol className="info-steps">
                        {((item.disposal_steps && (item.disposal_steps[lang] || item.disposal_steps.en)) || []).map(function(s, i) { return <li key={i}>{s}</li> })}
                      </ol>
                      {item.can_sell && (
                        <div className="sell-tag">{t('sell_earn')}: <strong>{item.sell_price}</strong></div>
                      )}
                    </div>
                    <div className="info-card">
                      <div className="info-card-title">{t('carbon_title')}</div>
                      {[
                        { lbl: t('carbon_this'), val: item.carbon_footprint_kg || 0, color: '#f59e0b' },
                        { lbl: t('carbon_wrong'), val: item.carbon_if_disposed_wrong_kg || 0, color: '#ef4444' },
                        { lbl: t('carbon_saved'), val: item.carbon_saved_if_recycled_kg || 0, color: '#10b981' },
                      ].map(function(c) {
                        const max = Math.max(item.carbon_if_disposed_wrong_kg || 0.01, 0.01)
                        return (
                          <div key={c.lbl} className="cbar-row">
                            <span>{c.lbl}</span>
                            <div className="cbar-track"><div className="cbar-fill" style={{ width: ((c.val / max) * 100) + '%', background: c.color }}/></div>
                            <strong>{c.val}kg</strong>
                          </div>
                        )
                      })}
                      <p className="carbon-save-msg">{t('carbon_impact_msg').replace('{x}', item.carbon_saved_if_recycled_kg || 0)}</p>
                    </div>
                  </div>
                  {/* Upcycle Ideas Generator — prominent card */}
                  <div className="upcycle-card">
                    <div className="upcycle-header">
                      <div className="upcycle-header-left">
                        <div className="upcycle-icon-wrap">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                          </svg>
                        </div>
                        <div>
                          <h4>{lang === 'kn' ? 'ಮರುಬಳಕೆ ಆಲೋಚನೆ ಜನರೇಟರ್' : 'Upcycle Ideas Generator'}</h4>
                          <p>{lang === 'kn' ? `ಈ ${item.waste_subtype} ನಿಂದ ನೀವು ಇವುಗಳನ್ನು ತಯಾರಿಸಬಹುದು` : `Here's what you can make from this ${item.waste_subtype}`}</p>
                        </div>
                      </div>
                      <span className="upcycle-badge">{lang === 'kn' ? 'AI ಆಲೋಚನೆಗಳು' : 'AI Ideas'}</span>
                    </div>
                    <div className="upcycle-ideas">
                      {((item.diy_ideas && (item.diy_ideas[lang] || item.diy_ideas.en)) || []).map(function(idea, i) {
                        const icons = ['🪴','🎨','🧺','💡','🛠️']
                        const colors = ['#10b981','#6366f1','#f59e0b','#3b82f6','#8b5cf6']
                        return (
                          <div key={i} className="upcycle-idea-item" style={{ borderLeft: '3px solid ' + colors[i % colors.length] }}>
                            <div className="upcycle-idea-num" style={{ background: colors[i % colors.length] + '22', color: colors[i % colors.length] }}>
                              {i + 1}
                            </div>
                            <p>{idea}</p>
                          </div>
                        )
                      })}
                    </div>
                    <div className="upcycle-footer-note">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      {lang === 'kn' ? 'ವಿಲೇವಾರಿ ಮಾಡುವ ಮೊದಲು ಮರುಬಳಕೆ ಪರಿಗಣಿಸಿ — ಪ್ರತಿ ಮರುಬಳಕೆ ಒಂದು ಮರ ಉಳಿಸುತ್ತದೆ' : 'Consider upcycling before disposal — every reuse saves resources'}
                    </div>
                  </div>
                  <div className="eco-card">
                    <h4>{t('eco_tips')}</h4>
                    <div className="eco-grid">
                      {((result.eco_tips && (result.eco_tips[lang] || result.eco_tips.en)) || []).map(function(tip, i) {
                        return <div key={i} className="eco-item">{tip}</div>
                      })}
                    </div>
                  </div>
                </>
              )}
              <div className="points-card">+{result.points_earned || 10} {t('points_earned')}</div>
              <button className="analyze-btn secondary" onClick={reset}>{t('scan_again')}</button>
            </div>
          )}
        </div>
        <div className="scan-right">
          <ChatPanel lang={lang} t={t} contextItems={(result && result.items) || []}/>
        </div>
      </div>
    </div>
  )
}

