import Butterfly from "./Butterfly";

// The butterfly next to the app name, as in the guide's "Header" combination:
// gap between mark and name = half the mark's height. One colour: currentColor.
export default function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center font-display font-semibold tracking-[-0.01em] ${lg ? "gap-4 text-[1.75rem]" : "gap-3 text-[1.25rem]"}`}>
      <Butterfly className={lg ? "h-9 w-auto" : "h-7 w-auto"} />
      Ticked
    </span>
  );
}
