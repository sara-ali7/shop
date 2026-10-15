# Modern E-Commerce Web Application

Capstone project: a responsive storefront and admin dashboard built on the public
[EscuelaJS API](https://api.escuelajs.co/docs).

**Live demo:** _add your deployment URL here_ · **Repository:** _add your GitHub URL here_

## Technologies

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui-style components
(Radix Dialog/Slot, class-variance-authority) · next-themes · lucide-react · EscuelaJS API

## Features

**Storefront**
- Home page with API categories and featured products
- `/products`: search by name, filter by category and price range, six sort options, "show more" paging
- `/products/[id]`: gallery, quantity selector, add to cart, related products, helpful not-found page
- `/categories` and `/categories/[slug]`: all data from the API, nothing hardcoded
- Cart persisted in `localStorage`; duplicate adds increase quantity; totals; clear cart
- Guest checkout redirect to `/login` with the required message; cart survives login/register
- Register (validation + email availability check) and login (invalid credentials, duplicate-submit guard)
- Profile (from `GET /auth/profile`) with logout
- Simulated checkout, then `/checkout/success`. **No payment or order is ever created**
- Light / dark / system themes, mobile-first layout, skip link, labelled forms, dynamic metadata

**Admin (`/admin`)**
- Overview with real counts (or an explicit "Unavailable" state) and recent products
- Products: searchable table, details, create, edit
- Categories: list, create, edit
- Users: searchable read-only list and details (passwords/tokens never displayed)
- Sidebar on desktop, drawer on mobile/tablet; Back to Store and Logout

## Getting started

```bash
npm install
cp .env.example .env.local      # then edit if needed
npm run dev                     # http://localhost:3000
npm run build && npm start      # production check
npm run typecheck
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API base URL (default `https://api.escuelajs.co/api/v1`) |
| `NEXT_PUBLIC_DEV_ADMIN_EMAILS` | Optional, **dev only** (see Admin authorization) |

Deploy to Vercel by importing the repo and setting `NEXT_PUBLIC_API_URL`.

## Project structure

```
src/
  app/                  Routes only (thin pages that compose components)
    (store)/            Storefront routes sharing header + footer
    admin/              Admin routes (layout = guard + shell)
  components/
    ui/                 shadcn-style primitives (button, input, card, sheet, ...)
    layout/ shared/     Header, footer, theme toggle, state views, form field
    product/ category/ cart/ checkout/ auth/ admin/
  lib/api/              Centralized API layer (client, cache, normalizers, services)
  lib/                  validators, routes, storage helpers, admin access
  providers/            Auth, cart and theme providers
  hooks/use-async.ts    Loading / error / retry hook
  types/                Types that mirror the real API responses
```

Server Components fetch data where SEO matters (home, categories, product and category
detail pages, `generateMetadata`). Client Components handle interaction (filters, cart,
forms, admin).

## API integration

All network access goes through `src/lib/api/client.ts`. Components never call `fetch`.

| Area | Endpoints used |
| --- | --- |
| Products | `GET /products` (paged), `GET /products/{id}`, `GET /products/slug/{slug}`, `GET /products/{id}/related`, `POST /products`, `PUT /products/{id}` |
| Categories | `GET /categories`, `GET /categories/{id}`, `GET /categories/slug/{slug}`, `GET /categories/{id}/products`, `POST /categories`, `PUT /categories/{id}` |
| Users / auth | `POST /users`, `POST /users/is-available`, `POST /auth/login`, `GET /auth/profile`, `POST /auth/refresh-token`, `GET /users`, `GET /users/{id}` |

Behaviour worth knowing:
- **Normalizers** validate every record. Malformed products are skipped, never replaced with mock data.
- **Images**: the API sometimes returns `["https://..."]` as a string; `cleanImage` repairs it and
  `SafeImage` shows a placeholder if the URL is broken.
- **Passwords**: the API returns a `password` field on users. `parseUser` drops it, so it never
  reaches components or the UI.
- **Token refresh**: on a 401 the client calls `/auth/refresh-token` once (single-flight), retries,
  and otherwise logs the user out and shows "session expired".
- **Caching**: product and category lists are cached in memory for 1 and 5 minutes; writes invalidate.
- **Errors**: network failures, 4xx/5xx, empty lists, and missing records all have visible states
  with retry actions where useful.
- The API is not verified against live responses in this repo's CI. **Confirm request bodies in the
  official docs before your demo** (especially `POST /users` and `PUT` bodies).

## Authentication and route protection

- Tokens are stored in `localStorage` (`src/lib/auth-storage.ts`). This is readable by any script on
  the page, so it is weaker than an httpOnly cookie session. The API offers no cookie option.
- `/checkout`, `/checkout/success` and `/profile` use the `<RequireAuth>` guard. Guests are redirected to
  `/login?next=...` and see: "Please log in or create an account to continue to checkout."
- Next.js middleware cannot read `localStorage`, so protection is client-side. **A user can bypass client-side
  guards; real protection must be enforced by a backend.**
- Redirect targets are validated (`safeNextPath`) to prevent open redirects.

## Admin authorization (limitations)

The EscuelaJS API exposes a `role` field, but this project cannot verify that the API enforces it on
write endpoints, and the dashboard calls the API straight from the browser. Therefore:

1. The dashboard opens for accounts whose profile `role` is `"admin"` (UI gate only).
2. For development, emails in `NEXT_PUBLIC_DEV_ADMIN_EMAILS` also pass. This value is public in the
   browser bundle. An on-screen banner says so.
3. Neither mechanism is production security. Hiding a link or checking a client-side flag does not
   protect data.

**Shared API safety:** there is no delete in the UI. Editing a product/category that was not created from
your browser requires ticking a confirmation box (`src/lib/owned-records.ts`). Test writes with records you create.

**Known API limitations:** `GET /users` may be restricted; the admin users pages show an explicit
unavailable state instead of fabricating data.

## Manual testing checklist

- [ ] Home loads categories and products  · [ ] Search / category / price / sort all change results
- [ ] Product page with a bad id shows "Product not found"
- [ ] Add twice = one row with quantity 2; refresh keeps the cart
- [ ] Guest clicks Checkout, lands on `/login` with the message, logs in, returns to `/checkout`
- [ ] Typing `/checkout` or `/profile` as a guest redirects to `/login`
- [ ] Register rejects a taken email; login shows an error for a wrong password
- [ ] Checkout validation, success page, cart cleared, no payment claims
- [ ] Admin: counts load, create a test product, edit it, create a test category
- [ ] Theme toggle works on storefront, auth pages and admin; no horizontal scroll at 360 px
