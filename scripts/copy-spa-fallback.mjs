/**
 * GitHub Pages SPA support: serve index.html for unknown routes via 404.html.
 * @see https://github.com/rafgraph/spa-github-pages
 */
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const indexPath = join(distDir, 'index.html');
const fallbackPath = join(distDir, '404.html');

if (!existsSync(indexPath)) {
  console.error('copy-spa-fallback: dist/index.html not found — run vite build first.');
  process.exit(1);
}

copyFileSync(indexPath, fallbackPath);
console.log('copy-spa-fallback: wrote dist/404.html for GitHub Pages client-side routing.');
