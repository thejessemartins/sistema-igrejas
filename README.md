# Sistema para Igrejas

Fundação do sistema para gestão de igrejas, construído com Next.js App Router, TypeScript strict, Tailwind CSS (Design System Sera), Drizzle ORM e PostgreSQL local (sem Docker).

## Pré-requisitos (Ambiente Local — Sem Docker)

- **Node.js LTS** (v20+ recomendado) e `npm`
- **PostgreSQL 16+** instalado diretamente no sistema operacional e em execução na porta `5432`:
  - **Windows**: serviço `postgresql-x64-16` iniciado
  - **macOS**: via instalador oficial ou Homebrew (`brew services start postgresql@16`)
  - **Linux**: via gerenciador de pacotes (`sudo systemctl start postgresql`)
- Ferramenta gráfica opcional: **pgAdmin** ou **DBeaver** conectando em `localhost:5432`

## Configuração Local Passo a Passo

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Criar o banco de dados e usuário local** (executar uma única vez no `psql`, pgAdmin ou DBeaver como usuário `postgres`):
   ```sql
   CREATE DATABASE sistema_igrejas;
   CREATE USER igrejas_dev WITH PASSWORD 'igrejas_dev_local';
   GRANT ALL PRIVILEGES ON DATABASE sistema_igrejas TO igrejas_dev;
   ```
   No PostgreSQL 15+, conecte ao banco `sistema_igrejas` e conceda uso do schema `public`:
   ```sql
   GRANT ALL ON SCHEMA public TO igrejas_dev;
   ```

3. **Configurar variáveis de ambiente**:
   ```bash
   cp .env.example .env
   ```
   Ajuste `DATABASE_URL` no `.env` se necessário (padrão: `postgresql://igrejas_dev:igrejas_dev_local@localhost:5432/sistema_igrejas`).

4. **Executar migrations e seed**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Iniciar servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000`.

## Scripts Disponíveis

- `npm run dev` — Inicia o Next.js em modo desenvolvimento
- `npm run build` — Gera o build de produção
- `npm run lint` — Executa o ESLint
- `npx tsc --noEmit` — Verifica tipagem TypeScript strict
- `npm run db:generate` — Gera migrations do Drizzle
- `npm run db:migrate` — Aplica migrations no PostgreSQL local
- `npm run db:studio` — Abre o Drizzle Studio
- `npm run db:seed` — Executa o seed inicial
- `npm test` — Executa os testes

## Solução de Problemas Local

- **Serviço do PostgreSQL parado**: inicie o serviço (`sudo systemctl start postgresql` no Linux, `brew services start postgresql@16` no macOS ou via `services.msc` no Windows).
- **Porta 5432 em uso**: verifique se há outra instância do PostgreSQL rodando (`ss -tulpn | grep 5432` ou `lsof -i :5432`).
- **Senha incorreta na `DATABASE_URL`**: confirme o usuário e senha no `.env` com os definidos no `CREATE USER`.
- **Banco ainda não criado**: execute `CREATE DATABASE sistema_igrejas;` conectado como `postgres`.
