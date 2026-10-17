import Image from "next/image";
import Link from "next/link";
import { Badge, Price } from "@/components/ui/misc";
import { QuickAdd } from "./quick-add";
import { shadeHex } from "@/lib/colors";
import type { ProductSummary } from "@/lib/woo/types";
import { cn } from "@/lib/cn";

export function ProductCard({ product, priority, sizes = "(min-width:1280px) 22vw, (min-width:768px) 31vw, 48vw" }: { product: ProductSummary; priority?: boolean; sizes?: string }) {
  const p = product;
  const onSale = p.salePrice !== null && p.regularPrice > p.price;
  const cat = p.categories.find((c) => !["skincare"].includes(c.slug)) ?? p.categories[0];
  return (
    <article className="group relative flex flex-col" data-testid="product-card">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-rasp-50">
        <Link href={`/products/${p.slug}`} tabIndex={-1} aria-hidden className="absolute inset-0 block">
          {p.image ? (
            <Image
              src={p.image.src} alt="" fill sizes={sizes} priority={priority} quality={75}
              className={cn("object-cover transition duration-500 group-hover:scale-[1.03]", p.hoverImage && "group-hover:opacity-0", !p.inStock && "opacity-60")}
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm text-plum-500">بدون تصویر</span>
          )}
          {p.hoverImage && (
            <Image src={p.hoverImage.src} alt="" fill sizes={sizes} quality={75} className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
        </Link>
        <span className="pointer-events-none absolute right-3 top-3 flex flex-col items-start gap-1">
          {onSale && <Badge tone="danger">تخفیف</Badge>}
          {!p.inStock && <Badge>ناموجود</Badge>}
        </span>
        {p.inStock && p.type === "simple" && (
          <span className="absolute bottom-3 left-3"><QuickAdd id={p.id} name={p.name} /></span>
        )}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1">
        {cat && <p className="text-xs font-medium text-rasp-600">{cat.name}</p>}
        <h3 className="line-clamp-2 min-h-[3.25rem] text-[0.95rem] font-medium leading-[1.65rem]">
          <Link href={`/products/${p.slug}`} className="after:absolute after:inset-x-0 after:top-0 after:aspect-[4/5] hover:text-rasp-700" aria-label={p.name}>{p.name}</Link>
        </h3>
        <div className="flex items-center justify-between gap-2">
          <Price price={p.price} regular={onSale ? p.regularPrice : null} max={p.priceMax} size="sm" />
        </div>
        {p.shades.length > 1 && (
          <ul className="mt-1 flex items-center gap-1.5" aria-label="رنگ‌های موجود">
            {p.shades.map((c) => (
              <li key={c.id} title={c.name} className="size-4 rounded-full border border-plum-900/15" style={{ background: shadeHex(c.slug) }}>
                <span className="sr-only">{c.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0, className }: { products: ProductSummary[]; priorityCount?: number; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4", className)} data-testid="product-grid">
      {products.map((p, i) => (
        <li key={p.id}><ProductCard product={p} priority={i < priorityCount} /></li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4" aria-busy aria-label="در حال بارگذاری محصولات">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="skeleton aspect-[4/5] !rounded-lg" />
          <div className="skeleton mt-3 h-5 w-3/4" />
          <div className="skeleton mt-2 h-4 w-1/2" />
        </li>
      ))}
    </ul>
  );
}
