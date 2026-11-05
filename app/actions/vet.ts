"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getVetAnimal, requireVet } from "@/lib/dal";
import type { FormState } from "./auth";

const opt = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida").transform((v) => new Date(`${v}T00:00:00Z`));
const optDate = z
  .string()
  .optional()
  .transform((v) => (v ? v : undefined))
  .pipe(date.optional());
const optNum = (min: number, max: number, msg: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(",", ".")) : undefined))
    .pipe(z.number().min(min, msg).max(max, msg).optional());

function first(e: z.ZodError) {
  return e.issues[0].message;
}

/* ---------- Tutor ---------- */

export async function createTutor(_: FormState, formData: FormData): Promise<FormState> {
  const vet = await requireVet();
  const p = z
    .object({
      name: z.string().trim().min(2, "Informe o nome do tutor").max(120),
      email: opt(160),
      phone: opt(30),
      cpf: opt(20),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: first(p.error) };

  const tutor = await db.tutor.create({ data: { ...p.data, ownerVetId: vet.id } });
  redirect(`/vet/tutores/${tutor.id}`);
}

/* ---------- Animal ---------- */

export async function createAnimal(_: FormState, formData: FormData): Promise<FormState> {
  const vet = await requireVet();
  const p = z
    .object({
      tutorId: z.string().min(1, "Selecione o tutor"),
      name: z.string().trim().min(1, "Informe o nome do animal").max(80),
      species: z.enum(["CAO", "GATO", "AVE", "ROEDOR", "REPTIL", "EQUINO", "OUTRO"]),
      sex: z.enum(["MACHO", "FEMEA"]),
      neutered: z.string().optional(),
      breed: opt(80),
      birthDate: optDate,
      color: opt(60),
      microchip: opt(40),
      allergies: opt(500),
      notes: opt(2000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: first(p.error) };

  const tutor = await db.tutor.findFirst({ where: { id: p.data.tutorId, ownerVetId: vet.id } });
  if (!tutor) return { error: "Tutor não encontrado" };

  const { neutered, ...rest } = p.data;
  const animal = await db.animal.create({ data: { ...rest, neutered: neutered === "on" } });
  redirect(`/vet/animais/${animal.id}`);
}

/* ---------- Consulta ---------- */

export async function createConsultation(_: FormState, formData: FormData): Promise<FormState> {
  const vet = await requireVet();
  const raw = Object.fromEntries(formData);
  const p = z
    .object({
      animalId: z.string().min(1),
      date,
      reason: z.string().trim().min(2, "Informe o motivo da consulta").max(500),
      anamnesis: opt(),
      weightKg: optNum(0.01, 2000, "Peso inválido"),
      temperatureC: optNum(25, 45, "Temperatura inválida"),
      heartRate: optNum(0, 500, "Frequência cardíaca inválida"),
      respRate: optNum(0, 300, "Frequência respiratória inválida"),
      physicalExam: opt(),
      diagnosis: opt(),
      treatment: opt(),
      returnDate: optDate,
      privateNotes: opt(),
    })
    .safeParse(raw);
  if (!p.success) return { error: first(p.error) };

  await getVetAnimal(vet.id, p.data.animalId);

  const ids = [...formData.keys()]
    .map((k) => /^rx_medication_(\d+)$/.exec(k)?.[1])
    .filter((x): x is string => !!x);
  const get = (k: string, id: string) => String(formData.get(`rx_${k}_${id}`) ?? "").trim();
  const prescriptions = ids
    .map((id) => ({
      medication: get("medication", id),
      dose: get("dose", id),
      frequency: get("frequency", id),
      duration: get("duration", id) || undefined,
      instructions: get("instructions", id) || undefined,
    }))
    .filter((r) => r.medication || r.dose || r.frequency);
  if (prescriptions.some((r) => !r.medication || !r.dose || !r.frequency)) {
    return { error: "Em cada medicamento, preencha nome, dose e frequência" };
  }

  const { animalId, ...data } = p.data;
  const c = await db.consultation.create({
    data: { ...data, animalId, vetId: vet.id, prescriptions: { create: prescriptions } },
  });
  revalidatePath(`/vet/animais/${animalId}`);
  redirect(`/vet/consultas/${c.id}`);
}

/* ---------- Vacinas / vermífugos ---------- */

export async function createPrevention(_: FormState, formData: FormData): Promise<FormState> {
  const vet = await requireVet();
  const p = z
    .object({
      animalId: z.string().min(1),
      kind: z.enum(["VACINA", "VERMIFUGO", "ANTIPARASITARIO"]),
      name: z.string().trim().min(2, "Informe o nome do produto").max(120),
      appliedAt: date,
      nextDueAt: optDate,
      batch: opt(60),
      notes: opt(500),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) return { error: first(p.error) };

  await getVetAnimal(vet.id, p.data.animalId);
  if (p.data.nextDueAt && p.data.nextDueAt < p.data.appliedAt) {
    return { error: "A próxima dose não pode ser anterior à aplicação" };
  }

  await db.prevention.create({ data: { ...p.data, vetId: vet.id } });
  revalidatePath(`/vet/animais/${p.data.animalId}`);
  redirect(`/vet/animais/${p.data.animalId}`);
}
