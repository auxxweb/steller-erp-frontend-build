/**
 * Ensures the production bundle does not embed dev API URLs.
 * Ignores library defaults (e.g. axios/react-router) that mention localhost generically.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');

/** Hardcoded dev API endpoints that must not ship in production */
const forbiddenPatterns = [
  /https?:\/\/localhost(?::\d+)?\/api\b/i,
  /https?:\/\/127\.0\.0\.1(?::\d+)?\/api\b/i,
  /VITE_BACKEND_URL[`'"]?\s*:\s*[`'"]https?:\/\/localhost/i,
  /VITE_API(?:_BASE)?_URL[`'"]?\s*:\s*[`'"]https?:\/\/localhost/i,
  /baseURL[`'"]?\s*:\s*[`'"]https?:\/\/localhost/i,
  /baseURL[`'"]?\s*:\s*[`'"]\/api\/v1[`'"]/,
];

function collectFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) collectFiles(path, acc);
    else if (/\.(js|css|html|json|webmanifest)$/i.test(name)) acc.push(path);
  }
  return acc;
}

const offenders = [];
for (const file of collectFiles(distDir)) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      offenders.push(`${file.replace(`${root}/`, '')} (${pattern})`);
      break;
    }
  }
}

if (offenders.length) {
  console.error('Production build verification failed — dev API URL references found in:');
  offenders.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log('verify-production-build: no dev API URLs embedded in dist/.');
