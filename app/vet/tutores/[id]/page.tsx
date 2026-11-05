import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireVet } from "@/lib/dal";
import { Card, Dl, Empty, LinkButton, PageTitle } from "@/components/shell";
import { ageLabel } from "@/lib/format";
import { SEX, SPECIES } from "@/lib/labels";

export default async function TutorPage({ params }: PageProps<"/vet/tutores/[id]">) {
  const vet = await requireVet();
  const { id } = await params;
  const tutor = await db.tutor.findFirst({
    where: { id, ownerVetId: vet.id },
    include: { animals: { orderBy: { name: "asc" } } },
  });
  if (!tutor) notFound();

  return (
    <>
      <PageTitle
        title={tutor.name}
        subtitle="Tutor"
        actions={<LinkButton href={`/vet/animais/novo?tutor=${tutor.id}`}>+ Novo paciente</LinkButton>}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Contato">
          <Dl items={[["E-mail", tutor.email], ["Telefone", tutor.phone], ["CPF", tutor.cpf]]} />
        </Card>
        <Card title="Acesso do tutor ao portal">
          {tutor.userId ? (
            <p className="text-sm text-emerald-800">✔ O tutor já criou a conta e acompanha os pacientes pelo portal.</p>
          ) : (
            <div className="space-y-2 text-sm text-stone-700">
              <p>Envie este código ao tutor. Ele o usa em <strong>Criar conta → Sou tutor</strong>:</p>
              <p className="select-all rounded-lg bg-stone-100 px-3 py-2 font-mono text-base">{tutor.inviteCode}</p>
              <p className="text-xs text-stone-500">O código vale para uma única conta e dá acesso apenas aos animais deste tutor.</p>
            </div>
          )}
        </Card>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Pacientes</h2>
      {tutor.animals.length === 0 ? (
        <Empty>Nenhum paciente cadastrado para este tutor.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {tutor.animals.map((a) => (
            <Link key={a.id} href={`/vet/animais/${a.id}`} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-teal-700">
              <p className="font-semibold">{a.name}</p>
              <p className="text-sm text-stone-600">
                {SPECIES[a.species]}{a.breed ? ` · ${a.breed}` : ""} · {SEX[a.sex]} · {ageLabel(a.birthDate)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
