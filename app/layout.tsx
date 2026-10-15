import type { Metadata, Viewport } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/ephesis/400.css";
import "./globals.css";
import { UndoProvider } from "@/components/Undo";

export const metadata: Metadata = {
  title: "Ticked",
  description: "A small, private to-do list.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4fe" },
    { media: "(prefers-color-scheme: dark)", color: "#010310" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Clash Display is served by Fontshare (ITF Free Font License); it isn't on npm. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <UndoProvider>{children}</UndoProvider>
      </body>
    </html>
  );
}
