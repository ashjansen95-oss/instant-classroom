/**
 * Renders the app icon to the PNG sizes the manifest and iOS need.
 *
 * Run with `node scripts/generate-icons.mjs` after changing the mark. Output is
 * committed, so this is not part of the build and `sharp` stays a dev-only,
 * optional dependency.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");

/**
 * A lightning bolt on a violet rounded square. Reads at 48px, which is the point.
 *
 * `scale` shrinks the bolt for the maskable variant: Android crops maskable
 * icons to a circle, and only the middle 80% is guaranteed to survive.
 */
const icon = (background, scale = 1, radius = 112) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${radius}" fill="${background}"/>
  <g transform="translate(256 256) scale(${scale}) translate(-256 -256)">
    <path d="M296 64 154 286h84l-22 162 142-222h-84z" fill="#FFFBF4"/>
  </g>
</svg>`;

const BRAND = "#5B3DF5";

const OUTPUTS = [
  { file: "icon-192.png", size: 192, svg: icon(BRAND) },
  { file: "icon-512.png", size: 512, svg: icon(BRAND) },
  { file: "icon-maskable-512.png", size: 512, svg: icon(BRAND, 0.68, 0) },
  { file: "apple-touch-icon.png", size: 180, svg: icon(BRAND) },
];

const { default: sharp } = await import("sharp").catch(() => {
  console.error("Install sharp first:  npm i -D sharp");
  process.exit(1);
});

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "icon.svg"), icon(BRAND).trim());

for (const { file, size, svg } of OUTPUTS) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(publicDir, file));
  console.log(`wrote public/${file}`);
}
