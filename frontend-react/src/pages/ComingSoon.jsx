import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ComingSoon({ title }) {
  const navigate = useNavigate()
  const { t } = useApp()

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 24, textAlign: 'center'
    }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22d67a" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{title} — {t('coming_soon')}</h2>
      <p style={{ color: 'var(--muted2)', fontSize: 15, maxWidth: 320 }}>{t('coming_desc')}</p>
      <button onClick={() => navigate('/')} style={{
        marginTop: 8, padding: '11px 28px',
        background: 'linear-gradient(135deg,#22d67a,#16a85f)',
        borderRadius: 11, color: '#fff', fontSize: 14, fontWeight: 600,
        border: 'none', cursor: 'pointer'
      }}>{t('back_home')}</button>
    </div>
  )
}
