import { getVetAnimal, requireVet } from "@/lib/dal";
import { AnimalRecord, loadAnimal } from "@/components/animal-record";
import { LinkButton, PageTitle } from "@/components/shell";
import Link from "next/link";

export async function generateMetadata({ params }: PageProps<"/vet/animais/[id]">) {
  const { id } = await params;
  const vet = await requireVet();
  const a = await getVetAnimal(vet.id, id);
  return { title: a.name };
}

export default async function AnimalPage({ params }: PageProps<"/vet/animais/[id]">) {
  const vet = await requireVet();
  const { id } = await params;
  await getVetAnimal(vet.id, id); // checa permissão (404 se não for do veterinário)
  const animal = await loadAnimal(id);

  return (
    <>
      <PageTitle
        title={animal.name}
        subtitle={`Paciente de ${animal.tutor.name}`}
        actions={
          <>
            <LinkButton href={`/vet/animais/${id}/consulta/nova`}>+ Nova consulta</LinkButton>
            <LinkButton href={`/vet/animais/${id}/vacina/nova`} variant="ghost">+ Vacina / vermífugo</LinkButton>
          </>
        }
      />
      <p className="mb-4 text-sm">
        <Link href={`/vet/tutores/${animal.tutorId}`} className="text-teal-800 hover:underline">← Voltar ao tutor</Link>
      </p>
      <AnimalRecord animal={animal} audience="VET" />
    </>
  );
}
