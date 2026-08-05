// Labeled text input. label Medium 12 muted + box (white, border 1.5 line, r11, px14 py12,
// value Medium 14 ink). Uncontrolled by default (defaultValue) so mock data is editable.
export default function Field({
  label,
  defaultValue,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  maxLength,
  readOnly = false,
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium text-muted">{label}</label>}
      <input
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        readOnly={readOnly}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-[11px] border-[1.5px] border-line bg-white px-3.5 py-3 text-[14px] font-medium text-ink outline-none placeholder:text-muted focus:border-primary ${
          readOnly ? 'cursor-default focus:border-line' : ''
        }`}
      />
    </div>
  )
}
