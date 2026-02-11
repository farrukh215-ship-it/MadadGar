# Environment Variables Setup

## Vercel (Production) – All 3 Required

If you see "Your project's URL and API key are required" or 401 errors, add **all** of these in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project → **Settings** → **Environment Variables**
2. Add these (from Supabase Dashboard → Settings → API):

| Name | Value | Required |
|------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon public key) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role secret) | Yes (for chat) |

3. **Environments:** Production, Preview
4. **Save** → **Redeploy** (Deployments → ⋮ → Redeploy)

> Without `NEXT_PUBLIC_*` vars, the app cannot create a Supabase client and will show 401 / env errors.

---

### Local Development (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service_role-key
```

Restart dev server: `pnpm dev`

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

---

### 401 / Deployment Protection

If you get 401 on Vercel: **Settings → Deployment Protection** → disable "Vercel Authentication" for production, or add your domain to the bypass list.
