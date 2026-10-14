// Placeholders shown the moment you switch views, while the server loads the data.
// Shapes match the real pages so nothing jumps when the content arrives.

function Bar({ className = "" }: { className?: string }) {
  return <span className={`block animate-pulse rounded-md bg-line motion-reduce:animate-none ${className}`} />;
}

function Header({ wide = false }: { wide?: boolean }) {
  return (
    <div className="mb-6" aria-hidden="true">
      <Bar className="h-3 w-24" />
      <Bar className={`mt-3 h-8 ${wide ? "w-72" : "w-44"}`} />
    </div>
  );
}

function Rows({ count = 6 }: { count?: number }) {
  return (
    <div className="panel overflow-hidden" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-start gap-3.5 border-b border-line px-4 py-4 last:border-b-0 sm:px-5">
          <Bar className="size-6 rounded-full" />
          <div className="flex-1">
            <Bar className={`h-4 ${i % 3 === 0 ? "w-2/3" : i % 3 === 1 ? "w-1/2" : "w-3/5"}`} />
            <Bar className="mt-2 h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Loading({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <Loading>
      <main className="mx-auto w-full max-w-3xl">
        <Header />
        <Bar className="mb-6 h-14 w-full rounded-[var(--radius)]" />
        <Bar className="mb-3 h-11 w-full rounded-[var(--radius)]" />
        <Rows />
      </main>
    </Loading>
  );
}

export function TaskSkeleton() {
  return (
    <Loading>
      <main className="mx-auto w-full max-w-5xl">
        <Bar className="mb-6 h-5 w-20" />
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <div className="panel p-6" aria-hidden="true">
              <Bar className="h-7 w-2/3" />
            </div>
            <Rows count={3} />
          </div>
          <div className="panel h-56" aria-hidden="true" />
        </div>
      </main>
    </Loading>
  );
}

export function DashboardSkeleton() {
  return (
    <Loading>
      <main>
        <Header wide />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="panel h-28" />
          ))}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2" aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="panel h-64" />
          ))}
        </div>
      </main>
    </Loading>
  );
}

export function GraphSkeleton() {
  return (
    <Loading>
      <main>
        <Header wide />
        <div className="panel h-[60vh] min-h-[360px] sm:h-[66vh]" aria-hidden="true" />
      </main>
    </Loading>
  );
}
