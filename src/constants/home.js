import { ROUTES } from './routes'

// Mock content for the Home dashboard.
// `soon` = feature not shipping this release → routes to the Coming Soon placeholder,
// where `soon` is shown as the card label.
// Grid order matches Figma Home 7654:1983: Theft, Check Device Price / Payment, Diagnose.
export const ACTIONS = [
  { key: 'theft', label: 'Theft Verification', icon: 'ic-theft', route: ROUTES.imeiEnter },
  { key: 'price', label: 'Check Device Price', icon: 'ic-price', route: ROUTES.comingSoon, soon: 'Check your device' },
  { key: 'payment', label: 'Payment', icon: 'ic-payment', route: ROUTES.comingSoon, soon: 'Payment' },
  { key: 'diagnose', label: 'Diagnose', icon: 'ic-diagnose', route: ROUTES.comingSoon, soon: 'Diagnose' },
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
    route: ROUTES.comingSoon,
    soon: 'Diagnose',
  },
  {
    key: 'svc-price',
    title: 'Check your device price',
    sub: 'Secure, unrecoverable erase',
    icon: 'ic-svc-price',
    route: ROUTES.comingSoon,
    soon: 'Check your device',
  },
  {
    key: 'svc-aadhaar',
    title: 'Aadhaar + IMEI',
    sub: '₹5 · identity-linked record',
    icon: 'ic-svc-aadhaar',
    route: ROUTES.comingSoon,
    soon: 'Payment',
  },
]
