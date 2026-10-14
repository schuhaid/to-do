import Wordmark from "@/components/Wordmark";

// A single quiet column. The name sits in the corner; the form is the page.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col px-5 py-5 sm:px-8 sm:py-6">
      <Wordmark />
      <div className="flex flex-1 items-start justify-center pt-[12vh] sm:items-center sm:pt-0">
        <div className="w-full max-w-[22rem] pb-[8vh]">{children}</div>
      </div>
    </main>
  );
}
