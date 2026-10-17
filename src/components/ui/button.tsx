import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "accent" | "quiet" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,transform] duration-150 ease-out-quart " +
  "disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-rasp-600 text-white hover:bg-rasp-700 active:bg-rasp-700",
  secondary: "border border-rasp-600 text-rasp-600 hover:bg-rasp-600 hover:text-white active:bg-rasp-700",
  accent: "bg-plum-900 text-white hover:bg-plum-700 active:bg-plum-950",
  quiet: "text-plum-900 hover:bg-rasp-50 active:bg-rasp-100",
  danger: "border border-danger-600 text-danger-600 hover:bg-danger-600 hover:text-white",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-base",
  lg: "h-14 px-8 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  href?: string;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, href, className, children, disabled, type = "button", ...rest },
  ref,
) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={disabled || undefined}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
