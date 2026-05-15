#!/usr/bin/env node
/**
 * Прописує NEXT_PUBLIC_API_URL у Vercel (web + admin) і перезапускає production deploy.
 *
 * Usage:
 *   node scripts/staging-vercel-env.mjs https://malva-api-staging.onrender.com
 */

import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const raw = process.argv[2]?.trim().replace(/\/$/, "");

if (!raw) {
  console.error(
    "Usage: node scripts/staging-vercel-env.mjs <API_BASE_URL>\n" +
      "Example: node scripts/staging-vercel-env.mjs https://malva-api-staging.onrender.com",
  );
  process.exit(1);
}

const apiUrl = raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;

function run(cmd, cwd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

function setEnv(appDir, name, value, target) {
  try {
    run(`npx --yes vercel@latest env rm ${name} ${target} --yes`, appDir);
  } catch {
    /* missing */
  }
  const r = spawnSync(
    "npx",
    ["--yes", "vercel@latest", "env", "add", name, target, "--force"],
    { cwd: appDir, input: value, encoding: "utf8" },
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`vercel env add failed for ${name} (${target})`);
  }
}

console.log(`Staging API URL: ${apiUrl}\n`);

for (const app of ["apps/web", "apps/admin"]) {
  const appDir = path.join(root, app);
  for (const target of ["production", "preview", "development"]) {
    setEnv(appDir, "NEXT_PUBLIC_API_URL", apiUrl, target);
  }
}

run("npx --yes vercel@latest deploy --prod --yes", path.join(root, "apps/web"));
run("npx --yes vercel@latest deploy --prod --yes", path.join(root, "apps/admin"));

console.log("\nDone. Перевірте каталог і логін адмінки на Vercel production URL.");
