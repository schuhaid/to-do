import { logout } from "@/app/(auth)/actions";
import { getUser } from "@/lib/data";
import Wordmark from "@/components/Wordmark";
import ViewTabs from "@/components/ViewTabs";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

// Shared frame for every logged-in view: header, view tabs, shortcuts.
// Used as the layout of /todos, /dashboard and /graph.
export default async function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-5">
        <Wordmark />
        <div className="order-3 w-full sm:order-none sm:w-auto">
          <ViewTabs />
        </div>
        <div className="flex min-w-0 items-center gap-1">
          <span className="hidden max-w-48 truncate text-sm text-muted lg:block">{user.email}</span>
          <KeyboardShortcuts />
          <form action={logout}>
            <button type="submit" className="btn-quiet">Log out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
