/**
 * Create a user account from the command line.
 *
 *   npm run user:create -- --email admin@example.com --name "Alex Admin" --role ADMIN
 *   npm run user:create -- --email client@example.com --name "Casey Client" --role CLIENT --password "..."
 *
 * If --password is omitted a strong random one is generated and printed once. Passing
 * passwords on the command line leaves them in your shell history, so prefer the
 * generated one and change it later.
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { ROLES } from "../lib/constants";
import { hashPassword } from "../lib/password";

const MIN_PASSWORD_LENGTH = 12;

const inputSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1).max(120),
  role: z.enum(ROLES),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
});

async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      role: { type: "string" },
      password: { type: "string" },
    },
  });

  const generatedPassword = values.password === undefined;
  const parsed = inputSchema.safeParse({
    ...values,
    role: values.role?.toUpperCase(),
    password: values.password ?? randomBytes(18).toString("base64url"),
  });
  if (!parsed.success) {
    console.error("Invalid input:");
    for (const [field, messages] of Object.entries(z.flattenError(parsed.error).fieldErrors)) {
      console.error(`  --${field}: ${messages?.join(", ")}`);
    }
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  try {
    const { email, name, role, password } = parsed.data;
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({ data: { email, name, role, passwordHash } });

    console.log(`Created ${user.role.toLowerCase()} ${user.email}`);
    if (generatedPassword) console.log(`Generated password (shown once): ${password}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
