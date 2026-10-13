import Wordmark from "@/components/Wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-10 sm:py-20">
      <Wordmark />
      <div className="mt-12">{children}</div>
    </main>
  );
}
