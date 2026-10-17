import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartButton } from "./cart-drawer";
import { SearchDialog } from "./search-dialog";
import { MobileMenu } from "./mobile-menu";
import { NAV } from "./nav";
import { SITE } from "@/lib/config";
import { formatNumber } from "@/lib/format";

export function AnnouncementBar() {
  return (
    <div className="bg-rasp-700 text-blush-100" data-on-dark>
      <p className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-center gap-x-5 gap-y-0.5 px-4 py-1.5 text-center text-xs">
        <span>ارسال رایگان برای خرید بالای {formatNumber(SITE.freeShippingThreshold / 1000)} هزار تومان</span>
        <span className="hidden text-rasp-300 sm:inline" aria-hidden>•</span>
        <span>پشتیبانی: <a href={`tel:${SITE.phone}`} className="ltr underline underline-offset-4">{SITE.phone}</a></span>
      </p>
    </div>
  );
}

export function Header() {
  return (
    <>
      <div className="sticky top-0 z-40 border-b border-line bg-blush-50/95 backdrop-blur supports-[backdrop-filter]:bg-blush-50/85">
        <div className="mx-auto grid h-[var(--header-h)] max-w-[1360px] grid-cols-[auto_1fr_auto] items-center gap-2 px-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-1 justify-self-start">
            <MobileMenu />
            <SearchDialog variant="field" />
          </div>
          <Logo className="justify-self-center" />
          <div className="flex items-center justify-self-end">
            <SearchDialog variant="icon" />
            <CartButton />
          </div>
        </div>
        <nav aria-label="دسته‌بندی‌ها" className="hidden border-t border-line lg:block">
          <ul className="mx-auto flex max-w-[1360px] items-center justify-center gap-1 px-6">
            {NAV.map((n) => (
              <li key={n.href} className="group relative">
                <Link href={n.href} className="flex h-11 items-center gap-1 rounded-full px-4 text-[0.92rem] font-medium hover:bg-rasp-50 hover:text-rasp-700">
                  {n.label}
                  {n.children && <ChevronDown className="size-3.5 opacity-60" aria-hidden />}
                </Link>
                {n.children && (
                  <ul className="invisible absolute right-0 top-full z-10 min-w-56 rounded-md border border-line bg-white p-2 opacity-0 shadow-raised transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    {n.children.map((c) => (
                      <li key={c.href}><Link href={c.href} className="flex h-10 items-center rounded-sm px-3 text-sm hover:bg-rasp-50 hover:text-rasp-700">{c.label}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Mobile / tablet: scrollable category chips */}
      <nav aria-label="دسته‌بندی‌های سریع" className="border-b border-line bg-blush-100 lg:hidden">
        <ul className="no-scrollbar flex gap-2 overflow-x-auto px-3 py-2.5 sm:px-6">
          {NAV.filter((n) => !n.href.includes("?")).map((n) => (
            <li key={n.href} className="shrink-0">
              <Link href={n.href} className="flex h-9 items-center rounded-full border border-line bg-white px-4 text-sm font-medium hover:border-rasp-300 hover:text-rasp-700">{n.label}</Link>
            </li>
          ))}
          <li className="shrink-0"><Link href="/collections/all?onsale=1" className="flex h-9 items-center rounded-full bg-rasp-600 px-4 text-sm font-medium text-white">تخفیف‌ها</Link></li>
        </ul>
      </nav>
    </>
  );
}
