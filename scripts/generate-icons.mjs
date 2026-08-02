// Genererer app-ikon, splash og favicon ud fra Citrus-designet.
//
// Kør med:  node scripts/generate-icons.mjs
//
// Nålen er den eneste form i mærket, så alt herunder er afledt af den ene
// path. Kilden ligger i repoet, så ikonet kan regenereres i stedet for at
// være en binær fil ingen kan redigere.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "images");

const INK = "#1A1200";
const ORANGE = "#FF9500";
const CREAM = "#FFF4DE";

/** Nålen tegnet i sit eget 100×130-koordinatsystem. */
function pin({ fill, stroke, strokeWidth = 10, dotRadius = 16 }) {
  return `
    <path d="M50 6C26 6 7 25 7 49c0 30 43 74 43 74s43-44 43-74C93 25 74 6 50 6Z"
          fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
    <circle cx="50" cy="48" r="${dotRadius}" fill="${stroke}"/>
  `;
}

/**
 * Ikonet: fuldt udfaldende orange med nålen centreret.
 *
 * Bevidst UDEN den mørke ramme fra designdokumentet — iOS maskerer ikonet med
 * en superellipse, og en streg langs kanten ville blive klippet ujævnt i
 * hjørnerne. Nålen alene bærer formen ned til 40 px, hvilket designet selv
 * demonstrerer.
 */
function iconSvg(size) {
  const pinHeight = size * 0.52;
  const pinWidth = (pinHeight / 130) * 100;
  const x = (size - pinWidth) / 2;
  // Optisk centrering: nålens spids trækker tyngdepunktet nedad.
  const y = (size - pinHeight) / 2 - size * 0.015;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${ORANGE}"/>
  <g transform="translate(${x} ${y}) scale(${pinWidth / 100})">
    ${pin({ fill: CREAM, stroke: INK })}
  </g>
</svg>`;
}

/** Splash: nålen alene på gennemsigtig bund — app.json maler baggrunden. */
function splashSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${(size / 100) * 130}" viewBox="0 0 100 130">
  ${pin({ fill: CREAM, stroke: INK, strokeWidth: 9 })}
</svg>`;
}

/** Android adaptive: forgrunden skal ligge i den sikre midterste ~66 %. */
function adaptiveForegroundSvg(size) {
  const pinHeight = size * 0.38;
  const pinWidth = (pinHeight / 130) * 100;
  const x = (size - pinWidth) / 2;
  const y = (size - pinHeight) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <g transform="translate(${x} ${y}) scale(${pinWidth / 100})">
    ${pin({ fill: CREAM, stroke: INK })}
  </g>
</svg>`;
}

function adaptiveMonochromeSvg(size) {
  const pinHeight = size * 0.38;
  const pinWidth = (pinHeight / 130) * 100;
  const x = (size - pinWidth) / 2;
  const y = (size - pinHeight) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <g transform="translate(${x} ${y}) scale(${pinWidth / 100})">
    ${pin({ fill: "#000000", stroke: "#000000" })}
  </g>
</svg>`;
}

function solidSvg(size, color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="${color}"/></svg>`;
}

async function render(svg, file, { width, flatten } = {}) {
  // Høj densitet rasteriserer kanterne rent; resize bagefter fastlægger den
  // faktiske pixelstørrelse (uden den skalerer sharp efter DPI og rammer ved
  // siden af — iOS kræver præcis 1024×1024).
  let img = sharp(Buffer.from(svg), { density: 384 }).resize({ width });

  // iOS afviser ikoner med alfakanal, så app-ikonet flades mod orange.
  if (flatten) {
    img = img.flatten({ background: ORANGE });
  }

  await img.png().toFile(join(OUT, file));

  const { width: w, height: h } = await sharp(join(OUT, file)).metadata();
  console.log(`  ✓ ${file} (${w}×${h})`);
}

await mkdir(OUT, { recursive: true });

console.log("Genererer ikoner …");
await render(iconSvg(1024), "icon.png", { width: 1024, flatten: true });
await render(splashSvg(512), "splash-icon.png", { width: 512 });
await render(iconSvg(48), "favicon.png", { width: 48, flatten: true });
await render(adaptiveForegroundSvg(1024), "android-icon-foreground.png", {
  width: 1024,
});
await render(adaptiveMonochromeSvg(1024), "android-icon-monochrome.png", {
  width: 1024,
});
await render(solidSvg(1024, ORANGE), "android-icon-background.png", {
  width: 1024,
});

// Kilden gemmes, så ikonet kan åbnes i en editor uden at køre scriptet.
await writeFile(join(OUT, "icon.svg"), iconSvg(1024));
console.log("  ✓ icon.svg");
