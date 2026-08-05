import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { toPhone } from '../utils/format'

// `soon` = feature not shipping this release → routes to the Coming Soon placeholder.
const SERVICES = [
  { key: 'theft', label: 'Theft Verification', icon: 'ic-menu-theft', route: ROUTES.imeiEnter },
  { key: 'diagnose', label: 'Diagnose', icon: 'ic-menu-diagnose', route: ROUTES.comingSoon, soon: 'Diagnose' },
  { key: 'price', label: 'Check Device Price', icon: 'ic-menu-free', route: ROUTES.comingSoon, soon: 'Check your device' },
  { key: 'payment', label: 'Payment', icon: 'ic-menu-payment', route: ROUTES.comingSoon, soon: 'Payment' },
  { key: 'credits', label: 'Credits', icon: 'ic-menu-payment', route: ROUTES.wallet },
]

// Half-width, full-height side drawer (sidebar) overlaying Home. Figma: Hamburger Menu
// 7655:1979. Slides in from the left; backdrop + X close it. Frontend only.
export default function MenuSheet({ open, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const goto = (route, feature) => () => {
    onClose()
    if (route) navigate(route, { state: { feature } })
  }
  const onLogout = async () => {
    onClose()
    await logout()
    navigate(ROUTES.splash, { replace: true })
  }
  const displayName = user?.name || user?.companyName || 'Grest user'
  const displayMobile = user?.mobile ? `+91 ${toPhone(user.mobile)}` : ''
  const initials =
    displayName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GS'

  return (
    <div
      className={`absolute inset-0 z-50 overscroll-contain ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* backdrop — touch-action none blocks the background from scrolling behind it */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        style={{ touchAction: 'none' }}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* sidebar — half width, full height */}
      <div
        className={`absolute inset-y-0 left-0 flex w-1/2 min-w-[248px] flex-col rounded-r-[24px] shadow-sheet transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundImage: 'linear-gradient(169.36deg, #EFEDEE 9.82%, #FFFFFF 144.89%)' }}
      >
        {/* single scroll region: the menu scrolls internally; overscroll-contain keeps it
            from chaining to the frozen Home behind it */}
        <div
          className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4"
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          }}
        >
          <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-bold text-ink">Menu</h2>
            <button type="button" aria-label="Close" onClick={onClose} className="-m-2 p-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="#17171C" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* user card */}
          <div className="flex flex-col items-start gap-2.5 rounded-[16px] border-[1.5px] border-line bg-white p-3.5">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-secondary text-[18px] font-bold text-white">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[15px] font-semibold text-ink">{displayName}</span>
              {displayMobile && (
                <span className="text-[12px] font-normal text-muted">{displayMobile}</span>
              )}
            </div>
          </div>

          <p className="text-[13px] font-medium text-muted">Services</p>

          <div className="flex flex-col gap-2.5">
            {SERVICES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={goto(s.route, s.soon)}
                className="flex w-full items-center gap-2.5 rounded-[14px] border-[1.5px] border-line bg-white p-3 text-left transition duration-150 active:scale-[0.98] active:bg-field"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-indigo-subtle">
                  <img src={`/assets/icons/${s.icon}.svg`} alt="" aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1 text-[14px] font-semibold leading-tight text-ink">
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          </div>

          {/* bottom actions — sit at the bottom when short, scroll with the rest when tall */}
          <div className="mt-auto flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={goto(ROUTES.profile)}
              className="flex w-full items-center gap-2.5 rounded-[14px] bg-indigo-subtle px-3.5 py-3 transition duration-150 active:scale-[0.98] active:opacity-80"
            >
              <img src="/assets/icons/ic-menu-delete.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="text-[14px] font-semibold text-secondary">Delete Account</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-3 transition duration-150 active:scale-[0.98] active:bg-field"
            >
              <img src="/assets/icons/ic-menu-logout.svg" alt="" aria-hidden="true" className="h-5 w-5 shrink-0" />
              <span className="text-[14px] font-semibold text-primary">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
