# Money Tracker

A shared expense tracker for two — built for couples, roommates, or anyone splitting finances together.

One person creates a household, shares the invite code, the other joins. That's it. Now you both see the same dashboard: monthly budget, what's been spent, who spent it, and how much is left.

---

## What it does

- **Shared household** — invite your partner with a random code like `HAWK-4921`. No email lookup, no friction.
- **Monthly budget** — set a spending limit for the month. A progress bar shows how close you're cutting it (and goes red when you're over).
- **Expense log** — add expenses with a description, amount, and date. Each entry is labelled *You* or *Partner*. You can delete your own.
- **Month navigation** — browse any past or future month with prev/next controls.
- **Secure by default** — Row-Level Security on every table. You can only ever read or write data that belongs to your household.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase (Postgres + RLS) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

---

## Running locally

**1. Clone and install**

```bash
git clone <repo-url>
cd money_tracker
npm install
```

**2. Set up Supabase**

Create a project at [supabase.com](https://supabase.com), then run the migration:

```bash
# in the Supabase SQL editor, paste and run:
supabase/migrations/001_initial.sql
```

**3. Configure environment**

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**4. Start the dev server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
  (auth)/          # login, signup — no layout wrapper
  (app)/
    dashboard/     # main view: budget progress + expense list
    expenses/new/  # add expense form
    settings/      # create/join household, set monthly budget
components/
  BudgetProgress   # progress bar, spent vs remaining
  ExpenseList      # expense rows with delete for own entries
  MonthNav         # prev/next month via ?y=&m= search params
  HouseholdSection # create household or join with invite code
  BudgetSection    # set/update monthly budget
lib/
  supabase/        # server + client Supabase helpers
  types.ts         # hand-authored DB types + monthKey() helper
supabase/
  migrations/      # full schema with RLS policies
```

---

## Database schema

```
households        id, name, invite_code
household_members household_id → user_id  (max 2 per household)
budgets           household_id, month (YYYY-MM-01), amount
expenses          household_id, user_id, amount, description, date
```

A `my_household_id()` security-definer function powers all RLS policies — every read and write is automatically scoped to the current user's household.
