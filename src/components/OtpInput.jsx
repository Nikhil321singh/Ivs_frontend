import { useRef } from 'react'

// Reusable OTP entry. Controlled: parent holds the string `value`; `onChange` gets the
// new string. `length` boxes, each flex-1 h66 r14. Filled/active box = 2px primary border
// (Figma), empty = 1.5px line border. Auto-advances on entry, backspaces to previous.
export default function OtpInput({ length = 4, value, onChange }) {
  const inputs = useRef([])
  const chars = Array.from({ length }, (_, i) => value[i] || '')

  const setChar = (i, c) => {
    const next = chars.slice()
    next[i] = c
    onChange(next.join('').slice(0, length))
  }

  return (
    <div className="flex w-full gap-3">
      {chars.map((c, i) => {
        const active = i === value.length // next box to fill
        return (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="tel"
            inputMode="numeric"
            maxLength={1}
            value={c}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '').slice(-1)
              setChar(i, d)
              if (d && i < length - 1) inputs.current[i + 1]?.focus()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !c && i > 0) inputs.current[i - 1]?.focus()
            }}
            className={`h-[66px] min-w-0 flex-1 rounded-otp bg-white text-center text-[26px] font-bold text-ink outline-none focus:border-2 focus:border-primary ${
              c || active ? 'border-2 border-primary' : 'border-[1.5px] border-line'
            }`}
          />
        )
      })}
    </div>
  )
}
