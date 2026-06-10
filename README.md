# Stellar ERP Frontend

## GitHub Pages (required one-time setup)

Open **Settings → Pages → Build and deployment**:

| Setting | Value |
|---------|--------|
| Source | **Deploy from a branch** |
| Branch | **`main`** |
| Folder | **`/docs`** |

Then push to `main` or run:

```bash
npm run deploy:docs
git add docs && git commit -m "Deploy site" && git push
```

Live URL: `https://auxxweb.github.io/steller-erp-frontend-build/`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

## Local development

```bash
npm install
npm run dev
```

## Local preview (matches GitHub Pages)

```bash
npm run build:pages
npm run preview:pages
```
