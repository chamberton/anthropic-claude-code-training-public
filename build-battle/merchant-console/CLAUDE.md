# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Northwind Payments — Merchant Console

Internal ops tool for looking up payments, refunding them, working the dispute queue, and issuing virtual cards. All merchants, cardholders, amounts, and card numbers are generated — nothing here resembles real payment data.

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run lint       # ESLint via next lint
npm test           # run all tests once (vitest run)
npm run test:watch # vitest in watch mode

# run a single test file
npx vitest run src/lib/csv.test.ts
```

Tests live beside the source file they cover (`csv.ts` → `csv.test.ts`). Extend those files rather than creating new ones.

## Data and store

No database. Seed data is generated at boot and held on `globalThis` so Next.js module reloads don't reset it. Writes survive for the process lifetime and vanish on restart — that is deliberate.

## Conventions that cause bugs when missed

1. **Money is integer minor units.** `$250.00` is `25000`. Format exactly once, at the render boundary, using `formatMoney()` in `src/lib/money.ts`. Never store or compare a float; never call `toFixed` on a value that will be stored or summed.

2. **One query builder.** All payment filtering goes through `filterPayments` / `sortPayments` / `paginate` in `src/data/queries.ts`. A second filter path is a defect, not a shortcut — including for export routes and new scopes.

3. **Validate on the server.** Column names, statuses, sort fields, currencies — anything arriving from a client is checked against an allowlist in `parseFilters()` or a local allowlist before it reaches the store, a query, or a filename. Client-side checks are a convenience only.

4. **Storage and bucketing are UTC.** Display converts to the merchant's IANA timezone (via `formatDate()` in `src/lib/dates.ts`). Nothing else does timezone conversion.

## Path alias

`@/` resolves to `src/`. All imports use this alias.

## Component rules

`src/components/` has Button, Input, Select, Dialog, Table, Badge, and more — built on Tremor and Radix. Use these before adding a dependency or hand-rolling a control. Tailwind only; no inline `style` attributes. Prettier with `prettier-plugin-tailwindcss` sorts class names — run `npm run lint` to catch order issues.

## Card rules

Generated card numbers use the `4242` test BIN with a valid Luhn check digit. The full PAN is returned exactly once (creation response); after that, last four only. Card status is a state machine: `active ⇄ frozen`, either → `cancelled` (terminal).

## Context layering

Detail that only matters for a specific file type lives in `.claude/rules/` and is loaded by Claude Code when you open that kind of file:

| Rule | Applies to |
| --- | --- |
| `money.md` | `src/lib/`, `src/app/api/`, `src/data/` |
| `api-routes.md` | `src/app/api/` |
| `cards.md` | anything card-related |
| `components.md` | `src/components/`, `src/app/` |

## Release Standards

- All changes require test evidence before merging — `npm test` must pass and any new behaviour must have a test covering it.
- No direct commits to `main`. All work goes through a branch and a pull request.
- Every PR description must include a one-line business impact summary stating what ops or merchants can now do (or what risk is reduced).

## Before pushing

Run `npm test` and verify all tests pass. The export column serializer in `src/lib/csv.ts` has tests in `src/lib/csv.test.ts` that must stay green.
