import type { Metadata } from "next";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "درباره کازمتیکس", description: "کازمتیکس؛ فروشگاه آنلاین مراقبت از پوست، آرایش و مراقبت از مو با معرفی روشن و روتین‌محور محصولات.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <PageShell title="درباره کازمتیکس" lead="کازمتیکس برای کسانی ساخته شده که می‌خواهند مراقبت از خود را ساده، روشن و دلنشین کنند.">
      <div className="relative -mx-4 aspect-[3/2] overflow-hidden rounded-lg bg-rasp-50 sm:mx-0">
        <Image src="/media/editorial/story.webp" alt="کیف آرایش باز و آینه دستی؛ تصویرسازی" fill sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
      </div>
      <h2>رویکرد ما</h2>
      <p>محصولات را بر اساس گام‌های روتین روزانه دسته‌بندی کرده‌ایم: پاک‌سازی، آبرسانی، مراقبت ویژه، ضدآفتاب، آرایش و مراقبت از مو. در هر صفحه، حجم، بافت، روش استفاده و نوع پوست مناسب را می‌بینید.</p>
      <h2>صداقت در معرفی</h2>
      <p>ادعاهای پزشکی یا نتیجه تضمینی نمی‌نویسیم. فهرست دقیق ترکیبات و هشدارها روی بسته‌بندی هر کالا است و تصاویر سایت تصویرسازی هستند، نه عکس بسته‌بندی نهایی.</p>
      <Button href="/collections/all">مشاهده محصولات</Button>
    </PageShell>
  );
}
