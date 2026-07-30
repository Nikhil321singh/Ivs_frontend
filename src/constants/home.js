import { ROUTES } from './routes'

// Mock content for the Home dashboard. `route: null` = no screen in scope (placeholder).
export const ACTIONS = [
  { key: 'theft', label: 'Theft Verification', icon: 'ic-theft', route: ROUTES.imeiEnter },
  { key: 'diagnose', label: 'Diagnose', icon: 'ic-diagnose', route: ROUTES.diagnose },
  { key: 'payment', label: 'Payment', icon: 'ic-payment', route: ROUTES.aadhaar },
  { key: 'price', label: 'Check Device Price', icon: 'ic-price', route: ROUTES.tradeIn },
]

export const SERVICES = [
  {
    key: 'svc-theft',
    title: 'What is theft verification',
    sub: '₹20 · instant verification',
    icon: 'ic-svc-theft',
    route: ROUTES.imeiEnter,
  },
  {
    key: 'svc-diag',
    title: 'What is full diagnosis',
    sub: '₹50 · complete hardware report',
    icon: 'ic-svc-diagnosis',
    route: ROUTES.diagnose,
  },
  {
    key: 'svc-price',
    title: 'Check your device price',
    sub: 'Instant trade-in quote',
    icon: 'ic-svc-price',
    route: ROUTES.tradeIn,
  },
  {
    key: 'svc-aadhaar',
    title: 'Aadhaar + IMEI',
    sub: '₹5 · identity-linked record',
    icon: 'ic-svc-aadhaar',
    route: ROUTES.aadhaar,
  },
]
