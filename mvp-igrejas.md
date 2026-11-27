# Prompts completos para Antigravity — Sistema para Igrejas (MVP local)

Prompts prontos para copiar e colar no Antigravity, um por funcionalidade essencial do Sistema para Igrejas, somente com o que dá para desenvolver e testar em ambiente local, na stack Next.js / Tailwind CSS + shadcn/ui / Node.js-TypeScript / Drizzle ORM-PostgreSQL / Better Auth, com as skills do anexo `skills_index.json` e o padrão visual do anexo `design-system.md` (Sera Design System). O banco roda em PostgreSQL instalado localmente na máquina, sem Docker e sem Docker Compose.

## Como usar este documento

Não cole todos os prompts de uma vez. O Antigravity gera código melhor quando recebe um módulo por vez, com o projeto já criado pelo prompt anterior.

1. Cole o Prompt 0 — Fundação primeiro. Ele cria o projeto, o banco local, o design system Sera, a estrutura de pastas e as regras globais que todos os outros prompts reutilizam.
2. Cole os prompts na ordem numérica: Prompt 1 a Prompt 11 (MVP essencial) e, depois, Prompt 12 a Prompt 36 (Parte 2 — 25 novas funcionalidades, no final deste documento). Cada prompt assume que os anteriores já foram aplicados e proíbe recriar tabelas, componentes ou rotas que já existem.
3. Ao final de cada prompt, rode `npm run build`, `npm run lint` e `npx tsc --noEmit`. Só avance se os três passarem. Se falhar, use o Prompt de Correção, no final deste documento, antes de continuar.
4. Nunca peça dois módulos no mesmo prompt. Financeiro, permissões e dados de membros têm prompts próprios.
5. Mantenha o mesmo nome de projeto, as mesmas variáveis de ambiente e o mesmo banco local em todos os prompts. O banco é sempre o PostgreSQL instalado localmente (banco `sistema_igrejas` em `localhost:5432`, sem Docker).
6. Teste cada módulo só com dados fictícios criados pelo seed local. Não use dados reais de membros nesta fase.

### Ordem dos prompts

| Ordem | Prompt | Entrega |
|---|---|---|
| 0 | Fundação | Projeto, Sera, PostgreSQL local sem Docker, estrutura |
| 1 | Autenticação e acesso | Better Auth, papéis, permissões, auditoria |
| 2 | Membros | Cadastro completo, família, status, busca |
| 3 | Visitantes | Cadastro rápido, acompanhamento, conversão |
| 4 | Células | Células, membros da célula, reuniões |
| 5 | Cultos e eventos | Agenda de cultos e eventos |
| 6 | Presença | Chamada, frequência, baixa frequência |
| 7 | Ministérios e escalas | Ministérios, voluntários, escalas |
| 8 | Financeiro | Dízimos, ofertas, despesas, contas, fechamento |
| 9 | Comunicação interna | Mural de avisos dentro do sistema |
| 10 | Dashboard e relatórios | Indicadores, relatórios, PDF e CSV |
| 11 | Configurações e administração | Dados da igreja, backup, importação local |
| 12 | PWA e modo offline | Instalar como app, cache local, fila offline |
| 13 | Patrimônio | Inventário, bens, manutenção, baixa |
| 14 | Reservas | Salas, equipamentos, conflitos de horário |
| 15 | Missões e ação social | Projetos, doações de itens, beneficiários |
| 16 | Sermões e mídia | Biblioteca local de sermões, estudos e arquivos |
| 17 | Cerimônias | Batismo, casamento, apresentação, memoriais |
| 18 | Leitura bíblica | Planos de leitura, progresso, devocionais |
| 19 | Oração | Pedidos de oração e intercessão |
| 20 | Orçamento anual | Previsto x realizado por categoria e mês |
| 21 | Contribuições recorrentes | Compromissos recorrentes só de registro local |
| 22 | Documentos da igreja | Atas, estatuto, arquivos com versão e acesso |
| 23 | Loja e cantina — PDV local | Produtos, estoque, vendas manuais, caixa |
| 24 | Pesquisas e formulários | Enquetes, formulários internos, resultados |
| 25 | Mapa por bairro | Membros e células agrupados por bairro |
| 26 | Fornecedores e contratos | Cadastro, contratos, vencimentos |
| 27 | Inscrições em eventos | Inscrição interna, vagas, check-in |
| 28 | Transporte e logística | Rotas, veículos, passageiros por evento |
| 29 | Talentos e habilidades | Banco de talentos para servir e recrutar |
| 30 | Agenda pastoral | Atendimentos e aconselhamento com sigilo |
| 31 | Jornada do membro | Trilha de integração e discipulado por etapas |
| 32 | Cursos e Escola Bíblica | Turmas, aulas, frequência e materiais |
| 33 | Check-in infantil | Entrada/saída segura de crianças no culto |
| 34 | Louvor — repertório | Músicas, cifras, setlists por culto |
| 35 | Acessibilidade e idiomas | Preferências de leitura e idioma da interface |
| 36 | Mensagens internas | Conversas dentro do sistema, sem app externo |
| — | Correção | Corrigir build, lint e tipos sem mudar escopo |
| — | Auditoria final | Conferir tudo, testes locais e README — reaplicar após o Prompt 36 |

### Stack fixa em todos os prompts

- Framework: Next.js 15+ com App Router, React Server Components por padrão e Server Actions para mutações.
- Linguagem: TypeScript em modo `strict`, sem `any` sem justificativa em comentário.
- Backend: Node.js com TypeScript, lógica em Server Actions e queries separadas em `src/server/`.
- Estilo: Tailwind CSS + shadcn/ui, ícones Lucide, fontes Inter Tight e Inter.
- Banco: PostgreSQL instalado localmente na máquina (sem Docker, sem Docker Compose) + Drizzle ORM, migrations com Drizzle Kit. Nunca `push` direto sem migration.
- Autenticação: Better Auth com sessão por cookie. Papéis e permissões são regras da aplicação, não do provedor.
- Validação: Zod em todos os formulários e Server Actions, React Hook Form no cliente.
- Datas e dinheiro: datas com `date-fns` no fuso `America/Sao_Paulo`; dinheiro sempre em centavos, como `integer` no banco, exibido em reais (BRL).
- Idioma da interface: português do Brasil em todos os textos visíveis.
- Testes locais: Vitest para regras e validações e verificação manual guiada por roteiro de aceite em cada prompt. Sem serviço externo.

### Regra de escopo local — vale para todos os prompts

Só entra neste documento o que funciona e pode ser testado em `localhost`, sem conta, chave ou provedor externo.

- Não implementar: Pix, pagamento online, gateway, WhatsApp, SMS, e-mail transacional externo, push notification real, transmissão ao vivo, sincronização com Google Calendar, integração com banco ou contador.
- Recuperação de senha nesta fase é local: fluxo do Better Auth em ambiente local e, quando precisar, link exibido/logado apenas em desenvolvimento. Nunca envio real.
- Upload é local: foto do membro e comprovante de despesa salvos em pasta local de desenvolvimento, com validação de tipo e tamanho. Nada de bucket em nuvem.
- Exportação é local: PDF e CSV gerados pela própria aplicação e baixados pelo navegador.
- Backup é local: exportar e restaurar arquivo gerado na própria máquina.
- Banco sem Docker: o PostgreSQL roda instalado diretamente na máquina, como serviço local. Não criar nem exigir `docker-compose.yml`, Dockerfile ou container em nenhum prompt deste documento.

### Skills do anexo usadas neste documento

As skills abaixo foram selecionadas do `skills_index.json` por aderência direta à stack e ao módulo. Cada prompt repete apenas as skills que ele realmente usa, para o Antigravity não carregar contexto desnecessário.

| Skill (id no anexo) | Quando usar |
|---|---|
| `react-nextjs-development` | App Router, Server Components, Server Actions e rotas |
| `nextjs-app-router-patterns` | Arquitetura Next.js 14+, padrões full-stack |
| `senior-frontend` | Componentes React, Next.js, TypeScript e Tailwind |
| `frontend-developer` | Layout responsivo e estado no cliente |
| `senior-fullstack` | Integração interface, serviço, banco e entrega |
| `drizzle-orm-expert` | Schema Drizzle, queries relacionais e migrations |
| `drizzle-migration-conflict` | Conflitos de migration |
| `postgresql` | Modelagem PostgreSQL, índices e constraints |
| `postgres-best-practices` | Performance e boas práticas de query |
| `shadcn` | Instalação e uso correto de componentes shadcn/ui |
| `tailwind-design-system` | Tokens e variantes com Tailwind |
| `tailwind-patterns` | Configuração e padrões Tailwind |
| `zod-validation-expert` | Schemas Zod, erros e integração com formulários |
| `context7-auto-research` | Consultar documentação atualizada das bibliotecas |
| `007` | Auditoria de segurança e verificações OWASP |
| `api-security-best-practices` | Autenticação, autorização e validação em API |
| `backend-security-coder` | Código backend seguro e validação de entrada |
| `better-accessibility` | WCAG 2.2, foco, teclado e leitores de tela |
| `fixing-accessibility` | Correção de ARIA, contraste e formulários |
| `jest-skill` | Testes em JavaScript/TypeScript |
| `vitest-skill` | Testes unitários com Vitest |
| `announcement-board` | Mural de avisos: autor, audiência, publicação e expiração |
| `advanced-analytics-dashboard` | Métricas de dashboard: fórmula, período e fonte |
| `data-export-engine` | Registro e controle de exportações |
| `document-management-system` | Registro de documentos e arquivos enviados |

> Nota sobre Better Auth: não há no anexo uma skill específica de Better Auth. Por isso, os prompts que usam Better Auth instruem o Antigravity a consultar a documentação oficial atual da biblioteca antes de codar, em vez de inventar API. O mesmo vale para qualquer API que mudar entre versões.

### Padrão visual Sera — resumo obrigatório em todos os prompts

Todo prompt abaixo já carrega estas regras. Não as remova ao colar.

- Monocromo como base: branco, cinzas e preto constroem 90% da tela. Um único azul de ação: `#1447E6`.
- Cantos retos: raio de `2px` em cards, botões, inputs, toggles e selects. Nada de pill, nada de cantos grandes.
- Borda em vez de sombra: cards com `1px solid #E5E5E5`, sem sombra. Elevação só em menu e popover, com `0 4px 16px rgba(0, 0, 0, 0.08)`.
- Fundo da página em `#F5F5F5` (Neutral 50). Cards brancos com padding de `24px` e gap de `16px` a `20px` entre cards.
- Título de todo card em caixa alta, `13px`, peso `700`, `letter-spacing: 0.02em`, com descrição de uma linha em cinza `#737373` logo abaixo.
- Labels de campo em caixa alta, `10px`, peso `700`, `letter-spacing: 0.08em`. Botões em caixa alta, `11px`, peso `700`, `letter-spacing: 0.06em`.
- Um único botão primário azul por card. Ação secundária é sempre outline ou ghost, nunca um segundo azul.
- Gráficos monocromáticos em cinzas. Azul só para a série em destaque ou período selecionado.
- Dinheiro positivo em verde `#2E7D4F` com sinal `+`. Erro e exclusão em vermelho `#D92D20`, nunca em botão azul.
- Foco visível de `2px` em `#1447E6` em tudo que é interativo. Contraste mínimo de `4.5:1`. Alvo mínimo de `32px` em botões compactos e `40px` em ações primárias.
- No código, títulos em caixa alta são só estilo visual com CSS. O texto no HTML mantém a capitalização natural para leitores de tela.
- Fontes: Inter Tight para títulos, Inter para interface e corpo, JetBrains Mono só para dados técnicos.

### Convenções que todos os prompts devem respeitar

- Rotas do painel em português: `/painel`, `/membros`, `/visitantes`, `/celulas`, `/cultos`, `/presenca`, `/ministerios`, `/escalas`, `/financeiro`, `/avisos`, `/relatorios`, `/configuracoes`.
- Toda listagem tem busca, filtros quando fizer sentido, paginação no servidor, estado vazio no padrão Sera e estado de carregamento com skeleton.
- Toda exclusão de registro de negócio é lógica (`deletedAt`), nunca física, exceto onde o prompt disser o contrário.
- Toda mutação valida sessão, permissão, entrada com Zod e igreja/tenant quando houver, nessa ordem. Erro de permissão nunca vaza dado.
- Todo formulário mostra erro por campo, mantém os valores digitados após erro e desabilita o botão primário enquanto envia.
- Valores monetários: entrada com máscara em reais, armazenamento em centavos, exibição com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- CPF, telefone e CEP: validar formato com Zod, armazenar só dígitos quando for identificador, exibir formatado.

## Prompt 0 — Fundação do projeto, design system Sera, PostgreSQL local (sem Docker) e estrutura

