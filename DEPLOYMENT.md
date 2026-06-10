# GitHub Pages deployment — Stellar ERP frontend

This app is built with **Vite + React** and deployed to GitHub Pages from the `dist/` folder.

**Live URL (project site):**  
`https://<github-username>.github.io/steller-erp-frontend-build/`

---

## How GitHub Pages hosting works

1. GitHub Actions runs `npm run build:pages` in the `frontend/` directory.
2. The workflow uploads `frontend/dist` as a Pages artifact.
3. GitHub serves static files from that artifact.
4. The Vite `base` path is `/steller-erp-frontend-build/` so asset URLs resolve under the repository subdirectory.
5. `dist/404.html` is a copy of `index.html` so **direct links and page refreshes** on nested routes (e.g. `/admin/rentals`) work with React Router.
6. PWA service workers are **disabled** for subdirectory deploys (GitHub Pages) to avoid scope/caching issues; local dev and root-domain builds still support PWA when `base` is `/`.

---

## Environment variables

All backend URLs must come from Vite env vars (`import.meta.env.VITE_*`). Nothing is hardcoded in application code.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes (prod) | Full API root, e.g. `https://api.example.com/api/v1` (no trailing slash) |
| `VITE_BACKEND_URL` | Alternative | Server origin only; `/api/v1` is appended |
| `VITE_BASE_PATH` | Prod | Defaults to `/steller-erp-frontend-build/` in production builds |
| `VITE_APP_NAME` | No | App title (default: Stellar Camera Rentals ERP) |
| `VITE_DEV_PROXY_TARGET` | Dev only | Proxy target for `npm run dev` |

Resolution order for API URL: `VITE_API_BASE_URL` → legacy `VITE_API_URL` → `VITE_BACKEND_URL` + `/api/v1` → dev proxy `/api/v1`.

### Update the backend URL

**GitHub Actions (recommended for production)**

1. Open the repository on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Add repository secret:
   - `VITE_API_BASE_URL` = `https://your-api-host.com/api/v1`  
   **or** `VITE_BACKEND_URL` = `https://your-api-host.com`
3. Re-run the deployment workflow (push to `main` or **Actions → Deploy frontend to GitHub Pages → Run workflow**).

**Local production build**

```bash
cp .env.production.example .env.production
# Edit .env.production with your API URL
npm run build:pages
```

### Production env files

| File | Purpose |
|------|---------|
| `.env` | Shared defaults (app name) |
| `.env.development` | Local API proxy URL (`npm run dev` only) |
| `.env.production` | Used automatically by `vite build` on your machine |
| GitHub Actions secrets | Used in CI (not committed) |

Never commit real production URLs or secrets. Use `.env.production.example` as a template.

---

## Trigger a deployment

### Automatic

Push to `main` or `master` when files under `frontend/` change.

### Manual

1. GitHub → **Actions** → **Deploy frontend to GitHub Pages**
2. **Run workflow**

### First-time GitHub Pages setup

1. Repository → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. Ensure the workflow completed successfully; the site URL appears in the workflow run.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local dev server (`base` = `/`) |
| `npm run build` | Standard production build |
| `npm run build:pages` | GitHub Pages build + `404.html` SPA fallback + localhost verification |
| `npm run preview:pages` | Preview with GitHub Pages base path |
| `npm run verify:build` | Scan `dist/` for localhost references |

---

## Local validation checklist

```bash
cd frontend
cp .env.production.example .env.production
# Set VITE_API_BASE_URL to your API
npm run build:pages
npm run preview:pages
```

Verify:

- [ ] Build completes without errors
- [ ] `dist/404.html` exists
- [ ] `dist/index.html` asset paths start with `/steller-erp-frontend-build/`
- [ ] No `localhost` in `dist/**/*.js`
- [ ] Login and API calls hit your configured backend (check browser Network tab)
- [ ] Refresh works on a nested route (e.g. `/steller-erp-frontend-build/admin`)

---

## Troubleshooting

### White screen / `%BASE_URL%` 404 errors

If the browser requests URLs like `.../steller-erp-frontend-build/%BASE_URL%favicon.svg`, GitHub Pages is serving **source** `index.html`, not the **built** `dist/index.html`.

**Fix:**

1. Repository → **Settings** → **Pages** → **Build and deployment** → Source must be **GitHub Actions** (not “Deploy from a branch”).
2. Confirm the **Deploy frontend to GitHub Pages** workflow completed successfully on the latest push.
3. Open the workflow log and verify `npm run build:pages` ran and the sanity-check step passed.
4. Re-deploy: **Actions** → workflow → **Run workflow**.

The production bundle must include hashed files under `dist/assets/` and must **not** reference `/src/main.jsx`.

### White screen with correct asset paths

- Check browser **Network** tab for failed `index-*.js` requests.
- Confirm `VITE_API_BASE_URL` secret is set and CORS allows your GitHub Pages origin.

---

## CORS

The backend must allow the GitHub Pages origin, e.g.:

`https://<username>.github.io`

Configure this in the API server CORS settings.

---

## Repository name

The default `VITE_BASE_PATH` is `/steller-erp-frontend-build/`. If the GitHub repository is renamed, update:

- `VITE_BASE_PATH` in `.env.production` / GitHub secrets
- `DEFAULT_PAGES_BASE` in `vite.config.js` (fallback)
- `preview:pages` script in `package.json`
