import { expect, test, type Page } from "@playwright/test";

const consoleErrors = (page: Page) => {
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  return errs;
};

test("homepage loads without console errors, with logo and primary nav", async ({ page }) => {
  const errs = consoleErrors(page);
  await page.goto("/");
  await expect(page.getByRole("link", { name: /Cosmetics/ }).first()).toBeVisible();
  await expect(page.locator("h1")).toContainText("روتین زیبایی شما");
  await expect(page.getByTestId("product-card").first()).toBeVisible();
  expect(errs).toEqual([]);
});

test("document is Persian RTL and uses Vazir", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const family = await page.locator("body").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/vazir/i);
  const loaded = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family); });
  expect(loaded.join(" ")).toMatch(/vazir/i);
});

test("no customer-facing 'demo' wording", async ({ page }) => {
  for (const path of ["/", "/about", "/faq", "/checkout", "/collections/all"]) {
    await page.goto(path);
    const text = await page.locator("body").innerText();
    expect(text, path).not.toMatch(/نمایشی|آزمایشی|دمو|demo/i);
  }
});

test("category navigation, product listing, sort and filters", async ({ page, isMobile }) => {
  await page.goto("/collections/makeup");
  await expect(page.getByRole("heading", { level: 1, name: "آرایش" })).toBeVisible();
  await expect(page.getByTestId("result-count")).toContainText("۵");
  await page.selectOption("#sort", "price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  const first = await page.getByTestId("product-card").first().locator("h3").innerText();
  expect(first).toContain("رژگونه کرمی"); // cheapest makeup item (432,000 sale)
  if (!isMobile) {
    await page.getByRole("checkbox", { name: "فقط کالاهای تخفیف‌دار" }).click();
    await expect(page).toHaveURL(/onsale=1/);
    await expect(page.getByTestId("result-count")).toContainText("۱ محصول");
  }
});

test("skincare parent category includes its three sub-categories (16 products)", async ({ page }) => {
  await page.goto("/collections/skincare");
  await expect(page.getByTestId("result-count")).toContainText("۱۶");
});

test("skin-type filter narrows results", async ({ page }) => {
  await page.goto("/collections/skincare?skin=skin-dry");
  const n = await page.getByTestId("product-card").count();
  expect(n).toBeGreaterThan(0);
  expect(n).toBeLessThan(12);
});

test("empty filter result shows empty state", async ({ page }) => {
  await page.goto("/collections/beauty-tools?min=99000000&max=99999999");
  await expect(page.getByText("محصولی با این فیلترها پیدا نشد")).toBeVisible();
});

test("search returns results and handles no match", async ({ page }) => {
  await page.goto("/search?q=سرم");
  await expect(page.getByTestId("product-card").first()).toBeVisible();
  await page.goto("/search?q=zzzxxyy");
  await expect(page.getByText(/محصولی پیدا نشد/)).toBeVisible();
});

test("variable product (lipstick) requires a shade before add to cart", async ({ page }) => {
  await page.goto("/products/matte-lipstick");
  await expect(page.getByTestId("product-title")).toContainText("رژلب مات");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("variation-error")).toContainText("رنگ");
});

test("selecting a shade adds the right variation", async ({ page }) => {
  await page.goto("/products/matte-lipstick");
  const shades = page.getByRole("radio");
  await expect(shades).toHaveCount(4);
  await shades.first().click();
  await expect(shades.first()).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("product-price")).toContainText("۵۶۰٬۰۰۰");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-line")).toContainText("رنگ");
});

test("add to cart, change quantity, remove, totals stay correct", async ({ page }) => {
  await page.goto("/products/makeup-sponge-set-3"); // simple product, 240,000 toman
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await page.goto("/cart");
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("subtotal")).toContainText("۲۴۰٬۰۰۰");
  await page.getByRole("button", { name: "افزایش تعداد" }).click();
  await expect(page.getByTestId("subtotal")).toContainText("۴۸۰٬۰۰۰");
  await expect(page.getByTestId("total")).toContainText("۵۷۵٬۰۰۰"); // + 95,000 shipping
  await page.getByRole("button", { name: /حذف .* از سبد/ }).click();
  await expect(page.getByText("سبد خرید شما خالی است")).toBeVisible();
});

test("free shipping applies above the threshold", async ({ page }) => {
  await page.goto("/products/eight-piece-makeup-brush-set"); // 890,000
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await page.goto("/cart");
  for (let i = 0; i < 2; i++) await page.getByRole("button", { name: "افزایش تعداد" }).click(); // 3 x 890,000 = 2,670,000
  await expect(page.getByTestId("subtotal")).toContainText("۲٬۶۷۰٬۰۰۰");
  await expect(page.getByTestId("total")).toContainText("۲٬۶۷۰٬۰۰۰");
});

