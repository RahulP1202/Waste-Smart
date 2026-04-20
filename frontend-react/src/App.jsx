import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from './lib/supabase'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Landing from './pages/Landing'
import ScanAnalyze from './pages/ScanAnalyze'
import Chatbot from './pages/Chatbot'
import History from './pages/History'
import SmartTips from './pages/SmartTips'
import BarcodeScanner from './pages/BarcodeScanner'
import Learn from './pages/Learn'
import Find from './pages/Find'
import Community from './pages/Community'
import ComingSoon from './pages/ComingSoon'
import Quiz from './pages/Quiz'
import Shop from './pages/Shop'
import Admin from './pages/Admin'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

// Mock session for demo when Supabase is not configured
const DEMO_SESSION = {
  user: {
    id: 'demo-user-00000000-0000-0000-0000-000000000000',
    email: 'demo@wastesmart.app',
    user_metadata: { full_name: 'Demo User' }
  }
}

export default function App() {
  const [session, setSession] = useState(undefined)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      // No Supabase config — run in demo mode, skip login
      setSession(DEMO_SESSION)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (showWelcome) return <Welcome onDone={() => setShowWelcome(false)} />
  if (session === undefined) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={<ProtectedRoute session={session}><Landing session={session} /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute session={session}><ScanAnalyze session={session} /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute session={session}><Chatbot session={session} /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute session={session}><History session={session} /></ProtectedRoute>} />
        <Route path="/tips" element={<ProtectedRoute session={session}><SmartTips /></ProtectedRoute>} />
        <Route path="/blogs" element={<Navigate to="/tips" replace />} />
        <Route path="/quiz" element={<ProtectedRoute session={session}><Quiz session={session} /></ProtectedRoute>} />
        <Route path="/barcode" element={<ProtectedRoute session={session}><BarcodeScanner /></ProtectedRoute>} />
        <Route path="/find" element={<ProtectedRoute session={session}><Find session={session} /></ProtectedRoute>} />
        <Route path="/marketplace" element={<Navigate to="/find" replace />} />
        <Route path="/learn" element={<ProtectedRoute session={session}><Learn /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute session={session}><Community session={session} /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute session={session}><Shop session={session} /></ProtectedRoute>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
