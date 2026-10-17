#!/usr/bin/env node
// Captures real screenshots of the running storefront and builds presentation mockups from them.
//   BASE_URL=https://cosmetics.shomaaa.ir node scripts/capture.mjs
// The cart/checkout screenshots add a product to the cart only (no order is placed).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE = process.env.BASE_URL ?? "http://localhost:3010";
const SHOTS = path.join(ROOT, "artifacts/screenshots");
const MOCK = path.join(ROOT, "artifacts/mockups");
fs.mkdirSync(SHOTS, { recursive: true }); fs.mkdirSync(MOCK, { recursive: true });

const browser = await chromium.launch();
const settle = async (p) => {
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(500);
};
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "fa-IR" });
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "fa-IR" });
const go = async (p, url) => { for (let i = 0; ; i++) { try { await p.goto(BASE + url, { waitUntil: "load", timeout: 45000 }); break; } catch (e) { if (i >= 8) throw e; } } await settle(p); };

const d = await desk.newPage();
await go(d, "/"); await d.screenshot({ path: `${SHOTS}/desktop-home.png`, fullPage: true }); await d.screenshot({ path: `${SHOTS}/desktop-home-fold.png` });
await go(d, "/collections/skincare"); await d.screenshot({ path: `${SHOTS}/skincare-category.png` });
await go(d, "/collections/makeup"); await d.screenshot({ path: `${SHOTS}/makeup-category.png` });
await go(d, "/products/matte-lipstick"); await d.getByRole("radio").nth(1).click(); await d.evaluate(() => window.scrollTo(0, 0)); await d.waitForTimeout(300); await d.screenshot({ path: `${SHOTS}/product-detail.png` });
await d.getByTestId("add-to-cart").click(); await d.getByTestId("cart-drawer").waitFor(); await d.screenshot({ path: `${SHOTS}/cart-drawer.png` });
await go(d, "/products/lightweight-hydrating-serum"); await d.getByTestId("add-to-cart").click(); await d.getByTestId("cart-drawer").waitFor();
await go(d, "/cart"); await d.getByTestId("cart-line").first().waitFor(); await d.screenshot({ path: `${SHOTS}/cart.png` });
await go(d, "/checkout"); await d.getByTestId("place-order").waitFor();
await d.getByTestId("place-order").click(); await d.waitForTimeout(400); // validation states only; nothing is submitted
await d.screenshot({ path: `${SHOTS}/checkout.png` });

const m = await mob.newPage();
await go(m, "/"); await m.screenshot({ path: `${SHOTS}/mobile-home.png` }); await m.screenshot({ path: `${SHOTS}/mobile-home-full.png`, fullPage: true });
await go(m, "/collections/skincare"); await m.screenshot({ path: `${SHOTS}/mobile-collection.png` });
await go(m, "/products/lightweight-hydrating-serum"); await m.screenshot({ path: `${SHOTS}/mobile-product.png` });

// Mockups built from the real screenshots
const b64 = (f) => fs.readFileSync(f).toString("base64");
const vz = fs.readFileSync(path.join(ROOT, "src/fonts/Vazir-Bold.woff2")).toString("base64");
const cg = fs.readFileSync(path.join(ROOT, "src/fonts/cormorant-garamond-latin-500-italic.woff2")).toString("base64");
const css = `@font-face{font-family:V;src:url(data:font/woff2;base64,${vz}) format('woff2');font-weight:700}@font-face{font-family:C;src:url(data:font/woff2;base64,${cg}) format('woff2');font-style:italic}*{box-sizing:border-box}body{margin:0}`;
const dsk = b64(`${SHOTS}/desktop-home-fold.png`), mhome = b64(`${SHOTS}/mobile-home.png`), mprod = b64(`${SHOTS}/mobile-product.png`), pdp = b64(`${SHOTS}/product-detail.png`);
const frame = `${css}.laptop{position:absolute}.lid{background:#1d141c;border-radius:22px 22px 4px 4px;padding:16px 16px 20px;box-shadow:0 40px 80px rgba(125,18,59,.28)}.lid img{width:100%;display:block;border-radius:6px}.base{height:20px;margin:0 -60px;background:linear-gradient(#e6d8de,#b9a6b0);border-radius:0 0 40px 40px}.phone{position:absolute;width:300px;background:#1d141c;border-radius:46px;padding:11px;box-shadow:0 40px 70px rgba(125,18,59,.3)}.phone img{width:100%;display:block;border-radius:36px}`;
const cover = await browser.newPage({ viewport: { width: 1920, height: 1200 } });
await cover.setContent(`<style>${frame}.bg{width:1920px;height:1200px;position:relative;overflow:hidden;background:radial-gradient(120% 100% at 20% 0%,#fff5f8 0%,#f8dce7 60%,#e9a3be 100%);font-family:V;direction:rtl}.cap{position:absolute;right:120px;top:90px;color:#292129}.cap .k{font-family:C;font-style:italic;font-size:64px;color:#7d123b;direction:ltr;text-align:right}.cap h2{font-size:48px;margin:6px 0 0}.cap p{font-size:24px;color:#6a5d66;margin:8px 0 0}.ph1{left:1230px;top:330px;transform:rotate(-4deg)}.ph2{left:1440px;top:410px;transform:rotate(3deg)}</style><div class="bg"><div class="cap"><div class="k">Cosmetics</div><h2>فروشگاه آنلاین آرایشی و مراقبت از پوست</h2><p>cosmetics.shomaaa.ir</p></div><div class="laptop" style="left:140px;top:250px;width:1060px"><div class="lid"><img src="data:image/png;base64,${dsk}"></div><div class="base"></div></div><div class="phone ph1"><img src="data:image/png;base64,${mhome}"></div><div class="phone ph2"><img src="data:image/png;base64,${mprod}"></div></div>`);
await cover.evaluate(() => document.fonts.ready);
await cover.screenshot({ path: `${MOCK}/portfolio-cover.png` });
const dm = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await dm.setContent(`<style>${frame}.bg{width:1600px;height:1000px;position:relative;background:#f8dce7}</style><div class="bg"><div class="laptop" style="left:200px;top:110px;width:1200px"><div class="lid"><img src="data:image/png;base64,${pdp}"></div><div class="base"></div></div></div>`);
await dm.screenshot({ path: `${MOCK}/desktop-mockup.png` });
const mm = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await mm.setContent(`<style>${frame}.bg{width:1400px;height:1000px;position:relative;background:#f8dce7}</style><div class="bg"><div class="phone" style="left:300px;top:90px;width:340px"><img src="data:image/png;base64,${mhome}"></div><div class="phone" style="left:760px;top:130px;width:340px"><img src="data:image/png;base64,${mprod}"></div></div>`);
await mm.screenshot({ path: `${MOCK}/mobile-mockup.png` });
await browser.close();
console.log("captured");
