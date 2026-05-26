import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Explizit den Pfad zur .env-Datei angeben
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, ".env") });

const url = process.env["DATABASE_URL"];
if (!url) throw new Error("DATABASE_URL fehlt in der .env-Datei");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: { url },
});
