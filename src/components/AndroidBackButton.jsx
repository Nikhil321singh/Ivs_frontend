import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { ROOT_ROUTES, canGoBack, currentPath } from '../lib/back'
import { ROUTES } from '../constants/routes'

// Handles the Android hardware back button. Without this, Capacitor's default
// runs a raw WebView history.back() — which exits the app on the first entry or
// dumps the user onto Splash. Here we route it through React Router instead:
//   • root screen (Splash/Login/Home) → minimise/exit the app
//   • have history          → step back one screen
//   • no history (deep link) → go Home
// Web build is a no-op (renders nothing, registers no listener).
export default function AndroidBackButton() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let handle
    CapApp.addListener('backButton', () => {
      if (ROOT_ROUTES.includes(currentPath())) {
        CapApp.exitApp()
      } else if (canGoBack()) {
        navigate(-1)
      } else {
        navigate(ROUTES.home)
      }
    }).then((h) => {
      handle = h
    })
    return () => handle?.remove()
  }, [navigate])

  return null
}
