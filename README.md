# Sistema de Gestão para Igrejas (MVP Completo)

Sistema web completo e 100% local para gestão administrativa, pastoral, financeira e comunitária de igrejas, desenvolvido com **Next.js App Router**, **TypeScript strict**, **PostgreSQL + Drizzle ORM**, **Better Auth** e **Tailwind CSS**.

---

## Stack Tecnológica

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Linguagem:** TypeScript (`strict: true`)
- **Banco de Dados:** PostgreSQL 16+ com Drizzle ORM (`drizzle-orm` / `drizzle-kit`)
- **Autenticação & Sessão:** Better Auth (`better-auth`) com RBAC por papéis
- **Validação:** Zod (`zod`) em todas as entradas de servidor
- **UI & Estilização:** Tailwind CSS v4 + Lucide Icons + padrão visual **Sera**

---

## Funcionalidades Implementadas

### Gestão de Pessoas e Comunidade
- **Membros (`/membros`):** cadastro completo, histórico de alterações, vínculos familiares e aniversariantes (`/membros/aniversariantes`).
- **Jornada do Membro (`/membros/jornada`):** acompanhamento por etapas (Visitante → Liderança em formação) com alertas de estagnação (> 90 dias).
- **Visitantes (`/visitantes`):** registro de visitas, acompanhamento (`novo`, `em_contato`, `integrado`) e conversão para membro.
- **Células (`/celulas`):** grupos, membros vinculados, reuniões e lista de presença.
- **Mapa por Bairro (`/relatorios/bairros`):** agrupamento local de membros ativos e células por bairro normalizado, sem APIs externas.
- **Banco de Talentos (`/ministerios/talentos`):** habilidades, níveis, disponibilidade por dia/período e convite via aviso interno.

### Cultos, Eventos e Ministérios
- **Cultos e Eventos (`/cultos`):** agenda, recorrência, cancelamento com motivo e inscrições com vagas, lista de espera automática e check-in (`/cultos/[id]/inscrever`).
- **Presença (`/presenca`):** chamada por culto e relatórios de frequência.
- **Ministérios e Escalas (`/ministerios`, `/escalas`):** equipes, escalas de voluntários e visão individual (`/escalas/minhas`).
- **Louvor (`/louvor/musicas`, `/louvor/setlists`):** repertório com tom/letra/cifra e setlists por culto.
- **Check-in Infantil (`/infantil/check-in`):** entrada/saída segura de crianças com código de retirada e responsáveis autorizados.
- **Cursos e EBD (`/cursos`):** turmas, matrículas com limite de vagas, aulas e frequência própria.
- **Cerimônias (`/cerimonias`):** batismos, apresentações e certificados locais.
- **Transporte (`/transporte`):** veículos, viagens vinculadas a eventos e lista de passageiros com bloqueio de capacidade.

### Financeiro e Patrimônio
- **Financeiro (`/financeiro`):** receitas, despesas (`/financeiro/lancamentos`), contas a pagar/receber (`/financeiro/contas`), fechamento mensal (`/financeiro/fechamento`) e orçamento anual (`/financeiro/orcamento`).
- **Contribuições Recorrentes (`/financeiro/recorrentes`):** compromissos declarados com geração de 12 meses e confirmação manual vinculada ao financeiro.
- **Fornecedores e Contratos (`/financeiro/fornecedores`):** cadastro, despesas vinculadas e alertas de vencimento.
- **Loja e Cantina / PDV (`/loja/vender`, `/loja/produtos`, `/loja/vendas`):** ponto de venda local com baixa de estoque em transação, lançamento automático no financeiro e estorno em cancelamentos.
- **Patrimônio e Reservas (`/patrimonio`, `/reservas`):** inventário de bens, etiquetas e agendamento de salas/recursos.

### Comunicação, Documentos e Pastoral
- **Agenda Pastoral (`/agenda-pastoral`):** atendimentos com bloqueio de conflito de horário e notas privadas exclusivas do pastor responsável.
- **Documentos Oficiais (`/documentos`):** versionamento local (PDF/DOCX/ODT até 10 MB), controle de visibilidade por papel e download autenticado.
- **Pesquisas e Formulários (`/pesquisas`):** enquetes internas com múltiplos tipos de pergunta e resultados agregados.
- **Mensagens Internas (`/mensagens`):** conversas diretas e em grupo entre usuários do sistema.
- **Avisos (`/avisos`), Pedidos de Oração (`/oracao`), Sermões (`/sermoes`), Leitura Bíblica (`/leitura`) e Missões (`/missoes`).**

### Administração, Acessibilidade e Auditoria
- **Usuários e Permissões (`/configuracoes/usuarios`):** gestão de contas e matriz interativa de permissões por papel (editável apenas por administradores).
- **Auditoria (`/configuracoes/auditoria`):** trilha de ações sensíveis no sistema.
- **Acessibilidade e Idioma (`/acessibilidade`):** escala de fonte, redução de movimento, alto contraste, listas simplificadas e suporte a `pt-BR`, `es` e `en`.

---

## Perfis de Acesso (RBAC)

| Papel | Descrição |
| :--- | :--- |
| `admin` | Administrador — acesso total ao sistema e gestão de permissões |
| `pastor` | Pastor — gestão pastoral, membros, eventos, financeiro e relatórios |
| `secretario` | Secretário — membros, visitantes, células, cultos, escalas e avisos |
| `tesoureiro` | Tesoureiro — gestão financeira completa e relatórios |
| `lider_celula` | Líder de Célula — células, presença e avisos |
| `voluntario` | Voluntário — visualização de escalas, cultos, avisos e painel pessoal |

---

## Pré-requisitos e Instalação Local

1. **Pré-requisitos:**
   - Node.js 20+ (LTS)
   - PostgreSQL 16+ rodando localmente

2. **Clonar e instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Copie `.env.example` para `.env` e ajuste a `DATABASE_URL` para o seu PostgreSQL local:
   ```env
   DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/sistema_igrejas"
   BETTER_AUTH_SECRET="sua-chave-secreta-local"
   BETTER_AUTH_URL="http://localhost:3000"
   ```

4. **Aplicar migrations e popular dados iniciais (seed):**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Iniciar em desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

### Credenciais de Teste (Seed)
- **Admin:** `admin@igreja.local` / `Admin1234`
- **Pastor:** `pastor@igreja.local` / `Pastor1234`
- **Secretário:** `secretario@igreja.local` / `Secretario1234`
- **Tesoureiro:** `tesoureiro@igreja.local` / `Tesoureiro1234`
- **Líder de Célula:** `lider@igreja.local` / `Lider1234`
- **Voluntário:** `voluntario@igreja.local` / `Voluntario1234`

---

## Scripts Disponíveis

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`next build`)
- `npm run start` — inicia o build de produção
- `npm run lint` — verificação ESLint
- `npx tsc --noEmit` — verificação de tipos TypeScript
- `npm run db:generate` — gera migrations Drizzle
- `npm run db:migrate` — aplica migrations no PostgreSQL
- `npm run db:seed` — popula dados fictícios iniciais
