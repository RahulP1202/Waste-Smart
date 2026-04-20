import { useEffect, useState } from 'react'
import RecycleLogo from '../components/RecycleLogo'
import './Welcome.css'

export default function Welcome({ onDone }) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 2400)
    const t2 = setTimeout(onDone, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`welcome-root ${fade ? 'fade-out' : ''}`}>
      <div className="welcome-bg">
        <div className="wb wb1" /><div className="wb wb2" /><div className="wb wb3" />
      </div>
      <div className="welcome-content">
        <div className="welcome-icon-wrap">
          <RecycleLogo size={80} />
        </div>
        <h1 className="welcome-title">
          Smart<span className="gradient-text">Waste</span>
        </h1>
        <p className="welcome-en">Karnataka · AI Waste Classifier</p>
        <p className="welcome-kn">ಕರ್ನಾಟಕ · AI ತ್ಯಾಜ್ಯ ವರ್ಗೀಕರಣ</p>
        <div className="welcome-bar">
          <div className="welcome-bar-fill" />
        </div>
      </div>
    </div>
  )
}
