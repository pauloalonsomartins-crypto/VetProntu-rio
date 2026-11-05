import Link from "next/link";
import { db } from "@/lib/db";
import { requireVet } from "@/lib/dal";
import { Card, Empty, LinkButton, PageTitle } from "@/components/shell";
import { SPECIES } from "@/lib/labels";

export const metadata = { title: "Tutores e pacientes" };

export default async function TutoresPage({ searchParams }: PageProps<"/vet/tutores">) {
  const vet = await requireVet();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const tutors = await db.tutor.findMany({
    where: {
      ownerVetId: vet.id,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { animals: { some: { name: { contains: q, mode: "insensitive" } } } },
          { animals: { some: { microchip: { contains: q } } } },
        ],
      }),
    },
    orderBy: { name: "asc" },
    include: { animals: { orderBy: { name: "asc" } } },
  });

  return (
    <>
      <PageTitle title="Tutores e pacientes" actions={<LinkButton href="/vet/tutores/novo">+ Novo tutor</LinkButton>} />
      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por tutor, nome do animal ou microchip…"
          className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
        />
      </form>
      {tutors.length === 0 ? (
        <Empty>{q ? "Nada encontrado para essa busca." : "Cadastre seu primeiro tutor para começar."}</Empty>
      ) : (
        <div className="space-y-3">
          {tutors.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/vet/tutores/${t.id}`} className="font-semibold text-stone-900 hover:text-teal-800">
                  {t.name}
                </Link>
                <span className={`rounded-full px-2 py-0.5 text-xs ${t.userId ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
                  {t.userId ? "Portal ativo" : "Sem acesso ao portal"}
                </span>
              </div>
              {t.animals.length === 0 ? (
                <p className="mt-2 text-sm text-stone-500">Sem pacientes cadastrados.</p>
              ) : (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {t.animals.map((a) => (
                    <li key={a.id}>
                      <Link href={`/vet/animais/${a.id}`} className="inline-block rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm hover:border-teal-700 hover:text-teal-800">
                        {a.name} <span className="text-stone-500">· {SPECIES[a.species]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
