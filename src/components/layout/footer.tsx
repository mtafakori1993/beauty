import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SITE } from "@/lib/config";
import { NewsletterForm } from "./newsletter-form";

const cols = [
  { title: "فروشگاه", links: [
    ["مراقبت از پوست", "/collections/skincare"], ["آرایش", "/collections/makeup"], ["ضدآفتاب", "/collections/sun-care"], ["مراقبت از مو", "/collections/hair-care"], ["ابزار زیبایی", "/collections/beauty-tools"],
  ] },
  { title: "راهنمای خرید", links: [
    ["ارسال و تحویل", "/shipping"], ["بازگشت و تعویض", "/returns"], ["پرسش‌های متداول", "/faq"], ["تماس با ما", "/contact"],
  ] },
  { title: "کازمتیکس", links: [
    ["درباره کازمتیکس", "/about"], ["حریم خصوصی", "/privacy"], ["قوانین و مقررات", "/terms"], ["پیگیری سفارش", "/account"],
  ] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-plum-900 text-blush-200" data-on-dark>
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6">
        <div className="-mt-12 grid gap-6 rounded-lg bg-rasp-600 p-6 text-white shadow-raised sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center [&>*]:min-w-0">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">خبرنامه کازمتیکس</h2>
            <p className="mt-2 text-sm leading-7 text-rasp-100">از محصولات تازه و پیشنهادهای فروشگاه زودتر باخبر شوید. هر زمان بخواهید می‌توانید لغو کنید.</p>
          </div>
          <NewsletterForm />
        </div>
        <div className="grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1.3fr_2fr] [&>*]:min-w-0">
          <div className="space-y-5">
            <Logo onDark />
            <p className="max-w-sm text-sm leading-7 text-blush-300">فروشگاه آنلاین مراقبت از پوست، آرایش و مراقبت از مو؛ انتخابی ساده و دلنشین برای روتین روزانه شما.</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="size-4 text-rasp-300" aria-hidden /><span>پشتیبانی:</span><a href={`tel:${SITE.phone}`} className="ltr hover:underline">{SITE.phone}</a></li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-rasp-300" aria-hidden /><a href={`mailto:${SITE.email}`} className="ltr break-all hover:underline">{SITE.email}</a></li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="mb-4 text-sm font-bold text-white">{c.title}</h2>
                <ul className="space-y-1">
                  {c.links.map(([l, h]) => (
                    <li key={h}><Link href={h} className="flex min-h-9 items-center text-sm text-blush-300 hover:text-white hover:underline">{l}</Link></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-plum-700">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-2 px-4 py-5 text-xs text-blush-300 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false })} کازمتیکس · تصاویر محصولات تصویرسازی هستند و ممکن است با بسته‌بندی نهایی کالا تفاوت داشته باشند.</p>
          <p>
            <a href={SITE.attribution.href} target="_blank" rel="noopener" className="hover:text-white hover:underline">{SITE.attribution.text}</a>
            <span className="ltr mr-2 text-blush-300/70">{SITE.attribution.domain}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
