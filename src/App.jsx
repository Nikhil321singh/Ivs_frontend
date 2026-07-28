import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import { useAuth } from './context/AuthContext'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Otp from './pages/Otp'
import Register from './pages/Register'
import Home from './pages/Home'
import RecordHistory from './pages/RecordHistory'
import Profile from './pages/Profile'
import ProfileEdit from './pages/ProfileEdit'

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
  return (
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
      <Route path="*" element={<Navigate to={ROUTES.splash} replace />} />
    </Routes>
  )
}
