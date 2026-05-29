import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import "dotenv/config";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const count = await prisma.paragraph.count();
  console.log("Gesamt:", count);
  const byLaw = await prisma.paragraph.groupBy({ by: ["lawCode"], _count: true });
  for (const l of byLaw) console.log(l.lawCode, l._count);
  await prisma.$disconnect();
}

main().catch(console.error);
