/**
 * Ensures dist HTML is a real Vite production build (not raw source).
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('verify-dist-html: dist/index.html missing — run vite build first.');
  process.exit(1);
}

if (!existsSync(join(distDir, '.nojekyll'))) {
  console.error('verify-dist-html: dist/.nojekyll missing — add public/.nojekyll for GitHub Pages.');
  process.exit(1);
}

const errors = [];

for (const name of ['index.html', '404.html']) {
  const path = join(distDir, name);
  if (!existsSync(path)) continue;

  const html = readFileSync(path, 'utf8');

  if (html.includes('%BASE_URL%')) {
    errors.push(`${name} still contains unreplaced %BASE_URL% placeholders`);
  }

  if (html.includes('/src/main.jsx')) {
    errors.push(`${name} still references /src/main.jsx — Vite did not bundle the app`);
  }

  if (!html.includes('/assets/') && name === 'index.html') {
    errors.push('index.html has no /assets/ script — build output looks invalid');
  }
}

if (errors.length) {
  console.error('verify-dist-html failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('verify-dist-html: dist HTML looks like a valid production build.');
