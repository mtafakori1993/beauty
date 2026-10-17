"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/stores/cart";
import { useToasts } from "@/stores/toast";

/** Round add-to-cart control for simple in-stock products (variable products go through the product page). */
export function QuickAdd({ id, name }: { id: number; name: string }) {
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  return (
    <button
      type="button"
      aria-label={`افزودن «${name}» به سبد خرید`}
      disabled={state === "busy"}
      onClick={async () => {
        setState("busy");
        const ok = await add(id, 1);
        if (ok) { setState("done"); setTimeout(() => setState("idle"), 1600); } else { setState("idle"); push(useCart.getState().error ?? "افزودن به سبد انجام نشد", "error"); }
      }}
      className="relative z-10 grid size-11 place-items-center rounded-full bg-white text-rasp-600 shadow-raised transition hover:bg-rasp-600 hover:text-white disabled:opacity-60"
      data-testid="quick-add"
    >
      {state === "done" ? <Check className="size-5" aria-hidden /> : <Plus className="size-5" aria-hidden />}
    </button>
  );
}
