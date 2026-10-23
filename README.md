# Pantry Pilot Fresh Keeper

Build "PantryPilot", a food-waste tracking web app (React + TypeScript + Tailwind, Supabase backend).

USER: busy household cook who wants to stop throwing food away.

DESIGN: calm, modern, accessible. Green primary, amber = expiring soon, red = expired. Rounded cards, responsive mobile-first, visible focus states, good contrast. Top nav (bottom tab bar on mobile): Dashboard, Pantry, Planner, Insights, plus a sign-out menu.

AUTH: Google sign-in via Supabase Auth. All pages except /login require login (redirect otherwise).

DATABASE (Supabase, with Row Level Security so users can only access their own rows):

Table pantry_items: id, user_id (default auth.uid()), name (1-60 chars), quantity (0.1-1000), unit (g|kg|ml|l|pcs), category (produce|dairy|meat|grains|pantry|frozen|other), storage (fridge|freezer|shelf), added_at, expires_at, status (active|used|wasted), source (manual|ai).

Table meal_plans: id, user_id, plan jsonb, created_at.

RLS policies: select/insert/update/delete only where user_id = auth.uid(). Add CHECK constraints for enums and ranges.

PANTRY PAGE: add item (modal form with Zod validation and inline errors), list sorted by soonest expiry with badges (fresh / expiring within 3 days / expired), search, category filter, edit, delete with confirm, "Mark used" and "Mark wasted" buttons. If expiry is empty, suggest one from a built-in shelf-life lookup (~30 common items). Loading skeletons, empty states, toasts.

DASHBOARD: stat cards (expiring soon, items in pantry, waste rate = wasted/(used+wasted), kg saved), and a "Use these first" list of the 5 soonest-expiring items.

INSIGHTS PAGE: used vs wasted bar chart, waste by category donut (Recharts), rule-based text summary. Handle empty data and division by zero.

PLANNER PAGE: placeholder "coming next".

SECURITY: no secrets in client code; validate all inputs; no dangerouslySetInnerHTML.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pantry-pilot-fresh-keeper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/859bd601-8c0b-4b59-b157-26d45157ce0d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
