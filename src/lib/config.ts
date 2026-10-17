export const SITE = {
  name: "کازمتیکس",
  latinName: "Cosmetics",
  domain: "beauty.shomaaa.ir",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://beauty.shomaaa.ir",
  tagline: "آرایشی، بهداشتی و مراقبت از پوست",
  description:
    "کازمتیکس؛ فروشگاه آنلاین محصولات مراقبت از پوست، آرایش، ضدآفتاب، مراقبت از مو و ابزار زیبایی با ارسال به سراسر ایران.",
  phone: "09040153212",
  phoneDisplay: "۰۹۰۴۰۱۵۳۲۱۲",
  email: "info@tafakorpardazan.ir",
  attribution: { text: "طراحی و توسعه توسط تفکر پردازان", href: "https://tafakorpardazan.ir", domain: "tafakorpardazan.ir" },
  freeShippingThreshold: 2_500_000,
} as const;

export const WORDPRESS_URL = process.env.WORDPRESS_URL ?? "http://localhost:8099";
