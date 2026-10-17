#!/usr/bin/env node
// Generates logo variations, favicon/app icons and the social sharing image from first principles.
// Fonts are embedded from the bundled files; rendering uses Playwright (Chromium).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(import.meta.dirname, "..");
const b64 = (f) => fs.readFileSync(path.join(ROOT, "src/fonts", f)).toString("base64");
const corm = b64("cormorant-garamond-latin-500-italic.woff2");
const vazir = b64("Vazir-Bold.woff2");
const vazirReg = b64("Vazir.woff2");
const RASP = "#b51f59";

// Arch window with a three-drupelet raspberry cluster and a small leaf.
const symbol = (c, accent = RASP) => `<g fill="none"><path d="M8 36V19C8 11.3 13.3 5 20 5s12 6.3 12 14v17z" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16.4" cy="22" r="3.4" fill="${accent}"/><circle cx="23.6" cy="22" r="3.4" fill="${accent}"/><circle cx="20" cy="28.6" r="3.4" fill="${accent}"/><path d="M20 15.5c1.8-2.2 4.6-2.4 6-.7-1.9 1.9-4.4 2.1-6 .7z" fill="${c}"/></g>`;
const fontCss = `@font-face{font-family:C;src:url(data:font/woff2;base64,${corm}) format('woff2');font-weight:500;font-style:italic}@font-face{font-family:V;src:url(data:font/woff2;base64,${vazir}) format('woff2');font-weight:700}`;

const wordmarkSvg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64" width="300" height="64" role="img" aria-label="Cosmetics — کازمتیکس"><title>Cosmetics — کازمتیکس</title><style>${fontCss}</style><g transform="translate(0 4) scale(1.45)">${symbol(c)}</g><text x="66" y="40" font-family="C,Georgia,serif" font-weight="500" font-style="italic" font-size="42" fill="${c}">Cosmetics</text><text x="68" y="58" font-family="V,Tahoma,sans-serif" font-weight="700" font-size="12" fill="${RASP}">کازمتیکس · آرایشی و مراقبت از پوست</text></svg>`;

fs.mkdirSync(path.join(ROOT, "public/brand"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public/brand/logo-light-bg.svg"), wordmarkSvg("#292129"));
fs.writeFileSync(path.join(ROOT, "public/brand/logo-dark-bg.svg"), wordmarkSvg("#fff5f8"));
fs.writeFileSync(path.join(ROOT, "public/brand/symbol-light-bg.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="160" height="160">${symbol("#292129")}</svg>`);
fs.writeFileSync(path.join(ROOT, "public/brand/symbol-dark-bg.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="160" height="160">${symbol("#fff5f8", "#f4c6d8")}</svg>`);
// App icon: symbol on a raspberry-wine tile (no text, so it needs no font)
fs.writeFileSync(path.join(ROOT, "src/app/icon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#7d123b"/><g transform="translate(4 4)">${symbol("#fff5f8", "#f4c6d8")}</g></svg>`);

const heroPath = path.join(ROOT, "public/media/editorial/hero.webp");
const heroB64 = fs.existsSync(heroPath) ? fs.readFileSync(heroPath).toString("base64") : "";
const browser = await chromium.launch();
const page = await browser.newPage();
const shot = async (html, w, h, out) => {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
};
await shot(`<body style="margin:0;background:#7d123b;display:grid;place-items:center;width:512px;height:512px"><svg viewBox="0 0 40 40" width="340">${symbol("#fff5f8", "#f4c6d8")}</svg></body>`, 512, 512, path.join(ROOT, "public/brand/icon-512.png"));
fs.copyFileSync(path.join(ROOT, "public/brand/icon-512.png"), path.join(ROOT, "src/app/apple-icon.png"));
const og = `<style>${fontCss}@font-face{font-family:VR;src:url(data:font/woff2;base64,${vazirReg}) format('woff2');font-weight:400}body{margin:0;width:1200px;height:630px;background:#fff5f8;display:flex;direction:ltr;overflow:hidden;font-family:V}
.l{flex:1;padding:72px;display:flex;flex-direction:column;justify-content:center;gap:22px;direction:rtl}
h1{margin:0;font-size:54px;line-height:1.4;color:#292129}h1 em{color:#b51f59;font-style:normal}p{margin:0;font-size:26px;font-family:VR;color:#6a5d66;line-height:1.9}
.w{font-family:C;font-style:italic;font-size:48px;color:#292129;direction:ltr;display:flex;align-items:center;gap:14px}.r{width:480px;background:#f8dce7 url(data:image/webp;base64,${heroB64}) center/cover}</style>
<body><div class="r"></div><div class="l"><div class="w"><svg viewBox="0 0 40 40" width="56">${symbol("#292129")}</svg>Cosmetics</div><h1>روتین زیبایی شما،<br><em>ساده و دلنشین</em></h1><p>مراقبت از پوست، آرایش و مراقبت از مو · cosmetics.shomaaa.ir</p></div></body>`;
await shot(og, 1200, 630, path.join(ROOT, "src/app/opengraph-image.png"));
await browser.close();
console.log("brand assets written");
