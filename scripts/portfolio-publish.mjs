#!/usr/bin/env node
/**
 * Registers Cosmetics as linked Persian + English "tp_project" entries (نمونه کار / Projects) on tafakorpardazan.ir through the WordPress REST API.
 * Credentials come from the environment (never committed):
 *   PORTFOLIO_USER=… PORTFOLIO_APP_PASSWORD="xxxx xxxx …" node scripts/portfolio-publish.mjs [--publish]
 * Idempotent: media are reused by slug, projects are updated by slug. Default status is `draft`; `--publish` publishes both languages.
 * Language linking uses the site's own POST /tp/v1/translations endpoint ({kind:"post", translations:{fa:ID,en:ID}}).
 */
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = process.env.PORTFOLIO_SITE ?? "https://tafakorpardazan.ir";
const AUTH = "Basic " + Buffer.from(`${process.env.PORTFOLIO_USER}:${process.env.PORTFOLIO_APP_PASSWORD}`).toString("base64");
const STATUS = process.argv.includes("--publish") ? "publish" : "draft";
if (!process.env.PORTFOLIO_USER || !process.env.PORTFOLIO_APP_PASSWORD) { console.error("PORTFOLIO_USER / PORTFOLIO_APP_PASSWORD required"); process.exit(1); }

async function api(p, init = {}, tries = 4) {
  let last;
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(`${SITE}/wp-json${p}`, { ...init, headers: { Authorization: AUTH, ...(init.headers ?? {}) }, signal: AbortSignal.timeout(120_000) });
      const text = await r.text();
      const json = text ? JSON.parse(text.slice(text.indexOf(text.trimStart()[0] === "[" ? "[" : "{"))) : null;
      if (!r.ok) throw Object.assign(new Error(`${r.status} ${json?.message ?? ""}`), { status: r.status });
      return json;
    } catch (e) { last = e; if (e.status && e.status < 500) break; await new Promise((r) => setTimeout(r, 2000 * i)); }
  }
  throw last;
}

const images = [
  { src: "artifacts/mockups/portfolio-cover.png", name: "cosmetics-live-cover", alt: { fa: "ماکاپ فروشگاه کازمتیکس روی لپ‌تاپ و موبایل", en: "Cosmetics storefront mockup on laptop and phones" }, w: 1600 },
  { src: "artifacts/screenshots/desktop-home-fold.png", name: "cosmetics-live-home", alt: { fa: "صفحه اصلی فروشگاه کازمتیکس در نسخه دسکتاپ", en: "Cosmetics homepage on desktop" }, w: 1440 },
  { src: "artifacts/screenshots/skincare-category.png", name: "cosmetics-live-skincare", alt: { fa: "دسته مراقبت از پوست با فیلتر نوع پوست و مرتب‌سازی", en: "Skincare category with skin-type filter and sorting" }, w: 1440 },
  { src: "artifacts/screenshots/makeup-category.png", name: "cosmetics-live-makeup", alt: { fa: "دسته آرایش", en: "Makeup category" }, w: 1440 },
  { src: "artifacts/screenshots/product-detail.png", name: "cosmetics-live-product", alt: { fa: "صفحه محصول با انتخاب رنگ", en: "Product page with shade selection" }, w: 1440 },
  { src: "artifacts/screenshots/cart.png", name: "cosmetics-live-cart", alt: { fa: "صفحه سبد خرید", en: "Shopping cart page" }, w: 1440 },
  { src: "artifacts/mockups/mobile-mockup.png", name: "cosmetics-live-mobile", alt: { fa: "نسخه موبایل: صفحه اصلی و صفحه محصول", en: "Mobile: homepage and product page" }, w: 1400 },
];

