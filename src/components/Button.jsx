// Primary / outline buttons. Tap target >= 44px (py16 + text). No hover-only styles;
// uses active: state for touch feedback.
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  pill = false,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center ${
        pill ? 'rounded-full' : 'rounded-btn'
      } bg-primary py-4 text-button font-semibold text-white transition active:scale-[0.98] active:bg-primary-press disabled:opacity-40 disabled:active:scale-100 ${className}`}
    >
      {children}
    </button>
  )
}

export function OutlineButton({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center rounded-btn border-1.5 border-secondary bg-white py-[15px] text-button font-semibold text-secondary transition active:scale-[0.98] active:bg-indigo-subtle ${className}`}
    >
      {children}
    </button>
  )
}
