# London Budget

Personal budgeting app for tracking monthly spending in £.
React + Vite frontend · Supabase (PostgreSQL) backend · deploy to Vercel.

---

## Quick start (local dev)

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Once created, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
   This creates the two tables and seeds your default budgets.
3. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abcdef.supabase.co`)
   - **anon / public** key

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 3. Install and run

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**

---

## Deploy to Vercel (so you can use it anywhere)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "init"
# create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/london-budget.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import your GitHub repo — Vercel auto-detects Vite, no config needed.
3. Before clicking **Deploy**, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
4. Click **Deploy** — you'll get a URL like `https://london-budget.vercel.app`.

Bookmark that URL on your phone and laptop. Every `git push` auto-redeploys.

---

## Where your data lives

All data is stored in your **Supabase project** (PostgreSQL, hosted by Supabase).
It's accessible from any device that can reach the Vercel URL.

> ⚠️ There is no login. Your Supabase anon key is bundled in the frontend JS.
> Keep your Vercel URL and Supabase credentials private — don't share them.

---

## Default monthly budget

| Category | Budget |
|---|---|
| Food & Dining | £360 |
| Going Out | £105 |
| Activities | £40 |
| Toiletries | £30 |
| Laundry | £15 |
| Clothing | £30 |
| Transport (extra) | £20 |
| Buffer / Misc | £35 |
| **Total** | **£635** |

All categories are editable in the **Settings** tab.
