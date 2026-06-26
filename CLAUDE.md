# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server at localhost:3000
npm run build     # production build
npm run start     # serve production build
# TypeScript check (npx tsc is broken in this project — use node directly):
node node_modules/typescript/lib/tsc.js --noEmit
```

Before running, copy `.env.local` and fill in your Supabase project URL and anon key:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** Next.js 14 (App Router) + Supabase (Postgres + Auth) + Tailwind CSS.

**Route groups:**
- `app/(auth)/` — public pages (login, signup), no layout wrapper
- `app/(app)/` — protected pages, `layout.tsx` redirects unauthenticated users
- `app/page.tsx` — root redirect: authed → `/dashboard`, else → `/login`

**Data flow:** Server Components fetch from Supabase directly (using `lib/supabase/server.ts`). Client Components use `lib/supabase/client.ts` for mutations and then call `router.refresh()` to re-render server data.

**Database schema** (defined in `supabase/migrations/001_initial.sql`):
- `households` — a named group with a random invite code (e.g. `HAWK-4921`)
- `household_members` — links users to a household (max 2 users per household)
- `budgets` — one row per `(household_id, month)` where `month` is always the first day (e.g. `2026-06-01`)
- `expenses` — individual spend entries with `amount`, `description`, `date`

All tables have Row-Level Security. A `my_household_id()` SQL function (security definer) is used in every RLS policy to gate access to the user's household only.

**TypeScript types** are hand-authored in `lib/types.ts` (not generated). They include `Views`, `Functions`, and `Enums` stubs required by `@supabase/supabase-js` generics. If you add a table, add it there too.

**Month key convention:** months are always stored and queried as `YYYY-MM-01`. Use the `monthKey(year, month)` helper from `lib/types.ts`. Dashboard queries filter `date >= monthStart AND date < nextMonthStart`.

**Invite flow:** One user creates a household (gets a random code like `HAWK-4921`), the partner enters the code in Settings to join. No email required.

**Key components:**
- `components/MonthNav.tsx` — prev/next month navigation via `?y=&m=` search params
- `components/BudgetProgress.tsx` — progress bar showing spent vs budget
- `components/ExpenseList.tsx` — per-expense delete (own expenses only, via RLS)
- `components/HouseholdSection.tsx` — create/join household flow
- `components/BudgetSection.tsx` — set/update monthly budget (upsert on `household_id,month`)
