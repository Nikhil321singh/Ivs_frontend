import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'
import ActionCard from '../components/ActionCard'
import ServiceRow from '../components/ServiceRow'
import MenuSheet from '../components/MenuSheet'
import { ACTIONS, SERVICES } from '../constants/home'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'

// Figma: Home 7654:1983 — header (greeting + KYC pill + hamburger), action grid (2x2),
// Services list, pinned bottom nav. Hamburger opens the half-screen MenuSheet overlay.
export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const go = (route) => () => (route ? navigate(route) : undefined)

  const firstName = (user?.name || user?.companyName || '').split(' ')[0]

  return (
    <PhoneFrame
      scroll={false}
      bg="bg-screen-grad"
      overlay={<MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />}
    >
      <div
        className={`no-scrollbar min-h-0 flex-1 space-y-5 px-6 pb-4 pt-3.5 ${
          menuOpen ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        {/* header */}
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-h1 font-bold text-ink">Hello{firstName ? `, ${firstName}` : ''}</h1>
            {user?.kycCompleted ? (
              <span className="flex items-center gap-1.5 self-start rounded-[20px] bg-white py-[5px] pl-2.5 pr-3">
                <img src="/assets/icons/ic-check.svg" alt="" aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold text-primary">KYC verified — full access</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => navigate(ROUTES.register)}
                className="flex items-center gap-1.5 self-start rounded-[20px] bg-white py-[5px] pl-2.5 pr-3"
              >
                <span className="text-[11px] font-semibold text-primary">Complete KYC →</span>
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-[13px] border-[1.5px] border-line bg-white transition active:scale-95 active:bg-field"
          >
            <img src="/assets/icons/ic-menu.svg" alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
          </button>
        </header>

        <p className="text-[14px] font-normal text-ink">What would you like to do today?</p>

        {/* 2x2 action grid */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            {ACTIONS.slice(0, 2).map((a) => (
              <ActionCard key={a.key} icon={a.icon} label={a.label} onClick={go(a.route)} />
            ))}
          </div>
          <div className="flex gap-4">
            {ACTIONS.slice(2, 4).map((a) => (
              <ActionCard key={a.key} icon={a.icon} label={a.label} onClick={go(a.route)} />
            ))}
          </div>
        </div>

        <h2 className="text-[15px] font-semibold text-ink">Services</h2>

        {/* services list */}
        <div className="flex flex-col gap-2.5">
          {SERVICES.map((s) => (
            <ServiceRow key={s.key} icon={s.icon} title={s.title} sub={s.sub} onClick={go(s.route)} />
          ))}
        </div>
      </div>

      <BottomNav active="home" />
    </PhoneFrame>
  )
}
