/**
 * Regenerate favicon sizes from apps/web/public/favicon.png (master asset).
 * Run from repo root: node scripts/generate-web-favicons.mjs
 */
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "apps/web/public/favicon.png");
const publicDir = join(root, "apps/web/public");
const appDir = join(root, "apps/web/src/app");

async function writeSquare(out, size) {
  mkdirSync(dirname(out), { recursive: true });
  await sharp(src).resize(size, size).png().toFile(out);
}

await writeSquare(join(appDir, "icon.png"), 512);
await writeSquare(join(appDir, "apple-icon.png"), 180);
await writeSquare(join(publicDir, "apple-icon.png"), 180);
await writeSquare(join(publicDir, "favicon-48.png"), 48);
await writeSquare(join(publicDir, "favicon-96.png"), 96);
await writeSquare(join(publicDir, "favicon-192.png"), 192);

console.log("Favicons updated from apps/web/public/favicon.png");
