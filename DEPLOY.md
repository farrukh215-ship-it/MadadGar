# Vercel Deployment Guide — Madadgar

Step-by-step guide to deploy Madadgar on Vercel.

---

## 1. Prerequisites

- GitHub account
- Vercel account — [vercel.com](https://vercel.com)
- Supabase project — [supabase.com](https://supabase.com)
- Project pushed to a GitHub repository

---

## 2. Supabase Setup

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Run migrations on your Supabase project:
   ```bash
   npx supabase db push
   ```
   Or run migrations manually in Supabase SQL Editor.
3. In Supabase Dashboard → **Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (for chat)

---

## 3. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/madadgar.git
git push -u origin main
```

---

## 4. Deploy on Vercel

### Step 1: Sign in to Vercel

1. Go to [vercel.com](https://vercel.com).
2. Sign in with GitHub.

### Step 2: Import Project

1. Click **Add New** → **Project**.
2. Import your GitHub repository.
3. Vercel will detect the monorepo.

### Step 3: Configure Project

1. **Framework Preset:** Next.js (auto-detected)
2. **Root Directory:** `apps/web` — **CRITICAL: Must be set, otherwise you get "No Next.js version detected"**
3. **Build Command:** `pnpm build` (default)
4. **Output Directory:** `.next` (default)
5. **Install Command:** `pnpm install`

**Vercel settings:**
- **Root Directory:** `apps/web` — **REQUIRED** for monorepo. The root `package.json` has no `next`; only `apps/web/package.json` has it.

### Step 4: Environment Variables

In **Project Settings → Environment Variables**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | service_role key (for chat) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |

> **Important:** Set `NEXT_PUBLIC_APP_URL` to your actual Vercel URL after first deploy (e.g. `https://madadgar-xxx.vercel.app`).

### Step 5: Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. Visit the deployment URL.

---

## 5. Monorepo / Root Directory

If the repo root is the monorepo root:

1. **Root Directory:** leave empty or `.`
2. **Build Command:** `pnpm build:web` or `cd apps/web && pnpm build`
3. **Install Command:** `pnpm install`
4. **Root Directory:** set to `apps/web` so Vercel treats it as the project root

**Recommended:** In Vercel Project Settings → General:
- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js

This way Vercel uses `apps/web` as the project root and runs `next build` correctly.

---

## 6. Supabase Auth Redirect URLs

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Add:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/**`, `https://your-app.vercel.app/auth/callback`

---

## 7. After Deployment

1. Copy the Vercel URL and set `NEXT_PUBLIC_APP_URL` in environment variables.
2. Redeploy once so sitemap and share links use the correct base URL.
3. Test:
   - Auth (login/signup)
   - Feed
   - Post creation
   - Chat
   - Profile

---

## 8. Custom Domain (Optional)

1. Project Settings → Domains
2. Add domain (e.g. `madadgar.app`)
3. Update DNS with the provided records
4. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs

---

## 9. Troubleshooting

| Issue | Solution |
|-------|----------|
| "No Next.js version detected" / "Could not identify Next.js version" | Set **Root Directory** to `apps/web` in Vercel → Project Settings → General |
| Build fails | Ensure Root Directory is `apps/web` |
| Auth redirect fails | Add Vercel URL in Supabase redirect URLs |
| Chat not working | Set `SUPABASE_SERVICE_ROLE_KEY` |
| Images not loading | Check Supabase Storage bucket permissions |
| Sitemap wrong URL | Set `NEXT_PUBLIC_APP_URL` to production URL |

---

## 10. Quick Reference

```bash
# Local build test (before deploy)
cd apps/web && pnpm build

# Run migrations
npx supabase db push
```

**Vercel Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
