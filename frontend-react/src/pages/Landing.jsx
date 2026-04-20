import { useNavigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './Landing.css'

const FEATURES = [
  {
    path: '/scan',
    key: 'scan',
    img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=85',
    accent: '#052e16',
  },
  {
    path: '/history',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
    key: 'history',
    accent: '#0f172a',
  },
  {
    path: '/tips',
    key: 'tips',
    img: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&q=85',
    accent: '#14532d',
  },
  {
    path: '/quiz',
    key: 'quiz',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=85',
    accent: '#1e1b4b',
  },
  {
    path: '/barcode',
    key: 'barcode',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=85',
    accent: '#042f2e',
  },
  {
    path: '/find',
    key: 'find',
    img: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=600&q=85',
    accent: '#450a0a',
  },
  {
    path: '/learn',
    key: 'learn',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85',
    accent: '#1c1917',
  },
  {
    path: '/community',
    key: 'community',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=85',
    accent: '#1e3a5f',
  },
  {
    path: '/shop',
    key: 'shop',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=85',
    accent: '#052e16',
  },
]

export default function Landing({ session }) {
  const navigate = useNavigate()
  const { t, lang, toggleLang, theme, toggleTheme } = useApp()

  const name = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0]
    || 'User'

  async function handleLogout() {
    if (supabaseConfigured) await supabase.auth.signOut()
    else window.location.reload()
  }

  return (
    <div className="landing-root">
      {/* ── Hero ── */}
      <section className="landing-hero">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src="https://cdn.pixabay.com/video/2020/07/30/46026-447087782_large.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2016/12/30/7090-197634410_large.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" />

        {/* Navbar */}
        <nav className="landing-nav">
          <div className="nav-brand">
            <RecycleLogo size={30} />
            <span>Smart<span className="gradient-text">Waste</span></span>
          </div>

          <div className="nav-right">
            <span className="nav-greeting">{t('hi_user')}, {name}</span>

            <button className="nav-toggle-btn" onClick={toggleLang}>
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>

            <button className="nav-toggle-btn" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>

            <button className="btn-logout" onClick={handleLogout}>{t('logout')}</button>
          </div>
        </nav>

        {/* Hero text */}
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="gradient-text">{t('hero_title_1')}</span>{' '}
            {t('hero_title_2')}
          </h1>
          <p className="hero-slogan">{t('hero_slogan')}</p>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="landing-features">
        <h2 className="features-heading">{t('feat_heading')}</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <button key={f.path} className="feature-card" onClick={() => navigate(f.path)}>
              <div className="fc-img-wrap">
                <img src={f.img} alt={t(`feat_${f.key}_lbl`)} className="fc-img" loading="lazy" />
                <div className="fc-img-overlay" style={{ background: `linear-gradient(170deg, ${f.accent}bb 0%, ${f.accent}ee 100%)` }} />
              </div>
              <div className="fc-body">
                <span className="fc-label">{t(`feat_${f.key}_lbl`)}</span>
                <span className="fc-desc">{t(`feat_${f.key}_desc`)}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <RecycleLogo size={24} />
          <span>Smart<span className="gradient-text">Waste</span> Karnataka</span>
        </div>
        <p className="footer-tagline">{t('footer_tagline')}</p>
        <div className="footer-links">
          <span>{t('footer_privacy')}</span>
          <span className="dot">·</span>
          <span>{t('footer_terms')}</span>
          <span className="dot">·</span>
          <span>{t('footer_contact')}</span>
        </div>
        <p className="footer-copy">{t('footer_copy')}</p>
      </footer>
    </div>
  )
}
