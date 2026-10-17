import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "بازگشت و تعویض", description: "شرایط بازگشت و تعویض کالا در فروشگاه کازمتیکس.", alternates: { canonical: "/returns" } };

export default function Returns() {
  return (
    <PageShell title="بازگشت و تعویض" lead="اگر کالا مطابق انتظار شما نبود، شرایط زیر را ببینید.">
      <h2>شرایط پذیرش</h2>
      <ul>
        <li>درخواست تا ۷ روز پس از تحویل به پشتیبانی اعلام شود.</li>
        <li>کالا باید بازنشده، استفاده‌نشده و در بسته‌بندی اصلی باشد.</li>
        <li>به‌دلایل بهداشتی، محصولات آرایشی و مراقبت از پوست که بازشده یا استفاده شده‌اند قابل بازگشت نیستند، مگر در صورت مشکل در خود کالا.</li>
      </ul>
      <h2>کالای آسیب‌دیده یا اشتباه</h2>
      <p>اگر کالا آسیب‌دیده رسید یا با سفارش شما تفاوت داشت، با ذکر شماره سفارش و ارسال تصویر، با پشتیبانی تماس بگیرید تا تعویض یا بازگشت وجه بررسی شود.</p>
      <h2>نحوه درخواست</h2>
      <p>با شماره <a href="tel:09040153212" className="ltr">09040153212</a> یا ایمیل <a href="mailto:info@tafakorpardazan.ir" className="ltr">info@tafakorpardazan.ir</a> در ارتباط باشید.</p>
    </PageShell>
  );
}
