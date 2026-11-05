import Link from "next/link";
import { db } from "@/lib/db";
import { Card, Dl, DueBadge, Empty } from "@/components/shell";
import { ageLabel, fmtDate } from "@/lib/format";
import { PREVENTION, SEX, SPECIES } from "@/lib/labels";

type Animal = Awaited<ReturnType<typeof loadAnimal>>;

export async function loadAnimal(id: string) {
  return db.animal.findUniqueOrThrow({
    where: { id },
    include: {
      tutor: true,
      // privateNotes nunca é carregado aqui: a ficha serve também ao portal do tutor.
      consultations: { omit: { privateNotes: true }, orderBy: { date: "desc" }, include: { vet: { select: { name: true, crmv: true } }, prescriptions: true } },
      preventions: { orderBy: { appliedAt: "desc" }, include: { vet: { select: { name: true } } } },
    },
  });
}

/** Ficha do animal: dados, carteira de vacinação e histórico. `base` é o prefixo das rotas de consulta. */
export function AnimalRecord({ animal, audience }: { animal: Animal; audience: "VET" | "TUTOR" }) {
  const consultHref = (id: string) => (audience === "VET" ? `/vet/consultas/${id}` : `/tutor/consultas/${id}`);
  const weights = animal.consultations.filter((c) => c.weightKg).slice(0, 1);

  return (
    <div className="space-y-6">
      <Card title="Identificação">
        <Dl
          items={[
            ["Espécie", SPECIES[animal.species]],
            ["Raça", animal.breed],
            ["Sexo", `${SEX[animal.sex]}${animal.neutered ? " · castrado(a)" : ""}`],
            ["Idade", `${ageLabel(animal.birthDate)}${animal.birthDate ? ` (nasc. ${fmtDate(animal.birthDate)})` : ""}`],
            ["Pelagem / cor", animal.color],
            ["Microchip", animal.microchip],
            ["Último peso", weights[0] ? `${String(weights[0].weightKg).replace(".", ",")} kg (${fmtDate(weights[0].date)})` : null],
            ["Tutor", animal.tutor.name],
            ["Alergias e condições crônicas", animal.allergies],
            ["Observações", animal.notes],
          ]}
        />
      </Card>

      <Card title="Carteira de vacinação e prevenção">
        {animal.preventions.length === 0 ? (
          <Empty>Nenhum registro de vacina ou vermífugo.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Produto</th>
                  <th className="py-2 pr-3">Aplicação</th>
                  <th className="py-2 pr-3">Lote</th>
                  <th className="py-2 pr-3">Próxima dose</th>
                  <th className="py-2">Veterinário(a)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {animal.preventions.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-3">{PREVENTION[p.kind]}</td>
                    <td className="py-2 pr-3 font-medium">{p.name}</td>
                    <td className="py-2 pr-3">{fmtDate(p.appliedAt)}</td>
                    <td className="py-2 pr-3">{p.batch ?? "—"}</td>
                    <td className="py-2 pr-3"><DueBadge next={p.nextDueAt} /></td>
                    <td className="py-2">{p.vet.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Histórico de consultas">
        {animal.consultations.length === 0 ? (
          <Empty>Nenhuma consulta registrada.</Empty>
        ) : (
          <ol className="relative space-y-4 border-l-2 border-stone-200 pl-5">
            {animal.consultations.map((c) => (
              <li key={c.id} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 size-3 rounded-full border-2 border-white bg-teal-700" />
                <Link href={consultHref(c.id)} className="block rounded-lg p-2 hover:bg-stone-50">
                  <p className="text-xs text-stone-500">
                    {fmtDate(c.date)} · {c.vet.name}
                  </p>
                  <p className="font-medium text-stone-900">{c.reason}</p>
                  {c.diagnosis && <p className="text-sm text-stone-600">Diagnóstico: {c.diagnosis}</p>}
                  {c.prescriptions.length > 0 && (
                    <p className="text-xs text-teal-800">💊 {c.prescriptions.length} medicamento(s) prescrito(s)</p>
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
