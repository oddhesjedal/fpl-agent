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
          <header className="bg-fpl-header text-white shadow-lg">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt="FPL Agent"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-fpl-green"
                  />
                  FPL <span className="text-fpl-green">Agent</span>
                </Link>
                <span className="hidden text-xs font-medium text-white/60 sm:block">
                  your edge for 2026/27
                </span>
              </div>
              <nav className="mt-3 flex flex-wrap gap-1 text-sm">
                {NAV.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="rounded-lg px-3 py-1.5 font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-fpl-purpleSoft/70">
            Advisory only · data from the public FPL API · you make the final calls.
          </footer>
        </div>
      </body>
    </html>
  );
}
