import Link from "next/link";
import { db } from "@/lib/db";
import { requireVet } from "@/lib/dal";
import { Card, DueBadge, Empty, LinkButton, PageTitle } from "@/components/shell";
import { fmtDate } from "@/lib/format";
import { SPECIES } from "@/lib/labels";

export const metadata = { title: "Painel" };

export default async function VetHome() {
  const vet = await requireVet();
  const own = { tutor: { ownerVetId: vet.id } };
  const in30 = new Date(Date.now() + 30 * 86400000);

  const [tutors, animals, consultations, recent, due] = await Promise.all([
    db.tutor.count({ where: { ownerVetId: vet.id } }),
    db.animal.count({ where: own }),
    db.consultation.count({ where: { animal: own } }),
    db.consultation.findMany({ where: { animal: own }, orderBy: { date: "desc" }, take: 6, include: { animal: true } }),
    db.prevention.findMany({
      where: { animal: own, nextDueAt: { lte: in30 } },
      orderBy: { nextDueAt: "asc" },
      take: 8,
      include: { animal: { include: { tutor: true } } },
    }),
  ]);

  return (
    <>
      <PageTitle
        title={`Olá, ${vet.name.split(" ")[0]}`}
        subtitle="Resumo da sua clínica"
        actions={<LinkButton href="/vet/tutores/novo">+ Novo tutor</LinkButton>}
      />
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[["Tutores", tutors], ["Pacientes", animals], ["Consultas", consultations]].map(([l, n]) => (
          <div key={l} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-2xl font-bold text-teal-800">{n}</p>
            <p className="text-sm text-stone-600">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Últimas consultas">
          {recent.length === 0 ? (
            <Empty>Nenhuma consulta registrada ainda.</Empty>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recent.map((c) => (
                <li key={c.id} className="py-2">
                  <Link href={`/vet/consultas/${c.id}`} className="block hover:text-teal-800">
                    <span className="font-medium">{c.animal.name}</span>{" "}
                    <span className="text-sm text-stone-500">· {fmtDate(c.date)}</span>
                    <span className="block truncate text-sm text-stone-600">{c.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Reforços atrasados ou nos próximos 30 dias">
          {due.length === 0 ? (
            <Empty>Nenhum reforço pendente.</Empty>
          ) : (
            <ul className="divide-y divide-stone-100">
              {due.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <Link href={`/vet/animais/${p.animalId}`} className="min-w-0 hover:text-teal-800">
                    <span className="font-medium">{p.animal.name}</span>{" "}
                    <span className="text-sm text-stone-500">({p.animal.tutor.name})</span>
                    <span className="block truncate text-sm text-stone-600">{p.name}</span>
                  </Link>
                  <DueBadge next={p.nextDueAt} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <p className="mt-6 text-xs text-stone-400">Espécies: {Object.values(SPECIES).join(", ")}</p>
    </>
  );
}
