// Builds catalog/products.json (consumed by the WordPress seeder) from products.mjs.
import fs from "node:fs";
import { products, SKIN } from "./products.mjs";
import categories from "./categories.json" with { type: "json" };

const catName = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

const intro = {
  cleansers: (p) => `${p.name} برای گام اول روتین مراقبت از پوست انتخاب شده است. بافت آن «${p.texture}» است و در استفاده روزانه حس تمیزی و راحتی ایجاد می‌کند.`,
  "moisturizers-serums": (p) => `${p.name} با بافت «${p.texture}» برای مرحله آبرسانی و نرم‌کردن پوست در روتین روزانه طراحی شده است و به‌راحتی با سایر محصولات ست می‌شود.`,
  "special-care": (p) => `${p.name} یکی از مراحل مراقبت ویژه است؛ برای روزهایی که می‌خواهید کمی بیشتر به پوست خود برسید. بافت آن «${p.texture}» است.`,
  makeup: (p) => `${p.name} با بافت «${p.texture}» برای آرایش روزانه و مهمانی انتخاب شده است و به‌سادگی در کیف آرایش شما جا می‌گیرد.`,
  "sun-care": (p) => `${p.name} با بافت «${p.texture}» برای استفاده روزانه در روتین صبح انتخاب شده است.`,
  "hair-care": (p) => `${p.name} با بافت «${p.texture}» در روتین شست‌وشو و مراقبت از مو کاربرد دارد.`,
  "beauty-tools": (p) => `${p.name} ابزاری کاربردی برای آرایش دقیق‌تر و مرتب‌تر است و مناسب استفاده روزانه و سفر است.`,
};
const caution = {
  skincare: "پیش از اولین استفاده، مقدار کمی از محصول را روی ناحیه کوچکی از پوست امتحان کنید. در صورت بروز هرگونه حساسیت، مصرف را قطع کنید.",
  default: "فهرست دقیق ترکیبات، تاریخ تولید و انقضا و هشدارهای مصرف را روی بسته‌بندی محصول بررسی کنید.",
};

const out = products.map((p) => {
  const skin = (p.skin ?? []).map((s) => SKIN[s]);
  const shades = (p.shades ?? []).map((c) => c.name);
  const skincare = ["cleansers", "moisturizers-serums", "special-care", "sun-care"].includes(p.cat);
  const spec = [
    `<li>حجم / تعداد: ${p.volume}</li>`,
    `<li>بافت: ${p.texture}</li>`,
    skin.length ? `<li>مناسب: ${skin.join("، ")}</li>` : "",
    shades.length ? `<li>رنگ‌ها: ${shades.join("، ")}</li>` : "",
    `<li>کد محصول: ${p.sku}</li>`,
  ].join("");
  const long = [
    `<p>${intro[p.cat](p)}</p>`,
    `<h3>مشخصات</h3><ul>${spec}</ul>`,
    `<h3>روش استفاده</h3><p>${p.usage}</p>`,
    `<h3>نکات مصرف</h3><p>${skincare ? caution.skincare + " " : ""}${caution.default}</p>`,
    `<p><em>تصاویر این صفحه تصویرسازی هستند و ممکن است با بسته‌بندی نهایی کالا تفاوت داشته باشند.</em></p>`,
  ].join("\n");
  return {
    id: p.id, sku: p.sku, slug: p.slug, cat: p.cat, name: p.name, price: p.price, salePrice: p.salePrice ?? null,
    short: p.short, long, tags: [...p.tags, ...(p.featured ? ["منتخب"] : [])], skin: p.skin ?? [], skinNames: skin,
    shades: p.shades ?? [], volume: p.volume, texture: p.texture, gallery: p.gallery.length, featured: !!p.featured,
    seoTitle: `${p.name} | خرید آنلاین از کازمتیکس`.slice(0, 70),
    seoDescription: `${p.short} ${catName[p.cat]} با ارسال به سراسر ایران؛ خرید آنلاین از فروشگاه کازمتیکس.`.slice(0, 160),
  };
});
fs.writeFileSync(new URL("./products.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`wrote ${out.length} products`);
