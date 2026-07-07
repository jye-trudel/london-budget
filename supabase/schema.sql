-- ─────────────────────────────────────────────────────────────────────────
-- London Budget — Supabase schema
-- Run this once in your Supabase project → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────────────────

-- Monthly budgets (one row per category)
CREATE TABLE IF NOT EXISTS budgets (
  category TEXT PRIMARY KEY,
  amount   NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Individual expense entries
CREATE TABLE IF NOT EXISTS expenses (
  id         TEXT        PRIMARY KEY,
  amount     NUMERIC(10, 2) NOT NULL,
  category   TEXT        NOT NULL,
  date       TEXT        NOT NULL,  -- stored as YYYY-MM-DD
  note       TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row-level security ────────────────────────────────────────────────────
-- This is a single-user app with no auth. Disable RLS so the anon key
-- (used by the frontend) can read and write freely.
-- Keep your Supabase URL + anon key private; don't share them publicly.
ALTER TABLE budgets  DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- ── Seed default budgets ──────────────────────────────────────────────────
-- Won't overwrite if the app has already been used (ON CONFLICT DO NOTHING).
INSERT INTO budgets (category, amount) VALUES
  ('Food & Dining',     360),
  ('Going Out',         105),
  ('Activities',         40),
  ('Toiletries',         30),
  ('Laundry',            15),
  ('Clothing',           30),
  ('Transport (extra)',  20),
  ('Buffer / Misc',      35)
ON CONFLICT (category) DO NOTHING;
