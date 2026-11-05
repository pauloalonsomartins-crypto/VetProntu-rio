import { createConsultation } from "@/app/actions/vet";
import { ActionForm, Input, PrescriptionRows, Textarea } from "@/components/form";
import { Card, PageTitle } from "@/components/shell";
import { getVetAnimal, requireVet } from "@/lib/dal";
import { toInputDate } from "@/lib/format";

export const metadata = { title: "Nova consulta" };

export default async function NovaConsulta({ params }: PageProps<"/vet/animais/[id]/consulta/nova">) {
  const vet = await requireVet();
  const { id } = await params;
  const animal = await getVetAnimal(vet.id, id);

  return (
    <>
      <PageTitle title="Nova consulta" subtitle={`${animal.name} · tutor: ${animal.tutor.name}`} />
      <Card className="max-w-3xl">
        <ActionForm action={createConsultation} submitLabel="Salvar consulta">
          <input type="hidden" name="animalId" value={animal.id} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Data" name="date" type="date" defaultValue={toInputDate(new Date())} required />
            <Input className="sm:col-span-2" label="Motivo / queixa principal" name="reason" required />
          </div>
          <Textarea label="Anamnese" name="anamnesis" rows={4} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Input label="Peso (kg)" name="weightKg" inputMode="decimal" />
            <Input label="Temp. (°C)" name="temperatureC" inputMode="decimal" />
            <Input label="FC (bpm)" name="heartRate" inputMode="numeric" />
            <Input label="FR (mpm)" name="respRate" inputMode="numeric" />
          </div>
          <Textarea label="Exame físico" name="physicalExam" rows={3} />
          <Textarea label="Diagnóstico / suspeita" name="diagnosis" rows={2} />
          <Textarea label="Conduta e tratamento" name="treatment" rows={3} />
          <PrescriptionRows />
          <Input label="Data de retorno" name="returnDate" type="date" className="max-w-xs" />
          <Textarea
            label="Anotações reservadas (somente veterinários)"
            name="privateNotes"
            rows={2}
            hint="Não aparecem no portal do tutor."
          />
        </ActionForm>
      </Card>
    </>
  );
}
