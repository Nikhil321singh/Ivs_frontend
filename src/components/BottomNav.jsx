import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

const ITEMS = [
  { key: 'home', label: 'Home', icon: '/assets/icons/ic-nav-home.svg', route: ROUTES.home },
  { key: 'records', label: 'Records', icon: '/assets/icons/ic-nav-records.svg', route: ROUTES.records },
  { key: 'account', label: 'Account', icon: '/assets/icons/ic-nav-account.svg', route: ROUTES.profile },
]

// Bottom navigation. Icons rendered as CSS masks so the active tab recolors to primary
// (reusable across Home/Records/Account). Pinned; adds the bottom safe-area inset.
export default function BottomNav({ active = 'home' }) {
  const navigate = useNavigate()
  return (
    <nav
      className="flex w-full shrink-0 items-center justify-between border-t border-line bg-white px-12 pt-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      {ITEMS.map((it) => {
        const on = it.key === active
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => it.route && navigate(it.route)}
            className="flex min-h-[44px] flex-col items-center justify-center gap-[5px] transition active:scale-90"
          >
            <span
              aria-hidden="true"
              className={`h-[22px] w-[22px] ${on ? 'bg-primary' : 'bg-muted'}`}
              style={{
                maskImage: `url(${it.icon})`,
                WebkitMaskImage: `url(${it.icon})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
              }}
            />
            <span className={`text-[11px] ${on ? 'font-semibold text-primary' : 'font-medium text-muted'}`}>
              {it.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