Pré-requisito de todos os outros prompts. Execute uma única vez, em projeto vazio.

```text
Você é um engenheiro de software sênior full-stack. Crie a fundação de um Sistema para Igrejas, para uso e teste somente em ambiente local, sem implementar nenhum módulo de negócio ainda.

STACK OBRIGATÓRIA
Next.js 15+ App Router, React Server Components por padrão, Server Actions para mutações; Node.js + TypeScript strict; Tailwind CSS + shadcn/ui + Lucide; PostgreSQL instalado localmente (sem Docker) + Drizzle ORM + Drizzle Kit; Better Auth (só a fundação/configuração neste prompt, telas no Prompt 1); Zod + React Hook Form; date-fns, clsx, tailwind-merge.

SKILLS A APLICAR
react-nextjs-development, nextjs-app-router-patterns, senior-fullstack, senior-frontend, drizzle-orm-expert, postgresql, shadcn, tailwind-design-system, tailwind-patterns, design-system (padrão Sera do anexo), context7-auto-research, better-accessibility.
Antes de usar qualquer biblioteca com API que muda entre versões, consulte a documentação oficial atual. Não invente métodos, imports ou opções.

AMBIENTE LOCAL — SEM DOCKER, POSTGRESQL INSTALADO NA MÁQUINA
- Não crie docker-compose.yml, Dockerfile nem nenhum serviço em container. O banco é o PostgreSQL 16+ instalado diretamente no sistema operacional (Windows, macOS ou Linux), rodando como serviço local na porta 5432.
- Pré-requisito documentado no README: PostgreSQL 16+ instalado localmente e em execução. No Windows, serviço "postgresql-x64-16" iniciado; no macOS, via instalador oficial ou Homebrew (`brew services start postgresql@16`); no Linux, via gerenciador de pacotes (`sudo systemctl start postgresql`). Ferramenta gráfica opcional: pgAdmin ou DBeaver, conectando em localhost:5432.
- Banco e usuário locais de desenvolvimento (executar uma única vez no psql, pgAdmin ou DBeaver, como usuário postgres): CREATE DATABASE sistema_igrejas; e, se quiser separar do superusuário, CREATE USER igrejas_dev WITH PASSWORD 'igrejas_dev_local'; GRANT ALL PRIVILEGES ON DATABASE sistema_igrejas TO igrejas_dev; No PostgreSQL 15+, conceda também o uso do schema public ao usuário da aplicação. Todos os valores são fictícios e só de desenvolvimento local.
- .env.example com DATABASE_URL apontando para o PostgreSQL local, no formato postgresql://USUARIO:SENHA@localhost:5432/sistema_igrejas (exemplo de desenvolvimento: postgresql://igrejas_dev:igrejas_dev_local@localhost:5432/sistema_igrejas), BETTER_AUTH_SECRET (placeholder de desenvolvimento), BETTER_AUTH_URL=http://localhost:3000 e NEXT_PUBLIC_APP_URL=http://localhost:3000. Nunca commite .env real. A conexão Drizzle em src/db/index.ts lê apenas essa DATABASE_URL — sem host de container, sem nome de serviço Docker.
- Scripts no package.json: dev, build, lint, db:generate, db:migrate, db:studio, db:seed, test.
- README inicial com pré-requisitos (Node LTS, PostgreSQL 16+ instalado localmente — sem Docker), passo a passo local: instalar e iniciar o PostgreSQL, criar o banco sistema_igrejas, copiar .env.example para .env e ajustar a DATABASE_URL local, rodar migrations, rodar seed, npm run dev. Inclua a seção de solução de problemas local: serviço do PostgreSQL parado, porta 5432 em uso, senha incorreta na DATABASE_URL e banco ainda não criado.

ESTRUTURA DE PASTAS
src/app/(auth), src/app/(dashboard), src/app/api/auth/[...all], src/components/ui (shadcn), src/components/layout, src/components/shared, src/db (schema/index/migrations), src/lib (auth, auth-client, permissions, utils, validations, format), src/server/actions, src/server/queries, src/hooks, src/types, public/uploads (ignorado no git, com .gitkeep). Alias @/ para src/.

DESIGN SYSTEM SERA — TOKENS, NÃO CORES SOLTAS
Crie CSS variables e tema Tailwind com: --blue-600 #1447E6, --blue-700 #0F38B8, --blue-800 #0B2A8A, --blue-200 #A9BBF5, --blue-100 #DCE4FC, --blue-50 #EFF3FE; --neutral-0 #FFFFFF, --neutral-25 #FAFAFA, --neutral-50 #F5F5F5, --neutral-100 #F0F0F0, --neutral-200 #E5E5E5, --neutral-300 #D4D4D4, --neutral-400 #A3A3A3, --neutral-500 #737373, --neutral-600 #525252, --neutral-800 #262626, --neutral-900 #111111, --neutral-950 #0A0A0A; --green-600 #2E7D4F, --red-600 #D92D20, --red-500 #E5484D, --amber-600 #B54708.
Raio global 2px. Fontes Inter Tight (títulos) e Inter (corpo) via next/font, JetBrains Mono só para dados técnicos. Sobrescreva --radius do shadcn para 2px e remova sombras de card.
Componentes base reutilizáveis em src/components/shared: PageHeader, SeraCard (título em caixa alta + descrição + conteúdo + rodapé), EmptyState (borda tracejada), DataTableShell, MoneyText, StatusBadge. Não crie card dentro de card.

LAYOUT BASE (sem dados de negócio)
Sidebar branca 220-240px, item 32px, ícone Lucide 16px, grupos com label de seção, item ativo em Neutral 50. Topbar com busca visual (sem função ainda), nome da igreja placeholder e menu do usuário placeholder. Área de conteúdo em Neutral 50. Layout responsivo: sidebar vira menu recolhível em telas pequenas. Página 404 no padrão Sera.

BANCO — SÓ FUNDAÇÃO NESTE PROMPT
Crie apenas o schema inicial vazio organizado por arquivos (um arquivo por domínio futuro em src/db/schema/) e a conexão Drizzle em src/db/index.ts. Não crie tabelas de membros, financeiro ou eventos aqui. Gere a migration inicial apenas se houver tabela de fundação; caso contrário deixe o pipeline de migrations configurado e documentado.

QUALIDADE
ESLint + Prettier, tsconfig strict, .gitignore completo (node_modules, .env, uploads, .next). Nenhum segredo no código.

ENTREGA E ACEITE
- Com o serviço do PostgreSQL local em execução e o banco sistema_igrejas criado, npm run db:migrate aplica as migrations e npm run dev abre a tela base Sera sem erro. Nenhum comando Docker é necessário nem deve ser usado.
- npm run build, npm run lint e npx tsc --noEmit passam.
Liste arquivos criados, variáveis de ambiente e comandos locais. Não implemente login, membros ou qualquer módulo: isso vem nos próximos prompts.
```

## Prompt 1 — Autenticação, usuários, papéis, permissões e auditoria

Pré-requisito: Prompt 0 aplicado e passando.

```text
Implemente autenticação e controle de acesso completos, testáveis só localmente.

SKILLS: context7-auto-research (documentação oficial atual do Better Auth — siga exatamente, não invente API), api-security-best-practices, backend-security-coder, 007, zod-validation-expert, shadcn, better-accessibility.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

PAPÉIS (roles) FIXOS NESTA FASE
admin (acesso total), pastor, secretario, tesoureiro, lider_celula, voluntario.
Matriz padrão (editável só por admin na tela de permissões do Prompt 11, aqui só aplique):
- admin: tudo.
- pastor: tudo exceto configurações de permissões e exclusão de usuários.
- secretario: membros, visitantes, células, cultos, presença, ministérios, escalas, avisos e relatórios (sem financeiro detalhado: vê apenas totais no dashboard se permitido).
- tesoureiro: financeiro completo e relatórios financeiros; membros somente leitura para vincular dízimo.
- lider_celula: sua(s) célula(s), membros da célula (leitura), reuniões e presença da célula, avisos da célula.
- voluntario: suas escalas, cultos (leitura), avisos e próprio perfil.
Implemente helper central hasPermission(session, modulo, acao) com acoes ver/criar/editar/excluir/exportar e use-o em Server Actions e na renderização de menus/botões. Negar por padrão.

BETTER AUTH E USUÁRIOS
- Tabelas do Better Auth conforme documentação oficial + tabela de perfil da aplicação ligando usuário a papel e, quando aplicável, a membro (memberId nullable, criado no Prompt 2 — deixe a FK para migration desse prompt se necessário; aqui use campo papel e ativo).
- Telas: /entrar (login e-mail+senha), /recuperar-senha (fluxo local: gera solicitação e, em desenvolvimento, mostra instrução de redefinição local sem enviar e-mail), /redefinir-senha, /painel/minha-conta (editar nome, trocar senha com senha atual).
- Sem cadastro público. Criação de usuário só por admin em /configuracoes/usuarios: nome, e-mail, papel, senha temporária definida pelo admin no cadastro local, ativo/inativo. Listagem com busca, filtro por papel e status, ativar/inativar (nunca excluir fisicamente; nunca inativar o próprio usuário nem o último admin).
- Logout, sessão por cookie httpOnly conforme Better Auth, proteção de todas as rotas (dashboard) por middleware/layout server-side, redirecionamento para /entrar sem sessão.
- Seed local: um usuário admin de desenvolvimento com credenciais fictícias documentadas só no README local e no .env.example comentado, mais um usuário fictício por papel para testar permissões. Senhas do seed nunca são de produção.

AUDITORIA
Tabela audit_logs: id, userId, acao, entidade, entidadeId, detalhes (jsonb sem dado sensível/senha), createdAt. Registre login, logout, criação/edição/inativação de usuário e mudanças de papel. Tela de leitura só para admin em /configuracoes/auditoria com filtros por usuário, ação e período. Sem edição/exclusão pela interface.

SEGURANÇA E VALIDAÇÃO
Zod em login e em gestão de usuários (e-mail válido, senha mínima 8 com letra e número na criação/troca). Mensagens de erro genéricas no login (não revele se e-mail existe). Rate limit simples em memória só para tentativas de login em desenvolvimento, documentado como local. Nunca logue senha, token ou CPF.

UI SERA
Login em card centrado sobre Neutral 50, input de linha como padrão Sera, label caixa alta, um primário azul em largura total. Tabelas e formulários seguindo SeraCard e DataTableShell da fundação.

ACEITE LOCAL
Entrar/sair com cada usuário do seed; voluntário não vê Financeiro no menu e recebe erro ao forçar a URL/ação; admin cria e inativa usuário; auditoria registra os eventos; build/lint/tsc passam. Liste rotas, tabelas e roteiro de teste por papel.
```

## Prompt 2 — Membros: cadastro completo, família, status e busca

Pré-requisito: Prompts 0 e 1 aplicados.

```text
Implemente a Gestão de Membros completa.

SKILLS: drizzle-orm-expert, postgresql, postgres-best-practices, zod-validation-expert, senior-frontend, shadcn, document-management-system (apenas para o registro da foto/arquivo local).
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS (Drizzle + migration)
Tabela members: id, fullName, birthDate, cpf (só dígitos, unique quando informado), phone, email, addressStreet, addressNumber, addressComplement, addressDistrict, addressCity, addressState, addressZip, maritalStatus (solteiro/casado/divorciado/viuvo/uniao_estavel), baptismDate, joinedAt, photoPath (nullable, arquivo local), status (ativo/inativo/afastado/transferido/falecido), notes, createdAt, updatedAt, deletedAt.
Tabela member_family_links: id, memberId, relatedMemberId, relation (conjuge/filho/filha/pai/mae/dependente/outro), createdAt, unique(memberId, relatedMemberId). Vínculo é bidirecional na exibição.
Índices: nome (busca), cpf, status, birthDate (mês/dia para aniversariantes).

ROTAS E TELAS
- /membros: listagem paginada no servidor (20/página), busca por nome/CPF/telefone, filtros por status, célula e ministério (filtros de célula/ministério funcionam depois dos Prompts 4 e 7 — deixe a estrutura e ative quando existirem), ordenação por nome. Colunas: foto/avatar com iniciais, nome, telefone, status (badge), célula, ações ver/editar.
- /membros/novo e /membros/[id]/editar: formulário em seções (Dados pessoais, Contato e endereço, Vida na igreja, Família, Observações) com React Hook Form + Zod. CPF válido (dígitos verificadores), e-mail válido, datas não futuras para nascimento/batismo, campos obrigatórios: nome e pelo menos um contato.
- /membros/[id]: ficha com dados, vínculos familiares clicáveis, e blocos preparados para células, ministérios, frequência e financeiro (preenchidos nos prompts seguintes — aqui mostre empty state, não invente dado).
- Foto: upload local para public/uploads/members (ou pasta local configurada), aceitar só JPG/PNG/WebP até 2 MB, validar tipo real, nome de arquivo aleatório, excluir arquivo antigo ao trocar. Sem nuvem.
- Família: na ficha e no formulário, buscar membro existente e vincular com relação; remover vínculo com confirmação. Impedir vínculo consigo mesmo e duplicado.
- Status e histórico: trocar status exige confirmação; registrar em member_history (id, memberId, field, oldValue, newValue, changedBy, createdAt) mudanças de status e de dados principais. Exclusão é lógica (deletedAt) só com permissão excluir, com confirmação digitando o nome.
- /membros/aniversariantes: lista do mês atual e do mês escolhido, ordenada por dia, com idade calculada, exportável depois no Prompt 10 (aqui só a tela).

SERVER ACTIONS E QUERIES
createMember, updateMember, softDeleteMember, changeMemberStatus, linkFamilyMember, unlinkFamilyMember; queries getMembers (filtros+paginação), getMemberById, getBirthdays. Toda mutação grava auditoria (Prompt 1) e member_history quando aplicável.

ACEITE LOCAL
Cadastrar membro com e sem CPF duplicado (duplicado deve falhar com mensagem clara), vincular cônjuge e filho, trocar status, buscar por telefone, filtrar aniversariantes do mês do seed, excluir logicamente e confirmar que some da listagem mas permanece no banco. Seed: pelo menos 15 membros fictícios variados (status, idades, famílias). Build/lint/tsc passam.
```

