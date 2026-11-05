import Link from "next/link";
import { login } from "@/app/actions/auth";
import { ActionForm, Input } from "@/components/form";

export const metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Link href="/" className="mb-6 text-lg font-bold text-teal-800">🐾 VetProntuário</Link>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Entrar</h1>
      <ActionForm action={login} submitLabel="Entrar">
        <Input label="E-mail" name="email" type="email" autoComplete="email" required />
        <Input label="Senha" name="password" type="password" autoComplete="current-password" required />
      </ActionForm>
      <p className="mt-6 text-sm text-stone-600">
        Ainda não tem conta? <Link href="/cadastro" className="font-medium text-teal-800 hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
}
