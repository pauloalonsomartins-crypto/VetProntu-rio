import Link from "next/link";
import { getTutorAnimal, requireTutor } from "@/lib/dal";
import { AnimalRecord, loadAnimal } from "@/components/animal-record";
import { PageTitle } from "@/components/shell";
import { PrintButton } from "@/components/print-button";

export default async function TutorAnimalPage({ params }: PageProps<"/tutor/animais/[id]">) {
  const { tutor } = await requireTutor();
  const { id } = await params;
  await getTutorAnimal(tutor.id, id); // 404 se o animal não for deste tutor
  const animal = await loadAnimal(id);

  return (
    <>
      <PageTitle title={animal.name} subtitle="Prontuário do pet" actions={<PrintButton />} />
      <p className="no-print mb-4 text-sm">
        <Link href="/tutor" className="text-teal-800 hover:underline">← Meus pets</Link>
      </p>
      <AnimalRecord animal={animal} audience="TUTOR" />
    </>
  );
}
