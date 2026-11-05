import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/dal";
import { ConsultationView } from "@/components/consultation-view";
import { PageTitle } from "@/components/shell";
import { PrintButton } from "@/components/print-button";

export const metadata = { title: "Consulta" };

export default async function TutorConsultaPage({ params }: PageProps<"/tutor/consultas/[id]">) {
  const { tutor } = await requireTutor();
  const { id } = await params;
  const c = await db.consultation.findFirst({
    where: { id, animal: { tutorId: tutor.id } },
    omit: { privateNotes: true },
    include: { vet: { select: { name: true, crmv: true } }, prescriptions: true, animal: { include: { tutor: true } } },
  });
  if (!c) notFound();

  return (
    <>
      <PageTitle title={`Consulta de ${c.animal.name}`} actions={<PrintButton />} />
      <p className="no-print mb-4 text-sm">
        <Link href={`/tutor/animais/${c.animalId}`} className="text-teal-800 hover:underline">← Voltar ao pet</Link>
      </p>
      <ConsultationView c={{ ...c, privateNotes: null }} showPrivate={false} />
    </>
  );
}
