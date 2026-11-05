import { createTutor } from "@/app/actions/vet";
import { ActionForm, Input } from "@/components/form";
import { Card, PageTitle } from "@/components/shell";

export const metadata = { title: "Novo tutor" };

export default function NovoTutor() {
  return (
    <>
      <PageTitle title="Novo tutor" />
      <Card className="max-w-xl">
        <ActionForm action={createTutor} submitLabel="Salvar tutor">
          <Input label="Nome completo" name="name" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail" name="email" type="email" />
            <Input label="Telefone" name="phone" type="tel" />
          </div>
          <Input label="CPF" name="cpf" hint="Opcional. Dado pessoal: colete apenas se necessário (LGPD)." />
        </ActionForm>
      </Card>
    </>
  );
}
