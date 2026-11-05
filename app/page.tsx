import Link from "next/link";
import { getUser } from "@/lib/dal";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();
  if (user) redirect(user.role === "VET" ? "/vet" : "/tutor");

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <p className="text-5xl">🐾</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
        O prontuário do seu paciente, <span className="text-teal-700">sempre à mão</span>.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-stone-600">
        Veterinários registram consultas, receitas, vacinas e vermífugos. Tutores acompanham o histórico completo e
        recebem a carteira de vacinação do pet sempre atualizada.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">
          Entrar
        </Link>
        <Link href="/cadastro" className="rounded-lg border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-100">
          Criar conta
        </Link>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Para veterinários</h2>
          <p className="mt-1 text-sm text-stone-600">
            Anamnese, exame físico, diagnóstico, receita e retornos em um só lugar, com campo de anotações reservado à equipe clínica.
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="font-semibold text-stone-900">Para tutores</h2>
          <p className="mt-1 text-sm text-stone-600">
            Histórico de consultas, receitas e carteira de vacinação com avisos de reforço, para imprimir ou mostrar a outro veterinário.
          </p>
        </div>
      </div>
    </div>
  );
}
