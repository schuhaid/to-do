// The name with its mark: the same tick box the tasks use, already ticked.
export default function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[-0.01em]">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <rect width="18" height="18" rx="5" className="fill-accent" />
        <path
          d="M5 9.4l2.6 2.7 5.2-6.4"
          fill="none"
          className="stroke-accent-ink"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Ticked
    </span>
  );
}
