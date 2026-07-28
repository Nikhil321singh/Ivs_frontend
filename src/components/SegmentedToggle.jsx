// Segmented control. White track (border 1.5 line, r12, p4). Active option = primary fill +
// white; inactive = muted. options: [{ value, label }].
export default function SegmentedToggle({ options, value, onChange }) {
  return (
    <div className="flex w-full gap-1 rounded-[12px] border-[1.5px] border-line bg-white p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex flex-1 items-center justify-center rounded-[9px] py-2.5 text-[14px] font-semibold transition-colors ${
              active ? 'bg-primary text-white' : 'text-muted'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
