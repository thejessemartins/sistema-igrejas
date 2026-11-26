import "dotenv/config";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, userProfiles } from "@/db/schema";
import type { Role } from "@/lib/permissions";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const SEED_USERS: SeedUser[] = [
  {
    name: "Administrador Local",
    email: "admin@igreja.local",
    password: "Admin1234",
    role: "admin",
  },
  {
    name: "Pastor Local",
    email: "pastor@igreja.local",
    password: "Pastor1234",
    role: "pastor",
  },
  {
    name: "Secretário Local",
    email: "secretario@igreja.local",
    password: "Secretario1234",
    role: "secretario",
  },
  {
    name: "Tesoureiro Local",
    email: "tesoureiro@igreja.local",
    password: "Tesoureiro1234",
    role: "tesoureiro",
  },
  {
    name: "Líder de Célula Local",
    email: "lider@igreja.local",
    password: "Lider1234",
    role: "lider_celula",
  },
  {
    name: "Voluntário Local",
    email: "voluntario@igreja.local",
    password: "Voluntario1234",
    role: "voluntario",
  },
];

async function main() {
  for (const item of SEED_USERS) {
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, item.email))
      .limit(1);

    if (existing) {
      console.log(`Usuário já existe: ${item.email} (${item.role})`);
      continue;
    }

    const created = await auth.api.signUpEmail({
      body: {
        name: item.name,
        email: item.email,
        password: item.password,
      },
    });

    if (!created?.user) {
      throw new Error(`Falha ao criar usuário ${item.email}`);
    }

    await db.insert(userProfiles).values({
      userId: created.user.id,
      role: item.role,
      active: true,
    });

    console.log(`Usuário criado: ${item.email} (${item.role})`);
  }

  console.log("Seed concluído com sucesso.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao executar seed:", err);
  process.exit(1);
});
