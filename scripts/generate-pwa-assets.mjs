/**
 * Generates PWA icons and iOS splash screens from the STELLER wordmark PNG.
 * Run: node scripts/generate-pwa-assets.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceLogo = join(root, 'src/assets/steller-logo-full.png');
const iconsDir = join(root, 'public/icons');
const splashDir = join(root, 'public/splash');
const publicDir = join(root, 'public');

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

async function logoBuffer(maxWidth, maxHeight) {
  return sharp(sourceLogo)
    .resize(maxWidth, maxHeight, { fit: 'contain', background: BG })
    .png()
    .toBuffer();
}

async function createIcon(size, filename, logoScale = 0.78) {
  const inner = Math.round(size * logoScale);
  const logo = await logoBuffer(inner, inner);
  const offset = Math.round((size - inner) / 2);

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
  const logoWidth = Math.round(width * 0.62);
  const logoHeight = Math.round(height * 0.12);
  const logo = await logoBuffer(logoWidth, logoHeight);
  const meta = await sharp(logo).metadata();
  const top = Math.round((height - (meta.height || logoHeight)) / 2);
  const left = Math.round((width - (meta.width || logoWidth)) / 2);

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

  await createIcon(512, 'maskable-icon-512x512.png', 0.68);
  console.log('✓ maskable-icon-512x512.png');

  await createIcon(32, 'favicon-32.png', 0.82);
  await sharp(join(iconsDir, 'favicon-32.png')).toFile(join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png');

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
