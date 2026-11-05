import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { readSession } from "./session";

/** Usuário logado (ou null). Memoizado por requisição. */
export const getUser = cache(async () => {
  const s = await readSession();
  if (!s) return null;
  return db.user.findUnique({
    where: { id: s.userId },
    select: { id: true, name: true, email: true, role: true, crmv: true },
  });
});

export async function requireVet() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "VET") redirect("/tutor");
  return user;
}

export async function requireTutor() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "TUTOR") redirect("/vet");
  const tutor = await db.tutor.findUnique({ where: { userId: user.id } });
  if (!tutor) redirect("/login");
  return { user, tutor };
}

/** Animal acessível ao veterinário (apenas de tutores cadastrados por ele). */
export async function getVetAnimal(vetId: string, animalId: string) {
  const animal = await db.animal.findFirst({
    where: { id: animalId, tutor: { ownerVetId: vetId } },
    include: { tutor: true },
  });
  if (!animal) notFound();
  return animal;
}

/** Animal acessível ao tutor (apenas os seus). */
export async function getTutorAnimal(tutorId: string, animalId: string) {
  const animal = await db.animal.findFirst({
    where: { id: animalId, tutorId },
    include: { tutor: true },
  });
  if (!animal) notFound();
  return animal;
}
