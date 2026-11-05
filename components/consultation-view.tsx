import { Card, Dl } from "@/components/shell";
import { fmtDate } from "@/lib/format";
import type { Prisma } from "@prisma/client";

type C = Prisma.ConsultationGetPayload<{
  include: { vet: { select: { name: true; crmv: true } }; prescriptions: true; animal: { include: { tutor: true } } };
}>;

export function ConsultationView({ c, showPrivate }: { c: C; showPrivate: boolean }) {
  return (
    <div className="space-y-6">
      <Card title="Consulta">
        <Dl
          items={[
            ["Data", fmtDate(c.date)],
            ["Veterinário(a)", `${c.vet.name}${c.vet.crmv ? ` · ${c.vet.crmv}` : ""}`],
            ["Motivo", c.reason],
            ["Retorno", c.returnDate ? fmtDate(c.returnDate) : null],
            ["Peso", c.weightKg ? `${String(c.weightKg).replace(".", ",")} kg` : null],
            ["Temperatura", c.temperatureC ? `${String(c.temperatureC).replace(".", ",")} °C` : null],
            ["Freq. cardíaca", c.heartRate ? `${c.heartRate} bpm` : null],
            ["Freq. respiratória", c.respRate ? `${c.respRate} mpm` : null],
          ]}
        />
      </Card>
      <Card title="Avaliação clínica">
        <Dl
          items={[
            ["Anamnese", c.anamnesis],
            ["Exame físico", c.physicalExam],
            ["Diagnóstico", c.diagnosis],
            ["Conduta e tratamento", c.treatment],
          ]}
        />
      </Card>
      {c.prescriptions.length > 0 && (
        <Card title="Receita">
          <ul className="divide-y divide-stone-100 text-sm">
            {c.prescriptions.map((r) => (
              <li key={r.id} className="py-2">
                <p className="font-medium">{r.medication}</p>
                <p className="text-stone-600">
                  {r.dose} · {r.frequency}
                  {r.duration ? ` · por ${r.duration}` : ""}
                </p>
                {r.instructions && <p className="text-stone-500">{r.instructions}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {showPrivate && c.privateNotes && (
        <Card title="Anotações reservadas" className="border-amber-300 bg-amber-50">
          <p className="whitespace-pre-wrap text-sm">{c.privateNotes}</p>
        </Card>
      )}
    </div>
  );
}
