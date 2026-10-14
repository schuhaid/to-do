// The app's name with its mark: a filled tick box, the same shape as the checkboxes.
export default function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? 30 : 26;
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-bold tracking-[-0.02em] ${
        size === "lg" ? "text-[22px]" : "text-lg"
      }`}
    >
      <svg width={box} height={box} viewBox="0 0 26 26" aria-hidden="true">
        <rect width="26" height="26" rx="8" className="fill-accent" />
        <path
          d="M7.5 13.5l3.6 3.6 7.4-8"
          fill="none"
          className="stroke-accent-ink"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="21" cy="5" r="2.6" className="fill-warn" />
      </svg>
      Ticked
    </span>
  );
}
