# Cosmetics — فروشگاه آنلاین آرایشی و مراقبت از پوست (cosmetics.shomaaa.ir)

Persian RTL, headless **WooCommerce** storefront built with Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS 4.
Design and development by [Tafakor Pardazan](https://tafakorpardazan.ir). Derived from the architecture of the SHOMAAA storefront but a separate codebase, backend, database and deployment.

## Architecture
```
Browser ─▶ Next.js (server components, route handlers) ──server-side only──▶ WooCommerce Store API (WordPress + MySQL)
```
- **Storefront** `src/`: server components for catalog pages; small client islands (cart, filters, product options, quick-add, dialogs). Zustand only for cart/toast state.
- **Backend** `wp/`: WordPress + WooCommerce image with a mu-plugin (`cosmetics-headless.php`: health endpoint, SEO/volume/texture fields in the Store API, single free-shipping rate, on-hold order status). Only the public **Store API** is used; no WooCommerce consumer key exists in the app. The Cart-Token lives in an httpOnly cookie managed by Next route handlers.
- **Catalog** `catalog/`: single source of truth for the 30 products; `wp/seed/*.php` seeds WooCommerce idempotently (matched by SKU).
- **Images** `scripts/generate-images.mjs` (OpenRouter, resumable, cost-capped): `google/gemini-nano-banana-2.1` (26 images) and, after the key's balance threshold blocked it, `qwen/qwen-image-3` (15 images). Raw originals stay out of Git (`assets-src/`); optimized WebP is in `public/media`.
- **Design**: raspberry palette tokens in `src/app/globals.css`, arch-shaped imagery motif, Spectrum-inspired spacing/focus/state discipline (not an Adobe product, no Spectrum package).
- **Fonts**: Vazir v16.1.0 bundled in `src/fonts` via `next/font/local`; Cormorant Garamond italic for the Latin wordmark.

## Develop
```bash
cp .env.example .env.local
wp/fetch-deps.sh && wp/prepare-seed.sh
docker compose up -d --build
docker compose exec -T wordpress /opt/cosmetics/bootstrap.sh   # idempotent: 30 products
npm install && npm run dev -- -p 3010
```
Scripts: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npx playwright test` (needs the local backend and a running build on :3010).

## Payments (important)
No payment gateway is installed. Checkout records a WooCommerce order in **on-hold** status through the `cod` method, titled «ثبت سفارش و هماهنگی پرداخت با پشتیبانی»; the UI states that no payment has been taken and support will arrange it. To go live with online payment: install a maintained Iranian gateway plugin with the merchant's credentials and update the checkout copy.

## Deployment
Manual, no CI/CD: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (k3s namespace `cosmetics`, Traefik + Let's Encrypt, node-local images).

## Support & attribution
Support: 09040153212 · info@tafakorpardazan.ir — طراحی و توسعه توسط [تفکر پردازان](https://tafakorpardazan.ir)
