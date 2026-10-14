"use client";

/**
 * The tick box. 18px to look at, 40px to hit: the invisible padding around it
 * is part of the button, so it's easy to tap without making the row louder.
 */
export default function Checkbox({
  checked,
  onToggle,
  label,
  small,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? `Mark "${label}" as open` : `Mark "${label}" as done`}
      onClick={onToggle}
      className="group/check -m-[11px] grid size-10 shrink-0 place-items-center rounded-md"
    >
      <span className={`check ${checked ? "check-on" : ""} ${small ? "size-4! rounded-[4px]!" : ""} group-hover/check:border-accent`}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.4 6.5l2.5 2.6 4.9-6.2" />
        </svg>
      </span>
    </button>
  );
}
