/**
 * Demo data: one admin, two clients and a handful of projects.
 *
 * Safe to run repeatedly: users are upserted and a project is only created if the client
 * does not already have one with the same name. Nothing is ever deleted.
 * All demo accounts share the password from SEED_PASSWORD (default "demo-password").
 */
import "dotenv/config";
import { PrismaClient, type ProjectStatus } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

/** A calendar date `offset` days from today, at UTC midnight. */
function dayFromToday(offset: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY_MS);
}

type MilestoneSeed = { title: string; dueInDays: number; completedDaysAgo?: number };

type ProjectSeed = {
  name: string;
  description: string;
  status: ProjectStatus;
  clientEmail: string;
  startInDays: number;
  dueInDays: number;
  archived?: boolean;
  milestones: MilestoneSeed[];
};

const projects: ProjectSeed[] = [
  {
    name: "Website redesign",
    description: "Refresh the marketing site: new structure, visual design and a faster build.",
    status: "ACTIVE",
    clientEmail: "client@example.com",
    startInDays: -40,
    dueInDays: 30,
    milestones: [
      { title: "Discovery workshop", dueInDays: -35, completedDaysAgo: 36 },
      { title: "Sitemap and wireframes", dueInDays: -20, completedDaysAgo: 21 },
      { title: "Visual design approved", dueInDays: -5, completedDaysAgo: 4 },
      { title: "Development complete", dueInDays: 9 },
      { title: "Launch", dueInDays: 28 },
    ],
  },
  {
    name: "Mobile app MVP",
    description: "A first release of the customer app covering sign-in, orders and notifications.",
    status: "PLANNING",
    clientEmail: "client@example.com",
    startInDays: 10,
    dueInDays: 120,
    milestones: [
      { title: "Requirements sign-off", dueInDays: 12 },
      { title: "Prototype review", dueInDays: 35 },
      { title: "Beta release", dueInDays: 90 },
    ],
  },
  {
    name: "Legacy intranet migration",
    description: "Move the old intranet content to the new platform.",
    status: "COMPLETED",
    clientEmail: "client@example.com",
    startInDays: -200,
    dueInDays: -60,
    archived: true,
    milestones: [
      { title: "Content audit", dueInDays: -180, completedDaysAgo: 181 },
      { title: "Migration", dueInDays: -90, completedDaysAgo: 92 },
    ],
  },
  {
    name: "Brand identity",
    description: "Logo, colour palette and brand guidelines.",
    status: "ACTIVE",
    clientEmail: "client2@example.com",
    startInDays: -15,
    dueInDays: 45,
    milestones: [
      { title: "Moodboards", dueInDays: -8, completedDaysAgo: 7 },
      { title: "Logo concepts", dueInDays: 3 },
      { title: "Guidelines document", dueInDays: 40 },
    ],
  },
  {
    name: "Annual report",
    description: "Design and layout of the annual report.",
    status: "COMPLETED",
    clientEmail: "client2@example.com",
    startInDays: -120,
    dueInDays: -20,
    milestones: [
      { title: "Layout approved", dueInDays: -80, completedDaysAgo: 82 },
      { title: "Print-ready files delivered", dueInDays: -25, completedDaysAgo: 24 },
    ],
  },
];

async function main() {
  const password = process.env.SEED_PASSWORD || "demo-password";
  const passwordHash = await hashPassword(password);

  const accounts = [
    { email: "admin@example.com", name: "Alex Admin", role: "ADMIN" as const },
    { email: "client@example.com", name: "Casey Client", role: "CLIENT" as const },
    { email: "client2@example.com", name: "Jordan Client", role: "CLIENT" as const },
  ];

  const users = new Map<string, { id: string }>();
  for (const account of accounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: { ...account, passwordHash },
    });
    users.set(account.email, user);
  }

  const admin = users.get("admin@example.com")!;
  let created = 0;

  for (const seed of projects) {
    const client = users.get(seed.clientEmail)!;
    const exists = await prisma.project.findFirst({ where: { name: seed.name, clientId: client.id } });
    if (exists) continue;

    await prisma.project.create({
      data: {
        name: seed.name,
        description: seed.description,
        status: seed.status,
        clientId: client.id,
        startDate: dayFromToday(seed.startInDays),
        dueDate: dayFromToday(seed.dueInDays),
        archivedAt: seed.archived ? new Date() : null,
        milestones: {
          create: seed.milestones.map((milestone, index) => ({
            title: milestone.title,
            order: index + 1,
            dueDate: dayFromToday(milestone.dueInDays),
            completedAt:
              milestone.completedDaysAgo === undefined
                ? null
                : new Date(Date.now() - milestone.completedDaysAgo * DAY_MS),
          })),
        },
        activities: {
          create: [
            {
              type: "PROJECT_CREATED",
              message: "Project created",
              actorId: admin.id,
              createdAt: dayFromToday(seed.startInDays),
            },
            ...seed.milestones
              .filter((milestone) => milestone.completedDaysAgo !== undefined)
              .map((milestone) => ({
                type: "MILESTONE_COMPLETED" as const,
                message: `Milestone "${milestone.title}" completed`,
                actorId: admin.id,
                createdAt: new Date(Date.now() - milestone.completedDaysAgo! * DAY_MS),
              })),
          ],
        },
      },
    });
    created += 1;
  }

  console.log(`Seed complete: ${accounts.length} accounts ensured, ${created} projects created.`);
  console.log(`Demo accounts: ${accounts.map((account) => account.email).join(", ")}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
