// Input formatters — enforce each field's proper format as the user types.
// Frontend only: shaping the string, no server-side validation.

// PAN: ABCDE1234F -> 5 letters, 4 digits, 1 letter. Uppercased, max 10.
export const toPan = (s) => {
  const chars = s.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let out = ''
  for (const ch of chars) {
    const i = out.length
    if (i >= 10) break
    const isAlpha = /[A-Z]/.test(ch)
    const isDigit = /[0-9]/.test(ch)
    if ((i < 5 && isAlpha) || (i >= 5 && i < 9 && isDigit) || (i === 9 && isAlpha)) out += ch
  }
  return out
}

// GSTIN: 27ABCDE1234F1Z5 -> 2 digits, 5 letters, 4 digits, 1 letter, 1 alnum, 1 letter, 1 alnum. Uppercased, max 15.
export const toGst = (s) => {
  const chars = s.toUpperCase().replace(/[^A-Z0-9]/g, '')
  let out = ''
  for (const ch of chars) {
    const i = out.length
    if (i >= 15) break
    const isAlpha = /[A-Z]/.test(ch)
    const isDigit = /[0-9]/.test(ch)
    const ok =
      (i < 2 && isDigit) ||
      (i >= 2 && i < 7 && isAlpha) ||
      (i >= 7 && i < 11 && isDigit) ||
      (i === 11 && isAlpha) ||
      (i === 12 && (isAlpha || isDigit)) ||
      (i === 13 && isAlpha) ||
      (i === 14 && (isAlpha || isDigit))
    if (ok) out += ch
  }
  return out
}

// Aadhaar: 12 digits grouped 4-4-4 -> "1234 5678 9012".
export const toAadhaar = (s) => {
  const d = s.replace(/\D/g, '').slice(0, 12)
  return d.replace(/(.{4})(?=.)/g, '$1 ')
}

// Phone: 10 digits grouped "98765 43210".
export const toPhone = (s) => {
  const d = s.replace(/\D/g, '').slice(0, 10)
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d
}

// Email: lowercase, no spaces.
export const toEmail = (s) => s.toLowerCase().replace(/\s/g, '')
