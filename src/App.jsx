import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Preferences } from '@capacitor/preferences'
import { ROUTES } from './constants/routes'
import { useAuth } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Otp from './pages/Otp'
import Register from './pages/Register'
import Home from './pages/Home'
import RecordHistory from './pages/RecordHistory'
import Profile from './pages/Profile'
import ProfileEdit, { RESUME_KEY } from './pages/ProfileEdit'
import ImeiEnter from './pages/ImeiEnter'
import Payment20 from './pages/Payment20'
import ImeiResult from './pages/ImeiResult'
import Diagnose from './pages/Diagnose'
import Payment50 from './pages/Payment50'
import DiagnoseScan from './pages/DiagnoseScan'
import DiagnoseReport from './pages/DiagnoseReport'
import Aadhaar from './pages/Aadhaar'
import AadhaarOtp from './pages/AadhaarOtp'
import Wallet from './pages/Wallet'
import Privacy from './pages/Privacy'
import Help from './pages/Help'
import TradeInQuote from './pages/TradeInQuote'
import CustomerDetail from './pages/CustomerDetail'
import Verifications from './pages/Verifications'
import SignSell from './pages/SignSell'
import ComingSoon from './pages/ComingSoon'

// If the app was killed while the ProfileEdit screen had the OS camera/gallery
// open (common on low-RAM devices — see ProfileEdit), it cold-starts back at the
// initial route and would strand the user on the wrong screen. When that resume
// flag is set, send them straight back to Edit (fields restored from the draft)
// once auth has resolved. Runs once per launch.
function ResumeGuard() {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handled = useRef(false)

  useEffect(() => {
    if (loading || handled.current) return
    handled.current = true
    if (!isAuthenticated) return
    // Resume record lives in native storage so it survives an OS process kill.
    Preferences.get({ key: RESUME_KEY }).then(({ value }) => {
      if (value && location.pathname !== ROUTES.profileEdit) {
        navigate(ROUTES.profileEdit, { replace: true })
      }
    })
  }, [loading, isAuthenticated, navigate, location.pathname])

  return null
}

// Gate for screens that need a logged-in user. While the initial /auth/profile
// check is in flight we render nothing (avoids a login flash on reload).
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  return children
}

// Routes are added screen-by-screen as each page is built and confirmed.
export default function App() {
  const location = useLocation()
  return (
    <>
    <ResumeGuard />
    {/* Inner boundary keyed on the route: a crash on one screen shows the
        fallback but clears itself once the user navigates elsewhere. */}
    <ErrorBoundary resetKey={location.pathname}>
    <Routes>
      <Route path={ROUTES.splash} element={<Splash />} />
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.otp} element={<Otp />} />
      <Route
        path={ROUTES.register}
        element={
          <RequireAuth>
            <Register />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.home}
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.records}
        element={
          <RequireAuth>
            <RecordHistory />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.profile}
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTES.profileEdit}
        element={
          <RequireAuth>
            <ProfileEdit />
          </RequireAuth>
        }
      />
      {/* IMEI verification (₹20) */}
      <Route path={ROUTES.imeiEnter} element={<RequireAuth><ImeiEnter /></RequireAuth>} />
      <Route path={ROUTES.payment20} element={<RequireAuth><Payment20 /></RequireAuth>} />
      <Route path={ROUTES.imeiResult} element={<RequireAuth><ImeiResult /></RequireAuth>} />
      {/* Diagnosis (₹50) */}
      <Route path={ROUTES.diagnose} element={<RequireAuth><Diagnose /></RequireAuth>} />
      <Route path={ROUTES.payment50} element={<RequireAuth><Payment50 /></RequireAuth>} />
      <Route path={ROUTES.diagnoseScan} element={<RequireAuth><DiagnoseScan /></RequireAuth>} />
      <Route path={ROUTES.diagnoseReport} element={<RequireAuth><DiagnoseReport /></RequireAuth>} />
      {/* Aadhaar + IMEI (₹5) */}
      <Route path={ROUTES.aadhaar} element={<RequireAuth><Aadhaar /></RequireAuth>} />
      <Route path={ROUTES.aadhaarOtp} element={<RequireAuth><AadhaarOtp /></RequireAuth>} />
      {/* Wallet / Credits */}
      <Route path={ROUTES.wallet} element={<RequireAuth><Wallet /></RequireAuth>} />
      {/* Coming soon (Diagnose / Payment / Check Device Price — not in this release) */}
      <Route path={ROUTES.comingSoon} element={<RequireAuth><ComingSoon /></RequireAuth>} />
      {/* Profile sub-pages */}
      <Route path={ROUTES.privacy} element={<RequireAuth><Privacy /></RequireAuth>} />
      <Route path={ROUTES.help} element={<RequireAuth><Help /></RequireAuth>} />
      {/* Trade-in / device price */}
      <Route path={ROUTES.tradeIn} element={<RequireAuth><TradeInQuote /></RequireAuth>} />
      <Route path={ROUTES.tradeInDetails} element={<RequireAuth><CustomerDetail /></RequireAuth>} />
      <Route path={ROUTES.tradeInVerify} element={<RequireAuth><Verifications /></RequireAuth>} />
      <Route path={ROUTES.tradeInSign} element={<RequireAuth><SignSell /></RequireAuth>} />
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
    </ErrorBoundary>
    </>
  )
}
