#!/usr/bin/env node
/**
 * Production boot: wait for Postgres, migrate deploy, start API (no seed).
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_ATTEMPTS = 30;
const DELAY_MS = 5_000;

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", shell: true, cwd: apiRoot, ...opts });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateWithRetry() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`\n[prod] prisma migrate deploy (${attempt}/${MAX_ATTEMPTS})`);
      run("npx prisma migrate deploy");
      return;
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          "Database unreachable after retries. Check DATABASE_URL and db service health.",
        );
      }
      console.log(`[prod] DB not ready (P1001?), retry in ${DELAY_MS / 1000}s…`);
      await sleep(DELAY_MS);
    }
  }
}

await migrateWithRetry();
console.log("[prod] starting API\n");
run("node dist/main");