async function uploadImage(img) {
  const found = await api(`/wp/v2/media?search=${img.name}&per_page=20&_fields=id,source_url,slug`);
  const hit = found.find((m) => m.slug === img.name);
  if (hit) return hit;
  const buf = await sharp(path.join(ROOT, img.src)).resize({ width: img.w, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
  const media = await api("/wp/v2/media", { method: "POST", headers: { "Content-Type": "image/webp", "Content-Disposition": `attachment; filename="${img.name}.webp"` }, body: buf });
  await api(`/wp/v2/media/${media.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt_text: img.alt.fa, title: img.alt.fa }) });
  return { id: media.id, source_url: media.source_url };
}

const post = (p, o) => api(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(o) });

// ---- technology terms (per language; term translations are linked through the site's own endpoint)
const TECH = [
  { fa: ["Next.js", 218], en: ["Next.js", 295] }, { fa: ["React", 202], en: ["React", 249] }, { fa: ["TypeScript", 204], en: ["TypeScript", 257] },
  { fa: ["Tailwind CSS", 214], en: ["Tailwind CSS", 289] }, { fa: ["Docker", 210], en: ["Docker", 255] }, { fa: ["Kubernetes", 208], en: ["Kubernetes", 245] },
  { fa: ["WooCommerce"], en: ["WooCommerce"] }, { fa: ["WordPress"], en: ["WordPress"] }, { fa: ["MySQL"], en: ["MySQL"] }, { fa: ["Playwright"], en: ["Playwright"] },
];
async function ensureTerm(lang, name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + (lang === "en" ? "-en" : "");
  const found = await api(`/wp/v2/tp_technology?slug=${slug}&_fields=id,slug`);
  if (found.length) return found[0].id;
  return (await post(`/wp/v2/tp_technology?lang=${lang}`, { name, slug })).id;
}
const techIds = { fa: [], en: [] };
for (const t of TECH) {
  const fa = t.fa[1] ?? (await ensureTerm("fa", t.fa[0]));
  const en = t.en[1] ?? (await ensureTerm("en", t.en[0]));
  techIds.fa.push(fa); techIds.en.push(en);
  if (!t.fa[1]) await post("/tp/v1/translations", { kind: "term", translations: { fa, en } }).catch((e) => console.warn("term link", t.fa[0], e.message));
}

const media = {};
for (const img of images) { media[img.name] = await uploadImage(img); console.log("media", img.name, media[img.name].id); }
const M = (n) => media[n];
const byName = Object.fromEntries(images.map((i) => [i.name, i]));
const fig = (n, lang) => `<figure style="margin:0"><img src="${M(n).source_url}" alt="${byName[n].alt[lang]}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:18px;border:1px solid rgba(246,250,248,.12);box-shadow:0 18px 40px -18px rgba(0,0,0,.7)"/></figure>`;
const btn = (label) => `<!-- wp:html -->
<p style="margin-block:24px"><a href="https://cosmetics.shomaaa.ir" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;border-radius:999px;background:#b51f59;color:#fff;font-weight:700;text-decoration:none">${label}</a></p>
<!-- /wp:html -->`;
const h = (t) => `<!-- wp:heading -->\n<h2>${t}</h2>\n<!-- /wp:heading -->`;
const p = (t) => `<!-- wp:paragraph -->\n<p>${t}</p>\n<!-- /wp:paragraph -->`;
const ul = (items) => `<!-- wp:list -->\n<ul class="wp-block-list">${items.map((i) => `<li>${i}</li>`).join("")}</ul>\n<!-- /wp:list -->`;
const shots = (names, lang) => `<!-- wp:html -->\n<div class="tp-shots" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-block:24px">${names.map((n) => fig(n, lang)).join("")}</div>\n<!-- /wp:html -->`;

const LIVE = "https://cosmetics.shomaaa.ir";
const CONTENT = {
  fa: [
    btn("مشاهده فروشگاه زنده: cosmetics.shomaaa.ir"),
    p("کازمتیکس (Cosmetics) یک فروشگاه آنلاین فارسی و راست‌چین برای محصولات مراقبت از پوست، آرایش، ضدآفتاب، مراقبت از مو و ابزار زیبایی است. تمرکز پروژه بر هویت بصری رزبری، دسته‌بندی بر اساس گام‌های روتین، و تجربه خریدی روان روی موبایل، تبلت و دسکتاپ بود."),
    p("<strong>طراحی و توسعه: تفکر پردازان</strong>"),
    shots(["cosmetics-live-cover"], "fa"),
    h("اهداف پروژه"),
    ul(["ساخت فروشگاهی با هویت مستقل و متمایز از سایر پروژه‌ها، با پالت رزبری و ترکیب‌بندی ویرایشی", "کشف محصول بر اساس روتین (پاک‌سازی، آبرسانی، مراقبت ویژه، ضدآفتاب) و نوع پوست", "مدیریت محصول، موجودی، تخفیف و سفارش در ووکامرس", "تجربه کاملاً فارسی و راست‌چین با فونت وزیر و قیمت‌های درست به تومان", "مصرف کم منابع سرور و تحویل سریع"]),
    h("هویت بصری و طراحی"),
    p("نشان برند یک قاب «طاق» با خوشه‌ای از سه دانه تمشک و یک برگ است؛ نوشتار لاتین Cosmetics با فونت سریف ایتالیک و متن فارسی با وزیر. پالت بر پایه رزبری (#B51F59)، رزبری عمیق، صورتی ملایم و سفید گرم ساخته شد و برای خوانایی کنتراست آن بررسی شد. موتیف طاق در تصاویر قهرمان، دسته‌ها و عناصر صفحه تکرار می‌شود."),
    p("سیستم طراحی با الهام از نظم Adobe Spectrum ساخته شد: شبکه ۴ پیکسلی، مقیاس تایپوگرافی، توکن‌های رنگ و حالت‌های تعامل و حلقه فوکوس واضح. بسته Spectrum نصب نشده و ظاهر، کاملاً اختصاصی کازمتیکس است."),
    h("تجربه کاربری و طراحی واکنش‌گرا"),
    ul(["هدر فشرده با لوگوی مرکزی، نوار دسته‌بندی و منوی موبایل با چیپ‌های قابل اسکرول", "صفحه اصلی با قهرمان قاب‌دار، مسیر روتین پنج‌گامی، منتخب‌ها، کمپین، مجموعه‌های گزینش‌شده و تازه‌ها", "صفحه دسته با فیلتر قیمت، نوع پوست و رنگ، مرتب‌سازی و صفحه‌بندی", "صفحه محصول با گالری، انتخاب رنگ (برای رژلب، کوشن و رژگونه)، موجودی و محصولات مرتبط", "بدون اسکرول افقی از ۳۲۰ تا ۱۹۲۰ پیکسل (با تست خودکار)"]),
    shots(["cosmetics-live-home", "cosmetics-live-skincare", "cosmetics-live-makeup", "cosmetics-live-product", "cosmetics-live-cart"], "fa"),
    shots(["cosmetics-live-mobile"], "fa"),
    h("قابلیت‌های فروشگاهی"),
    ul(["۳۰ محصول با نام، توضیحات کوتاه و کامل فارسی، دسته و برچسب، SKU، موجودی، ویژگی‌ها و عنوان/توضیح سئو؛ ایمپورت ایدمپوتنت (اجرای دوباره، محصول تکراری نمی‌سازد)", "محصولات متغیر واقعی برای رنگ‌ها با موجودی هر رنگ", "جست‌وجو، فیلتر، مرتب‌سازی، سبد خرید پایدار، تغییر تعداد، حذف و کد تخفیف با محاسبه سمت سرور", "ارسال رایگان خودکار بالای ۲٫۵ میلیون تومان", "تسویه حساب مهمان با اعتبارسنجی نشانی و موبایل ایران"]),
    h("معماری فنی"),
    p("ویترین با Next.js (App Router)، React و TypeScript سخت‌گیر ساخته شده و فقط از سمت سرور از Store API عمومی ووکامرس استفاده می‌کند؛ هیچ کلید محرمانه‌ای در مرورگر یا مخزن نیست. بک‌اند WordPress + WooCommerce + MySQL با پایگاه داده و اطلاعات کاملاً جدا اجرا می‌شود. استقرار دستی روی Kubernetes (k3s) پشت Traefik با گواهی Let’s Encrypt، با محدودیت منابع پایین و بدون CI/CD انجام شده است."),
    h("تصاویر محصول با هوش مصنوعی"),
    p("تصاویر با Nano Banana 2.1 و Qwen Image 3 از طریق OpenRouter و با اسکریپتی قابل‌ازسرگیری و دارای سقف هزینه تولید و به WebP بهینه شدند (۴۱ تصویر، حدود ۱٫۴ دلار). این تصاویر تصویرسازی‌اند و در فروشگاه نیز به‌عنوان تصویرسازی معرفی شده‌اند."),
    h("عملکرد، سئو و امنیت"),
    ul(["Lighthouse موبایل (شبیه‌سازی شبکه کند، نسخه تولیدی): عملکرد ۸۸ تا ۹۴، دسترس‌پذیری ۱۰۰، بهترین‌روش‌ها ۱۰۰، سئو ۱۰۰؛ CLS برابر صفر", "سئو: عنوان و توضیحات فارسی، canonical، نقشه سایت، robots، داده ساختاریافته محصول و breadcrumb؛ بدون امتیاز و نظر ساختگی", "امنیت: اعتبارسنجی ورودی، محدودیت نرخ، هدرهای امنیتی، سیاست‌های شبکه پیش‌فرض‌بسته و عدم دسترسی عمومی به پنل مدیریت", "۶۵ تست خودکار Playwright روی دسکتاپ و موبایل"]),
    h("وضعیت پروژه"),
    p("فروشگاه روی <a href=\"" + LIVE + "\" target=\"_blank\" rel=\"noopener\">cosmetics.shomaaa.ir</a> با HTTPS در دسترس است. درگاه پرداخت آنلاین هنوز متصل نشده است؛ ثبت سفارش در وضعیت «در انتظار تأیید» ذخیره می‌شود و پشتیبانی پرداخت را هماهنگ می‌کند و فروشگاه چنین چیزی را به‌روشنی به مشتری اعلام می‌کند. ورود مشتری و تاریخچه سفارش در این نسخه وجود ندارد."),
    h("مشخصات پروژه"),
    ul(["حوزه: فروشگاه اینترنتی آرایشی و بهداشتی", "بازار هدف: ایران · زبان: فارسی · طراحی: واکنش‌گرا و راست‌چین", "وب‌سایت: <a href=\"" + LIVE + "\" target=\"_blank\" rel=\"noopener\">" + LIVE + "</a>", "طراحی و توسعه: تفکر پردازان"]),
    btn("مشاهده فروشگاه زنده"),
  ].join("\n\n"),
  en: [
    btn("Visit the live store: cosmetics.shomaaa.ir"),
    p("Cosmetics is a Persian, right-to-left online store for skincare, makeup, sun care, hair care and beauty tools. The project centres on a raspberry visual identity, product discovery organised around daily routine steps, and a smooth shopping flow on mobile, tablet and desktop."),
    p("<strong>Designed and developed by Tafakor Pardazan</strong>"),
    shots(["cosmetics-live-cover"], "en"),
    h("Objectives"),
    ul(["A store with its own distinct identity: a raspberry palette and an editorial composition", "Product discovery by routine step (cleanse, hydrate, special care, sun protection) and by skin type", "Product, stock, discount and order management in WooCommerce", "A fully Persian, right-to-left experience with Vazir and correct toman prices", "A small server footprint and fast delivery"]),
    h("Visual identity and design"),
    p("The mark is an arch window holding a cluster of three raspberry drupelets and a leaf, set with an italic serif Cosmetics wordmark and Vazir for Persian. The palette is built on raspberry (#B51F59), deep raspberry, soft pink and warm white, checked for contrast. An arch motif recurs in hero imagery, category tiles and page elements."),
    p("The design system borrows the discipline of Adobe Spectrum: a 4px grid, a type scale, colour and interaction-state tokens and a clear focus ring. Spectrum itself is not installed and the look is entirely Cosmetics’ own."),
    h("UI/UX and responsive design"),
    ul(["A compact header with a centred logo, a category bar and a mobile menu with scrollable chips", "A homepage with an arch hero, a five-step routine path, picks, a campaign, curated collections and new arrivals", "Category pages with price, skin-type and shade filters, sorting and pagination", "Product pages with a gallery, shade selection (lipstick, cushion, blush), stock status and related products", "No horizontal overflow from 320px to 1920px (automated tests)"]),
    shots(["cosmetics-live-home", "cosmetics-live-skincare", "cosmetics-live-makeup", "cosmetics-live-product", "cosmetics-live-cart"], "en"),
    shots(["cosmetics-live-mobile"], "en"),
    h("E-commerce functionality"),
    ul(["30 products with Persian names and copy, categories, tags, SKUs, stock, attributes and SEO fields, imported idempotently (re-running never duplicates)", "Real variable products for shades with per-shade stock", "Search, filtering, sorting, a persistent cart, quantity changes, removal and discount codes with server-side totals", "Automatic free shipping above 2.5 million toman", "Guest checkout with Iranian address and mobile validation"]),
    h("Technical architecture"),
    p("The storefront uses Next.js (App Router), React and strict TypeScript and talks to WooCommerce only from the server through the public Store API, so no secret key exists in the browser or the repository. The back end is WordPress + WooCommerce + MySQL with its own database and credentials. It is deployed manually on Kubernetes (k3s) behind Traefik with Let’s Encrypt certificates, with low resource limits and no CI/CD."),
    h("AI product photography"),
    p("Images were generated with Nano Banana 2.1 and Qwen Image 3 through OpenRouter using a resumable, cost-capped script, then optimised to WebP (41 images, about US$1.4). They are illustrations and are labelled as such in the store."),
    h("Performance, SEO and security"),
    ul(["Lighthouse mobile (simulated slow network, production build): performance 88–94, accessibility 100, best practices 100, SEO 100; CLS 0", "SEO: Persian titles and descriptions, canonical URLs, sitemap, robots, product and breadcrumb structured data; no fabricated ratings or reviews", "Security: input validation, rate limiting, security headers, default-deny network policies and no public admin panel", "65 automated Playwright tests on desktop and mobile"]),
    h("Project status"),
    p("The store is live at <a href=\"" + LIVE + "\" target=\"_blank\" rel=\"noopener\">cosmetics.shomaaa.ir</a> over HTTPS. No online payment gateway is connected yet: checkout records an order as awaiting confirmation, support arranges payment, and the store tells customers so plainly. Customer login and order history are not part of this release."),
    h("Project details"),
    ul(["Industry: Beauty and e-commerce", "Target market: Iran · Storefront language: Persian · Design: responsive, right-to-left", "Website: <a href=\"" + LIVE + "\" target=\"_blank\" rel=\"noopener\">" + LIVE + "</a>", "Designed and developed by Tafakor Pardazan — <a href=\"https://tafakorpardazan.ir/en/home/\">tafakorpardazan.ir</a>"]),
    btn("Visit the live store"),
  ].join("\n\n"),
};

const META = {
  fa: { title: "کازمتیکس (Cosmetics)؛ فروشگاه آنلاین آرایشی و مراقبت از پوست", slug: "cosmetics", cat: [190], excerpt: "فروشگاه آنلاین مراقبت از پوست، آرایش و مراقبت از مو با هویت رزبری، دسته‌بندی بر اساس روتین، رابط فارسی و راست‌چین و تجربه خرید واکنش‌گرا." },
  en: { title: "Cosmetics — Skincare and Beauty E-commerce Store", slug: "cosmetics-beauty-ecommerce", cat: [228], excerpt: "An online store for skincare, makeup and hair care with a raspberry identity, routine-based discovery, a right-to-left Persian interface and a responsive shopping flow." },
};

const ids = {};
for (const lang of ["fa", "en"]) {
  const m = META[lang];
  const body = { title: m.title, slug: m.slug, status: STATUS, excerpt: m.excerpt, content: CONTENT[lang], featured_media: M("cosmetics-live-home").id, tp_project_category: m.cat, tp_technology: techIds[lang] };
  const existing = await api(`/wp/v2/tp_project?slug=${m.slug}&status=any&context=edit&_fields=id`);
  const res = existing.length ? await post(`/wp/v2/tp_project/${existing[0].id}`, body) : await post(`/wp/v2/tp_project?lang=${lang}`, body); // Polylang takes the language of NEW posts from ?lang=
  ids[lang] = res.id;
  const full = await api(`/wp/v2/tp_project/${res.id}?context=edit&_fields=id,status,permalink_template`);
  console.log(lang, JSON.stringify(full));
}
await post("/tp/v1/translations", { kind: "post", translations: ids });
for (const lang of ["fa", "en"]) console.log("final", lang, JSON.stringify(await api(`/wp/v2/tp_project/${ids[lang]}?context=edit&_fields=id,status,link,permalink_template`)));
