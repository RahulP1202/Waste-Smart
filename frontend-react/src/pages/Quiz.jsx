import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import RecycleLogo from '../components/RecycleLogo'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { getDailyQuestions } from '../data/quizQuestions'
import './Quiz.css'

const TOTAL = 10
const TIME_PER_Q = 20

function RankBadge({ rank }) {
  if (rank === 1) return <span className="quiz-rank-badge gold">1</span>
  if (rank === 2) return <span className="quiz-rank-badge silver">2</span>
  if (rank === 3) return <span className="quiz-rank-badge bronze">3</span>
  return <span className="quiz-rank-num">#{rank}</span>
}

export default function Quiz({ session }) {
  const navigate = useNavigate()
  const { lang } = useApp()
  const [questions, setQuestions] = useState(() => getDailyQuestions(lang))
  const [view, setView] = useState('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q)
  const [answers, setAnswers] = useState([])
  const [startTime, setStartTime] = useState(null)
  const [totalTime, setTotalTime] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef(null)
  const finalScoreRef = useRef(0)
  const finalTimeRef = useRef(0)

  const [saveError, setSaveError] = useState('')

  // Reload questions when language changes
  useEffect(() => {
    setQuestions(getDailyQuestions(lang))
  }, [lang])

  const userName = session?.user?.user_metadata?.full_name
    || session?.user?.email?.split('@')[0] || 'Player'
  const userId = session?.user?.id

  useEffect(() => {
    if (view !== 'quiz' || answered) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleAnswer(null); return TIME_PER_Q }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [view, current, answered])

  function startQuiz() {
    setCurrent(0); setScore(0); setAnswers([])
    setSelected(null); setAnswered(false)
    setTimeLeft(TIME_PER_Q)
    setStartTime(Date.now()); setSubmitted(false)
    finalScoreRef.current = 0
    finalTimeRef.current = 0
    setView('quiz')
  }

  function handleAnswer(optionIdx) {
    if (answered) return
    clearInterval(timerRef.current)
    const q = questions[current]
    const correct = optionIdx === q.answer
    setSelected(optionIdx)
    setAnswered(true)
    if (correct) {
      setScore(s => s + 1)
      finalScoreRef.current += 1
    }
    setAnswers(a => [...a, { correct, selected: optionIdx }])
  }

  function nextQuestion() {
    if (current + 1 >= TOTAL) {
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      finalTimeRef.current = elapsed
      setTotalTime(elapsed)
      setView('result')
      // Submit first, then load leaderboard after insert completes
      submitScore(finalScoreRef.current, elapsed).then(() => {
        loadLeaderboard()
      })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      setTimeLeft(TIME_PER_Q)
    }
  }

  async function submitScore(finalScore, timeTaken) {
    if (submitted || submitting) return
    if (!supabaseConfigured || !supabase) {
      console.log('Supabase not configured — score not saved')
      return
    }
    if (!userId || userId.startsWith('demo-')) {
      console.log('No real user session — score not saved. userId:', userId)
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('quiz_scores').insert({
        user_id: userId,
        user_name: userName,
        score: finalScore,
        total: TOTAL,
        time_taken: timeTaken,
        quiz_date: new Date().toISOString().split('T')[0]
      })
      if (error) {
        console.error('Quiz score insert error:', JSON.stringify(error))
        setSaveError(error.message || JSON.stringify(error))
      } else {
        console.log('Quiz score saved! score:', finalScore, 'user:', userName)
        setSubmitted(true)
        setSaveError('')
      }
    } catch (e) {
      console.error('Quiz score exception:', e)
    }
    setSubmitting(false)
  }

  async function loadLeaderboard() {
    setLbLoading(true)
    if (!supabaseConfigured) {
      // Only show demo data when Supabase is not configured at all
      setLeaderboard(DEMO_LB)
      setLbLoading(false)
      return
    }
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('user_name, score, total, time_taken')
        .eq('quiz_date', today)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true })
        .limit(20)
      if (error) console.error('Leaderboard fetch error:', error)
      // Show real data (even if empty) — no fake demo data when Supabase is configured
      setLeaderboard(data || [])
    } catch (e) { console.error(e) }
    setLbLoading(false)
  }

  const q = questions[current]
  const pct = Math.round((score / TOTAL) * 100)
  const timerPct = (timeLeft / TIME_PER_Q) * 100

  return (
    <div className="quiz-root">

      {/* Topbar */}
      <div className="quiz-topbar">
        <button className="scan-back" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {lang === 'kn' ? 'ಹಿಂದೆ' : 'Back'}
        </button>
        <div className="quiz-topbar-brand">
          <RecycleLogo size={20}/>
          <span>{lang === 'kn' ? 'ದೈನಂದಿನ ರಸಪ್ರಶ್ನೆ' : 'Daily Quiz'}</span>
        </div>
        <button className="quiz-lb-topbtn" onClick={() => { loadLeaderboard(); setView('leaderboard') }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/>
          </svg>
          {lang === 'kn' ? 'ಲೀಡರ್‌ಬೋರ್ಡ್' : 'Leaderboard'}
        </button>
      </div>

      {/* ── INTRO ── */}
      {view === 'intro' && (
        <div className="quiz-intro">
          <div className="quiz-intro-banner">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=85"
              alt="Quiz"
              className="quiz-intro-banner-img"
            />
            <div className="quiz-intro-banner-overlay"/>
            <div className="quiz-intro-banner-text">
              <p className="quiz-intro-tag">{lang === 'kn' ? 'ದೈನಂದಿನ ಸವಾಲು' : 'Daily Challenge'}</p>
              <h1>{lang === 'kn' ? 'ಪರಿಸರ ರಸಪ್ರಶ್ನೆ' : 'Eco Knowledge Quiz'}</h1>
              <p className="quiz-intro-sub">
                {lang === 'kn'
                  ? 'ಪ್ರತಿ ದಿನ 10 ಹೊಸ ಪ್ರಶ್ನೆಗಳು — ಉತ್ತರಿಸಿ, ಅಂಕ ಗಳಿಸಿ, ಲೀಡರ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಮೇಲೇರಿ'
                  : '10 fresh questions every day — answer fast, score high, top the board'}
              </p>
            </div>
          </div>

          <div className="quiz-intro-body">
            <div className="quiz-stats-row">
              <div className="quiz-stat-box">
                <strong>{TOTAL}</strong>
                <span>{lang === 'kn' ? 'ಪ್ರಶ್ನೆಗಳು' : 'Questions'}</span>
              </div>
              <div className="quiz-stat-divider"/>
              <div className="quiz-stat-box">
                <strong>{TIME_PER_Q}s</strong>
                <span>{lang === 'kn' ? 'ಪ್ರತಿ ಪ್ರಶ್ನೆಗೆ' : 'Per question'}</span>
              </div>
              <div className="quiz-stat-divider"/>
              <div className="quiz-stat-box">
                <strong>{lang === 'kn' ? 'ಲೈವ್' : 'Live'}</strong>
                <span>{lang === 'kn' ? 'ಲೀಡರ್‌ಬೋರ್ಡ್' : 'Leaderboard'}</span>
              </div>
              <div className="quiz-stat-divider"/>
              <div className="quiz-stat-box">
                <strong>{lang === 'kn' ? 'ದೈನಂದಿನ' : 'Daily'}</strong>
                <span>{lang === 'kn' ? 'ಹೊಸ ಸೆಟ್' : 'New set'}</span>
              </div>
            </div>

            <div className="quiz-how-grid">
              <div className="quiz-how-item">
                <div className="quiz-how-num">01</div>
                <p>{lang === 'kn' ? 'ಪ್ರಶ್ನೆ ಓದಿ ಮತ್ತು ಚಿತ್ರ ನೋಡಿ' : 'Read the question and study the image'}</p>
              </div>
              <div className="quiz-how-item">
                <div className="quiz-how-num">02</div>
                <p>{lang === 'kn' ? '20 ಸೆಕೆಂಡ್‌ನಲ್ಲಿ ಉತ್ತರ ಆರಿಸಿ' : 'Pick your answer within 20 seconds'}</p>
              </div>
              <div className="quiz-how-item">
                <div className="quiz-how-num">03</div>
                <p>{lang === 'kn' ? 'ವಿವರಣೆ ಓದಿ ಕಲಿಯಿರಿ' : 'Read the explanation and learn'}</p>
              </div>
              <div className="quiz-how-item">
                <div className="quiz-how-num">04</div>
                <p>{lang === 'kn' ? 'ಸ್ಕೋರ್ ಉಳಿಸಿ ಲೀಡರ್‌ಬೋರ್ಡ್ ಏರಿ' : 'Save your score and climb the board'}</p>
              </div>
            </div>

            <button className="quiz-cta-btn" onClick={startQuiz}>
              {lang === 'kn' ? 'ಪ್ರಾರಂಭಿಸಿ' : 'Start Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {view === 'quiz' && (
        <div className="quiz-play">

          {/* Top progress strip */}
          <div className="quiz-top-strip">
            <span className="quiz-q-count">{lang === 'kn' ? 'ಪ್ರಶ್ನೆ' : 'Question'} {current + 1} / {TOTAL}</span>
            <div className="quiz-progress-track">
              <div className="quiz-progress-fill" style={{ width: `${((current + 1) / TOTAL) * 100}%` }}/>
            </div>
            <span className={`quiz-timer-label ${timeLeft <= 5 ? 'danger' : timeLeft <= 10 ? 'warn' : ''}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Timer bar */}
          <div className="quiz-timer-track">
            <div
              className="quiz-timer-fill"
              style={{
                width: `${timerPct}%`,
                background: timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : 'var(--green)'
              }}
            />
          </div>

          {/* Question card */}
          <div className="quiz-card">
            {/* Full image at top of card */}
            <div className="quiz-card-img-wrap">
              <img src={q.image} alt="" className="quiz-card-img" loading="lazy"/>
            </div>

            {/* Question text */}
            <div className="quiz-card-body">
              <p className="quiz-q-text">{q.question}</p>

              {/* Options */}
              <div className="quiz-options">
                {q.options.map((opt, i) => {
                  let cls = 'quiz-option'
                  if (answered) {
                    if (i === q.answer) cls += ' correct'
                    else if (i === selected) cls += ' wrong'
                    else cls += ' dimmed'
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
                      <span className="quiz-opt-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="quiz-opt-text">{opt}</span>
                      {answered && i === q.answer && (
                        <svg className="quiz-opt-icon correct-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {answered && i === selected && i !== q.answer && (
                        <svg className="quiz-opt-icon wrong-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {answered && (
                <div className={`quiz-explanation ${selected === q.answer ? 'correct' : 'wrong'}`}>
                  <p className="quiz-exp-label">
                    {selected === q.answer
                      ? (lang === 'kn' ? 'ಸರಿಯಾದ ಉತ್ತರ' : 'Correct')
                      : (lang === 'kn' ? 'ತಪ್ಪು ಉತ್ತರ' : 'Incorrect')}
                  </p>
                  <p className="quiz-exp-text">{q.explanation}</p>
                  <button className="quiz-next-btn" onClick={nextQuestion}>
                    {current + 1 >= TOTAL
                      ? (lang === 'kn' ? 'ಫಲಿತಾಂಶ ನೋಡಿ' : 'See Results')
                      : (lang === 'kn' ? 'ಮುಂದಿನ ಪ್ರಶ್ನೆ' : 'Next Question')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {view === 'result' && (
        <div className="quiz-result">
          <div className="quiz-result-banner" style={{
            background: pct >= 80
              ? 'linear-gradient(135deg, #052e16 0%, #065f46 100%)'
              : pct >= 50
              ? 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)'
              : 'linear-gradient(135deg, #1c1917 0%, #44403c 100%)'
          }}>
            <p className="quiz-result-label">
              {pct >= 80
                ? (lang === 'kn' ? 'ಅದ್ಭುತ ಪ್ರದರ್ಶನ' : 'Outstanding')
                : pct >= 50
                ? (lang === 'kn' ? 'ಚೆನ್ನಾಗಿ ಮಾಡಿದ್ದೀರಿ' : 'Good effort')
                : (lang === 'kn' ? 'ಇನ್ನಷ್ಟು ಕಲಿಯಿರಿ' : 'Keep learning')}
            </p>
            <div className="quiz-score-display">
              <span className="quiz-score-num">{score}</span>
              <span className="quiz-score-denom">/ {TOTAL}</span>
            </div>
            <p className="quiz-score-meta">{pct}% correct &nbsp;·&nbsp; {totalTime}s</p>
          </div>

          <div className="quiz-result-body">
            <h3 className="quiz-section-title">{lang === 'kn' ? 'ಉತ್ತರ ವಿಮರ್ಶೆ' : 'Answer Review'}</h3>
            <div className="quiz-review-list">
              {answers.map((a, i) => (
                <div key={i} className={`quiz-review-row ${a.correct ? 'correct' : 'wrong'}`}>
                  <span className="quiz-review-num">{i + 1}</span>
                  <span className="quiz-review-q">{questions[i].question}</span>
                  <span className={`quiz-review-dot ${a.correct ? 'correct' : 'wrong'}`}/>
                </div>
              ))}
            </div>

            <div className="quiz-result-actions">
              <button className="quiz-cta-btn" onClick={startQuiz}>
                {lang === 'kn' ? 'ಮತ್ತೆ ಆಡಿ' : 'Play Again'}
              </button>
              <button className="quiz-outline-btn" onClick={() => { loadLeaderboard(); setView('leaderboard') }}>
                {lang === 'kn' ? 'ಲೀಡರ್‌ಬೋರ್ಡ್' : 'Leaderboard'}
              </button>
            </div>

            {!supabaseConfigured && (
              <p className="quiz-demo-note">
                {lang === 'kn'
                  ? 'Supabase ಸಂಪರ್ಕಿಸಿ ಸ್ಕೋರ್ ಉಳಿಸಲು'
                  : 'Connect Supabase to save scores and compete on the leaderboard.'}
              </p>
            )}
            {supabaseConfigured && !userId && (
              <p className="quiz-demo-note">
                {lang === 'kn'
                  ? 'ಸ್ಕೋರ್ ಉಳಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ'
                  : 'Log in to save your score to the leaderboard.'}
              </p>
            )}
            {supabaseConfigured && userId && !userId.startsWith('demo-') && submitted && (
              <p className="quiz-demo-note" style={{ color: '#10b981' }}>
                {lang === 'kn' ? '✓ ಸ್ಕೋರ್ ಉಳಿಸಲಾಗಿದೆ!' : '✓ Score saved to leaderboard!'}
              </p>
            )}
            {supabaseConfigured && userId && !userId.startsWith('demo-') && submitting && (
              <p className="quiz-demo-note">
                {lang === 'kn' ? 'ಸ್ಕೋರ್ ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'Saving score...'}
              </p>
            )}
            {saveError && (
              <p className="quiz-demo-note" style={{ color: '#ef4444' }}>
                Save error: {saveError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── LEADERBOARD ── */}
      {view === 'leaderboard' && (
        <div className="quiz-lb-page">
          <div className="quiz-lb-header">
            <h2>{lang === 'kn' ? 'ಇಂದಿನ ಲೀಡರ್‌ಬೋರ್ಡ್' : "Today's Leaderboard"}</h2>
            <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>

          {lbLoading ? (
            <div className="quiz-lb-loading">
              <div className="spinner"><div/><div/><div/></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="quiz-lb-empty">
              <p className="quiz-lb-empty-title">{lang === 'kn' ? 'ಇನ್ನೂ ಯಾರೂ ಆಡಿಲ್ಲ' : 'No scores yet today'}</p>
              <p className="quiz-lb-empty-sub">{lang === 'kn' ? 'ಮೊದಲಿಗರಾಗಿ!' : 'Be the first to play!'}</p>
              <button className="quiz-cta-btn" onClick={startQuiz}>
                {lang === 'kn' ? 'ಈಗ ಆಡಿ' : 'Play Now'}
              </button>
            </div>
          ) : (
            <div className="quiz-lb-list">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`quiz-lb-row ${entry.user_name === userName ? 'mine' : ''}`}>
                  <RankBadge rank={i + 1}/>
                  <div className="quiz-lb-info">
                    <span className="quiz-lb-name">{entry.user_name}</span>
                    {entry.user_name === userName && (
                      <span className="quiz-lb-you">{lang === 'kn' ? 'ನೀವು' : 'You'}</span>
                    )}
                  </div>
                  <div className="quiz-lb-right">
                    <span className="quiz-lb-score">{entry.score}/{entry.total}</span>
                    <span className="quiz-lb-time">{entry.time_taken}s</span>
                  </div>
                  <div className="quiz-lb-bar-track">
                    <div className="quiz-lb-bar-fill" style={{ width: `${(entry.score / entry.total) * 100}%` }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="quiz-outline-btn" onClick={() => setView(answers.length > 0 ? 'result' : 'intro')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            {lang === 'kn' ? 'ಹಿಂದೆ' : 'Back'}
          </button>
        </div>
      )}
    </div>
  )
}

const DEMO_LB = [
  { user_name: 'Priya S', score: 9, total: 10, time_taken: 87 },
  { user_name: 'Rahul M', score: 8, total: 10, time_taken: 102 },
  { user_name: 'Ananya K', score: 7, total: 10, time_taken: 95 },
  { user_name: 'Kiran B', score: 6, total: 10, time_taken: 134 },
]
