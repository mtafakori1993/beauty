import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, HeartHandshake, PackageCheck, RefreshCcw, Truck } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/config";
import { formatNumber, formatToman } from "@/lib/format";
import { listProducts } from "@/lib/woo/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | فروشگاه آنلاین مراقبت از پوست، آرایش و مراقبت از مو` },
  alternates: { canonical: "/" },
};

const categories = [
  { href: "/collections/skincare", title: "مراقبت از پوست", img: "/media/products/lightweight-hydrating-serum/main.webp" },
  { href: "/collections/makeup", title: "آرایش", img: "/media/products/matte-lipstick/main.webp" },
  { href: "/collections/sun-care", title: "ضدآفتاب", img: "/media/products/light-daily-sunscreen-cream/main.webp" },
  { href: "/collections/hair-care", title: "مراقبت از مو", img: "/media/products/nourishing-hair-oil/main.webp" },
  { href: "/collections/beauty-tools", title: "ابزار زیبایی", img: "/media/products/eight-piece-makeup-brush-set/main.webp" },
];

const routine = [
  { n: "۱", t: "پاک‌سازی", d: "ژل، فوم و میسلار", href: "/collections/cleansers" },
  { n: "۲", t: "تونر و سرم", d: "آبرسانی سبک", href: "/collections/moisturizers-serums" },
  { n: "۳", t: "مرطوب‌کننده", d: "نرمی و راحتی پوست", href: "/collections/moisturizers-serums" },
  { n: "۴", t: "مراقبت ویژه", d: "ماسک، دور چشم، لب", href: "/collections/special-care" },
  { n: "۵", t: "ضدآفتاب", d: "گام پایانی صبح", href: "/collections/sun-care" },
];

const collections = [
  { href: "/collections/skincare", title: "روتین مراقبت از پوست", sub: "از پاک‌سازی تا مرطوب‌کننده", img: "/media/editorial/col-skin.webp", alt: "چیدمان محصولات مراقبت از پوست روی سنگ مرمر صورتی؛ تصویرسازی" },
  { href: "/collections/makeup", title: "آرایش روزانه و مهمانی", sub: "رژلب، کوشن، رژگونه و سایه", img: "/media/editorial/col-makeup.webp", alt: "مجموعه لوازم آرایش روی پارچه مخمل تمشکی؛ تصویرسازی" },
  { href: "/collections/hair-care", title: "مراقبت از مو", sub: "شامپو، نرم‌کننده و روغن مو", img: "/media/editorial/col-hair.webp", alt: "محصولات مراقبت از مو و برس چوبی روی سطح صورتی؛ تصویرسازی" },
];

const trust = [
  { icon: Truck, t: "ارسال به سراسر ایران", d: `ارسال رایگان برای خرید بالای ${formatToman(SITE.freeShippingThreshold)}` },
  { icon: HeartHandshake, t: "پشتیبانی تلفنی", d: `${SITE.phoneDisplay} · info@tafakorpardazan.ir` },
  { icon: RefreshCcw, t: "بازگشت و تعویض", d: "شرایط شفاف برای کالاهای استفاده‌نشده" },
  { icon: PackageCheck, t: "بسته‌بندی ایمن", d: "بسته‌بندی محافظ برای محصولات شیشه‌ای" },
];

async function safe<T>(p: Promise<T>): Promise<T | null> { try { return await p; } catch { return null; } }