## Prompt 3 — Visitantes: cadastro rápido, acompanhamento e conversão em membro

Pré-requisito: Prompts 0 a 2 aplicados.

```text
Implemente Visitantes, pensado para uso rápido na recepção durante o culto.

SKILLS: drizzle-orm-expert, zod-validation-expert, senior-frontend, shadcn.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela visitors: id, fullName, phone, email, invitedByMemberId (FK members nullable), invitedByText (nome livre quando não for membro), firstVisitAt, followUpStatus (novo/em_contato/retornou/virou_membro/nao_retornou), responsibleUserId (quem acompanha, nullable), notes, convertedMemberId (nullable), createdAt, updatedAt, deletedAt.
Tabela visitor_visits: id, visitorId, eventId (nullable nesta fase; FK real no Prompt 5 — se a tabela de eventos ainda não existir, crie visitor_visits sem FK de evento e adicione a FK na migration do Prompt 5), visitedAt, notes. Contagem de visitas é derivada desta tabela, nunca campo digitado.

ROTAS E TELAS
- /visitantes: listagem com busca por nome/telefone, filtro por status de acompanhamento e por período da primeira visita, coluna de nº de visitas e última visita.
- Cadastro rápido /visitantes/novo: formulário curto (nome obrigatório, telefone, e-mail, quem convidou com busca de membro ou texto livre, data/hora da visita, observação). Salvar em no máximo 3 campos obrigatórios visíveis. Botão salvar e cadastrar outro.
- /visitantes/[id]: ficha com histórico de visitas, registrar nova visita (data/hora e observação; vincular ao culto depois do Prompt 5), editar dados, mudar status de acompanhamento com registro em auditoria.
- Conversão: ação Converter em membro — abre o formulário de membros (Prompt 2) pré-preenchido com dados do visitante; ao salvar, grava convertedMemberId, muda followUpStatus para virou_membro e impede segunda conversão. Não duplique se já existir membro com mesmo CPF/telefone sem avisar: mostre alerta e exija confirmação.

ACEITE LOCAL
Cadastrar visitante na recepção em menos de 1 minuto, registrar 2ª e 3ª visitas, filtrar por novo/em_contato, converter em membro e conferir que o visitante aponta para o membro criado e não pode converter de novo. Seed: 8 visitantes fictícios em status diferentes. Build/lint/tsc passam.
```

## Prompt 4 — Células e pequenos grupos: cadastro, membros e reuniões

Pré-requisito: Prompts 0 a 3 aplicados.

```text
Implemente Células / Pequenos Grupos com membros, reuniões e presença da reunião (a presença geral de cultos é o Prompt 6 — não duplique).

SKILLS: drizzle-orm-expert, postgresql, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela cells: id, name, leaderMemberId (FK members), coLeaderMemberId (nullable), weekday (0-6), meetingTime (time), addressStreet, addressDistrict, addressCity, isActive, createdAt, updatedAt, deletedAt.
Tabela cell_members: id, cellId, memberId, joinedAt, leftAt (nullable), unique ativo por membro/célula. Um membro pode estar em uma célula principal por vez nesta fase: ao entrar em outra, encerre o vínculo anterior (leftAt) e registre no histórico do membro.
Tabela cell_meetings: id, cellId, meetingDate, topic, notes, createdBy, createdAt, updatedAt, deletedAt.
Tabela cell_meeting_attendance: id, cellMeetingId, memberId, status (presente/ausente/justificado), unique(cellMeetingId, memberId).

ROTAS E TELAS
- /celulas: cards/lista com nome, líder, dia/horário, bairro, nº de membros ativos. Busca por nome/líder/bairro, filtro ativas/inativas.
- /celulas/nova, /celulas/[id]/editar: formulário com líder e vice-líder por busca de membros ativos.
- /celulas/[id]: abas Visão geral, Membros, Reuniões. Membros: adicionar/remover com busca, listar com data de entrada. Reuniões: criar reunião (data, tema, observações), abrir reunião e marcar presença de todos os membros da célula em lista única com salvar em lote.
- Meu escopo: lider_celula só vê e edita as células que lidera (leader ou coLeader ligado ao seu memberId). Teste essa regra no servidor, não só na tela.
- Relatórios desta tela (sem sair do módulo): frequência da célula por período (presentes/total por reunião) e frequência por membro na célula, em tabela simples. Exportação completa fica no Prompt 10.

ACEITE LOCAL
Criar célula, adicionar 6 membros, mover 1 membro de célula encerrando vínculo anterior, registrar 3 reuniões com presença, conferir percentuais. Líder de célula não acessa célula de outro líder pela URL. Seed: 3 células fictícias com reuniões. Build/lint/tsc passam.
```

## Prompt 5 — Cultos e eventos: agenda da igreja

Pré-requisito: Prompts 0 a 4 aplicados.

```text
Implemente Cultos e Eventos (agenda interna, sem integração com calendário externo).

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend, better-accessibility.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela events: id, title, eventType (culto_domingo/culto_oracao/vigilia/batismo/santa_ceia/ensaio/reuniao/evento_especial/outro), startsAt, endsAt (nullable, maior que startsAt), location, theme, preacherText, preacherMemberId (nullable), responsibleUserId (nullable), description, status (agendado/realizado/cancelado), cancelReason (nullable), createdAt, updatedAt, deletedAt.
Se visitor_visits ainda não tem FK de evento, adicione-a agora via migration. Índices: startsAt, status, eventType.

ROTAS E TELAS
- /cultos: visões Lista e Calendário mensal (grade Sera: dia selecionado em quadrado azul, dias com evento marcados). Filtros por tipo, status e período. Separar Próximos e Anteriores.
- /cultos/novo, /cultos/[id]/editar: formulário completo com validação de datas. Recorrência simples local nesta fase: ao criar, permitir repetir semanalmente por N ocorrências (gera eventos individuais editáveis, sem regra RRULE externa).
- /cultos/[id]: detalhes com pregador, responsável, tema, local, contagem de presença (preenchida no Prompt 6), visitantes vinculados e escala (Prompt 7, empty state até lá). Ações: marcar como realizado, cancelar com motivo (exige confirmação, não apaga), duplicar evento.
- Visitantes: na ficha do evento, vincular visita de visitante existente ou cadastrar visita rápida reaproveitando o Prompt 3.

ACEITE LOCAL
Criar culto de domingo recorrente por 4 semanas, editar só uma ocorrência, cancelar um evento com motivo, conferir calendário e lista, vincular visitante ao culto. Seed: cultos fictícios passados e futuros. Build/lint/tsc passam.
```

## Prompt 6 — Presença e frequência em cultos

Pré-requisito: Prompts 0 a 5 aplicados.

```text
Implemente Presença / Frequência de cultos. Presença de reunião de célula já existe no Prompt 4: reutilize o padrão, não recrie tabelas de célula.

SKILLS: drizzle-orm-expert, postgres-best-practices, zod-validation-expert, shadcn, advanced-analytics-dashboard (apenas para definir fórmula de frequência).
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela attendances: id, eventId (FK events), memberId (nullable), visitorId (nullable), personNameSnapshot, status (presente/ausente/justificado), checkedAt, checkedBy, notes, unique(eventId, memberId) e unique(eventId, visitorId). Exatamente um de memberId/visitorId por linha (constraint).
Fórmula oficial: frequência % = presenças / (presenças + ausências) no período, ignorando justificados no denominador. Documente a fórmula no código e na tela de relatório.

ROTAS E TELAS
- /presenca: escolher evento (padrão: culto mais recente agendado/realizado) e fazer a chamada.
- Chamada /presenca/[eventId]: lista de membros ativos com busca rápida, marcar todos presentes, marcar individual presente/ausente/justificado, incluir visitante do evento, contador ao vivo (presentes/ausentes/justificados/total), salvar em lote em uma Server Action transacional. Permitir corrigir a chamada depois, registrando auditoria.
- /presenca/membro/[memberId]: histórico do membro por período, % de frequência, últimos cultos, sequência de ausências.
- /presenca/relatorio: por período, culto/tipo e célula (membros agrupados pela célula atual): tabela de frequência, total de presentes por culto, média de presença. Alerta de baixa frequência: membros ativos com frequência abaixo de 50% no período (mínimo 4 cultos considerados) ou 3 ausências seguidas, em lista própria para acompanhamento pastoral (sem envio automático de nada).

PERFORMANCE E REGRAS
Salvar chamada de 200 pessoas em uma transação, sem N+1. Chamada só para evento não cancelado. Membro inativo/falecido não entra na lista padrão.

ACEITE LOCAL
Fazer chamada de um culto do seed com 20+ pessoas, corrigir 2 registros, conferir % pela fórmula, conferir alerta de baixa frequência com membro propositalmente ausente. Build/lint/tsc passam.
```

## Prompt 7 — Ministérios e escalas de voluntários

Pré-requisito: Prompts 0 a 6 aplicados.

```text
Implemente Ministérios e Escalas.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela ministries: id, name, description, leaderMemberId (nullable), isActive, createdAt, updatedAt, deletedAt. Seed de nomes sugeridos (criados como dados editáveis, não enum fixo): Louvor, Recepção, Mídia, Infantil, Intercessão, Diáconos, Limpeza, Som.
Tabela ministry_members: id, ministryId, memberId, roleInMinistry (texto: vocal, teclado, recepção etc.), joinedAt, leftAt, unique ativo(ministryId, memberId).
Tabela schedules: id, eventId (FK events), ministryId, title, notes, createdAt, updatedAt, deletedAt.
Tabela schedule_assignments: id, scheduleId, memberId, assignmentRole, status (confirmado/pendente/substituido/cancelado), replacedByMemberId (nullable), unique(scheduleId, memberId, assignmentRole).

ROTAS E TELAS
- /ministerios: lista com líder, nº de voluntários, próxima escala. Criar/editar ministério, ativar/inativar.
- /ministerios/[id]: voluntários (adicionar/remover com função), histórico simples.
- /escalas: calendário/lista por período e por ministério. Criar escala a partir de um culto/evento existente: escolher ministério, adicionar voluntários do ministério com função. Detectar conflito: mesmo membro em duas escalas no mesmo evento/horário sobreposto — mostrar aviso e exigir confirmação, não salvar silenciosamente.
- /escalas/[id]: lista da escala, substituir voluntário (mantém registro: status substituido + replacedByMemberId + auditoria), cancelar designação.
- /escalas/minhas: voluntário vê só as próprias escalas futuras e passadas recentes, com culto, ministério e função.

ACEITE LOCAL
Criar ministério, vincular voluntários, montar escala do culto de domingo, provocar conflito de horário e ver o aviso, substituir um voluntário e conferir histórico. Voluntário em Minhas escalas não vê escala de terceiros. Seed: 4 ministérios com voluntários. Build/lint/tsc passam.
```

## Prompt 8 — Financeiro: dízimos, ofertas, despesas, contas e fechamento mensal

Pré-requisito: Prompts 0 a 7 aplicados. Este é o módulo mais sensível: não misture com nenhum outro prompt.

