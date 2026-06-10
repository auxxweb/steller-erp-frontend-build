/**
 * Copies dist/ → docs/ for GitHub Pages (Settings: main branch, /docs folder).
 * The docs folder is published at https://<user>.github.io/<repo>/ — not under /docs/ in the URL.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const docsDir = join(root, 'docs');

if (!existsSync(join(distDir, 'index.html'))) {
  console.error('publish-to-docs: run npm run build:pages first.');
  process.exit(1);
}

if (existsSync(docsDir)) {
  rmSync(docsDir, { recursive: true, force: true });
}

cpSync(distDir, docsDir, { recursive: true });
console.log('publish-to-docs: copied dist/ → docs/');
