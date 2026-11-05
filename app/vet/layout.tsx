import { AppShell } from "@/components/shell";
import { requireVet } from "@/lib/dal";

export default async function VetLayout({ children }: LayoutProps<"/vet">) {
  const user = await requireVet();
  return (
    <AppShell
      user={user}
      nav={[
        { href: "/vet", label: "Painel" },
        { href: "/vet/tutores", label: "Tutores e pacientes" },
      ]}
    >
      {children}
    </AppShell>
  );
}
