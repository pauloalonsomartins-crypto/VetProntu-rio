import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const d = (s: string) => new Date(`${s}T00:00:00Z`);
const daysFromNow = (n: number) => new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime() + n * 86400000;

async function main() {
  const passwordHash = await bcrypt.hash("senha12345", 12);
  const vet = await db.user.upsert({
    where: { email: "vet@exemplo.com" },
    update: {},
    create: { name: "Dra. Helena Souza", email: "vet@exemplo.com", passwordHash, role: "VET", crmv: "CRMV-SP 12345" },
  });

  if (await db.tutor.findFirst({ where: { ownerVetId: vet.id } })) return console.log("Seed já aplicado.");

  const user = await db.user.upsert({
    where: { email: "tutor@exemplo.com" },
    update: {},
    create: { name: "Carlos Mendes", email: "tutor@exemplo.com", passwordHash, role: "TUTOR" },
  });
  const tutor = await db.tutor.create({
    data: { name: "Carlos Mendes", email: "tutor@exemplo.com", phone: "(11) 91234-5678", ownerVetId: vet.id, userId: user.id },
  });
  await db.tutor.create({ data: { name: "Marina Alves", phone: "(11) 98888-0000", ownerVetId: vet.id, inviteCode: "CONVITE-DEMO" } });

  const thor = await db.animal.create({
    data: { name: "Thor", species: "CAO", breed: "Golden Retriever", sex: "MACHO", neutered: true, birthDate: d("2021-03-12"), color: "Dourado", microchip: "985112003456789", allergies: "Alergia a frango", tutorId: tutor.id },
  });
  const mia = await db.animal.create({
    data: { name: "Mia", species: "GATO", breed: "SRD", sex: "FEMEA", neutered: true, birthDate: d("2022-08-02"), tutorId: tutor.id },
  });

  await db.consultation.create({
    data: {
      animalId: thor.id, vetId: vet.id, date: d("2026-09-10"), reason: "Coceira e vermelhidão nas patas",
      anamnesis: "Tutor relata lambedura frequente das patas há 2 semanas.", weightKg: 31.4, temperatureC: 38.6, heartRate: 96, respRate: 24,
      physicalExam: "Eritema interdigital bilateral. Demais sistemas sem alterações.", diagnosis: "Dermatite alérgica",
      treatment: "Banho terapêutico semanal e controle da dieta.", returnDate: d("2026-09-24"),
      privateNotes: "Considerar teste de dieta de exclusão se não houver melhora.",
      prescriptions: { create: [{ medication: "Apoquel 16 mg", dose: "1 comprimido", frequency: "a cada 12 h", duration: "7 dias", instructions: "Após a alimentação" }] },
    },
  });
  await db.consultation.create({
    data: { animalId: mia.id, vetId: vet.id, date: d("2026-06-18"), reason: "Check-up anual", weightKg: 4.1, temperatureC: 38.4, physicalExam: "Sem alterações.", diagnosis: "Animal saudável" },
  });
  await db.prevention.createMany({
    data: [
      { animalId: thor.id, vetId: vet.id, kind: "VACINA", name: "V10", appliedAt: d("2025-11-01"), nextDueAt: new Date(daysFromNow(-4)), batch: "L2345" },
      { animalId: thor.id, vetId: vet.id, kind: "VACINA", name: "Antirrábica", appliedAt: d("2026-02-15"), nextDueAt: new Date(daysFromNow(200)), batch: "R778" },
      { animalId: thor.id, vetId: vet.id, kind: "VERMIFUGO", name: "Drontal Plus", appliedAt: d("2026-09-10"), nextDueAt: new Date(daysFromNow(18)) },
      { animalId: mia.id, vetId: vet.id, kind: "VACINA", name: "V4 (Quádrupla felina)", appliedAt: d("2026-06-18"), nextDueAt: new Date(daysFromNow(220)) },
    ],
  });
  console.log("Seed concluído. vet@exemplo.com / tutor@exemplo.com — senha: senha12345");
}

main().finally(() => db.$disconnect());
