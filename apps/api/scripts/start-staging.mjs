#!/usr/bin/env node
/**
 * Staging boot: чекаємо Postgres (Render free / перший deploy), migrate, seed, API.
 */
import { execSync } from "node:child_process";

const MAX_ATTEMPTS = 30;
const DELAY_MS = 10_000;

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateWithRetry() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`\n[staging] prisma migrate deploy (${attempt}/${MAX_ATTEMPTS})`);
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      return;
    } catch {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          "Database unreachable after retries. Check Render: DB status, same region as API (frankfurt), DATABASE_URL.",
        );
      }
      console.log(
        `[staging] DB not ready (P1001?), retry in ${DELAY_MS / 1000}s…`,
      );
      await sleep(DELAY_MS);
    }
  }
}

await migrateWithRetry();
run("npx prisma db seed");
run("node dist/main");