```text
Implemente o Financeiro manual e local. Sem Pix, sem gateway, sem banco, sem pagamento online: só registro manual conferível pela tesouraria.

SKILLS: drizzle-orm-expert, postgresql, zod-validation-expert, api-security-best-practices, backend-security-coder, document-management-system (comprovante local), shadcn.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

REGRAS DE DINHEIRO (obrigatórias)
Valor sempre em centavos (integer, > 0). Nunca float. Exibição em BRL. Nenhuma edição silenciosa: corrigir lançamento é estorno + novo lançamento, ou edição com auditoria completa antes/depois quando o prompt permitir — escolha estorno para receita/despesa já fechada no mês. Mês fechado (fechamento) bloqueia criar/editar/excluir lançamento naquele mês para não-admin; admin reabre com motivo registrado.

MODELO DE DADOS
Tabela financial_categories: id, name, kind (receita/despesa), isActive, createdAt, updatedAt, deletedAt. Seed editável: receitas — Dízimos, Ofertas, Doações, Cantina/Eventos; despesas — Aluguel, Contas, Manutenção, Missões/Ajuda, Material, Salários/Prebendas (nome configurável).
Tabela financial_transactions: id, kind (receita/despesa), categoryId, memberId (nullable; receita pode ser anônima com isAnonymous=true e sem memberId), visitorNameText (nullable), description, amountCents, transactionDate, paymentMethod (dinheiro/transferencia_manual/cheque/cartao_manual/outro — apenas registro, sem processar), eventId (nullable, culto de origem), supplierText (despesa), dueDate (contas), paidAt (nullable; null = pendente), status derivado de paidAt/dueDate, attachmentPath (comprovante local nullable), reversedOfId (nullable), createdBy, createdAt, updatedAt, deletedAt.
Tabela monthly_closings: id, year, month, totalInCents, totalOutCents, balanceCents, closedBy, closedAt, reopenedBy, reopenedAt, reopenReason, unique(year, month).

ROTAS E TELAS (permissão financeiro: tesoureiro e admin; pastor conforme matriz)
- /financeiro: resumo do mês (entradas, saídas, saldo, contas vencidas), gráfico de barras monocromático Sera por mês, últimas movimentações.
- /financeiro/lancamentos: lista paginada com filtros período/categoria/tipo/membro/status, nova receita (dízimo/oferta com membro buscável ou anônimo), nova despesa (fornecedor, categoria, comprovante local JPG/PNG/PDF até 5 MB).
- Contas a pagar/receber: mesma tabela com dueDate e paidAt — tela /financeiro/contas com abas A vencer, Vencidas, Pagas/Recebidas e ação Dar baixa (paidAt=hoje, com confirmação).
- /financeiro/fechamento: fechar mês (calcula totais no servidor em transação, grava monthly_closings), reabrir só admin com motivo, histórico de fechamentos.
- Relatório do módulo (completo no Prompt 10): por período, categoria e membro (dízimos por membro só para tesoureiro/admin/pastor conforme matriz; nunca expor a voluntário/líder).

ACEITE LOCAL
Lançar dízimo identificado e oferta anônima, despesa com comprovante, conta vencida e dar baixa, fechar o mês e tentar editar lançamento do mês fechado (deve bloquear), conferir totais batendo centavo a centavo com soma manual do seed. Seed: 2 meses fictícios de lançamentos. Build/lint/tsc passam.
```

## Prompt 9 — Comunicação interna: mural de avisos

Pré-requisito: Prompts 0 a 8 aplicados. Sem WhatsApp, sem e-mail, sem push: aviso só dentro do sistema.

```text
Implemente o Mural de Avisos interno.

SKILLS: announcement-board, drizzle-orm-expert, zod-validation-expert, shadcn, better-accessibility.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela notices: id, title, body (texto, sem HTML livre — renderizar como texto com quebras de linha), audienceType (todos/ministerio/celula/papeis), ministryId (nullable), cellId (nullable), priority (normal/importante/urgente), publishAt, expiresAt (nullable, depois de publishAt), isPinned, authorUserId, createdAt, updatedAt, deletedAt.
Tabela notice_reads: id, noticeId, userId, readAt, unique(noticeId, userId).

ROTAS E TELAS
- /avisos: mural do usuário logado — só avisos cuja audiência inclui ele (todos, seu ministério, sua célula ou seu papel), dentro do período publishAt/expiresAt, fixados primeiro, depois mais recentes. Marcar como lido ao abrir; selo Não lido.
- /avisos/novo e /avisos/[id]/editar: criar/editar com audiência escolhida (permissão: admin, pastor, secretario; líder só para sua célula; líder de ministério só para seu ministério — valide no servidor). Agendar publicação futura e expiração.
- /avisos/[id]: leitura completa e, para o autor/admin, lista de quem leu / quem não leu entre os destinatários com usuário no sistema.
- Blocos automáticos de leitura no mural (sem criar aviso falso no banco): aniversariantes da semana (Prompt 2) e próximos cultos (Prompt 5), em cards Sera separados do mural editável.

ACEITE LOCAL
Criar aviso para todos, aviso só para uma célula e aviso agendado; conferir que usuário fora da audiência não vê nem forçando a URL; marcar como lido e conferir lista de leitura. Seed: 5 avisos fictícios. Build/lint/tsc passam.
```

## Prompt 10 — Dashboard, relatórios e exportação PDF/CSV

Pré-requisito: Prompts 0 a 9 aplicados.

```text
Implemente Dashboard inicial, Relatórios e Exportações locais (PDF gerado pela aplicação e CSV, baixados pelo navegador, sem serviço externo).

SKILLS: advanced-analytics-dashboard, data-export-engine, drizzle-orm-expert, postgres-best-practices, senior-frontend, shadcn.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

DASHBOARD /painel (respeitando permissão: quem não tem financeiro não vê valores, vê contagens)
Cards Sera (stat): membros ativos, visitantes no mês, presença no último culto realizado (nº e %), entradas do mês, saídas do mês e saldo (só permissão financeira), contas vencidas, aniversariantes da semana, próximas escalas do usuário, avisos não lidos.
Gráficos monocromáticos Sera (barras em cinzas, azul só na série em destaque): presença nos últimos 6 cultos, entradas x saídas dos últimos 6 meses (só permissão financeira), novos membros/visitantes por mês. Cada métrica com fórmula documentada em comentário e tooltip/descrição curta na tela. Sem biblioteca de gráfico pesada sem necessidade: prefira gráfico simples em SVG/componente próprio no padrão Sera; se usar biblioteca, justifique.

RELATÓRIOS /relatorios (cada um com filtros, tabela paginada e totalizadores)
1. Membros por status, faixa etária, célula e ministério.
2. Frequência: por período/culto/célula/membro, usando a fórmula do Prompt 6.
3. Financeiro mensal e anual: por categoria, por forma de registro e dízimos por membro (permissão restrita).
4. Visitantes e conversões: novos por período, status de acompanhamento, convertidos em membros.
5. Células: reuniões realizadas, média de presença por célula.
6. Escalas: voluntários mais escalados no período (leitura, sem ranking punitivo).

EXPORTAÇÃO
Botões Exportar CSV e Exportar PDF em cada relatório, gerados no servidor a partir dos mesmos filtros da tela (nunca exportar mais do que a tela mostra/permissão permite). CSV com separador ; e encoding compatível com Excel pt-BR, cabeçalho em pt-BR. PDF com cabeçalho com nome da igreja (Prompt 11; até lá use nome placeholder configurável), título do relatório, período, data de geração e totais. Registrar cada exportação em export_logs (usuário, relatório, formato, filtros resumidos sem dado sensível, createdAt) reaproveitando a ideia de data-export-engine. Nome de arquivo: relatorio-<tipo>-<periodo>.pdf/csv.

ACEITE LOCAL
Conferir cada número do dashboard contra consultas dos módulos de origem com o seed; exportar o mesmo relatório em CSV e PDF e conferir totais iguais aos da tela; usuário sem permissão financeira não exporta relatório financeiro nem forçando a rota. Build/lint/tsc passam.
```

## Prompt 11 — Configurações, administração, backup e importação local

Pré-requisito: Prompts 0 a 10 aplicados. Fecha o MVP local.

```text
Implemente Configurações e Administração, backup local e importação/exportação de membros.

SKILLS: drizzle-orm-expert, zod-validation-expert, api-security-best-practices, 007, shadcn, data-export-engine.
REGRAS GLOBAIS (não repita código já criado, reutilize)
- Reutilize fundação, tokens Sera, componentes shadcn/ui, helpers, permissões e schemas já existentes. Não recrie tabela, componente ou rota existente: estenda.
- TypeScript strict, sem any sem justificativa. Zod em toda entrada. Server Actions para mutações, queries separadas em src/server/queries.
- Toda rota do painel exige sessão. Toda mutação confere permissão no servidor, nunca só esconde botão.
- UI Sera: fundo #F5F5F5, cards brancos raio 2px borda 1px #E5E5E5 sem sombra, padding 24px, título de card em caixa alta 13px/700, label 10px/700 caixa alta, botão 11px/700 caixa alta, um único primário azul #1447E6 por card, foco 2px #1447E6, contraste 4.5:1.
- Estados obrigatórios em toda tela: carregando (skeleton), vazio, erro e sucesso (toast). Texto visível em pt-BR.
- Ao terminar: rode npm run build, npm run lint e npx tsc --noEmit, corrija até passar, e liste arquivos criados/alterados, rotas, tabelas e como testar localmente.

MODELO DE DADOS
Tabela church_settings: id (linha única), churchName, legalName, cnpj, email, phone, address completo, logoPath (upload local igual ao padrão de foto), defaultCurrency fixo BRL nesta fase, createdAt, updatedAt.
Reutilize, sem recriar: usuários e permissões (Prompt 1), categorias financeiras (Prompt 8), ministérios (Prompt 7). Telas de configuração apenas orquestram esses cadastros.

ROTAS E TELAS (só admin, exceto Minha conta)
- /configuracoes/igreja: dados da igreja e logo local; esses dados alimentam cabeçalho de PDF (Prompt 10) e topbar.
- /configuracoes/usuarios e /configuracoes/permissoes: reaproveitar Prompt 1; matriz papel x módulo x ação editável por admin com salvar transacional e auditoria; nunca permitir remover o próprio acesso de admin nem deixar o sistema sem admin ativo.
- /configuracoes/cadastros: atalhos e gestão de categorias financeiras, tipos de evento (se virarem cadastro) e demais listas simples já existentes.
- /configuracoes/importar: importar membros por CSV (modelo para download na tela, colunas em pt-BR iguais ao cadastro do Prompt 2): validar arquivo inteiro antes de gravar, mostrar prévia com erros por linha, gravar só linhas válidas após confirmação, relatório de importados/ignorados. Exportar membros em CSV/JSON com permissão exportar.
- /configuracoes/backup: gerar backup local — exportar dados das tabelas de negócio em JSON estruturado versionado + instruções de restauração; botão Restaurar aceita só arquivo gerado por esta aplicação (validar versão e estrutura com Zod), exige confirmação forte e registra auditoria. Documente no README que backup de banco completo é feito com o pg_dump da instalação local do PostgreSQL, fora desta tela. Nunca restaure por cima sem tela de confirmação e resumo do que será substituído.

SEED FINAL E DADOS DE DEMONSTRAÇÃO LOCAL
Consolide um seed único idempotente (rodar 2x não duplica): igreja fictícia, usuários por papel, membros, visitantes, células, cultos, presenças, ministérios, escalas, financeiro de 2 meses, avisos. Comando npm run db:seed documentado.

ACEITE LOCAL
Editar dados da igreja e ver no PDF; alterar uma permissão e conferir efeito imediato no usuário de teste; importar CSV com 2 linhas válidas e 1 inválida (só válidas entram, erro explicado); exportar membros; gerar backup, alterar um dado, restaurar e conferir retorno — tudo em ambiente de teste local descartável. Build/lint/tsc passam.
```

## Prompt de correção — Use quando build, lint ou tipos falharem

Cole este prompt no Antigravity, junto com a saída completa do erro, antes de avançar para o próximo módulo.

```text
Corrija apenas o erro abaixo, sem mudar o escopo, sem criar módulo novo e sem trocar a stack.

ERRO (cole a saída completa de npm run build, npm run lint ou npx tsc --noEmit):
[COLE AQUI]

REGRAS DA CORREÇÃO
- Stack fixa: Next.js App Router, TypeScript strict, Tailwind CSS + shadcn/ui, Drizzle ORM + PostgreSQL, Better Auth, Zod. Não troque biblioteca para contornar o erro sem me avisar e justificar.
- Consulte a documentação oficial atual da biblioteca envolvida no erro (skill context7-auto-research) antes de inventar API, import ou opção.
- Não use any, @ts-ignore ou eslint-disable para esconder o erro, exceto com comentário justificando e alternativa registrada.
- Não apague migration, tabela ou dado para fazer passar. Se a migration estiver errada, gere uma migration de correção.
- Mantenha o padrão Sera (tokens, raio 2px, um primário azul por card) e as permissões no servidor.
- Depois de corrigir, rode npm run build, npm run lint e npx tsc --noEmit e mostre o resultado dos três. Liste exatamente quais arquivos você alterou e por quê.
```

