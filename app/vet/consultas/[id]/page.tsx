import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireVet } from "@/lib/dal";
import { ConsultationView } from "@/components/consultation-view";
import { PageTitle } from "@/components/shell";

export const metadata = { title: "Consulta" };

export default async function ConsultaPage({ params }: PageProps<"/vet/consultas/[id]">) {
  const vet = await requireVet();
  const { id } = await params;
  const c = await db.consultation.findFirst({
    where: { id, animal: { tutor: { ownerVetId: vet.id } } },
    include: { vet: { select: { name: true, crmv: true } }, prescriptions: true, animal: { include: { tutor: true } } },
  });
  if (!c) notFound();

  return (
    <>
      <PageTitle title={`Consulta de ${c.animal.name}`} subtitle={`Tutor: ${c.animal.tutor.name}`} />
      <p className="no-print mb-4 text-sm">
        <Link href={`/vet/animais/${c.animalId}`} className="text-teal-800 hover:underline">← Voltar ao paciente</Link>
      </p>
      <ConsultationView c={c} showPrivate />
    </>
  );
}
