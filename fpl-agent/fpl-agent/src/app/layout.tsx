import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPL Agent",
  description: "Advisory agent for Fantasy Premier League — optimizer + dashboard.",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/squad", label: "Optimal Squad" },
  { href: "/team", label: "My Team" },
  { href: "/differentials", label: "Differentials" },
  { href: "/chips", label: "Chips" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/players", label: "Players" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-pitch text-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-lg font-bold tracking-tight">
                ⚽ FPL Agent
              </Link>
              <nav className="flex flex-wrap gap-1 text-sm">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-md px-3 py-1.5 hover:bg-pitchDark"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-400">
            Advisory only · data from the public FPL API · you make the final calls.
          </footer>
        </div>
      </body>
    </html>
  );
}
