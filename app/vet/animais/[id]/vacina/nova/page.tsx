import { createPrevention } from "@/app/actions/vet";
import { ActionForm, Input, Select, Textarea } from "@/components/form";
import { Card, PageTitle } from "@/components/shell";
import { getVetAnimal, requireVet } from "@/lib/dal";
import { toInputDate } from "@/lib/format";
import { PREVENTION } from "@/lib/labels";

export const metadata = { title: "Vacina / vermífugo" };

export default async function NovaPrevencao({ params }: PageProps<"/vet/animais/[id]/vacina/nova">) {
  const vet = await requireVet();
  const { id } = await params;
  const animal = await getVetAnimal(vet.id, id);

  return (
    <>
      <PageTitle title="Registrar vacina ou vermífugo" subtitle={`${animal.name} · tutor: ${animal.tutor.name}`} />
      <Card className="max-w-xl">
        <ActionForm action={createPrevention} submitLabel="Registrar">
          <input type="hidden" name="animalId" value={animal.id} />
          <Select label="Tipo" name="kind" options={PREVENTION} />
          <Input label="Produto" name="name" placeholder="ex.: V10, Antirrábica, Drontal" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Data de aplicação" name="appliedAt" type="date" defaultValue={toInputDate(new Date())} required />
            <Input label="Próxima dose" name="nextDueAt" type="date" hint="Gera o aviso de reforço para o tutor." />
          </div>
          <Input label="Lote" name="batch" />
          <Textarea label="Observações" name="notes" rows={2} />
        </ActionForm>
      </Card>
    </>
  );
}
