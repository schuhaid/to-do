import { logout } from "@/app/(auth)/actions";
import { getUser } from "@/lib/data";
import Wordmark from "@/components/Wordmark";
import Icon from "@/components/Icon";
import { BottomNav, SideNav } from "@/components/ViewTabs";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import FeedbackButton from "@/components/FeedbackButton";
import MobileHeader from "@/components/MobileHeader";

// Shared frame for every logged-in view.
// Desktop: fixed sidebar. Phones/tablets: slim top bar + bottom tab bar.
// Used as the layout of /todos, /dashboard and /graph.
export default async function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-material-heavy px-3 py-6 lg:flex">
        <div className="mb-8 px-3">
          <Wordmark />
        </div>
        <p className="eyebrow mb-2 px-3">Views</p>
        <SideNav />

        <div className="mt-auto space-y-1">
          <FeedbackButton />
          <KeyboardShortcuts />
          <div className="flex items-center gap-3 rounded-[12px] bg-panel px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent" aria-hidden="true">
              {initial}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-muted" title={user.email}>
              {user.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="press grid size-9 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
                aria-label="Log out"
                title="Log out"
              >
                <Icon name="logout" className="size-[18px]" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader
          actions={
            <>
              <FeedbackButton variant="compact" />
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Log out"
                  title="Log out"
                  className="press grid size-11 place-items-center rounded-full text-accent hover:bg-hover active:bg-sunken"
                >
                  <Icon name="logout" className="size-[22px]" />
                </button>
              </form>
            </>
          }
        />

        <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-2 sm:px-8 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
