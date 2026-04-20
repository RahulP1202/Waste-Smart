import { useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import './Login.css'

const VIEWS = { SIGN_IN: 'sign_in', SIGN_UP: 'sign_up', FORGOT: 'forgot', OTP_SEND: 'otp_send', OTP_VERIFY: 'otp_verify' }

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
)

export default function Login() {
  const { t, lang, toggleLang } = useApp()
  const [view, setView] = useState(VIEWS.SIGN_IN)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const notify = (text, type = 'error') => setMsg({ text, type })
  const clear = () => setMsg({ text: '', type: '' })
  const go = (v) => { setView(v); clear(); setConfirmPassword('') }

  async function handleGoogle() {
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    setLoading(true); clear()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    })
    if (error) notify(error.message)
    setLoading(false)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    setLoading(true); clear()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) notify(error.message)
    setLoading(false)
  }

  async function handleSignUp(e) {
    e.preventDefault()
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    if (password !== confirmPassword) return notify('Passwords do not match')
    if (password.length < 6) return notify('Password must be at least 6 characters')
    setLoading(true); clear()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) notify(error.message)
    else { notify('Account created! Check your email to confirm.', 'success'); go(VIEWS.SIGN_IN) }
    setLoading(false)
  }

  async function handleForgot(e) {
    e.preventDefault()
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    setLoading(true); clear()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) notify(error.message)
    else notify('Password reset link sent to your email!', 'success')
    setLoading(false)
  }

  async function handleOTPSend(e) {
    e.preventDefault()
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    setLoading(true); clear()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined,
      }
    })
    if (error) notify(error.message)
    else { notify('OTP sent! Check your email for a 6-digit code.', 'success'); go(VIEWS.OTP_VERIFY) }
    setLoading(false)
  }

  async function handleOTPVerify(e) {
    e.preventDefault()
    if (!supabaseConfigured) return notify('Supabase not configured — add keys to .env')
    setLoading(true); clear()
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (error) notify(error.message)
    else notify('Logged in successfully!', 'success')
    setLoading(false)
  }

  return (
    <div className="login-root">
      <div className="login-orbs">
        <div className="l-orb l-orb1" /><div className="l-orb l-orb2" />
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <RecycleLogo size={34} />
          <span>Smart<span className="gradient-text">Waste</span></span>
        </div>
        <p className="login-sub">Karnataka · AI Waste Classifier</p>

        {/* Lang toggle — short label */}
        <button className="login-lang-btn" onClick={toggleLang}>
          {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        {!supabaseConfigured && (
          <div className="login-msg info">
            Supabase not configured — add your keys to <code>.env</code> to enable real auth.
          </div>
        )}

        {msg.text && <div className={`login-msg ${msg.type}`}>{msg.text}</div>}

        {/* ── SIGN IN ── */}
        {view === VIEWS.SIGN_IN && (
          <>
            <h2 className="login-heading">{t('welcome_back')}</h2>
            <button className="btn-google" onClick={handleGoogle} disabled={loading}>
              <GoogleIcon /> {t('continue_google')}
            </button>
            <div className="login-divider"><span>{t('or')}</span></div>
            <form onSubmit={handleSignIn} className="login-form">
              <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('signing_in') : t('sign_in')}
              </button>
            </form>
            <div className="login-links">
              <button onClick={() => go(VIEWS.FORGOT)}>{t('forgot_password')}</button>
              <span className="sep">·</span>
              <button onClick={() => go(VIEWS.OTP_SEND)}>{t('otp_login')}</button>
            </div>
            <p className="login-switch">{t('new_here')} <button onClick={() => go(VIEWS.SIGN_UP)}>{t('create_account')}</button></p>
          </>
        )}

        {/* ── SIGN UP ── */}
        {view === VIEWS.SIGN_UP && (
          <>
            <h2 className="login-heading">{t('create_account')}</h2>
            <button className="btn-google" onClick={handleGoogle} disabled={loading}>
              <GoogleIcon /> {t('continue_google')}
            </button>
            <div className="login-divider"><span>{t('or')}</span></div>
            <form onSubmit={handleSignUp} className="login-form">
              <input type="text" placeholder={t('full_name')} value={name} onChange={e => setName(e.target.value)} required />
              <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required />
              <input type="password" placeholder={t('password_hint')} value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
              <input type="password" placeholder={t('confirm_password')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6} required />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('creating') : t('create_account')}
              </button>
            </form>
            <p className="login-switch">{t('already_have')} <button onClick={() => go(VIEWS.SIGN_IN)}>{t('sign_in')}</button></p>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {view === VIEWS.FORGOT && (
          <>
            <h2 className="login-heading">{t('reset_password')}</h2>
            <p className="login-desc">{t('reset_desc')}</p>
            <form onSubmit={handleForgot} className="login-form">
              <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('sending') : t('send_reset')}
              </button>
            </form>
            <p className="login-switch"><button onClick={() => go(VIEWS.SIGN_IN)}>← {t('back_signin')}</button></p>
          </>
        )}

        {/* ── OTP SEND ── */}
        {view === VIEWS.OTP_SEND && (
          <>
            <h2 className="login-heading">{t('sign_in_otp')}</h2>
            <p className="login-desc">We'll email you a 6-digit OTP code. Make sure OTP email is enabled in your Supabase project (Authentication → Email → Enable OTP).</p>
            <form onSubmit={handleOTPSend} className="login-form">
              <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? t('sending') : t('send_otp')}
              </button>
            </form>
            <p className="login-switch"><button onClick={() => go(VIEWS.SIGN_IN)}>← {t('back_signin')}</button></p>
          </>
        )}

        {/* ── OTP VERIFY ── */}
        {view === VIEWS.OTP_VERIFY && (
          <>
            <h2 className="login-heading">{t('enter_otp')}</h2>
            <p className="login-desc">Check your email for a <strong>6-digit OTP code</strong> and enter it below.</p>
            <form onSubmit={handleOTPVerify} className="login-form">
              <input
                type="text" placeholder="Enter 6-digit OTP"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6} inputMode="numeric" pattern="[0-9]{6}" required
              />
              <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
                {loading ? t('verifying') : t('verify_otp')}
              </button>
            </form>
            <p className="login-switch">
              <button onClick={() => go(VIEWS.OTP_SEND)}>{t('resend_otp')}</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
