import { logout } from "@/app/(auth)/actions";
import { getUser } from "@/lib/data";
import Wordmark from "@/components/Wordmark";
import Icon from "@/components/Icon";
import { BottomNav, SideNav } from "@/components/ViewTabs";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import FeedbackButton from "@/components/FeedbackButton";
import MobileHeader from "@/components/MobileHeader";

// Shared frame for every logged-in view.
// Desktop: a quiet grey sidebar beside the page. Phones/tablets: top bar + bottom tab bar.
// Used as the layout of /todos, /dashboard and /graph.
export default async function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = await getUser();

  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-side px-3 py-4 lg:flex">
        <div className="mb-6 px-2 py-1">
          <Wordmark />
        </div>
        <SideNav />

        <div className="mt-auto space-y-0.5">
          <FeedbackButton />
          <KeyboardShortcuts />
          <div className="mt-3 flex items-center gap-2">
            <span className="meta min-w-0 flex-1 truncate px-2" title={user.email}>
              {user.email}
            </span>
            <form action={logout}>
              <button type="submit" className="btn-quiet" title="Log out">
                <Icon name="logout" />
                Log out
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
                  className="press grid size-11 place-items-center rounded-md text-muted hover:bg-hover hover:text-ink"
                >
                  <Icon name="logout" className="size-5" />
                </button>
              </form>
            </>
          }
        />

        <div className="w-full flex-1 px-5 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-4 sm:px-8 lg:px-16 lg:pb-20 lg:pt-14">
          {children}
        </div>

        <BottomNav />
      </div>
    </div>
  );
}