## Prompt final — Auditoria, testes locais e entrega do MVP

Cole este prompt depois do Prompt 11, com todos os módulos aplicados.

```text
Você é um revisor sênior. Audite o Sistema para Igrejas (MVP local) inteiro e deixe-o pronto para uso local contínuo, sem adicionar funcionalidade nova.

SKILLS: 007, api-security-best-practices, backend-security-coder, better-accessibility, fixing-accessibility, vitest-skill, jest-skill, drizzle-migration-conflict.

CHECKLIST DE AUDITORIA (corrija o que falhar, um item por vez, sem mudar escopo)
1. Build: npm run build, npm run lint e npx tsc --noEmit passam do zero, com instruções reproduzíveis.
2. Banco: migrations sobem em banco vazio no PostgreSQL instalado localmente (sem Docker) via db:migrate; seed é idempotente; dinheiro em centavos; constraints de unicidade e FKs conferidas.
3. Permissões: para cada papel do seed, teste no servidor (não só na tela) ver/criar/editar/excluir/exportar em membros, visitantes, células, cultos, presença, ministérios, escalas, financeiro, avisos, relatórios e configurações. Liste a matriz final em tabela.
4. Segurança local: nenhuma rota do painel sem sessão; nenhuma mutação sem permissão e Zod; uploads validados por tipo/tamanho; nenhum segredo, senha ou token em código, log ou seed de produção; mensagens de login genéricas.
5. Sera: confira telas principais contra os tokens — raio 2px, borda sem sombra, um primário azul por card, títulos e labels em caixa alta via CSS, gráficos em cinzas, foco visível, contraste 4.5:1, responsivo.
6. Acessibilidade: navegação por teclado, foco visível, labels associados, erros de formulário anunciados, texto alternativo/avatar com iniciais.
7. Testes: garanta testes Vitest mínimos para validação de CPF, máscara/formatação de dinheiro, fórmula de frequência, regra de mês fechado no financeiro e matriz de permissões. Rode npm test e mostre o resultado.
8. Fluxos ponta a ponta com o seed: login por papel, cadastrar membro e visitante, converter visitante, criar célula e reunião, criar culto, fazer chamada, montar escala, lançar dízimo e despesa, fechar o mês, publicar aviso, ver dashboard, exportar PDF/CSV, importar membros, gerar e restaurar backup em ambiente descartável.
9. Escopo local: confirme que não há integração externa ativa (Pix, gateway, WhatsApp, SMS, e-mail externo, push, streaming, calendário externo). Se houver stub, remova ou desligue e documente.
10. README final: pré-requisitos (Node LTS e PostgreSQL 16+ instalado localmente, sem Docker), subida local completa (instalar/iniciar o PostgreSQL, criar o banco sistema_igrejas, configurar a DATABASE_URL local, migrations e seed), usuários fictícios do seed por papel, comandos de banco, roteiro de testes manuais, estrutura de pastas, decisões (dinheiro em centavos, exclusão lógica, fórmula de frequência) e limitações conhecidas do MVP local. Confirme que o README não menciona Docker em nenhum passo.

ENTREGA DA AUDITORIA
Relatório em tabela: item, status (ok/corrigido/pendente), arquivo(s) afetados e evidência (comando ou roteiro). Não declare pronto nenhum item sem evidência. Ao final, liste o que ficou fora do MVP local e por quê, sem prometer integração externa.
```

## Checklist rápido antes de colar cada prompt

- O prompt anterior passou em `npm run build`, `npm run lint` e `npx tsc --noEmit`?
- O PostgreSQL local está em execução (serviço iniciado, sem Docker), o banco `sistema_igrejas` existe e as migrations estão aplicadas?
- Você está colando um prompt só, completo, sem juntar dois módulos?
- Os dados de teste são fictícios, do seed ou criados por você para testar?
- Se algo falhar, você vai usar o Prompt de Correção antes de continuar?

---

# Parte 2 — 25 novas funcionalidades (Prompts 12 a 36)

Funcionalidades interessantes para adicionar depois do MVP essencial (Prompts 0 a 11), seguindo exatamente o mesmo padrão: uma por prompt, na ordem numérica, só com o que dá para desenvolver e testar em ambiente local, sem provedor externo. Cole um por vez e só avance com `npm run build`, `npm run lint` e `npx tsc --noEmit` passando. Ao terminar o Prompt 36, reaplique o Prompt de Correção (se algo falhar) e o Prompt Final de Auditoria, agora cobrindo os Prompts 0 a 36.

> Regra que continua valendo nesta parte: nada de Pix, gateway, WhatsApp, SMS, e-mail externo, push real, streaming, geolocalização por API externa ou sincronização com calendário externo. Onde a funcionalidade lembraria um serviço externo, a versão aqui é interna e local — registro, controle e tela dentro do próprio sistema.

## Prompt 12 — PWA e modo offline local

Pré-requisito: Prompts 0 a 11 aplicados.

```text
Transforme o sistema em PWA instalável, testável só localmente, sem push real.

SKILLS: react-nextjs-development, nextjs-app-router-patterns, senior-frontend, context7-auto-research (documentação atual de PWA/manifest no Next.js), better-accessibility.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações. UI Sera: fundo #F5F5F5, card branco raio 2px borda 1px #E5E5E5 sem sombra, título de card em caixa alta 13px/700, um primário azul #1447E6 por card, foco 2px #1447E6. Estados: carregando, vazio, erro e sucesso. Ao terminar, build/lint/tsc devem passar e liste arquivos, rotas e roteiro de teste.

ENTREGA
- manifest.webmanifest com nome da igreja (de church_settings), cores Sera (#1447E6 e #F5F5F5) e ícones locais gerados a partir da logo, nos tamanhos exigidos. Service worker só para cache de assets estáticos e das páginas já visitadas (estratégia documentada no código); nunca cachear resposta de financeiro, auditoria ou dados pessoais além da sessão atual.
- Banner interno "Você está offline" quando navigator.onLine for falso, sem bloquear a navegação já cacheada.
- Fila offline local (IndexedDB) apenas para rascunhos não sensíveis: rascunho de aviso (Prompt 9) e rascunho de presença ainda não salva. Ao voltar a conexão local, mostrar os rascunhos pendentes e exigir confirmação do usuário antes de enviar — nunca enviar sozinho.
- Tela /painel/offline no padrão Sera explicando o que funciona offline (consulta ao cache) e o que exige conexão com o servidor local (salvar, financeiro, relatórios).
- Não implementar: push notification, background sync com servidor externo e instalação via loja de apps.

ACEITE LOCAL
Instalar o PWA pelo navegador local, abrir offline pelo DevTools e conferir banner e página offline, criar rascunho offline, reconectar e confirmar o envio manual. Build/lint/tsc passam.
```

## Prompt 13 — Patrimônio e inventário de bens

Pré-requisito: Prompts 0 a 12 aplicados.

```text
Implemente Patrimônio: inventário de bens da igreja, com localização, responsável e manutenção.

SKILLS: drizzle-orm-expert, postgresql, zod-validation-expert, shadcn, document-management-system (foto/nota fiscal local).
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão conferida no servidor. UI Sera completa (raio 2px, borda sem sombra, um primário azul por card, foco visível). Estados: carregando, vazio, erro e sucesso. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela assets: id, name, category (som/instrumento/moveis/informatica/veiculo/cozinha/outro), patrimonyCode (unique), description, locationText, responsibleMemberId (nullable), acquiredAt, acquisitionValueCents (nullable, em centavos), condition (novo/bom/regular/ruim/baixado), photoPath e invoicePath (upload local, JPG/PNG/PDF até 5 MB), createdAt, updatedAt, deletedAt.
Tabela asset_movements: id, assetId, kind (criacao/transferencia_local/manutencao/emprestimo/devolucao/baixa), fromLocation, toLocation, memberId (nullable), notes, createdBy, createdAt. Baixa exige motivo e nunca apaga o histórico.

ROTAS E TELAS
- /patrimonio: lista paginada, busca por nome/código, filtros por categoria, condição e local; valor total de aquisição só para permissão financeira/admin.
- /patrimonio/novo, /patrimonio/[id]/editar e /patrimonio/[id]: ficha com foto, movimentações e registro de manutenção/empréstimo/devolução/baixa.
- Etiqueta local: tela de impressão simples com código e nome do bem, sem serviço externo.

ACEITE LOCAL
Cadastrar bem com código duplicado (deve falhar), transferir de local, registrar empréstimo e devolução, dar baixa com motivo e conferir o histórico. Seed: 12 bens fictícios. Build/lint/tsc passam.
```

## Prompt 14 — Reservas de salas e equipamentos

Pré-requisito: Prompts 0 a 13 aplicados.

```text
Implemente Reservas de salas e equipamentos, com controle de conflito de horário.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend, better-accessibility.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios em toda tela. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela reservable_resources: id, name, kind (sala/equipamento/veiculo), capacity (nullable), locationText, assetId (nullable, reaproveita bem do Prompt 13 sem duplicar cadastro), isActive, createdAt, updatedAt, deletedAt.
Tabela reservations: id, resourceId, eventId (nullable, Prompt 5), title, requestedByUserId, startsAt, endsAt (maior que startsAt), status (pendente/aprovada/recusada/cancelada/concluida), approverUserId (nullable), decisionNotes, createdAt, updatedAt, deletedAt. Índice por resourceId e período.

ROTAS E TELAS
- /reservas: calendário semanal/mensal Sera e lista, filtro por recurso e status. Minhas reservas para qualquer usuário logado.
- /reservas/nova: o servidor bloqueia sobreposição com reserva aprovada do mesmo recurso e mostra o conflito; reserva pendente pode coexistir, aprovada não.
- Aprovação por admin, pastor e secretario, com justificativa registrada em auditoria. Cancelar reserva própria até o início, com confirmação.

ACEITE LOCAL
Reservar a mesma sala em horários diferentes (passa), no mesmo horário já aprovado (bloqueia com mensagem clara), aprovar, recusar e cancelar. Seed: 4 recursos e 6 reservas fictícias. Build/lint/tsc passam.
```

## Prompt 15 — Missões e ação social: projetos, doações de itens e beneficiários

Pré-requisito: Prompts 0 a 14 aplicados.

```text
Implemente Missões e Ação Social: projetos de ajuda com doações em itens e dinheiro registrado manualmente (sem pagamento online).

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela social_projects: id, name, description, kind (missoes/acao_social/campanha), startsAt, endsAt (nullable), goalCents (nullable), responsibleMemberId (nullable), status (planejado/ativo/encerrado), createdAt, updatedAt, deletedAt.
Tabela aid_beneficiaries: id, fullName, phone, addressDistrict, familySize, notes, isMember (bool), memberId (nullable), createdAt, updatedAt, deletedAt. Dado sensível: só admin, pastor, secretario e responsável do projeto veem nome completo e telefone.
Tabela item_donations: id, projectId, donorMemberId (nullable), donorText, itemDescription, quantity, unit, donatedAt, deliveredAt (nullable), beneficiaryId (nullable), createdBy, createdAt. Doação em dinheiro do projeto é lançamento do Financeiro (Prompt 8) com categoria própria — vincule por financialTransactionId nullable, nunca duplique o valor em outra tabela.

ROTAS E TELAS
- /missoes: projetos ativos com meta, arrecadado (via financeiro vinculado) e itens recebidos/entregues.
- /missoes/[id]: abas Visão geral, Doações de itens, Beneficiários e Entregas. Registrar doação, registrar entrega a beneficiário com data e responsável.
- Relatório do projeto: itens em estoque do projeto (recebidos menos entregues) e famílias atendidas no período.

ACEITE LOCAL
Criar projeto, receber itens, entregar a beneficiário, vincular lançamento financeiro e conferir saldos de itens e de meta. Usuário sem permissão não vê dados de beneficiários nem forçando a URL. Seed: 2 projetos fictícios. Build/lint/tsc passam.
```

## Prompt 16 — Sermões, estudos e biblioteca de mídia local

Pré-requisito: Prompts 0 a 15 aplicados.

