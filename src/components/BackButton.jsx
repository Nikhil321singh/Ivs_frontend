import { useNavigate } from 'react-router-dom'
import { goBack } from '../lib/back'

// 24px chevron-left with a 44px tap target (a11y). Defaults to a safe browser-back
// (steps back if there's history, else falls Home so it never strands the user on
// the Splash catch-all); pass `to` for an explicit route.
export default function BackButton({ to, className = '', onClick }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => {
        onClick?.()
        goBack(navigate, to)
      }}
      className={`-m-2.5 flex h-11 w-11 items-center justify-center p-2.5 ${className}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 18l-6-6 6-6"
          stroke="#17171C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
