"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";

/**
 * Phone/tablet top bar, iOS-style.
 * - Transparent at the top; becomes translucent material with a hairline once
 *   content scrolls underneath (a scroll-edge effect, not a permanent divider).
 * - When the page's large title scrolls under the bar, a small inline title
 *   rises into the middle of the bar, so you always know where you are.
 */
export default function MobileHeader({ actions }: { actions: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // Title state is tagged with its page, so a stale title never shows after navigating.
  const [inline, setInline] = useState({ path: "", title: "", show: false });
  const showTitle = inline.path === pathname && inline.show;
  const title = inline.path === pathname ? inline.title : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>("main h1");
    if (!h1) return;
    // Fires once on observe with the current state, then on every crossing.
    const io = new IntersectionObserver(
      ([entry]) =>
        setInline({
          path: pathname,
          title: h1.textContent ?? "",
          show: !entry.isIntersecting && entry.boundingClientRect.top < 80,
        }),
      { rootMargin: "-56px 0px 0px 0px" },
    );
    io.observe(h1);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,backdrop-filter] duration-200 sm:px-5 lg:hidden ${
        scrolled ? "material shadow-[0_0.5px_0_var(--material-line)]" : "bg-transparent"
      }`}
    >
      <div className="flex min-h-13 items-center pl-1">
        <Wordmark />
      </div>
      <p
        aria-hidden={!showTitle}
        className={`max-w-[42vw] truncate text-center text-[0.9375rem] font-semibold tracking-[-0.012em] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-opacity ${
          showTitle ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0 motion-reduce:translate-y-0"
        }`}
      >
        {title}
      </p>
      <div className="flex items-center justify-end">{actions}</div>
    </header>
  );
}