```text
Implemente a biblioteca de Sermões e Estudos com arquivos locais. Sem streaming e sem hospedagem externa: arquivo enviado fica na pasta local, como foto e comprovante.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, document-management-system, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela sermons: id, title, preacherText, preacherMemberId (nullable), eventId (nullable, culto de origem), preachedAt, bibleReference (texto livre, ex.: João 3), seriesName (nullable), summary, tags (texto separado por vírgula nesta fase), audioPath, videoPath, pdfPath e notesPath (todos nullable, upload local: áudio MP3, vídeo MP4, documento PDF até o limite configurado e validado por tipo real), isPublished (só publicado aparece para voluntário), createdAt, updatedAt, deletedAt.

ROTAS E TELAS
- /sermoes: biblioteca com busca por título, pregador, passagem e série; filtro por período. Player de áudio/vídeo é o elemento nativo do navegador servindo o arquivo local — sem plataforma externa.
- /sermoes/novo e /sermoes/[id]: cadastro/edição e ficha com download dos anexos locais e esboço em texto.
- Vincular ao culto do Prompt 5: na ficha do evento, listar sermão vinculado quando existir.

ACEITE LOCAL
Cadastrar sermão com áudio e PDF locais, buscar por passagem, despublicar e conferir que voluntário não o vê, abrir a partir do culto vinculado. Seed: 6 sermões fictícios sem arquivo pesado (arquivo de exemplo pequeno ou sem anexo). Build/lint/tsc passam.
```

## Prompt 17 — Cerimônias: batismo, casamento, apresentação e memoriais

Pré-requisito: Prompts 0 a 16 aplicados.

```text
Implemente Cerimônias: solicitação, preparação e realização de batismos, casamentos, apresentações de crianças e memoriais, ligadas à agenda de eventos.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela ceremonies: id, kind (batismo/casamento/apresentacao_crianca/memorial/outro), title, eventId (nullable; ao confirmar a data, criar/vincular evento do Prompt 5), requestedByText, responsibleUserId (nullable), scheduledAt, status (solicitada/em_preparacao/confirmada/realizada/cancelada), notes, createdAt, updatedAt, deletedAt.
Tabela ceremony_participants: id, ceremonyId, memberId (nullable), personName, roleInCeremony (batizando/noivo/noiva/crianca/pai/mae/familiar/outro), birthDate (nullable, para apresentação), preparationDone (bool), notes, unique(ceremonyId, personName, roleInCeremony).
Para batismo realizado: ao marcar realizada, atualizar baptismDate do membro participante quando houver memberId, registrando em member_history (Prompt 2) — nunca sobrescrever data existente sem confirmação.

ROTAS E TELAS
- /cerimonias: lista com filtro por tipo, status e período. Nova solicitação com participantes.
- /cerimonias/[id]: participantes com checklist de preparação, confirmar data (cria evento), cancelar com motivo, marcar realizada.
- Certificado local: tela de impressão/PDF simples gerado pela aplicação com nome, cerimônia, data e nome da igreja (church_settings), no padrão Sera.

ACEITE LOCAL
Solicitar batismo com 3 participantes, concluir a preparação, confirmar (evento criado), realizar e conferir baptismDate e histórico do membro; gerar certificado de apresentação. Seed: 4 cerimônias fictícias. Build/lint/tsc passam.
```

## Prompt 18 — Planos de leitura bíblica e devocionais

Pré-requisito: Prompts 0 a 17 aplicados.

```text
Implemente Planos de Leitura Bíblica e Devocionais internos. O texto bíblico não é embutido nem copiado de fonte externa: cada dia guarda apenas a referência (livro, capítulo) e o devocional é texto escrito pela própria igreja.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend, better-accessibility.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela reading_plans: id, title, description, durationDays, isActive, createdBy, createdAt, updatedAt, deletedAt.
Tabela reading_plan_days: id, planId, dayNumber, bibleReference, devotionalTitle, devotionalBody (texto da igreja, nullable), unique(planId, dayNumber).
Tabela reading_progress: id, userId, memberId (nullable), planId, dayNumber, completedAt, unique(userId, planId, dayNumber).

ROTAS E TELAS
- /leitura: planos ativos, meu progresso em barra Sera (cinzas, azul só no percentual em destaque) e leitura de hoje conforme a data de início do usuário no plano.
- /leitura/[planId]: dias do plano, marcar/desmarcar dia como lido, devocional do dia em texto.
- Gestão (admin, pastor, secretario): criar plano e cadastrar os dias em lote por formulário simples ou importação CSV local no mesmo padrão do Prompt 11.
- Líder de célula vê, na sua célula, apenas o percentual agregado de conclusão — nunca a lista individual sem permissão.

ACEITE LOCAL
Criar plano de 7 dias, iniciar, marcar 3 dias, conferir percentual e leitura de hoje, importar dias por CSV com uma linha inválida (erro explicado, válidas entram). Seed: 1 plano fictício de 30 dias com referências. Build/lint/tsc passam.
```

## Prompt 19 — Pedidos de oração e intercessão

Pré-requisito: Prompts 0 a 18 aplicados.

```text
Implemente Pedidos de Oração com sigilo por nível de visibilidade, atendidos só dentro do sistema.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices, backend-security-coder.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela prayer_requests: id, authorUserId (nullable), authorMemberId (nullable), authorText (quando não logado internamente, registrado pela secretaria), title, body, visibility (publico/intercessores/pastoral), isAnonymous (bool — quando verdadeiro, nunca exibir autor fora do nível pastoral), status (ativo/atendido/arquivado), answeredNotes (nullable), createdAt, updatedAt, deletedAt.
Tabela prayer_commitments: id, prayerRequestId, userId, prayedAt, unique(prayerRequestId, userId, dia) — registrar "orei por este pedido" sem expor lista pública de quem orou.

ROTAS E TELAS
- /oracao: pedidos visíveis para o usuário conforme visibility e papel: publico para todos os logados; intercessores para membros do ministério de Intercessão (Prompt 7); pastoral só para pastor e admin.
- /oracao/novo: criar pedido com escolha de visibilidade e anonimato explicados em texto curto antes de salvar.
- /oracao/[id]: ler, registrar oração, e autor/pastoral marca como atendido com nota. Arquivar pedido antigo.
- Regra dura: nenhuma query pode retornar pedido fora da visibilidade do usuário, nem por busca, nem por URL direta, nem em contadores do dashboard.

ACEITE LOCAL
Criar pedido pastoral e conferir que secretario e voluntário não o veem nem forçando a URL; criar pedido público anônimo e conferir que o autor não aparece; registrar oração e marcar atendido. Seed: 6 pedidos fictícios nos 3 níveis. Build/lint/tsc passam.
```

## Prompt 20 — Orçamento anual: previsto x realizado

Pré-requisito: Prompts 0 a 19 aplicados. Reaproveite o Financeiro (Prompt 8): não crie segunda tabela de lançamentos.

```text
Implemente o Orçamento Anual sobre o Financeiro existente: quanto a igreja planejou por categoria e mês, comparado ao realizado.

SKILLS: drizzle-orm-expert, postgres-best-practices, zod-validation-expert, shadcn, advanced-analytics-dashboard (fórmula e período de cada indicador).
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão financeira no servidor (tesoureiro, admin e pastor conforme matriz). UI Sera completa, gráficos em cinzas com azul só na série em destaque. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela budget_items: id, year, month (1-12), categoryId (FK financial_categories), plannedInCents, plannedOutCents, notes, unique(year, month, categoryId), createdAt, updatedAt. Dinheiro sempre em centavos.
Realizado é calculado a partir de financial_transactions do período (pagas/recebidas, paidAt preenchido), nunca digitado nesta tela. Documente a fórmula em comentário e na descrição do card.

ROTAS E TELAS
- /financeiro/orcamento: escolher o ano; grade mês x categoria com previsto, realizado e diferença (realizado menos previsto; despesa acima do previsto em vermelho #D92D20, receita e economia no padrão Sera).
- Edição em lote do ano: preencher os 12 meses de uma categoria em uma tela e salvar em transação, com auditoria.
- Copiar orçamento do ano anterior como ponto de partida, com confirmação, sem apagar o ano atual já preenchido sem avisar.

ACEITE LOCAL
Cadastrar orçamento de um ano, lançar receitas/despesas no financeiro, conferir previsto x realizado batendo com a soma manual, copiar o ano anterior. Usuário sem permissão financeira não acessa nem exporta. Seed: orçamento fictício do ano corrente. Build/lint/tsc passam.
```

## Prompt 21 — Contribuições recorrentes: controle local de compromissos

Pré-requisito: Prompts 0 a 20 aplicados.

```text
Implemente Contribuições Recorrentes apenas como controle interno de compromissos. Não há cobrança, débito, Pix ou gateway: o membro declara o compromisso e a tesouraria confirma manualmente cada recebimento no Financeiro.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela recurring_commitments: id, memberId, categoryId (receita do Prompt 8), amountCents, frequency (mensal/semanal), dayOfMonth (nullable), startsAt, endsAt (nullable), status (ativo/pausado/encerrado), notes, createdAt, updatedAt, deletedAt.
Tabela recurring_occurrences: id, commitmentId, dueDate, financialTransactionId (nullable — preenchido quando a tesouraria lança e vincula o recebimento no Prompt 8), status derivado: pendente quando sem lançamento vinculado, confirmada quando vinculado. Gerar ocorrências dos próximos 12 meses ao criar e ao prorrogar, em transação, sem duplicar (unique commitmentId + dueDate).

ROTAS E TELAS
- /financeiro/recorrentes: compromissos ativos, ocorrências do mês pendentes e confirmadas, total esperado do mês.
- Criar/pausar/encerrar compromisso (tesoureiro e admin; membro com usuário vinculado vê só os próprios em Minhas contribuições, em /painel).
- Confirmar recebimento: atalho que abre o lançamento financeiro já preenchido e, ao salvar, vincula a ocorrência. Nunca gerar lançamento sozinho.

ACEITE LOCAL
Criar compromisso mensal, conferir as 12 ocorrências, confirmar 2 recebimentos pelo financeiro e ver o status mudar, pausar e conferir que novas ocorrências não são geradas. Seed: 5 compromissos fictícios. Build/lint/tsc passam.
```

## Prompt 22 — Documentos da igreja: atas, estatuto e arquivos oficiais

Pré-requisito: Prompts 0 a 21 aplicados.

```text
Implemente a Gestão de Documentos oficiais da igreja, com arquivo local, versão e controle de quem pode ver cada documento.

SKILLS: document-management-system, drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices, 007.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela documents: id, title, category (ata/estatuto/regimento/financeiro/juridico/outro), description, visibility (todos_logados/lideranca/pastoral_financeiro/admin), currentVersion (int), createdBy, createdAt, updatedAt, deletedAt.
Tabela document_versions: id, documentId, versionNumber, filePath (upload local PDF/DOCX/ODT até 10 MB, tipo real validado), fileSizeBytes, changeNotes, uploadedBy, createdAt, unique(documentId, versionNumber). Nova versão nunca sobrescreve o arquivo anterior.
Download só por rota autenticada que confere visibility contra o papel do usuário — nunca link público direto para a pasta de uploads.

ROTAS E TELAS
- /documentos: lista por categoria e busca, mostrando só o que a visibility do usuário permite.
- /documentos/novo e /documentos/[id]: cadastrar, enviar nova versão com nota de alteração, ver histórico de versões e baixar qualquer versão permitida.
- Registrar em auditoria envio, troca de visibility e download de documento restrito.

ACEITE LOCAL
Enviar documento pastoral, conferir que voluntário não o lista nem baixa forçando a rota, enviar versão 2 e baixar a versão 1 pelo histórico. Seed: 4 documentos fictícios sem arquivo real pesado. Build/lint/tsc passam.
```

## Prompt 23 — Loja e cantina: produtos, estoque e PDV local

Pré-requisito: Prompts 0 a 22 aplicados.

```text
Implemente Loja/Cantina simples com ponto de venda local: venda registrada manualmente, em dinheiro ou registro manual, sem pagamento online e sem integração com maquininha.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. Dinheiro em centavos. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela store_products: id, name, description, priceCents, stockQuantity (int, nunca negativo), isActive, photoPath (upload local nullable), createdAt, updatedAt, deletedAt.
Tabela store_sales: id, soldAt, sellerUserId, buyerMemberId (nullable), buyerText, paymentMethod (dinheiro/transferencia_manual/cartao_manual — só registro), totalCents, financialTransactionId (nullable), status (concluida/cancelada), createdAt. Ao concluir, gerar/vincular lançamento de receita no Financeiro (Prompt 8) na categoria Cantina/Eventos; ao cancelar, estornar no financeiro pelo padrão já existente — nunca apagar a venda.
Tabela store_sale_items: id, saleId, productId, productNameSnapshot, unitPriceCentsSnapshot, quantity, unique não se aplica. Baixar o estoque em transação junto com a venda; bloquear venda acima do estoque.

ROTAS E TELAS
- /loja/produtos: cadastro e estoque, com alerta de estoque baixo (limite configurável, padrão 5).
- /loja/vender (PDV): grade de produtos ativos, carrinho, total ao vivo, finalizar e cancelar venda. Tela rápida, teclado acessível.
- /loja/vendas: vendas do dia e do período, por vendedor e forma de registro, conferindo com o financeiro vinculado.

ACEITE LOCAL
Cadastrar produto, vender 2 itens e conferir estoque e lançamento financeiro, tentar vender acima do estoque (bloqueia), cancelar venda e conferir estorno e retorno do estoque. Seed: 8 produtos fictícios. Build/lint/tsc passam.
```

