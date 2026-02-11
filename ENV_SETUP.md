# Environment Variables Setup

## SUPABASE_SERVICE_ROLE_KEY (Required for Chat)

Chat features need this key. Add it in **both** places below.

---

### 1. Local Development (`apps/web/.env.local`)

Create or edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ugtymhfgkzhrpfywfmju.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=paste-your-service_role-key-here
```

- Get **service_role** key: Supabase Dashboard → Settings → API → "service_role secret" → Copy
- Restart dev server after adding: `pnpm dev`

---

### 2. Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste your service_role key from Supabase)
   - **Environments:** Production, Preview
4. Click **Save**
5. **Redeploy:** Deployments tab → ⋮ on latest → Redeploy

> `.env.local` is never committed. Production must use Vercel Environment Variables.

---

### 3. Supabase Redirect URLs (Required for Google Login)

In **Supabase Dashboard → Authentication → URL Configuration**:

1. **Site URL:** Your app URL (e.g. `https://your-app.vercel.app` or `http://localhost:3001`)
2. **Redirect URLs:** Add exactly:
   - `http://localhost:3001/auth/callback` (for local)
   - `http://localhost:3000/auth/callback` (if using port 3000)
   - `https://your-app.vercel.app/auth/callback` (for production)
   - `https://your-app.vercel.app/**` (wildcard for production)

If Google login fails, the login page will show the error. Check that redirect URLs match exactly.
