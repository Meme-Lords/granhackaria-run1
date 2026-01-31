# granhackaria-run1

**Stack:** Next.js · TypeScript · Supabase

## Setup

1. Clone and install:
   ```bash
   git clone https://github.com/Meme-Lords/granhackaria-run1.git
   cd granhackaria-run1
   npm install
   ```
2. Copy env and add your Supabase keys:
   ```bash
   cp .env.example .env
   ```
   Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from [Supabase](https://supabase.com/dashboard) → Project → Settings → API.

   If `.env.example` is missing, create it with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run dev server (after Phase 01 creates the app):
   ```bash
   npm run dev
   ```

## Running phases (Ralphy)

- **PowerShell:** `.\run-ralphy-all-phases.ps1`
- **Bash:** `./run-ralphy-all-phases.sh`
- Or: `ralphy --yaml .ralphy/tasks.yaml --max-iterations 0 --max-retries 3 --verbose`

Phase plans live in `.planning/phases/`. GSD skills are in `.agents/skills/gsd/`.
