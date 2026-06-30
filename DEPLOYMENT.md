# Deployment Guide

## Arsitektur

```
[Vercel]                    [Render]                     [Neon]
Dashboard (React SPA)  →    Bot API + Discord.js    →    PostgreSQL
  bot-discord-z.vercel.app   bot-discord-z.onrender.com   (cloud)
      │                              │
      └────── /api/* proxy ──────────┘
```

- **Dashboard** (React/Vite) → deploy ke **Vercel** (static site + API proxy)
- **Bot** (Express API + Discord.js) → deploy ke **Render** (Docker web service)
- **Database** → **Neon PostgreSQL** (sudah running)

---

## 1. Persiapan

### 1.1 Push ke GitHub

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/USERNAME/bot-discord-z.git
git push -u origin main
```

### 1.2 Environment Variables

Semua variable wajib diisi di dashboard Render & Vercel:

| Variable | Source |
|---|---|
| `DISCORD_TOKEN` | Discord Developer Portal → Bot → Token |
| `DISCORD_CLIENT_ID` | Discord Developer Portal → OAuth2 → Client ID |
| `DISCORD_CLIENT_SECRET` | Discord Developer Portal → OAuth2 → Client Secret |
| `DATABASE_URL` | Neon Dashboard → Connection string |
| `JWT_SECRET` | Generate sendiri (`openssl rand -hex 32`) |

---

## 2. Deploy Bot ke Render

### Via Render Dashboard

1. Login ke [render.com](https://render.com)
2. **New +** → **Web Service**
3. Connect GitHub repo → pilih repo `bot-discord-z`
4. Isi:
   - **Name:** `bot-discord-z`
   - **Region:** Singapore (sesuaikan)
   - **Branch:** `main`
   - **Root Directory:** (biarkan kosong)
   - **Runtime:** `Node`
   - **Build Command:**
     ```
     corepack enable && pnpm install --frozen-lockfile
     ```
   - **Start Command:**
     ```
     node start.js
     ```
   - **Health Check Path:** `/health`
5. **Advanced** → Add Environment Variables:
   - `NODE_ENV = production`
   - `PORT = 3001`
   - `DISCORD_TOKEN` = isi token
   - `DISCORD_CLIENT_ID` = isi client ID
   - `DISCORD_CLIENT_SECRET` = isi client secret
   - `DATABASE_URL` = isi connection string Neon
   - `JWT_SECRET` = generate random string
   - `DASHBOARD_URL = https://bot-discord-z.vercel.app` (ganti nanti setelah Vercel deploy)
   - `BOT_API_URL = https://bot-discord-z.onrender.com`
6. **Create Web Service**

> Build & deploy pertama ~5-10 menit. Bot akan restart otomatis setiap ada push ke GitHub.
> `start.js` menjalankan API server (port 3001) dan Discord bot secara bersamaan.

---

## 3. Deploy Dashboard ke Vercel

1. Login ke [vercel.com](https://vercel.com)
2. **Add New → Project**
3. Import GitHub repo `bot-discord-z`
4. **Framework Preset:** `Vite`
5. **Root Directory:** `apps/dashboard` (pilih dari dropdown)
6. **Build Command:** `pnpm install --frozen-lockfile && pnpm --filter dashboard build`
7. **Output Directory:** `dist`
8. **Environment Variables:**
   - `VITE_API_URL = https://bot-discord-z.onrender.com`
9. **Deploy**

> Atau bisa menggunakan `vercel.json` yang sudah disediakan. Cukup pilih root directory `apps/dashboard` saat setup project.

### Update vercel.json

Setelah deploy, ganti URL di `apps/dashboard/vercel.json` dengan URL asli Render:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://NAMA-APP-MU.onrender.com/api/$1" }
  ]
}
```

---

## 4. Update Redirect URI Discord

1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Pilih aplikasi kamu
3. **OAuth2 → Redirects**
4. Tambah:
   - `https://bot-discord-z.vercel.app/api/auth/discord/callback`
   - (Kalo local dev) `http://localhost:3001/api/auth/discord/callback`

---

## 5. Verifikasi

| Cek | URL |
|---|---|
| Health bot | `https://NAMA-APP-MU.onrender.com/health` |
| Dashboard | `https://bot-discord-z.vercel.app` |
| Login Discord | Klik "Login with Discord" di dashboard |

---

## 6. Notes

- **start.js** menjalankan API server (port 3001) dan Discord bot secara bersamaan
- **Prisma migrate** dijalankan otomatis via `prisma db push` di Dockerfile (perlu ditambahkan jika belum)
- Jika ada error `Missing Permissions`, pastikan role bot di atas role target di server Discord
- Untuk development lokal, cukup `pnpm dev` di root
