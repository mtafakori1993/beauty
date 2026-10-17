"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { formatToman } from "@/lib/format";
import type { ProductSummary } from "@/lib/woo/types";

export function SearchDialog({ variant = "icon" }: { variant?: "icon" | "field" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<ProductSummary[] | null>(null);
  const [error, setError] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (q.trim().length < 2) return;
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (mine === seq.current) { setResults(json.products); setError(false); }
      } catch {
        if (mine === seq.current) setError(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const active = q.trim().length >= 2;
  const shownResults = active ? results : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "field" ? (
          <button type="button" aria-label="جست‌وجو" className="hidden h-11 w-72 max-w-full items-center gap-2 rounded-full border border-line bg-white px-4 text-sm text-plum-600 hover:border-rasp-300 lg:flex">
            <Search className="size-4" aria-hidden />جست‌وجوی محصول یا دسته…
          </button>
        ) : (
          <button type="button" aria-label="جست‌وجو" className="grid size-11 place-items-center rounded-full hover:bg-rasp-50 lg:hidden">
            <Search className="size-5" aria-hidden />
          </button>
        )}
      </DialogTrigger>
      <DialogContent title="جست‌وجو در فروشگاه" description="نام محصول یا دسته را بنویسید" className="!top-[10dvh] !-translate-y-0 sm:max-w-2xl">
        <form onSubmit={submit} role="search" className="flex gap-2 p-5">
          <input
            type="search" name="q" value={q} onChange={(e) => setQ(e.target.value)} autoFocus autoComplete="off" enterKeyHint="search"
            placeholder="مثلاً: سرم آبرسان" aria-label="عبارت جست‌وجو"
            className="h-12 flex-1 rounded-full border border-plum-500/50 bg-white px-5 text-base placeholder:text-plum-500 focus:border-rasp-600"
          />
          <button type="submit" className="h-12 rounded-full bg-rasp-600 px-6 font-medium text-white hover:bg-rasp-700">جست‌وجو</button>
        </form>
        <div className="max-h-[50dvh] overflow-y-auto px-5 pb-5" aria-live="polite">
          {active && error && <p className="text-sm text-danger-600">جست‌وجو در حال حاضر ممکن نیست؛ دوباره تلاش کنید.</p>}
          {shownResults && shownResults.length === 0 && <p className="py-6 text-center text-plum-600">محصولی با این عبارت پیدا نشد.</p>}
          {shownResults && shownResults.length > 0 && (
            <ul className="divide-y divide-line">
              {shownResults.map((p) => (
                <li key={p.id}>
                  <DialogClose asChild>
                    <Link href={`/products/${p.slug}`} className="flex items-center gap-4 py-3 hover:bg-blush-100">
                      <span className="relative block aspect-[4/5] w-12 shrink-0 overflow-hidden rounded-xs bg-blush-200">
                        {p.image && <Image src={p.image.src} alt="" fill sizes="48px" className="object-cover" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="text-sm text-plum-600">{formatToman(p.price)}</span>
                      </span>
                    </Link>
                  </DialogClose>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
