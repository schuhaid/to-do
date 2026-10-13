// The app's name with a small round tick as its mark.
export default function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="11" className="fill-accent" />
        <path d="M6.5 11.5l3 3 6-6.5" fill="none" className="stroke-accent-ink" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Ticked
    </span>
  );
}
