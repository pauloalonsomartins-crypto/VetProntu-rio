import { AppShell } from "@/components/shell";
import { requireTutor } from "@/lib/dal";

export default async function TutorLayout({ children }: LayoutProps<"/tutor">) {
  const { user } = await requireTutor();
  return (
    <AppShell user={user} nav={[{ href: "/tutor", label: "Meus pets" }]}>
      {children}
    </AppShell>
  );
}