## Prompt 24 — Pesquisas, enquetes e formulários internos

Pré-requisito: Prompts 0 a 23 aplicados.

```text
Implemente Pesquisas e Formulários internos para coletar respostas dos usuários logados, sem formulário externo.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend, better-accessibility.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod gerado a partir da definição do formulário, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela surveys: id, title, description, audienceType (todos/ministerio/celula/papeis, mesmo padrão dos Avisos), ministryId, cellId, isAnonymous (bool), startsAt, endsAt (nullable), status (rascunho/publicada/encerrada), createdBy, createdAt, updatedAt, deletedAt.
Tabela survey_questions: id, surveyId, position, questionText, kind (texto_curto/texto_longo/unica_escolha/multipla_escolha/nota_1_5/sim_nao), optionsJson (nullable, para escolhas), isRequired.
Tabela survey_responses: id, surveyId, userId (nullable quando isAnonymous — nesse caso não gravar userId, apenas controlar duplicidade por token de sessão documentado como limitação local), submittedAt, unique(surveyId, userId) quando não anônima.
Tabela survey_answers: id, responseId, questionId, valueText, valuesJson (nullable, múltipla escolha).

ROTAS E TELAS
- /pesquisas: pesquisas abertas para a audiência do usuário e gestão para quem cria (admin, pastor, secretario).
- Construtor simples: criar pesquisa, adicionar/reordenar perguntas dos tipos acima, publicar e encerrar.
- /pesquisas/[id]/responder e /pesquisas/[id]/resultados: responder uma vez (não anônima) e ver resultados agregados — contagens e percentuais por opção, média da nota e respostas de texto em lista; exportar respostas em CSV local (Prompt 10, mesma permissão).

ACEITE LOCAL
Criar enquete de única escolha e formulário com texto, publicar para uma célula, responder com 3 usuários, conferir agregados e CSV, tentar responder duas vezes (bloqueia quando não anônima). Seed: 2 pesquisas fictícias. Build/lint/tsc passam.
```

## Prompt 25 — Mapa de membros e células por bairro

Pré-requisito: Prompts 0 a 24 aplicados.

```text
Implemente a visão por Bairro de membros e células. Sem mapa externo, sem API de geolocalização e sem coordenadas inventadas: o agrupamento usa apenas o bairro já cadastrado no endereço (Prompts 2 e 4).

SKILLS: drizzle-orm-expert, postgres-best-practices, zod-validation-expert, shadcn, advanced-analytics-dashboard.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Server Actions/queries no servidor, permissão no servidor. UI Sera completa, gráfico de barras em cinzas com azul só no bairro selecionado. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas (se houver), rotas e roteiro de teste.

ENTREGA (sem tabela nova obrigatória)
- /relatorios/bairros (e atalho em /celulas): tabela e gráfico de membros ativos por bairro e por cidade, células por bairro com líder e dia de reunião, e membros sem bairro informado em grupo próprio "Não informado" — nunca descartar esses registros da contagem.
- Normalização de exibição: agrupar ignorando maiúsculas/acentos na comparação, mas exibir o bairro como cadastrado mais frequente do grupo. Documente a regra no código.
- Ao clicar em um bairro: lista paginada de membros e células daquele bairro, respeitando as permissões normais de membros (líder de célula vê só a sua célula).
- Uso pastoral sugerido na tela, em texto curto: abrir célula nova onde há membros sem célula, e redistribuir membros distantes — apenas sugestão visual, nenhuma ação automática.

ACEITE LOCAL
Com o seed variado por bairro, conferir totais por bairro batendo com a lista de membros, abrir um bairro e conferir a lista, conferir o grupo Não informado. Nenhuma chamada externa é feita (conferir no DevTools/rede). Build/lint/tsc passam.
```

## Prompt 26 — Fornecedores e contratos

Pré-requisito: Prompts 0 a 25 aplicados.

```text
Implemente Fornecedores e Contratos, ligados às despesas do Financeiro sem duplicar lançamentos.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, document-management-system (contrato em arquivo local).
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão financeira/admin no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela suppliers: id, name, documentText (CNPJ/CPF como texto validado, só dígitos quando identificador), contactName, phone, email, categoryText (ex.: limpeza, som, aluguel), addressText, notes, isActive, createdAt, updatedAt, deletedAt.
Tabela supplier_contracts: id, supplierId, title, startsAt, endsAt (nullable), monthlyValueCents (nullable), status (ativo/encerrado/cancelado), filePath (contrato local PDF até 10 MB, nullable), renewalAlertDays (padrão 30), createdAt, updatedAt, deletedAt.
No Financeiro (Prompt 8), supplierText continua existindo para despesa avulsa; adicione supplierId nullable em financial_transactions via migration para despesa de fornecedor cadastrado, mantendo compatibilidade com os lançamentos já criados.

ROTAS E TELAS
- /financeiro/fornecedores: lista com busca e categoria; ficha com contratos, despesas vinculadas e total pago no período.
- Contratos a vencer: bloco no dashboard financeiro e na lista, com contratos cujo endsAt cai nos próximos renewalAlertDays dias — alerta só visual dentro do sistema.
- Criar/editar fornecedor e contrato, encerrar contrato com motivo em auditoria.

ACEITE LOCAL
Cadastrar fornecedor e contrato, lançar despesa vinculada e conferir o total na ficha, conferir o alerta de contrato a vencer com data do seed. Usuário sem permissão financeira não acessa. Seed: 5 fornecedores fictícios. Build/lint/tsc passam.
```

## Prompt 27 — Inscrições em eventos e conferências internas

Pré-requisito: Prompts 0 a 26 aplicados. Reaproveite Cultos e Eventos (Prompt 5): inscrição é camada sobre o evento, não um segundo cadastro de eventos.

```text
Implemente Inscrições para eventos e conferências internas, com vagas, lista de espera e check-in no dia.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. Dinheiro em centavos quando houver valor de inscrição registrado manualmente — sem pagamento online. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela event_registrations_config: eventId (PK/FK events), capacity (int maior que 0), registrationStartsAt, registrationEndsAt, priceCents (0 = gratuito), isEnabled, unique(eventId).
Tabela event_registrations: id, eventId, memberId (nullable), visitorId (nullable), personName, phone, status (confirmada/lista_espera/cancelada/compareceu), paidManually (bool — confirmação manual da secretaria, com confirmedBy e confirmedAt), registeredAt, checkedInAt (nullable), unique(eventId, memberId) e unique(eventId, visitorId) quando preenchidos. Ao cancelar uma confirmada, promover automaticamente a primeira da lista de espera por registeredAt, em transação, e registrar em auditoria.

ROTAS E TELAS
- Na ficha do evento (/cultos/[id]): bloco Inscrições com vagas restantes, lista de inscritos (permissão de gestão) e check-in rápido por busca de nome.
- /cultos/[id]/inscrever: usuário logado inscreve a si (e dependentes já vinculados na família, Prompt 2) ou a secretaria inscreve membro/visitante.
- Relatório do evento: inscritos, presentes (check-in), faltas e lista de espera final, exportável em CSV local.

ACEITE LOCAL
Abrir inscrições com 3 vagas, inscrever 4 pessoas (4ª entra em lista de espera), cancelar uma confirmada e conferir a promoção automática, fazer check-in de 2 e conferir o relatório. Seed: 1 conferência fictícia com inscrições. Build/lint/tsc passam.
```

## Prompt 28 — Transporte e logística de eventos

Pré-requisito: Prompts 0 a 27 aplicados.

```text
Implemente Transporte e Logística para eventos: veículos, motoristas e lista de passageiros, sem rastreamento e sem mapa externo.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela vehicles: id, name, plateText, capacity (int maior que 0), kind (onibus/van/carro/outro), notes, isActive, assetId (nullable, reaproveita veículo do Patrimônio sem duplicar), createdAt, updatedAt, deletedAt.
Tabela event_trips: id, eventId (FK events), vehicleId, driverMemberId (nullable), driverText, departureAt, departurePlaceText, returnAt (nullable), notes, status (planejada/realizada/cancelada), createdAt, updatedAt, deletedAt.
Tabela trip_passengers: id, tripId, memberId (nullable), visitorId (nullable), personName, phone, boarded (bool), unique(tripId, personName). O servidor bloqueia passageiros além da capacity do veículo.

ROTAS E TELAS
- /transporte: veículos ativos e próximas viagens ligadas a eventos. Criar viagem a partir da ficha do evento.
- /transporte/viagens/[id]: passageiros com adicionar/remover, contador vagas ocupadas/restantes, marcar embarque (boarded) no dia, imprimir lista de passageiros local.
- Motorista e passageiros veem a própria viagem em leitura quando logados; gestão é de admin, pastor e secretario.

ACEITE LOCAL
Cadastrar veículo de 10 lugares, criar viagem, adicionar 10 passageiros (o 11º é bloqueado com mensagem clara), marcar embarques e imprimir a lista. Seed: 2 veículos e 1 viagem fictícia. Build/lint/tsc passam.
```

## Prompt 29 — Talentos, habilidades e banco de voluntários

Pré-requisito: Prompts 0 a 28 aplicados.

```text
Implemente o Banco de Talentos: habilidades e disponibilidade dos membros para servir, ligado a Ministérios e Escalas sem duplicar esses cadastros.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela skill_tags: id, name (unique normalizado), category (musica/tecnica/manual/ensino/cuidado/administracao/outro), isActive, createdAt. Seed editável de exemplos: violão, canto, som, fotografia, cozinha, costura, eletricidade, ensino infantil, libras, motorista.
Tabela member_skills: id, memberId, skillTagId, level (iniciante/intermediario/avancado), notes, unique(memberId, skillTagId).
Tabela member_availability: id, memberId, weekday (0-6), period (manha/tarde/noite), unique(memberId, weekday, period). Disponibilidade é declarada pelo próprio membro ou pela secretaria com consentimento registrado em notes — sem esse registro, não exibir fora da liderança.

ROTAS E TELAS
- Na ficha do membro (Prompt 2): bloco Talentos para editar habilidades, nível e disponibilidade.
- /ministerios/talentos: busca por habilidade, nível, ministério atual e disponibilidade (dia/período) para recrutar; ação Convidar apenas cria um aviso interno direcionado (Prompt 9) ou registro de convite — sem contato externo.
- Membro sem ministério com habilidade buscada aparece em destaque discreto Sera, como oportunidade, nunca como ranking.

ACEITE LOCAL
Cadastrar talentos em 5 membros, buscar "som" para domingo à noite e conferir que só aparecem disponíveis nesse período, convidar um membro e conferir o aviso interno criado. Seed: talentos fictícios variados. Build/lint/tsc passam.
```

## Prompt 30 — Agenda pastoral: atendimentos e aconselhamento

Pré-requisito: Prompts 0 a 29 aplicados.

```text
Implemente a Agenda Pastoral de atendimentos, com sigilo reforçado: o conteúdo do atendimento não é visível para secretaria nem aparece em relatórios gerais.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices, backend-security-coder, 007.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela pastoral_appointments: id, pastorUserId, memberId (nullable), personName, phone, reasonCategory (aconselhamento/oracao/familia/luto/visita/outro — categoria, nunca descrição livre nesta tabela compartilhada), startsAt, endsAt, placeText, status (solicitado/confirmado/realizado/cancelado/faltou), createdBy, createdAt, updatedAt, deletedAt. Conflito de horário do mesmo pastor é bloqueado no servidor.
Tabela pastoral_notes: id, appointmentId (unique), pastorUserId, body (texto privado), createdAt, updatedAt. Acesso exclusivo ao pastorUserId dono e ao admin apenas para suporte, com leitura registrada em auditoria sem copiar o conteúdo para o log.

ROTAS E TELAS
- /agenda-pastoral: pastor vê a própria agenda (semana/lista); secretaria vê apenas horários ocupados/livres e categoria, sem notas — implemente essa visão reduzida como query separada, não escondendo campo no cliente.
- Solicitar atendimento: membro logado ou secretaria registra solicitação; pastor confirma, remarca ou cancela com motivo visível ao solicitante.
- /agenda-pastoral/[id]: detalhes permitidos ao papel, nota privada só para o pastor dono.

ACEITE LOCAL
Solicitar e confirmar atendimento, tentar criar outro no mesmo horário do pastor (bloqueia), conferir que a secretaria não lê a nota nem forçando a rota e que o dashboard não expõe conteúdo. Seed: 4 atendimentos fictícios sem texto sensível real. Build/lint/tsc passam.
```

