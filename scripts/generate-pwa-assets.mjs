/**
 * Generates PWA icons and iOS splash screens from the Stellar logo SVG.
 * Run: node scripts/generate-pwa-assets.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceSvg = readFileSync(join(root, 'src/assets/stellar-logo.svg'));
const iconsDir = join(root, 'public/icons');
const splashDir = join(root, 'public/splash');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SPLASH_SCREENS = [
  { name: '640x1136', width: 640, height: 1136 },
  { name: '750x1334', width: 750, height: 1334 },
  { name: '828x1792', width: 828, height: 1792 },
  { name: '1080x2340', width: 1080, height: 2340 },
  { name: '1125x2436', width: 1125, height: 2436 },
  { name: '1170x2532', width: 1170, height: 2532 },
  { name: '1179x2556', width: 1179, height: 2556 },
  { name: '1284x2778', width: 1284, height: 2778 },
  { name: '1290x2796', width: 1290, height: 2796 },
  { name: '1536x2048', width: 1536, height: 2048 },
  { name: '1668x2388', width: 1668, height: 2388 },
  { name: '2048x2732', width: 2048, height: 2732 },
];

const BG = { r: 10, g: 10, b: 10, alpha: 1 };

async function ensureDirs() {
  await mkdir(iconsDir, { recursive: true });
  await mkdir(splashDir, { recursive: true });
}

async function createIcon(size, filename, logoScale = 0.82) {
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(sourceSvg).resize(logoSize, logoSize).png().toBuffer();
  const offset = Math.round((size - logoSize) / 2);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, top: offset, left: offset }])
    .png()
    .toFile(join(iconsDir, filename));
}

async function createSplash(width, height, filename) {
  const logoSize = Math.round(Math.min(width, height) * 0.22);
  const logo = await sharp(sourceSvg).resize(logoSize, logoSize).png().toBuffer();
  const top = Math.round((height - logoSize) / 2);
  const left = Math.round((width - logoSize) / 2);

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, top, left }])
    .png({ compressionLevel: 9 })
    .toFile(join(splashDir, filename));
}

async function main() {
  await ensureDirs();

  for (const size of ICON_SIZES) {
    await createIcon(size, `icon-${size}x${size}.png`);
    console.log(`✓ icon-${size}x${size}.png`);
  }

  await createIcon(180, 'apple-touch-icon.png');
  console.log('✓ apple-touch-icon.png');

  // Maskable: logo at ~72% for safe zone
  await createIcon(512, 'maskable-icon-512x512.png', 0.72);
  console.log('✓ maskable-icon-512x512.png');

  for (const { name, width, height } of SPLASH_SCREENS) {
    await createSplash(width, height, `apple-splash-${name}.png`);
    console.log(`✓ apple-splash-${name}.png`);
  }

  console.log('\nPWA assets generated in public/icons and public/splash');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
