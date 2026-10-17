import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "حریم خصوصی", description: "نحوه استفاده کازمتیکس از اطلاعات شما.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <PageShell title="حریم خصوصی" lead="به اطلاعات شما احترام می‌گذاریم و فقط به اندازه نیاز از آن‌ها استفاده می‌کنیم.">
      <h2>اطلاعاتی که دریافت می‌کنیم</h2>
      <p>هنگام ثبت سفارش، نام، شماره تماس، ایمیل و نشانی تحویل را دریافت می‌کنیم. اگر در خبرنامه عضو شوید، ایمیل شما نگهداری می‌شود.</p>
      <h2>نحوه استفاده</h2>
      <p>اطلاعات سفارش فقط برای پردازش، ارسال و پشتیبانی استفاده می‌شود و برای فروش به اشخاص ثالث ارائه نمی‌شود. برای نگه‌داشتن سبد خرید از یک کوکی ضروری استفاده می‌کنیم.</p>
      <h2>لغو عضویت و حذف اطلاعات</h2>
      <p>برای لغو خبرنامه یا درخواست حذف اطلاعات، به <a href="mailto:info@tafakorpardazan.ir" className="ltr">info@tafakorpardazan.ir</a> ایمیل بزنید.</p>
    </PageShell>
  );
}
