import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './Chatbot.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SUGGESTIONS = {
  en: [
    'How do I dispose a plastic bottle?',
    'What can I make from cardboard at home?',
    'How to compost food waste?',
    'Where to dispose e-waste in Bengaluru?',
    'What is my carbon footprint from plastic?',
  ],
  kn: [
    'ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲಿಯನ್ನು ಹೇಗೆ ವಿಲೇವಾರಿ ಮಾಡಬೇಕು?',
    'ಮನೆಯಲ್ಲಿ ಕಾರ್ಡ್‌ಬೋರ್ಡ್‌ನಿಂದ ಏನು ತಯಾರಿಸಬಹುದು?',
    'ಆಹಾರ ತ್ಯಾಜ್ಯವನ್ನು ಕಾಂಪೋಸ್ಟ್ ಮಾಡುವುದು ಹೇಗೆ?',
    'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಇ-ತ್ಯಾಜ್ಯ ಎಲ್ಲಿ ವಿಲೇವಾರಿ ಮಾಡಬೇಕು?',
    'ಪ್ಲಾಸ್ಟಿಕ್‌ನಿಂದ ನನ್ನ ಕಾರ್ಬನ್ ಹೆಜ್ಜೆಗುರುತು ಎಷ್ಟು?',
  ]
}

export default function Chatbot() {
  const navigate = useNavigate()
  const { t, lang } = useApp()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const bottomRef = useRef()
  const fileRef = useRef()
  const mediaRef = useRef()
  const chunksRef = useRef([])

  // Greet on mount
  useEffect(() => {
    const greet = {
      en: "Hello! I'm the SmartWaste Assistant. Ask me anything about waste disposal, recycling, composting, or environmental impact. You can also send an image or use voice.",
      kn: "ನಮಸ್ಕಾರ! ನಾನು SmartWaste ಸಹಾಯಕ. ತ್ಯಾಜ್ಯ ವಿಲೇವಾರಿ, ಮರುಬಳಕೆ, ಕಾಂಪೋಸ್ಟಿಂಗ್ ಅಥವಾ ಪರಿಸರ ಪ್ರಭಾವದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ."
    }
    setMessages([{ role: 'assistant', content: greet[lang] || greet.en }])
  }, [lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleImageFile(f) {
    if (!f.type.startsWith('image/')) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  function removeImage() { setImageFile(null); setImagePreview(null) }

  async function sendMessage(text = input) {
    const content = text.trim()
    if (!content && !imageFile) return
    setInput('')

    const userMsg = { role: 'user', content: content || (lang === 'kn' ? 'ಈ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ' : 'Analyze this image') }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      let imageBase64 = null
      let imageMime = null
      if (imageFile) {
        const buf = await imageFile.arrayBuffer()
        imageBase64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
        imageMime = imageFile.type
        setImageFile(null); setImagePreview(null)
      }

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          language: lang,
          image_base64: imageBase64,
          image_mime: imageMime,
        })
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, I could not process that.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utt = new SpeechSynthesisUtterance(reply)
        utt.lang = lang === 'kn' ? 'kn-IN' : 'en-US'
        utt.rate = 0.88
        utt.pitch = 1.15
        utt.volume = 1

        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices()
          const preferred = voices.find(v =>
            v.name.includes('Samantha') || v.name.includes('Karen') ||
            v.name.includes('Moira') || v.name.includes('Tessa') ||
            v.name.includes('Google UK English Female') ||
            v.name.includes('Microsoft Zira') ||
            v.name.includes('Microsoft Aria') ||
            (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
          ) || voices.find(v => v.lang.startsWith(lang === 'kn' ? 'kn' : 'en') && !v.name.toLowerCase().includes('male'))
            || voices.find(v => v.lang.startsWith('en'))
          if (preferred) utt.voice = preferred
          window.speechSynthesis.speak(utt)
        }

        // Voices may not be loaded yet
        if (window.speechSynthesis.getVoices().length > 0) {
          pickVoice()
        } else {
          window.speechSynthesis.onvoiceschanged = pickVoice
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Make sure the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        // Use Web Speech API for transcription
        transcribeAudio(blob)
      }
      mr.start()
      setRecording(true)
    } catch {
      alert('Microphone access denied.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    setRecording(false)
  }

  function transcribeAudio() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Try Chrome.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    // Use both Kannada and English for better recognition
    recognition.lang = lang === 'kn' ? 'kn-IN' : 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 3
    recognition.onresult = e => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      sendMessage(transcript)
    }
    recognition.onerror = e => {
      if (e.error === 'language-not-supported' && lang === 'kn') {
        // Fallback: try again with en-IN if kn-IN not supported
        const r2 = new SR()
        r2.lang = 'en-IN'
        r2.interimResults = false
        r2.onresult = ev => {
          const t = ev.results[0][0].transcript
          setInput(t)
          sendMessage(t)
        }
        r2.onerror = () => alert('Could not recognize speech. Please type in Kannada instead.')
        r2.start()
      } else {
        alert('Could not recognize speech. Please try again.')
      }
    }
    recognition.start()
  }

  function handleVoiceBtn() {
    if (recording) stopRecording()
    else startRecording()
  }

  return (
    <div className="chat-root">
      {/* Topbar */}
      <div className="chat-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {t('back')}
        </button>
        <div className="chat-topbar-brand">
          <RecycleLogo size={22} />
          <span>SmartWaste {lang === 'kn' ? 'ಸಹಾಯಕ' : 'Assistant'}</span>
          {lang === 'kn' && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px',
              background: 'rgba(16,185,129,0.15)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100
            }}>ಕನ್ನಡ</span>
          )}
        </div>
        <div className="chat-status">
          <span className="status-dot" />
          {lang === 'kn' ? 'ಆನ್‌ಲೈನ್' : 'Online'}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === 'assistant' && (
              <div className="chat-avatar"><RecycleLogo size={20} /></div>
            )}
            <div className="chat-bubble">
              {m.image && <img src={m.image} alt="uploaded" className="chat-img-preview" />}
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-avatar"><RecycleLogo size={20} /></div>
            <div className="chat-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="chat-suggestions">
          {(SUGGESTIONS[lang] || SUGGESTIONS.en).map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* Image preview in input */}
      {imagePreview && (
        <div className="chat-img-attach">
          <img src={imagePreview} alt="attach" />
          <button onClick={removeImage}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="chat-input-bar">
        <button className="chat-icon-btn" onClick={() => fileRef.current.click()} title={lang === 'kn' ? 'ಚಿತ್ರ ಸೇರಿಸಿ' : 'Attach image'}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
        <input
          ref={fileRef} type="file" accept="image/*" hidden
          onChange={e => e.target.files[0] && handleImageFile(e.target.files[0])}
        />

        <input
          className="chat-text-input"
          placeholder={lang === 'kn' ? 'ಕನ್ನಡದಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...' : 'Type a message...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          lang={lang === 'kn' ? 'kn' : 'en'}
        />

        <button
          className={`chat-icon-btn voice-btn ${recording ? 'recording' : ''}`}
          onClick={handleVoiceBtn}
          title={recording ? 'Stop recording' : 'Voice input'}
        >
          {recording ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="1.5">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        <button
          className="chat-send-btn"
          onClick={() => sendMessage()}
          disabled={(!input.trim() && !imageFile) || loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
