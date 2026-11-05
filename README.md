# VetProntuário

Prontuário eletrônico veterinário com dois perfis:

- **Veterinário**: cadastra tutores e pacientes, registra consultas (anamnese, exame físico, diagnóstico, conduta, receita, retorno), vacinas e vermífugos; vê reforços atrasados no painel; tem campo de anotações reservadas.
- **Tutor**: acessa o portal com um **código de convite** gerado pelo veterinário; vê histórico, receitas e carteira de vacinação (com aviso de reforço) e pode imprimir. Não vê as anotações reservadas.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind 4 · Prisma 6 · PostgreSQL · sessão por cookie JWT (jose) · senhas com bcrypt.

## Rodar localmente

```bash
cp .env.example .env        # ajuste DATABASE_URL e SESSION_SECRET
npm install
npx prisma migrate dev      # cria as tabelas
npm run db:seed             # dados de exemplo (opcional)
npm run dev
```

Contas do seed (senha `senha12345`): `vet@exemplo.com` e `tutor@exemplo.com`. Código de convite de demonstração: `CONVITE-DEMO`.

## Segurança e privacidade (LGPD)

- Toda leitura passa por `lib/dal.ts`: o veterinário só acessa tutores/pacientes que cadastrou; o tutor só acessa os seus. Fora disso, 404.
- `privateNotes` nunca é carregado nas consultas do portal do tutor.
- Prontuários não têm exclusão pela interface (histórico clínico deve ser preservado).
- Cookie `httpOnly`, `sameSite=lax`, `secure` em produção. Em produção use um `SESSION_SECRET` longo e aleatório e HTTPS.

## Próximos passos sugeridos

Anexos de exames (armazenamento de arquivos), clínicas com várias pessoas na equipe, agenda e lembretes por e-mail/WhatsApp, edição e correção de registros com histórico de auditoria, limite de tentativas de login, compartilhamento do prontuário com outro veterinário (autorizado pelo tutor), exportação em PDF da receita e da carteira.
