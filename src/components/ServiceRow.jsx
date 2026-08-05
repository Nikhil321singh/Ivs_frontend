// Home services list row: white card (border 1.5 line, r14, px14 py13), indigo icon tile
// (40, #ececf8, r13, icon 22) + title/subtitle + chevron.
export default function ServiceRow({ icon, title, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 rounded-[14px] border-[1.5px] border-line bg-white px-3.5 py-[13px] text-left transition duration-150 active:scale-[0.98] active:bg-field"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-indigo-subtle">
        <img src={`/assets/icons/${icon}.svg`} alt="" aria-hidden="true" className="h-[22px] w-[22px]" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-[14px] font-semibold text-ink">{title}</span>
        <span className="truncate text-[12px] font-normal text-muted">{sub}</span>
      </span>
      <img
        src="/assets/icons/ic-chevron.svg"
        alt=""
        aria-hidden="true"
        className="h-[18px] w-[18px] shrink-0"
      />
    </button>
  )
}