test("cart persists across reload and coupon applies", async ({ page }) => {
  await page.goto("/products/makeup-sponge-set-3");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await page.goto("/cart");
  await page.reload();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await page.getByLabel("کد تخفیف").fill("WELCOME10");
  await page.getByRole("button", { name: "اعمال" }).click();
  await expect(page.getByText("کد تخفیف اعمال شد")).toBeVisible();
  await page.getByLabel("کد تخفیف").fill("NOPE123");
  await page.getByRole("button", { name: "اعمال" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
});

test("quick add from a product card adds a simple product", async ({ page }) => {
  await page.goto("/collections/beauty-tools");
  await page.getByTestId("quick-add").first().click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await expect(page.getByTestId("cart-line")).toHaveCount(1);
});

test("checkout validates the form, then records an order awaiting confirmation (no payment claimed)", async ({ page }) => {
  await page.goto("/products/makeup-sponge-set-3");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-drawer")).toBeVisible();
  await page.goto("/checkout");
  await expect(page.getByText("پرداخت آنلاین هنوز فعال نیست")).toBeVisible();
  await page.getByTestId("place-order").click();
  await expect(page.getByText("نام را وارد کنید")).toBeVisible();
  await expect(page.getByText(/شماره موبایل باید/)).toBeVisible();
  await page.fill('[name="firstName"]', "تست");
  await page.fill('[name="lastName"]', "خودکار");
  await page.fill('[name="phone"]', "۰۹۱۲۰۰۰۰۰۰۰");
  await page.fill('[name="email"]', "e2e@example.test");
  await page.selectOption('[name="state"]', "THR");
  await page.fill('[name="city"]', "تهران");
  await page.fill('[name="address"]', "تهران، خیابان آزمون، پلاک ۱۰");
  await page.fill('[name="postcode"]', "1234567890");
  await page.getByTestId("place-order").click();
  await expect(page.getByTestId("order-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("order-confirmation")).toContainText("پرداختی انجام نشده");
  await expect(page.getByTestId("order-confirmation")).toContainText("در انتظار تأیید");
});

test("checkout with an empty cart shows empty state", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByText("سبد خرید شما خالی است")).toBeVisible();
});

test("API failure on add-to-cart surfaces an error toast", async ({ page }) => {
  await page.route("**/api/cart/add", (r) => r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "سرویس فروشگاه در دسترس نیست" }) }));
  await page.goto("/products/makeup-sponge-set-3");
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByText("سرویس فروشگاه در دسترس نیست")).toBeVisible();
});

test("search dialog degrades gracefully when the API fails", async ({ page }) => {
  await page.route("**/api/search**", (r) => r.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "جست‌وجو" }).locator("visible=true").first().click();
  await page.getByLabel("عبارت جست‌وجو").fill("سرم");
  await expect(page.getByText(/جست‌وجو در حال حاضر ممکن نیست/)).toBeVisible();
});

test("unknown product and route return 404 pages", async ({ page }) => {
  const r1 = await page.goto("/products/does-not-exist");
  expect(r1?.status()).toBe(404);
  await expect(page.getByTestId("not-found")).toBeVisible();
  const r2 = await page.goto("/nope");
  expect(r2?.status()).toBe(404);
});

test("product images all load (no broken images on a collection)", async ({ page }) => {
  await page.goto("/collections/all");
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await page.waitForLoadState("networkidle");
  const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.src));
  expect(broken).toEqual([]);
});

test("SEO: canonical, title, product structured data, sitemap, robots", async ({ page, request }) => {
  await page.goto("/products/lightweight-hydrating-serum");
  await expect(page).toHaveTitle(/سرم آبرسان سبک/);
  expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toMatch(/^https?:\/\/[^/]+\/products\/lightweight-hydrating-serum$/); // host comes from NEXT_PUBLIC_SITE_URL (https://cosmetics.shomaaa.ir in production)
  const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts();
  const parsed = ld.map((t) => JSON.parse(t));
  const product = parsed.find((j) => j["@type"] === "Product");
  expect(product.offers.priceCurrency).toBe("IRR");
  expect(product.sku).toBe("COS-MS-008");
  expect(product.aggregateRating).toBeUndefined(); // no fabricated ratings
  expect(parsed.some((j) => j["@type"] === "BreadcrumbList")).toBe(true);
  const sm = await request.get("/sitemap.xml");
  expect(sm.status()).toBe(200);
  expect((await sm.text()).match(/\/products\//g)?.length).toBe(30);
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap");
});

test("support details and attribution are present", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByTestId("support-phone")).toHaveText("09040153212");
  await expect(page.getByTestId("support-email")).toHaveText("info@tafakorpardazan.ir");
  const a = page.getByRole("link", { name: "طراحی و توسعه توسط تفکر پردازان" });
  await expect(a).toHaveAttribute("href", "https://tafakorpardazan.ir");
});

test("health endpoint and backend connectivity", async ({ request }) => {
  expect((await request.get("/api/health")).status()).toBe(200);
  const deep = await request.get("/api/health?deep=1");
  expect(deep.status()).toBe(200);
});

test("newsletter validates email", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("ایمیل").first().fill("not-an-email");
  await page.getByRole("button", { name: "عضویت" }).first().click();
  await expect(page.getByRole("alert").first()).toContainText("ایمیل معتبر");
});
