// The app's name with a small ticked box as its mark.
export default function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <rect x="1" y="1" width="20" height="20" rx="6" className="fill-highlight" />
        <path d="M6 11.5l3.2 3.2L16 7.8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Ticked
    </span>
  );
}
