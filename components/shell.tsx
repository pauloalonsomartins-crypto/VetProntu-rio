import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { dueStatus, fmtDate } from "@/lib/format";

export function AppShell({
  user,
  nav,
  children,
}: {
  user: { name: string; role: "VET" | "TUTOR" };
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="no-print border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href={user.role === "VET" ? "/vet" : "/tutor"} className="text-lg font-bold text-teal-800">
            🐾 VetProntuário
          </Link>
          <nav className="flex gap-4 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-stone-600 hover:text-teal-800">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-stone-600">{user.name}</span>
            <form action={logout}>
              <button className="rounded-md border border-stone-300 px-3 py-1 text-stone-700 hover:bg-stone-100">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-stone-600">{subtitle}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h2 className="mb-3 text-base font-semibold text-stone-900">{title}</h2>}
      {children}
    </section>
  );
}

export function LinkButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  const cls =
    variant === "primary"
      ? "bg-teal-700 text-white hover:bg-teal-800"
      : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100";
  return (
    <Link href={href} className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${cls}`}>
      {children}
    </Link>
  );
}

export function DueBadge({ next }: { next: Date | null }) {
  const s = dueStatus(next);
  if (s === "none") return <span className="text-stone-400">—</span>;
  const map = {
    late: "bg-red-100 text-red-800",
    soon: "bg-amber-100 text-amber-800",
    ok: "bg-emerald-100 text-emerald-800",
  } as const;
  const label = { late: "Atrasada", soon: "Em breve", ok: "Em dia" }[s];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s]}`}>
      {fmtDate(next)} · {label}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">{children}</p>;
}

export function Dl({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{k}</dt>
          <dd className="mt-0.5 whitespace-pre-wrap text-stone-900">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