export default async function Home() {
  const [picks, fresh, sale] = await Promise.all([
    safe(listProducts({ tag: "featured", perPage: 8 })),
    safe(listProducts({ orderby: "date", order: "desc", perPage: 8 })),
    safe(listProducts({ onSale: true, perPage: 4 })),
  ]);
  const spotlight = picks?.products.find((p) => p.slug === "lightweight-hydrating-serum") ?? picks?.products[0];

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-h" className="bg-rasp-50">
        <div className="mx-auto grid max-w-[1360px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
          <div className="order-2 lg:order-1">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-rasp-700">
              <span className="size-2 rounded-full bg-rasp-600" aria-hidden />پوست، آرایش، مو
            </p>
            <h1 id="hero-h" className="text-4xl font-bold leading-[1.45] text-plum-900 sm:text-5xl sm:leading-[1.4]">
              روتین زیبایی شما، <span className="text-rasp-600">ساده و دلنشین</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-9 text-plum-700">
              محصولات مراقبت از پوست، آرایش، ضدآفتاب و مراقبت از مو را بر اساس گام‌های روتین روزانه پیدا کنید و با ارسال به سراسر ایران درِ خانه تحویل بگیرید.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/collections/all" size="lg">مشاهده همه محصولات<ArrowLeft className="size-5" aria-hidden /></Button>
              <Button href="/collections/skincare" size="lg" variant="secondary">روتین مراقبت از پوست</Button>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <div className="arch relative aspect-[4/5] overflow-hidden bg-rasp-100">
              <Image src="/media/editorial/hero.webp" alt="رژلب تمشکی، سرم قطره‌چکان‌دار و کرم روی سکوی صورتی؛ تصویرسازی" fill priority sizes="(min-width:1024px) 45vw, 90vw" quality={82} className="object-cover" />
            </div>
            {spotlight && (
              <Link href={`/products/${spotlight.slug}`} className="absolute -bottom-4 right-3 flex items-center gap-3 rounded-md bg-white p-2.5 pl-4 shadow-raised sm:-right-4">
                {spotlight.image && <Image src={spotlight.image.src} alt="" width={56} height={70} className="h-[70px] w-14 rounded-sm object-cover" />}
                <span className="text-sm">
                  <span className="block text-xs text-rasp-600">منتخب کازمتیکس</span>
                  <span className="block max-w-40 truncate font-medium">{spotlight.name}</span>
                  <span className="block text-plum-600">{formatToman(spotlight.price)}</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Category arches */}
      <section aria-labelledby="cat-h" className="mx-auto max-w-[1360px] px-4 py-14 sm:px-6">
        <h2 id="cat-h" className="sr-only">دسته‌بندی‌ها</h2>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group block text-center">
                <span className="arch relative mx-auto block aspect-[3/4] w-full max-w-60 overflow-hidden bg-rasp-50 ring-1 ring-line transition group-hover:ring-rasp-300">
                  <Image src={c.img} alt="" fill sizes="(min-width:1024px) 18vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="mt-3 block font-bold group-hover:text-rasp-700">{c.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Routine */}
      <section aria-labelledby="routine-h" className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="rounded-lg border border-line bg-white p-6 sm:p-10">
          <div className="mb-8 max-w-xl">
            <h2 id="routine-h" className="text-2xl font-bold sm:text-3xl">محصولات را بر اساس گام روتین پیدا کنید</h2>
            <p className="mt-2 leading-8 text-plum-600">پنج گام ساده برای مراقبت روزانه از پوست؛ هر گام را باز کنید و محصول مناسب خودتان را انتخاب کنید.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {routine.map((r) => (
              <li key={r.n + r.t}>
                <Link href={r.href} className="group flex h-full items-center gap-4 rounded-md bg-blush-100 p-4 transition hover:bg-rasp-50 lg:flex-col lg:items-start">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rasp-600 text-lg font-bold text-white">{r.n}</span>
                  <span><span className="block font-bold group-hover:text-rasp-700">{r.t}</span><span className="text-sm text-plum-600">{r.d}</span></span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Picks */}
      {picks && picks.products.length > 0 && (
        <section aria-labelledby="picks-h" className="mx-auto max-w-[1360px] px-4 pt-20 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-rasp-600">انتخاب‌های ما</p>
              <h2 id="picks-h" className="text-2xl font-bold sm:text-3xl">منتخب کازمتیکس</h2>
            </div>
            <Link href="/collections/all" className="hidden items-center gap-1 text-sm font-medium text-rasp-700 hover:underline sm:flex">همه محصولات<ArrowLeft className="size-4" aria-hidden /></Link>
          </div>
          <ProductGrid products={picks.products.slice(0, 8)} priorityCount={4} />
        </section>
      )}

      {/* Campaign */}
      <section aria-labelledby="camp-h" className="mx-auto mt-20 max-w-[1360px] px-4 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-lg bg-rasp-700 text-white" data-on-dark>
          <Image src="/media/editorial/campaign.webp" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-60 mix-blend-luminosity" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-l from-rasp-700 via-rasp-700/85 to-transparent" aria-hidden />
          <div className="max-w-xl px-6 py-14 sm:px-12 sm:py-20">
            <p className="text-sm font-medium text-rasp-200">پیشنهادهای ویژه</p>
            <h2 id="camp-h" className="mt-3 text-3xl font-bold leading-[1.5] sm:text-4xl">آرایش روزانه، با رنگ‌های گرم تمشکی</h2>
            <p className="mt-4 leading-8 text-rasp-100">رژلب مات، رژگونه کرمی، کوشن و پالت سایه؛ مجموعه‌ای برای آرایش سریع صبح تا مهمانی شب.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/collections/makeup" className="inline-flex h-12 items-center rounded-full bg-white px-7 font-medium text-rasp-700 hover:bg-rasp-50">خرید آرایش</Link>
              <Link href="/collections/all?onsale=1" className="inline-flex h-12 items-center rounded-full border border-white/50 px-7 font-medium hover:bg-white/10">محصولات تخفیف‌دار</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Curated collections */}
      <section aria-labelledby="col-h" className="mx-auto max-w-[1360px] px-4 pt-20 sm:px-6">
        <h2 id="col-h" className="mb-8 text-2xl font-bold sm:text-3xl">مجموعه‌های گزینش‌شده</h2>
        <ul className="grid gap-5 md:grid-cols-3">
          {collections.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="group relative block overflow-hidden rounded-lg bg-rasp-50">
                <span className="relative block aspect-[4/5]">
                  <Image src={c.img} alt={c.alt} fill sizes="(min-width:768px) 30vw, 95vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="absolute inset-x-3 bottom-3 rounded-md bg-white/95 p-4">
                  <span className="block font-bold">{c.title}</span>
                  <span className="mt-0.5 flex items-center justify-between text-sm text-plum-600">{c.sub}<ArrowLeft className="size-4 text-rasp-600" aria-hidden /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      {fresh && fresh.products.length > 0 && (
        <section aria-labelledby="new-h" className="mx-auto max-w-[1360px] px-4 pt-20 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 id="new-h" className="text-2xl font-bold sm:text-3xl">تازه‌ترین محصولات</h2>
            <Link href="/collections/all?sort=date" className="flex items-center gap-1 text-sm font-medium text-rasp-700 hover:underline">مشاهده همه<ArrowLeft className="size-4" aria-hidden /></Link>
          </div>
          <ProductGrid products={fresh.products} />
        </section>
      )}

      {/* On sale */}
      {sale && sale.products.length > 0 && (
        <section aria-labelledby="sale-h" className="mx-auto mt-20 max-w-[1360px] px-4 sm:px-6">
          <div className="rounded-lg bg-rasp-50 p-5 sm:p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="sale-h" className="text-2xl font-bold sm:text-3xl">محصولات تخفیف‌دار</h2>
              <Link href="/collections/all?onsale=1" className="text-sm font-medium text-rasp-700 hover:underline">{formatNumber(sale.total)} محصول</Link>
            </div>
            <ProductGrid products={sale.products} />
          </div>
        </section>
      )}

      {/* Story */}
      <section aria-labelledby="story-h" className="mx-auto mt-20 grid max-w-[1360px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-rasp-50">
          <Image src="/media/editorial/story.webp" alt="کیف آرایش باز، آینه دستی و گل‌های خشک صورتی؛ تصویرسازی" fill sizes="(min-width:1024px) 45vw, 95vw" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-medium text-rasp-600">درباره کازمتیکس</p>
          <h2 id="story-h" className="mt-2 text-2xl font-bold leading-[1.6] sm:text-3xl">زیبایی یعنی روتینی که با آن راحت باشید</h2>
          <p className="mt-4 leading-9 text-plum-700">
            کازمتیکس مجموعه‌ای از محصولات مراقبت از پوست، آرایش و مراقبت از مو را کنار هم آورده است تا انتخاب ساده‌تر شود. هر محصول با حجم، بافت، روش استفاده و نوع پوست مناسب معرفی می‌شود؛ بدون ادعاهای اغراق‌آمیز.
          </p>
          <Link href="/about" className="mt-5 inline-flex items-center gap-1 font-medium text-rasp-700 hover:underline">بیشتر درباره ما<ArrowLeft className="size-4" aria-hidden /></Link>
        </div>
      </section>

      {/* Trust */}
      <section aria-label="خدمات فروشگاه" className="mx-auto mt-20 max-w-[1360px] px-4 sm:px-6">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-4 rounded-md border border-line bg-white p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rasp-50 text-rasp-600"><Icon className="size-5" aria-hidden /></span>
              <span><span className="block font-bold">{t}</span><span className="text-sm leading-7 text-plum-600">{d}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
