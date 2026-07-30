import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PhoneFrame from '../components/PhoneFrame'
import BottomNav from '../components/BottomNav'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../context/AuthContext'
import { toPhone } from '../utils/format'

// Account menu. `route` rows navigate; the rest are informational placeholders
// (no backend for policy/help pages yet).
const MENU = [
  { key: 'settings', label: 'Account settings', icon: 'ic-settings', route: ROUTES.profileEdit },
  { key: 'credits', label: 'Credits & tokens', icon: 'ic-payment', route: ROUTES.wallet },
  { key: 'privacy', label: 'Privacy Policy', icon: 'ic-privacy', route: ROUTES.privacy },
  { key: 'help', label: 'Help & support', icon: 'ic-help', route: ROUTES.help },
]

// Figma: Profile 7749:1984 — Account bottom-nav tab. Reads the live user from the
// auth context (re-fetched on mount), edits via the ProfileEdit screen.
export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Pull the freshest profile whenever this tab opens.
  useEffect(() => {
    refreshUser().catch(() => {})
  }, [refreshUser])

  const displayName = user?.name || user?.companyName || 'Grest user'
  const initials =
    displayName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'GS'
  const contact = [user?.email, user?.mobile ? `+91 ${toPhone(user.mobile)}` : null]
    .filter(Boolean)
    .join(' · ')
  const accountType = user?.userType === 'vendor' ? 'Vendor' : 'Individual'

  const onLogout = async () => {
    await logout()
    navigate(ROUTES.splash, { replace: true })
  }

  return (
    <PhoneFrame
      scroll={false}
      bg="bg-screen-grad"
      overlay={
        confirmDelete && (
          <div className="absolute inset-0 z-50 flex items-end">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setConfirmDelete(false)}
              className="absolute inset-0 bg-black/40"
            />
            <div className="relative flex w-full flex-col gap-3 rounded-t-[24px] bg-white px-6 pb-8 pt-6 font-spline shadow-sheet">
              <h2 className="text-[18px] font-bold text-ink">Delete account?</h2>
              <p className="text-[13px] font-normal text-muted">
                Account deletion isn't available in the app yet. To close your Grest account,
                contact support at support@grest.in and we'll process it for you.
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="mt-2 flex w-full items-center justify-center rounded-[14px] bg-primary py-[15px] text-[15px] font-semibold text-white transition active:scale-[0.98] active:bg-primary-press"
              >
                Got it
              </button>
            </div>
          </div>
        )
      }
    >
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-7 pt-3 font-spline">
        {/* header */}
        <header className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-ink">Profile</h1>
          <button
            type="button"
            aria-label="Edit profile"
            onClick={() => navigate(ROUTES.profileEdit)}
            className="flex h-[42px] w-[42px] items-center justify-center rounded-[11px] border-[1.5px] border-line bg-white transition active:scale-95 active:bg-field"
          >
            <img src="/assets/icons/ic-edit.svg" alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
          </button>
        </header>

        {/* profile card */}
        <div className="flex flex-col items-center gap-3.5 rounded-[18px] border-[1.5px] border-line bg-white px-[18px] py-[22px]">
          <div className="flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full bg-secondary font-sans text-[26px] font-bold text-white">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-[19px] font-bold text-ink">{displayName}</p>
            {contact && <p className="text-[13px] font-normal text-muted">{contact}</p>}
          </div>
          <div className="flex items-center gap-2">
            {user?.kycCompleted ? (
              <span className="flex items-center gap-[5px] rounded-[20px] bg-success-subtle py-[5px] pl-2.5 pr-3">
                <img src="/assets/icons/ic-kyc-check.svg" alt="" aria-hidden="true" className="h-[13px] w-[13px]" />
                <span className="text-[11px] font-semibold text-success">KYC verified</span>
              </span>
            ) : (
              <span className="rounded-[20px] bg-warning-subtle px-2.5 py-[5px] text-[11px] font-semibold text-warning">
                KYC pending
              </span>
            )}
            {user?.userType && (
              <span className="rounded-[20px] bg-indigo-subtle px-2.5 py-[5px] text-[11px] font-semibold text-secondary">
                {accountType}
              </span>
            )}
          </div>
        </div>

        {/* menu rows */}
        <div className="flex flex-col gap-2.5">
          {MENU.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => m.route && navigate(m.route)}
              className="flex w-full items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white p-3.5 text-left transition duration-150 active:scale-[0.98] active:bg-field"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-indigo-subtle">
                <img src={`/assets/icons/${m.icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
              </span>
              <span className="min-w-0 flex-1 text-[15px] font-semibold text-ink">{m.label}</span>
              <img src="/assets/icons/ic-chevron.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            </button>
          ))}
        </div>

        {/* log out / delete — pushed to the bottom */}
        <div className="mt-auto flex flex-col gap-4 pt-6">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[14px] bg-primary px-3.5 py-[15px] transition active:scale-[0.98] active:bg-primary-press"
          >
            <img src="/assets/icons/ic-logout-white.svg" alt="" aria-hidden="true" className="h-5 w-5" />
            <span className="text-[15px] font-semibold text-white">Log out</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center gap-3 rounded-[14px] border border-primary bg-white px-3.5 py-[15px] transition active:scale-[0.98] active:bg-danger-subtle"
          >
            <img src="/assets/icons/ic-delete.svg" alt="" aria-hidden="true" className="h-5 w-5" />
            <span className="text-[15px] font-semibold text-primary">Delete</span>
          </button>
        </div>
      </div>

      <BottomNav active="account" />
    </PhoneFrame>
  )
}
