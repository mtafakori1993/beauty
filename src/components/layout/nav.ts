export interface NavItem { label: string; href: string; children?: { label: string; href: string }[] }

export const NAV: NavItem[] = [
  { label: "مراقبت از پوست", href: "/collections/skincare", children: [
    { label: "پاک‌کننده و تونر", href: "/collections/cleansers" },
    { label: "مرطوب‌کننده و سرم", href: "/collections/moisturizers-serums" },
    { label: "مراقبت ویژه پوست", href: "/collections/special-care" },
  ] },
  { label: "آرایش", href: "/collections/makeup" },
  { label: "ضدآفتاب", href: "/collections/sun-care" },
  { label: "مراقبت از مو", href: "/collections/hair-care" },
  { label: "ابزار زیبایی", href: "/collections/beauty-tools" },
  { label: "تازه‌ها", href: "/collections/all?sort=date" },
  { label: "تخفیف‌ها", href: "/collections/all?onsale=1" },
];
