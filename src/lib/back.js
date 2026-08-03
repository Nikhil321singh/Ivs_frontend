import { ROUTES } from '../constants/routes'

// Screens that are a "root" of a flow — pressing back here should NOT crawl
// further up the history stack (which on Android would exit the app or land on
// Splash). From these we either exit the app (hardware back) or go Home.
export const ROOT_ROUTES = [ROUTES.splash, ROUTES.login, ROUTES.home]

// React Router (v6) stamps each history entry with an incrementing `idx`. If
// idx is 0 we're at the very first entry, so there's nothing to go back to and
// `navigate(-1)` would fall through to a raw history.back() → app exit / blank.
export function canGoBack() {
  return (window.history.state?.idx ?? 0) > 0
}

// The current hash route (HashRouter), read live so it's safe inside stale
// event-listener closures.
export function currentPath() {
  return window.location.hash.replace(/^#/, '').split('?')[0] || ROUTES.splash
}

// Shared "go back" used by both the in-app BackButton and the Android hardware
// back button. `to` forces an explicit target; otherwise step back if we can,
// else fall back Home so we never strand the user on the Splash catch-all.
export function goBack(navigate, to) {
  if (to) return navigate(to)
  if (canGoBack()) return navigate(-1)
  return navigate(ROUTES.home)
}
