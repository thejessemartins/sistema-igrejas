import "dotenv/config";
import { count, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cellMeetingAttendance, cellMeetings, cellMembers, cells, events, financialCategories, financialTransactions, memberFamilyLinks, members, ministries, ministryMembers, notices, user, userProfiles, visitors, visitorVisits } from "@/db/schema";
import type { Role } from "@/lib/permissions";

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const SEED_USERS: SeedUser[] = [
  { name: "Administrador Local", email: "admin@igreja.local", password: "Admin1234", role: "admin" },
  { name: "Pastor Local", email: "pastor@igreja.local", password: "Pastor1234", role: "pastor" },
  { name: "Secretário Local", email: "secretario@igreja.local", password: "Secretario1234", role: "secretario" },
  { name: "Tesoureiro Local", email: "tesoureiro@igreja.local", password: "Tesoureiro1234", role: "tesoureiro" },
  { name: "Líder de Célula Local", email: "lider@igreja.local", password: "Lider1234", role: "lider_celula" },
  { name: "Voluntário Local", email: "voluntario@igreja.local", password: "Voluntario1234", role: "voluntario" },
];

const SEED_MEMBERS = [
  { fullName: "Carlos Eduardo Silva", birthDate: "1980-11-10", phone: "(11) 98888-1001", email: "carlos.silva@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Mariana Oliveira Silva", birthDate: "1983-05-22", phone: "(11) 98888-1002", email: "mariana.silva@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Lucas Oliveira Silva", birthDate: "2010-11-18", phone: "(11) 98888-1003", email: null, maritalStatus: "solteiro", status: "ativo" },
  { fullName: "Ana Paula Ferreira", birthDate: "1992-03-14", phone: "(11) 98888-1004", email: "ana.ferreira@exemplo.local", maritalStatus: "solteiro", status: "ativo" },
  { fullName: "João Pedro Santos", birthDate: "1975-08-30", phone: "(11) 98888-1005", email: "joao.santos@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Beatriz Costa Santos", birthDate: "1978-11-25", phone: "(11) 98888-1006", email: "beatriz.santos@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Rafael Mendes Lima", birthDate: "1995-01-12", phone: "(11) 98888-1007", email: "rafael.lima@exemplo.local", maritalStatus: "solteiro", status: "afastado" },
  { fullName: "Juliana Rocha Almeida", birthDate: "1988-07-04", phone: "(11) 98888-1008", email: "juliana.almeida@exemplo.local", maritalStatus: "divorciado", status: "ativo" },
  { fullName: "Marcos Vinícius Souza", birthDate: "1968-12-19", phone: "(11) 98888-1009", email: "marcos.souza@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Fernanda Gomes Pereira", birthDate: "1999-09-08", phone: "(11) 98888-1010", email: "fernanda.pereira@exemplo.local", maritalStatus: "solteiro", status: "ativo" },
  { fullName: "Gabriel Barbosa Ribeiro", birthDate: "2002-04-17", phone: "(11) 98888-1011", email: "gabriel.ribeiro@exemplo.local", maritalStatus: "solteiro", status: "transferido" },
  { fullName: "Patrícia Martins Carvalho", birthDate: "1985-06-29", phone: "(11) 98888-1012", email: "patricia.carvalho@exemplo.local", maritalStatus: "uniao_estavel", status: "ativo" },
  { fullName: "Sebastião Alves Nogueira", birthDate: "1952-02-11", phone: "(11) 98888-1013", email: null, maritalStatus: "viuvo", status: "inativo" },
  { fullName: "Camila Duarte Teixeira", birthDate: "1991-11-03", phone: "(11) 98888-1014", email: "camila.teixeira@exemplo.local", maritalStatus: "solteiro", status: "ativo" },
  { fullName: "Daniel Rodrigues Castro", birthDate: "1986-10-21", phone: "(11) 98888-1015", email: "daniel.castro@exemplo.local", maritalStatus: "casado", status: "ativo" },
  { fullName: "Helena Cardoso Moreira", birthDate: "1945-03-05", phone: "(11) 98888-1016", email: null, maritalStatus: "viuvo", status: "falecido" },
];

