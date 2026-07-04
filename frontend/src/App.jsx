import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './contexts/UserContext'
import Layout from './components/Layout'
import OnboardingPage from './pages/OnboardingPage'
import ProfileModal from './components/ProfileModal'
import HomePage from './pages/HomePage'
import ProblemBankPage from './pages/ProblemBankPage'
import BankProblemPage from './pages/BankProblemPage'
import SolvePage from './pages/SolvePage'
import SavedPage from './pages/SavedPage'
import AptitudePage from './pages/AptitudePage'

function AppRoutes() {
  const { profile, editing } = useUser()

  // Still loading from localStorage / DB
  if (profile === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080909' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#E8C547', boxShadow: '0 4px 20px rgba(232,197,71,0.3)' }}>
            <svg className="w-5 h-5 animate-pulse" style={{ color: '#080909' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: '#374151' }}>Loading AlgoLens...</p>
        </div>
      </div>
    )
  }

  // First visit — show full-screen onboarding
  if (profile === false) {
    return <OnboardingPage />
  }

  // Has profile — show app + optional edit modal on top
  return (
    <BrowserRouter>
      {editing && <ProfileModal />}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="problems" element={<ProblemBankPage />} />
          <Route path="problems/:problemId" element={<BankProblemPage />} />
          <Route path="solve" element={<SolvePage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="aptitude" element={<AptitudePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  )
}
