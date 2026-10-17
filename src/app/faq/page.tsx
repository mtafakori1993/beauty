import type { Metadata } from "next";
import { Accordion } from "radix-ui";
import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "پرسش‌های متداول", description: "پاسخ پرسش‌های رایج درباره ارسال، پرداخت و بازگشت کالا در فروشگاه کازمتیکس.", alternates: { canonical: "/faq" } };

const faq = [
  ["چطور محصول مناسب پوستم را انتخاب کنم؟", "در صفحه هر محصول، نوع پوست مناسب، حجم، بافت و روش استفاده نوشته شده است. در فهرست محصولات هم می‌توانید بر اساس نوع پوست فیلتر کنید. برای راهنمایی بیشتر با پشتیبانی تماس بگیرید."],
  ["هزینه و زمان ارسال چقدر است؟", "هزینه ارسال ۹۵ هزار تومان است و برای خرید بالای ۲٫۵ میلیون تومان رایگان می‌شود. زمان تحویل پس از تأیید سفارش اعلام می‌شود."],
  ["پرداخت چگونه انجام می‌شود؟", "پرداخت آنلاین هنوز فعال نیست. پس از ثبت سفارش، پشتیبانی موجودی را تأیید می‌کند و برای هماهنگی پرداخت با شما تماس می‌گیرد؛ تا آن زمان مبلغی دریافت نمی‌شود."],
  ["آیا می‌توانم کالا را بازگردانم؟", "تا ۷ روز پس از تحویل، برای کالاهای بازنشده و استفاده‌نشده. شرایط کامل در صفحه «بازگشت و تعویض» آمده است."],
  ["آیا تصاویر، عکس بسته‌بندی نهایی هستند؟", "خیر. تصاویر محصولات تصویرسازی هستند و ممکن است با بسته‌بندی نهایی تفاوت داشته باشند. ترکیبات و هشدارها را روی بسته‌بندی کالا بخوانید."],
  ["چگونه کد تخفیف را اعمال کنم؟", "در صفحه سبد خرید یا تسویه حساب، کد را در بخش «کد تخفیف» وارد کنید."],
] as const;

export default function Faq() {
  return (
    <PageShell title="پرسش‌های متداول">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
      <Accordion.Root type="single" collapsible className="border-t border-line !mt-0">
        {faq.map(([q, a], i) => (
          <Accordion.Item key={q} value={`q${i}`} className="border-b border-line">
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 text-start font-medium text-plum-900">
                {q}<ChevronDown className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pb-5">{a}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </PageShell>
  );
}
