import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UndoProvider } from "@/components/Undo";

export const metadata: Metadata = {
  title: "Ticked",
  description: "A small, private to-do list.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <UndoProvider>{children}</UndoProvider>
      </body>
    </html>
  );
}
