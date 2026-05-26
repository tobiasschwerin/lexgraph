/**
 * Imports German federal laws from gesetze-im-internet.de into the database.
 * Run with: npx tsx scripts/import-laws.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { parseLawXml } from "../src/lib/law-parser.js";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";
import { readFile } from "fs/promises";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "../.law-cache");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set — check your .env file");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Laws to import: [name, zipUrl, code]
const LAWS: [string, string, string][] = [
  ["BGB",  "https://www.gesetze-im-internet.de/bgb/xml.zip",  "BGB"],
  ["HGB",  "https://www.gesetze-im-internet.de/hgb/xml.zip",  "HGB"],
  ["StGB", "https://www.gesetze-im-internet.de/stgb/xml.zip", "StGB"],
  ["GG",   "https://www.gesetze-im-internet.de/gg/xml.zip",   "GG"],
  ["ZPO",  "https://www.gesetze-im-internet.de/zpo/xml.zip",  "ZPO"],
  ["StPO", "https://www.gesetze-im-internet.de/stpo/xml.zip", "StPO"],
  ["VwGO", "https://www.gesetze-im-internet.de/vwgo/xml.zip", "VwGO"],
];

async function downloadAndExtract(url: string, code: string): Promise<string> {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

  const zipPath = path.join(CACHE_DIR, `${code}.zip`);
  const xmlDir = path.join(CACHE_DIR, code);

  if (!existsSync(zipPath)) {
    console.log(`  Downloading ${url}…`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const buffer = await res.arrayBuffer();
    const { writeFile } = await import("fs/promises");
    await writeFile(zipPath, Buffer.from(buffer));
  }

  if (!existsSync(xmlDir)) {
    mkdirSync(xmlDir, { recursive: true });
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(xmlDir, true);
  }

  const { readdir } = await import("fs/promises");
  const files = await readdir(xmlDir);
  const xmlFile = files.find((f) => f.endsWith(".xml"));
  if (!xmlFile) throw new Error(`No XML file found in ${xmlDir}`);

  return path.join(xmlDir, xmlFile);
}

async function importLaw(name: string, url: string, code: string) {
  console.log(`\n[${code}] Starting import…`);

  const xmlPath = await downloadAndExtract(url, code);
  const xml = await readFile(xmlPath, "utf-8");

  console.log(`[${code}] Parsing XML…`);
  const { paragraphs, refs } = await parseLawXml(xml, code);
  console.log(`[${code}] Found ${paragraphs.length} paragraphs, ${refs.length} cross-references`);

  // Upsert paragraphs in batches
  let upserted = 0;
  for (const p of paragraphs) {
    await prisma.paragraph.upsert({
      where: { id: p.id },
      create: p,
      update: { content: p.content, title: p.title, sectionOrder: p.sectionOrder },
    });
    upserted++;
    if (upserted % 100 === 0) process.stdout.write(`  ${upserted}/${paragraphs.length} paragraphs\r`);
  }
  console.log(`[${code}] ✓ ${upserted} paragraphs imported`);

  // Insert cross-references (skip duplicates)
  let refCount = 0;
  for (const ref of refs) {
    try {
      await prisma.connection.create({
        data: {
          fromId: ref.fromId,
          toId: ref.toId,
          createdBy: "system",
          isAutomatic: true,
        },
      });
      refCount++;
    } catch {
      // Duplicate — ignore
    }
  }
  console.log(`[${code}] ✓ ${refCount} cross-references imported`);
}

async function main() {
  console.log("LexGraph Law Importer");
  console.log("======================");

  for (const [name, url, code] of LAWS) {
    await importLaw(name, url, code);
  }

  console.log("\n✅ Import complete!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
