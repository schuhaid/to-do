// Small stroke icon set (Lucide-style, 24px grid). Decorative unless a label is passed.
const PATHS = {
  list: "M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01",
  dashboard: "M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z",
  graph: "M6 6m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M18 7m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M12 18m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M8.3 7.2l7.4-.2M7.4 8.2l3.4 7.5M16.6 9.1l-3.3 6.6",
  logout: "M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10",
  keyboard: "M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10",
  plus: "M12 5v14M5 12h14",
  search: "M11 11m-6.5 0a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0M20 20l-4.2-4.2",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  back: "M15 5l-7 7 7 7",
  pencil: "M15.5 4.5l4 4L8 20H4v-4z",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
  note: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h4",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7",
  alert: "M12 8v5M12 16.5h.01M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  clock: "M12 12m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M12 7.5V12l3 2",
  circle: "M12 12m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0",
  target: "M12 12m-8.5 0a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  message: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5",
  send: "M4 12l16-8-6 16-2.5-6.5z",
  rotate: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v3.5H8",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({
  name,
  className = "size-5",
  strokeWidth = 1.8,
  label,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
