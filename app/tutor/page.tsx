import Link from "next/link";
import { db } from "@/lib/db";
import { requireTutor } from "@/lib/dal";
import { DueBadge, Empty, PageTitle } from "@/components/shell";
import { ageLabel } from "@/lib/format";
import { SEX, SPECIES } from "@/lib/labels";

export const metadata = { title: "Meus pets" };

export default async function TutorHome() {
  const { tutor } = await requireTutor();
  const animals = await db.animal.findMany({
    where: { tutorId: tutor.id },
    orderBy: { name: "asc" },
    include: {
      preventions: { where: { nextDueAt: { not: null } }, orderBy: { nextDueAt: "asc" }, take: 1 },
      _count: { select: { consultations: true } },
    },
  });

  return (
    <>
      <PageTitle title="Meus pets" subtitle="Prontuário e carteira de vacinação" />
      {animals.length === 0 ? (
        <Empty>Seu veterinário ainda não cadastrou nenhum pet.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {animals.map((a) => {
            const next = a.preventions[0];
            return (
              <Link key={a.id} href={`/tutor/animais/${a.id}`} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm hover:border-teal-700">
                <p className="text-lg font-semibold">{a.name}</p>
                <p className="text-sm text-stone-600">
                  {SPECIES[a.species]}{a.breed ? ` · ${a.breed}` : ""} · {SEX[a.sex]} · {ageLabel(a.birthDate)}
                </p>
                <p className="mt-3 text-sm text-stone-600">{a._count.consultations} consulta(s) registrada(s)</p>
                {next && (
                  <p className="mt-2 text-sm">
                    Próximo reforço: <span className="font-medium">{next.name}</span> <DueBadge next={next.nextDueAt} />
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
