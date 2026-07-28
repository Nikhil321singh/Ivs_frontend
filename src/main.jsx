import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
// Bundle Inter locally (offline-safe for the Capacitor WebView; no CDN dependency)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
// Spline Sans — used on the newer Figma screens (Record History, Profile)
import '@fontsource/spline-sans/400.css'
import '@fontsource/spline-sans/500.css'
import '@fontsource/spline-sans/600.css'
import '@fontsource/spline-sans/700.css'
import './index.css'

// HashRouter: routes resolve from a URL fragment, so navigation works inside
// Capacitor's WebView (file:// origin) without server-side route handling.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