async function main() {
  for (const item of SEED_USERS) {
    const [existing] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, item.email))
      .limit(1);

    if (!existing) {
      const created = await auth.api.signUpEmail({
        body: { name: item.name, email: item.email, password: item.password },
      });
      if (!created?.user) throw new Error(`Falha ao criar usuário ${item.email}`);
      await db.insert(userProfiles).values({
        userId: created.user.id,
        role: item.role,
        active: true,
      });
      console.log(`Usuário criado: ${item.email} (${item.role})`);
    }
  }

  const [{ total }] = await db.select({ total: count() }).from(members);
  if (total === 0) {
    const inserted = await db
      .insert(members)
      .values(SEED_MEMBERS)
      .returning({ id: members.id, fullName: members.fullName });

    // Vínculos familiares de exemplo (Carlos + Mariana = cônjuge, Carlos + Lucas = filho)
    if (inserted.length >= 3) {
      await db.insert(memberFamilyLinks).values([
        {
          memberId: inserted[0].id,
          relatedMemberId: inserted[1].id,
          relation: "conjuge",
        },
        {
          memberId: inserted[0].id,
          relatedMemberId: inserted[2].id,
          relation: "filho",
        },
      ]);
    }
    console.log(`${inserted.length} membros fictícios criados com vínculos familiares.`);
  } else {
    console.log(`Membros já populados (${total}).`);
  }

  const [{ total: visitorsTotal }] = await db.select({ total: count() }).from(visitors);
  if (visitorsTotal === 0) {
    const seedVisitors = [
      { fullName: "Lucas Andrade", phone: "(11) 97777-2001", email: "lucas.andrade@exemplo.local", followUpStatus: "novo", invitedByText: "Convite na rua" },
      { fullName: "Mariane Costa", phone: "(11) 97777-2002", email: null, followUpStatus: "em_contato", invitedByText: "Amiga da célula" },
      { fullName: "Pedro Henrique Dias", phone: "(11) 97777-2003", email: "pedro.dias@exemplo.local", followUpStatus: "retornou", invitedByText: "Instagram" },
      { fullName: "Larissa Souza", phone: "(11) 97777-2004", email: null, followUpStatus: "novo", invitedByText: "Culto de domingo" },
      { fullName: "Thiago Nogueira", phone: "(11) 97777-2005", email: "thiago.nogueira@exemplo.local", followUpStatus: "nao_retornou", invitedByText: "Colega de trabalho" },
      { fullName: "Vanessa Lima", phone: "(11) 97777-2006", email: null, followUpStatus: "em_contato", invitedByText: "Familiar" },
      { fullName: "Felipe Barbosa", phone: "(11) 97777-2007", email: "felipe.barbosa@exemplo.local", followUpStatus: "retornou", invitedByText: "Evento especial" },
      { fullName: "Renata Alves", phone: "(11) 97777-2008", email: null, followUpStatus: "novo", invitedByText: "Vizinha" },
    ];
    const insertedVisitors = await db
      .insert(visitors)
      .values(seedVisitors)
      .returning({ id: visitors.id });

    await db.insert(visitorVisits).values(
      insertedVisitors.map((v) => ({
        visitorId: v.id,
        notes: "Primeira visita registrada no seed",
      }))
    );
    console.log(`${insertedVisitors.length} visitantes fictícios criados.`);
  }

  const [{ total: cellsTotal }] = await db.select({ total: count() }).from(cells);
  if (cellsTotal === 0) {
    const allMembers = await db.select({ id: members.id }).from(members).limit(12);
    if (allMembers.length >= 6) {
      const insertedCells = await db
        .insert(cells)
        .values([
          {
            name: "Célula Esperança",
            leaderMemberId: allMembers[0].id,
            coLeaderMemberId: allMembers[1].id,
            weekday: 3,
            meetingTime: "20:00",
            addressStreet: "Rua das Flores, 120",
            addressDistrict: "Centro",
            addressCity: "São Paulo",
            isActive: true,
          },
          {
            name: "Célula Vida Nova",
            leaderMemberId: allMembers[3].id,
            weekday: 4,
            meetingTime: "19:30",
            addressStreet: "Av. Brasil, 450",
            addressDistrict: "Jardim América",
            addressCity: "São Paulo",
            isActive: true,
          },
          {
            name: "Célula Betel",
            leaderMemberId: allMembers[4].id,
            weekday: 5,
            meetingTime: "20:00",
            addressStreet: "Rua da Paz, 88",
            addressDistrict: "Vila Mariana",
            addressCity: "São Paulo",
            isActive: true,
          },
        ])
        .returning({ id: cells.id });

      const today = new Date().toISOString().slice(0, 10);
      await db.insert(cellMembers).values([
        { cellId: insertedCells[0].id, memberId: allMembers[0].id, joinedAt: today },
        { cellId: insertedCells[0].id, memberId: allMembers[1].id, joinedAt: today },
        { cellId: insertedCells[0].id, memberId: allMembers[2].id, joinedAt: today },
        { cellId: insertedCells[1].id, memberId: allMembers[3].id, joinedAt: today },
        { cellId: insertedCells[2].id, memberId: allMembers[4].id, joinedAt: today },
      ]);

      const [meeting] = await db
        .insert(cellMeetings)
        .values({
          cellId: insertedCells[0].id,
          meetingDate: today,
          topic: "Estudo sobre Fé e Comunhão",
          notes: "Reunião inicial do seed",
        })
        .returning({ id: cellMeetings.id });

      await db.insert(cellMeetingAttendance).values([
        { cellMeetingId: meeting.id, memberId: allMembers[0].id, status: "presente" },
        { cellMeetingId: meeting.id, memberId: allMembers[1].id, status: "presente" },
        { cellMeetingId: meeting.id, memberId: allMembers[2].id, status: "justificado" },
      ]);

      console.log(`${insertedCells.length} células fictícias criadas com reuniões.`);
    }
  }

  const [{ total: eventsTotal }] = await db.select({ total: count() }).from(events);
  if (eventsTotal === 0) {
    const now = new Date();
    const past1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const past2 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const future1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const future2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await db.insert(events).values([
      {
        title: "Culto de Celebração",
        eventType: "culto_domingo",
        startsAt: past1,
        location: "Templo Principal",
        theme: "Vivendo pela Fé",
        preacherText: "Pr. João",
        status: "realizado",
      },
      {
        title: "Culto de Oração",
        eventType: "culto_oracao",
        startsAt: past2,
        location: "Templo Principal",
        theme: "Clamor pela Cidade",
        status: "realizado",
      },
      {
        title: "Culto de Domingo",
        eventType: "culto_domingo",
        startsAt: future1,
        location: "Templo Principal",
        theme: "Esperança Viva",
        status: "agendado",
      },
      {
        title: "Santa Ceia do Senhor",
        eventType: "santa_ceia",
        startsAt: future2,
        location: "Templo Principal",
        theme: "Comunhão e Gratidão",
        status: "agendado",
      },
    ]);
    console.log("4 cultos/eventos fictícios criados.");
  }

  const [{ total: ministriesTotal }] = await db
    .select({ total: count() })
    .from(ministries);
  if (ministriesTotal === 0) {
    const allMembers = await db.select({ id: members.id }).from(members).limit(8);
    const insertedMinistries = await db
      .insert(ministries)
      .values([
        { name: "Louvor", description: "Equipe de música e adoração", leaderMemberId: allMembers[0]?.id ?? null },
        { name: "Recepção", description: "Boas-vindas e acolhimento", leaderMemberId: allMembers[1]?.id ?? null },
        { name: "Mídia", description: "Projeção, transmissão e som", leaderMemberId: allMembers[2]?.id ?? null },
        { name: "Infantil", description: "Ministério com crianças", leaderMemberId: allMembers[3]?.id ?? null },
      ])
      .returning({ id: ministries.id });

    const today = new Date().toISOString().slice(0, 10);
    if (allMembers.length >= 4) {
      await db.insert(ministryMembers).values([
        { ministryId: insertedMinistries[0].id, memberId: allMembers[0].id, roleInMinistry: "Vocal", joinedAt: today },
        { ministryId: insertedMinistries[0].id, memberId: allMembers[1].id, roleInMinistry: "Teclado", joinedAt: today },
        { ministryId: insertedMinistries[1].id, memberId: allMembers[2].id, roleInMinistry: "Recepção", joinedAt: today },
        { ministryId: insertedMinistries[2].id, memberId: allMembers[3].id, roleInMinistry: "Projeção", joinedAt: today },
      ]);
    }
    console.log(`${insertedMinistries.length} ministérios fictícios criados.`);
  }

  const [{ total: catTotal }] = await db
    .select({ total: count() })
    .from(financialCategories);
  if (catTotal === 0) {
    const insertedCats = await db
      .insert(financialCategories)
      .values([
        { name: "Dízimos", kind: "receita" },
        { name: "Ofertas", kind: "receita" },
        { name: "Doações", kind: "receita" },
        { name: "Cantina/Eventos", kind: "receita" },
        { name: "Aluguel", kind: "despesa" },
        { name: "Contas", kind: "despesa" },
        { name: "Manutenção", kind: "despesa" },
        { name: "Missões/Ajuda", kind: "despesa" },
        { name: "Material", kind: "despesa" },
        { name: "Salários/Prebendas", kind: "despesa" },
      ])
      .returning({ id: financialCategories.id, name: financialCategories.name, kind: financialCategories.kind });

    const dizimo = insertedCats.find((c) => c.name === "Dízimos")!;
    const oferta = insertedCats.find((c) => c.name === "Ofertas")!;
    const aluguel = insertedCats.find((c) => c.name === "Aluguel")!;
    const contas = insertedCats.find((c) => c.name === "Contas")!;

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const prevMonth = prevDate.toISOString().slice(0, 7);

    const [firstMember] = await db.select({ id: members.id }).from(members).limit(1);

    await db.insert(financialTransactions).values([
      {
        kind: "receita",
        categoryId: dizimo.id,
        memberId: firstMember?.id ?? null,
        isAnonymous: false,
        description: "Dízimo mensal",
        amountCents: 150000,
        transactionDate: `${prevMonth}-05`,
        paymentMethod: "transferencia_manual",
        paidAt: `${prevMonth}-05`,
      },
      {
        kind: "receita",
        categoryId: oferta.id,
        isAnonymous: true,
        description: "Oferta culto de domingo",
        amountCents: 85000,
        transactionDate: `${prevMonth}-12`,
        paymentMethod: "dinheiro",
        paidAt: `${prevMonth}-12`,
      },
      {
        kind: "despesa",
        categoryId: aluguel.id,
        description: "Aluguel do templo",
        supplierText: "Imobiliária Central",
        amountCents: 120000,
        transactionDate: `${prevMonth}-10`,
        dueDate: `${prevMonth}-10`,
        paidAt: `${prevMonth}-10`,
        paymentMethod: "transferencia_manual",
      },
      {
        kind: "receita",
        categoryId: dizimo.id,
        memberId: firstMember?.id ?? null,
        isAnonymous: false,
        description: "Dízimo mensal",
        amountCents: 180000,
        transactionDate: `${thisMonth}-05`,
        paymentMethod: "transferencia_manual",
        paidAt: `${thisMonth}-05`,
      },
      {
        kind: "despesa",
        categoryId: contas.id,
        description: "Conta de energia elétrica",
        supplierText: "Concessionária Local",
        amountCents: 42000,
        transactionDate: `${thisMonth}-08`,
        dueDate: `${thisMonth}-10`,
        paidAt: null, // pendente / vencida
        paymentMethod: "transferencia_manual",
      },
    ]);
    console.log("Categorias e 2 meses de lançamentos financeiros criados.");
  }

  const [{ total: noticesTotal }] = await db
    .select({ total: count() })
    .from(notices);
  if (noticesTotal === 0) {
    const [adminUser] = await db.select({ id: user.id }).from(user).limit(1);
    const [firstCell] = await db.select({ id: cells.id }).from(cells).limit(1);
    const [firstMinistry] = await db.select({ id: ministries.id }).from(ministries).limit(1);

    await db.insert(notices).values([
      {
        title: "Bem-vindos ao Mural de Avisos",
        body: "Este é o canal oficial de comunicação interna da igreja.",
        audienceType: "todos",
        priority: "importante",
        isPinned: true,
        authorUserId: adminUser?.id ?? null,
      },
      {
        title: "Ensaio Geral do Louvor",
        body: "Sábado às 18h no templo principal.",
        audienceType: firstMinistry ? "ministerio" : "todos",
        ministryId: firstMinistry?.id ?? null,
        priority: "normal",
        authorUserId: adminUser?.id ?? null,
      },
      {
        title: "Reunião de Célula Especial",
        body: "Nesta semana teremos momento de oração e comunhão.",
        audienceType: firstCell ? "celula" : "todos",
        cellId: firstCell?.id ?? null,
        priority: "normal",
        authorUserId: adminUser?.id ?? null,
      },
      {
        title: "Campanha de Alimentos",
        body: "Traga 1kg de alimento não perecível no próximo domingo.",
        audienceType: "todos",
        priority: "urgente",
        authorUserId: adminUser?.id ?? null,
      },
      {
        title: "Reunião de Obreiros",
        body: "Encontro mensal após o culto de domingo.",
        audienceType: "todos",
        priority: "normal",
        authorUserId: adminUser?.id ?? null,
      },
    ]);
    console.log("5 avisos fictícios criados.");
  }

  console.log("Seed concluído com sucesso.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao executar seed:", err);
  process.exit(1);
});
