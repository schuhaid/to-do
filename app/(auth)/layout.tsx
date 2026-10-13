import Wordmark from "@/components/Wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12 sm:justify-center sm:py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <div className="panel p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