## Prompt 31 — Jornada do membro: integração e discipulado por etapas

Pré-requisito: Prompts 0 a 30 aplicados.

```text
Implemente a Jornada do Membro: trilha de etapas desde a primeira visita até servir em ministério, reaproveitando visitante, membro, célula, cursos e ministérios já existentes.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, senior-frontend, advanced-analytics-dashboard.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela journey_stages: id, name, description, position, isActive, createdAt. Seed editável sugerido: Visitante, Novo convertido, Classe de integração, Batismo, Membro ativo, Em célula, Servindo em ministério, Liderança em formação.
Tabela member_journey: id, memberId, stageId, enteredAt, completedAt (nullable), responsibleUserId (nullable), notes, unique ativo por membro/etapa. A etapa atual do membro é a de maior position sem completedAt ou a última concluída — defina e documente uma única regra no código e use-a em todas as telas.

ROTAS E TELAS
- Na ficha do membro: linha da jornada com etapas concluídas, atual e próximas; avançar etapa com data, responsável e observação, registrando em member_history.
- /membros/jornada: quadro por etapas (colunas Sera, sem arrastar obrigatório — botão avançar basta) com contagem e lista por etapa, filtro por célula e ministério.
- Alertas internos: membro parado na mesma etapa há mais de X dias (configurável, padrão 90) aparece em lista de acompanhamento para pastor, secretario e líder da célula dele — só dentro do sistema.

ACEITE LOCAL
Mover um membro por 3 etapas e conferir ficha e histórico, conferir contagens do quadro, conferir o alerta de membro parado com data antiga do seed. Seed: membros fictícios distribuídos nas etapas. Build/lint/tsc passam.
```

## Prompt 32 — Cursos e Escola Bíblica: turmas, aulas e materiais

Pré-requisito: Prompts 0 a 31 aplicados.

```text
Implemente Cursos e Escola Bíblica Dominical: turmas com professor, aulas, matrícula, frequência própria e material em arquivo local. Frequência de curso é separada da presença em cultos (Prompt 6).

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, document-management-system (material local), senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela courses: id, title, description, kind (ebd/curso_livre/classe_integracao/treinamento_lideranca), teacherMemberId (nullable), startsAt, endsAt (nullable), weekday, meetingTime, roomText, capacity (nullable), isActive, createdAt, updatedAt, deletedAt.
Tabela course_enrollments: id, courseId, memberId, enrolledAt, status (ativo/concluido/desistente), completionNotes, unique(courseId, memberId). Bloquear matrícula além da capacity.
Tabela course_lessons: id, courseId, lessonDate, title, summary, materialPath (arquivo local nullable, PDF até 10 MB), createdAt.
Tabela course_attendance: id, lessonId, memberId, status (presente/ausente/justificado), unique(lessonId, memberId). Frequência usa a mesma fórmula do Prompt 6, documentada de novo na tela do curso.

ROTAS E TELAS
- /cursos: turmas ativas com professor, horário, vagas e alunos. /cursos/[id]: abas Alunos, Aulas e Frequência; matricular/remover aluno, criar aula com material, fazer chamada da aula em lote.
- Concluir curso: marcar matrícula como concluída e, quando o curso for classe de integração, sugerir avanço de etapa na Jornada (Prompt 31) com confirmação — nunca avançar sozinho.
- Aluno logado vê seus cursos e sua frequência em /painel.

ACEITE LOCAL
Criar turma com 5 vagas, matricular 5 (a 6ª é bloqueada), registrar 3 aulas com chamada, concluir um aluno e confirmar a sugestão na jornada. Seed: 2 cursos fictícios com alunos. Build/lint/tsc passam.
```

## Prompt 33 — Check-in infantil seguro no culto

Pré-requisito: Prompts 0 a 32 aplicados.

```text
Implemente o Check-in do Ministério Infantil: entrada e saída de crianças no culto, com retirada só por responsável autorizado. Tudo local, na recepção/sala infantil, sem app externo.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices, backend-security-coder, better-accessibility.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa, botões grandes e legíveis para uso rápido. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Reaproveite a família do Prompt 2: criança é membro com vínculo ou registro rápido em kids_children quando ainda não for membro: id, fullName, birthDate, allergiesOrRestrictions (texto, dado sensível — só equipe infantil autorizada e responsáveis veem), notes, createdAt, updatedAt, deletedAt.
Tabela kids_guardians: id, childRef (memberId ou kidsChildId — defina uma única forma com constraint e documente), guardianMemberId (nullable), guardianName, guardianPhone, relation, isAuthorizedPickup (bool).
Tabela kids_checkins: id, eventId (FK events), childRef, checkedInAt, checkedInBy, pickupCode (código curto gerado na hora e mostrado/impresso localmente, nunca enviado), checkedOutAt (nullable), checkedOutBy, pickedUpByGuardianId (nullable), roomText, createdAt. Saída só é gravada conferindo pickupCode ou responsável autorizado marcado em kids_guardians.

ROTAS E TELAS
- /infantil/check-in: escolher o culto, buscar a criança, fazer check-in gerando o código, lista de crianças presentes por sala com idade calculada e alerta visual discreto de alergia/restrição para a equipe.
- Saída: buscar pelo código ou pela criança, selecionar quem retira entre os autorizados, confirmar e registrar horário e responsável.
- Relatório do culto: crianças presentes, horários e retiradas, só para permissão do ministério infantil, pastor e admin.

ACEITE LOCAL
Cadastrar criança com responsável autorizado e não autorizado, fazer check-in, tentar saída por pessoa não autorizada (bloqueia), sair pelo código com responsável autorizado e conferir o relatório. Nenhum dado de criança aparece para voluntário de outro ministério. Seed: 6 crianças fictícias. Build/lint/tsc passam.
```

## Prompt 34 — Louvor: repertório, cifras e setlists por culto

Pré-requisito: Prompts 0 a 33 aplicados. Reaproveite Ministérios e Escalas (Prompt 7): setlist é do culto e da equipe já escalada, não um segundo sistema de escalas.

```text
Implemente o Repertório de Louvor: cadastro de músicas com cifra/letra em texto ou arquivo local, e a lista de músicas (setlist) de cada culto.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, document-management-system (arquivo local da cifra), senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela worship_songs: id, title, authorText, musicalKey (tom, texto curto), tempoBpm (nullable), themeTags, lyricsText (nullable — apenas letra cadastrada pela equipe; não buscar letra em fonte externa), chordSheetPath (arquivo local nullable, PDF/txt até 5 MB), linkNote (campo de observação interna, não player externo), timesUsed derivado das setlists, createdAt, updatedAt, deletedAt.
Tabela worship_setlists: id, eventId (unique, FK events), ministryId, title, notes, createdBy, createdAt, updatedAt.
Tabela worship_setlist_items: id, setlistId, songId, position, musicalKeyOverride (nullable, tom usado naquele culto), notes, unique(setlistId, position) e unique(setlistId, songId).

ROTAS E TELAS
- /louvor/musicas: repertório com busca por título, tema e tom; ficha da música com cifra, letra cadastrada e histórico de cultos em que foi usada.
- /louvor/setlists e dentro da ficha do culto: montar a ordem das músicas (subir/descer), ajustar o tom do dia e imprimir a setlist local em padrão Sera para a equipe.
- Equipe escalada no culto (Prompt 7) vê a setlist em Minhas escalas; quem não está escalado não vê setlists de cultos futuros, só o repertório geral permitido.

ACEITE LOCAL
Cadastrar 3 músicas, montar a setlist do culto de domingo na ordem certa, trocar o tom de uma música só naquele culto (repertório não muda), imprimir e conferir o histórico da música. Seed: 10 músicas fictícias de exemplo, sem letra protegida copiada de fonte externa. Build/lint/tsc passam.
```

## Prompt 35 — Acessibilidade ampliada e idioma da interface

Pré-requisito: Prompts 0 a 34 aplicados.

```text
Implemente Preferências de Acessibilidade por usuário e a base de Idioma da Interface, sem serviço externo de tradução.

SKILLS: better-accessibility, fixing-accessibility, react-nextjs-development, senior-frontend, shadcn, context7-auto-research (abordagem atual de i18n no App Router, se adotar biblioteca).
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações. Nunca reduza contraste abaixo de 4.5:1 nem remova o foco visível ao aplicar preferências. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas (se houver), rotas e roteiro de teste.

ENTREGA
- Preferências salvas por usuário (tabela user_preferences ou extensão do perfil do Prompt 1, sem duplicar): fontSizeScale (padrão/maior/muito maior), reduceMotion (bool, respeita prefers-reduced-motion), highContrastText (bool dentro da paleta Sera, sem trocar o azul de ação) e leitura simplificada de listas (linhas mais espaçadas). Aplicar via classe/variável no layout, persistir no servidor e funcionar já na tela de login quando houver cookie local de preferência.
- Idioma: externalizar os textos das telas principais (menu, dashboard, membros e avisos) para arquivos de mensagens pt-BR, com estrutura pronta para es e en — traduzir de fato só o pt-BR completo e o menu/dashboard em es e en como demonstração local. Seletor de idioma em Minha conta. Nenhuma chamada a API de tradução.
- Recursos de Libras nesta fase local: campo opcional nos Avisos e Sermões para a equipe cadastrar observação/link interno de material já produzido pela igreja (arquivo local do Prompt 16), sem gerar nem embutir serviço externo.
- Página /acessibilidade no padrão Sera descrevendo os recursos, atalhos de teclado e como pedir ajuda à secretaria.

ACEITE LOCAL
Trocar tamanho de fonte e idioma, recarregar e conferir persistência por usuário, navegar só por teclado nas telas principais, conferir que contraste e foco continuam aprovados. Build/lint/tsc passam.
```

## Prompt 36 — Mensagens internas entre usuários

Pré-requisito: Prompts 0 a 35 aplicados. Fecha a Parte 2.

```text
Implemente Mensagens Internas: conversa entre usuários logados dentro do próprio sistema. Sem WhatsApp, sem e-mail, sem chat externo e sem tempo real obrigatório — atualização por recarregamento/polling simples local é suficiente nesta fase.

SKILLS: drizzle-orm-expert, zod-validation-expert, shadcn, api-security-best-practices, backend-security-coder, senior-frontend.
REGRAS GLOBAIS: reutilize fundação, tokens Sera, shadcn/ui, permissões e schemas existentes, sem recriar nada. TypeScript strict, Zod em toda entrada, Server Actions para mutações, permissão no servidor. UI Sera completa. Estados obrigatórios. Ao terminar, build/lint/tsc devem passar e liste arquivos, tabelas, rotas e roteiro de teste.

MODELO DE DADOS
Tabela message_threads: id, subject, kind (direta/grupo), createdBy, createdAt, updatedAt (atualizado a cada mensagem), deletedAt.
Tabela message_thread_participants: id, threadId, userId, lastReadAt (nullable), leftAt (nullable), unique(threadId, userId).
Tabela messages: id, threadId, senderUserId, body (texto, sem HTML livre), attachmentPath (arquivo local nullable, JPG/PNG/PDF até 5 MB), createdAt, editedAt (nullable), deletedAt (exclusão lógica mostra "mensagem removida" aos demais).
Participante que saiu (leftAt) não lê mensagens novas; nenhuma query retorna conversa para quem não é participante, nem por busca, URL direta ou contador de não lidas.

ROTAS E TELAS
- /mensagens: lista de conversas do usuário com não lidas em destaque Sera, nova conversa direta (buscar usuário ativo) e grupo com nome, restrito a usuários do sistema — nunca para telefone ou contato externo.
- /mensagens/[id]: conversa com enviar, editar a própria mensagem em até 15 minutos, remover a própria mensagem e marcar como lida ao abrir. Contador de não lidas no menu e no dashboard (Prompt 10).
- Moderação mínima: admin não lê conversas alheias pela interface (privacidade por padrão); denúncia de mensagem grava registro em auditoria para tratamento fora da leitura automática do conteúdo.

ACEITE LOCAL
Conversar entre 2 usuários do seed, criar grupo de 3, conferir não lidas e marcação de lida, editar e remover mensagem, e conferir que um quarto usuário não acessa a conversa nem forçando a URL. Seed: 2 conversas fictícias. Build/lint/tsc passam. Depois deste prompt, reaplique o Prompt Final de Auditoria cobrindo os Prompts 0 a 36.
```

### O que continua fora do escopo, mesmo na Parte 2

Pix e pagamento online, WhatsApp/SMS/e-mail externo, push real, transmissão ao vivo e streaming hospedado, mapa/geolocalização por API externa, sincronização com Google Calendar, tradução automática por API e chat externo. Cada funcionalidade acima foi desenhada na versão interna e local dessas ideias — registro, controle, arquivo e tela dentro do próprio sistema, testável em `localhost` com dados fictícios.
