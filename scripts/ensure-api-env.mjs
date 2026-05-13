import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const envPath = path.join(repoRoot, "apps", "api", ".env");
const examplePath = path.join(repoRoot, "apps", "api", ".env.example");

if (fs.existsSync(envPath)) {
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error(
    "Не знайдено apps/api/.env.example — не можу створити apps/api/.env",
  );
  process.exit(1);
}

fs.copyFileSync(examplePath, envPath);
console.log(
  "Створено apps/api/.env з apps/api/.env.example (перевірте DATABASE_URL та JWT_SECRET).",
);
