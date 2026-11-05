"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const email = z.string().trim().toLowerCase().email("E-mail inválido");
const password = z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(72);
const name = z.string().trim().min(2, "Informe o nome").max(120);

// Hash fictício para igualar o tempo de resposta quando o e-mail não existe.
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "E-mail ou senha inválidos" };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "E-mail ou senha inválidos" };

  await createSession({ userId: user.id, role: user.role });
  redirect(user.role === "VET" ? "/vet" : "/tutor");
}

export async function registerVet(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ name, email, password, crmv: z.string().trim().min(3, "Informe o CRMV").max(30) })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Já existe uma conta com este e-mail" };

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      crmv: parsed.data.crmv,
      role: "VET",
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
    },
  });
  await createSession({ userId: user.id, role: "VET" });
  redirect("/vet");
}

export async function registerTutor(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ name, email, password, inviteCode: z.string().trim().min(6, "Informe o código de convite") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const tutor = await db.tutor.findUnique({ where: { inviteCode: parsed.data.inviteCode } });
  if (!tutor || tutor.userId) return { error: "Código de convite inválido ou já utilizado" };

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Já existe uma conta com este e-mail" };

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: "TUTOR",
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      tutorProfile: { connect: { id: tutor.id } },
    },
  });
  await createSession({ userId: user.id, role: "TUTOR" });
  redirect("/tutor");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
