import { redirect } from "next/navigation";
import { createAnimal } from "@/app/actions/vet";
import { ActionForm, Input, Select, Textarea } from "@/components/form";
import { Card, PageTitle } from "@/components/shell";
import { db } from "@/lib/db";
import { requireVet } from "@/lib/dal";
import { SEX, SPECIES } from "@/lib/labels";

export const metadata = { title: "Novo paciente" };

export default async function NovoAnimal({ searchParams }: PageProps<"/vet/animais/novo">) {
  const vet = await requireVet();
  const sp = await searchParams;
  const tutorId = typeof sp.tutor === "string" ? sp.tutor : "";
  const tutor = await db.tutor.findFirst({ where: { id: tutorId, ownerVetId: vet.id } });
  if (!tutor) redirect("/vet/tutores");

  return (
    <>
      <PageTitle title="Novo paciente" subtitle={`Tutor: ${tutor.name}`} />
      <Card className="max-w-2xl">
        <ActionForm action={createAnimal} submitLabel="Salvar paciente">
          <input type="hidden" name="tutorId" value={tutor.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nome" name="name" required />
            <Select label="Espécie" name="species" options={SPECIES} />
            <Input label="Raça" name="breed" />
            <Select label="Sexo" name="sex" options={SEX} />
            <Input label="Nascimento" name="birthDate" type="date" />
            <Input label="Pelagem / cor" name="color" />
            <Input label="Microchip" name="microchip" />
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input type="checkbox" name="neutered" className="size-4 accent-teal-700" /> Castrado(a)
            </label>
          </div>
          <Textarea label="Alergias e condições crônicas" name="allergies" rows={2} />
          <Textarea label="Observações" name="notes" rows={2} />
        </ActionForm>
      </Card>
    </>
  );
}
