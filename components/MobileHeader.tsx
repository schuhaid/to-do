"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Wordmark from "./Wordmark";

/**
 * Phone/tablet top bar, iOS-style.
 * - Solid paper; a 1px line appears only once content scrolls underneath.
 * - When the page title scrolls under the bar, a small copy fades into the
 *   middle of the bar, so you always know where you are.
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
      className={`sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b bg-paper px-3 pt-[env(safe-area-inset-top)] transition-colors duration-150 sm:px-6 lg:hidden ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <div className="flex min-h-12 items-center pl-2">
        <Wordmark />
      </div>
      <p
        aria-hidden={!showTitle}
        className={`max-w-[42vw] truncate text-center text-[0.875rem] font-semibold transition-opacity duration-150 ${
          showTitle ? "opacity-100" : "opacity-0"
        }`}
      >
        {title}
      </p>
      <div className="flex items-center justify-end">{actions}</div>
    </header>
  );
}
