import Butterfly from "@/components/Butterfly";
import Wordmark from "@/components/Wordmark";

// Split screen like the cover of the corporate design guide: an Ink panel with
// the butterfly, the name set big in Clash Display, the claim in Ephesis and
// soft colour glows; the form sits on Lavender on the right.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <section className="relative isolate hidden overflow-hidden bg-[#010310] p-14 text-[#ececff] lg:flex lg:flex-col lg:justify-between">
        {/* Glows, as on the cover: violet top right, Royal Blue and teal at the bottom. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-40 -top-48 size-[34rem] rounded-full bg-[#1f1f7a] opacity-60 blur-[120px]" />
          <div className="absolute -bottom-56 -left-24 size-[34rem] rounded-full bg-[#015aa0] opacity-50 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/2 size-[26rem] rounded-full bg-[#1d677c] opacity-30 blur-[120px]" />
        </div>

        <Butterfly className="h-16 w-auto self-start text-[#fff7d3]" title="Daniel Schuhai" />

        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#67bcfe]">A small, private to-do list</p>
          <h2 className="mt-5 font-display text-[clamp(5rem,9vw,9rem)] font-bold uppercase leading-[0.88] tracking-[-0.01em]">
            Ticked
          </h2>
          <p className="script mt-8 text-[2.25rem] leading-none text-[#fff7d3]">What stands in the way becomes the way</p>
        </div>

        <p className="text-[0.8125rem] text-[#9ea1c9]">Only you can see your tasks.</p>
      </section>

      <section className="flex flex-col items-center bg-bg px-5 py-10 sm:justify-center sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <Wordmark size="lg" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
