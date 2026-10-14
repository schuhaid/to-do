"use client";

/** Round checkbox that fills with the accent and draws its tick. */
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
      className={`check ${checked ? "check-on" : ""} ${small ? "size-[20px]!" : ""}`}
    >
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 6.3l2.3 2.3 4.7-5" />
      </svg>
    </button>
  );
}
