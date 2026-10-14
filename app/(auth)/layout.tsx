import Wordmark from "@/components/Wordmark";
import Icon from "@/components/Icon";

// Split screen on desktop: a quiet brand panel with a sample list, the form on the right.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="relative hidden overflow-hidden border-r border-line bg-sunken lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Wordmark size="lg" />

        <div className="max-w-md">
          <h2 className="text-[40px] font-bold leading-[1.08] tracking-[-0.03em]">
            Less to remember.
            <br />
            <span className="text-accent">More ticked off.</span>
          </h2>
          <p className="mt-4 max-w-sm text-lg text-muted">
            A small, private list for you and your group. Subtasks, notes, due dates, and nothing you don&apos;t need.
          </p>

          <ul className="panel mt-10 divide-y divide-line" aria-hidden="true">
            <SampleRow title="Statistics worksheet 4" chip="Today" tone="warn" />
            <SampleRow title="Draft the project plan" chip="Fri" tone="soon" />
            <SampleRow title="Book the gym hall" done />
          </ul>
        </div>

        <p className="flex items-center gap-2 text-sm text-muted">
          <Icon name="lock" className="size-4" />
          Only you can see your tasks.
        </p>
      </section>

      <section className="flex flex-col items-center px-4 py-10 sm:justify-center sm:py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Wordmark size="lg" />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

function SampleRow({
  title,
  chip,
  tone,
  done,
}: {
  title: string;
  chip?: string;
  tone?: "warn" | "soon";
  done?: boolean;
}) {
  return (
    <li className="flex items-center gap-3.5 px-5 py-3.5">
      <span className={`check ${done ? "check-on" : ""}`}>
        <svg viewBox="0 0 12 12">
          <path d="M2.5 6.3l2.3 2.3 4.7-5" />
        </svg>
      </span>
      <span className={`task-title flex-1 truncate ${done ? "task-done" : ""}`}>{title}</span>
      {chip && (
        <span className={`chip ${tone === "warn" ? "bg-warn-soft text-warn" : "bg-accent-soft text-accent"}`}>{chip}</span>
      )}
    </li>
  );
}
