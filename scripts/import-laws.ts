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
import pg from "pg";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "../.law-cache");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set — check your .env file");

const pool = new pg.Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
});
const adapter = new PrismaPg(pool);
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

  // Upsert paragraphs in bulk batches of 200
  const BATCH = 200;
  let upserted = 0;
  for (let i = 0; i < paragraphs.length; i += BATCH) {
    const batch = paragraphs.slice(i, i + BATCH);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Paragraph" (id, "lawCode", section, "sectionOrder", title, content)
       VALUES ${batch.map((_, j) => `($${j * 6 + 1},$${j * 6 + 2},$${j * 6 + 3},$${j * 6 + 4},$${j * 6 + 5},$${j * 6 + 6})`).join(",")}
       ON CONFLICT (id) DO UPDATE SET content=EXCLUDED.content, title=EXCLUDED.title, "sectionOrder"=EXCLUDED."sectionOrder"`,
      ...batch.flatMap(p => [p.id, p.lawCode, p.section, p.sectionOrder, p.title ?? null, p.content])
    );
    upserted += batch.length;
    process.stdout.write(`  ${upserted}/${paragraphs.length} paragraphs\r`);
  }
  console.log(`[${code}] ✓ ${upserted} paragraphs imported`);

  // Insert cross-references in bulk (skip duplicates)
  const validRefs = refs.filter(r => r.fromId && r.toId);
  if (validRefs.length > 0) {
    const REF_BATCH = 500;
    let refCount = 0;
    for (let i = 0; i < validRefs.length; i += REF_BATCH) {
      const batch = validRefs.slice(i, i + REF_BATCH);
      try {
        const result = await prisma.connection.createMany({
          data: batch.map(r => ({ fromId: r.fromId, toId: r.toId, createdBy: "system", isAutomatic: true })),
          skipDuplicates: true,
        });
        refCount += result.count;
      } catch {
        // ignore batch errors
      }
    }
    console.log(`[${code}] ✓ ${refCount} cross-references imported`);
  } else {
    console.log(`[${code}] ✓ 0 cross-references`);
  }
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
