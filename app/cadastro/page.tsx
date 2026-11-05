import Link from "next/link";
import { registerTutor, registerVet } from "@/app/actions/auth";
import { ActionForm, Input } from "@/components/form";

export const metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: PageProps<"/cadastro">) {
  const sp = await searchParams;
  const tipo = sp.tipo === "tutor" ? "tutor" : "vet";
  const codigo = typeof sp.codigo === "string" ? sp.codigo : "";

  const tab = (active: boolean) =>
    `flex-1 rounded-md px-3 py-2 text-center text-sm font-medium ${active ? "bg-white text-teal-800 shadow-sm" : "text-stone-600 hover:text-stone-900"}`;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-lg font-bold text-teal-800">🐾 VetProntuário</Link>
      <h1 className="mb-4 text-2xl font-bold text-stone-900">Criar conta</h1>
      <div className="mb-6 flex rounded-lg bg-stone-200 p-1">
        <Link href="/cadastro?tipo=vet" className={tab(tipo === "vet")}>Sou veterinário</Link>
        <Link href="/cadastro?tipo=tutor" className={tab(tipo === "tutor")}>Sou tutor</Link>
      </div>

      {tipo === "vet" ? (
        <ActionForm action={registerVet} submitLabel="Criar conta">
          <Input label="Nome completo" name="name" autoComplete="name" required />
          <Input label="CRMV" name="crmv" placeholder="ex.: CRMV-SP 12345" required />
          <Input label="E-mail" name="email" type="email" autoComplete="email" required />
          <Input label="Senha" name="password" type="password" autoComplete="new-password" minLength={8} required hint="Mínimo de 8 caracteres" />
        </ActionForm>
      ) : (
        <ActionForm action={registerTutor} submitLabel="Criar conta">
          <Input label="Código de convite" name="inviteCode" defaultValue={codigo} required hint="Peça ao seu veterinário. Ele aparece no cadastro do tutor." />
          <Input label="Seu nome" name="name" autoComplete="name" required />
          <Input label="E-mail" name="email" type="email" autoComplete="email" required />
          <Input label="Senha" name="password" type="password" autoComplete="new-password" minLength={8} required hint="Mínimo de 8 caracteres" />
        </ActionForm>
      )}
      <p className="mt-6 text-sm text-stone-600">
        Já tem conta? <Link href="/login" className="font-medium text-teal-800 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
