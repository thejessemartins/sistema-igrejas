"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency as formatCents } from "@/lib/format";
import { createStoreSale } from "@/server/actions/store";

interface Product {
  id: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
}

export function PdvClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<
    "dinheiro" | "transferencia_manual" | "cartao_manual"
  >("dinheiro");
  const [buyerText, setBuyerText] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  function addToCart(product: Product) {
    setFeedback(null);
    setCart((prev) => {
      const current = prev[product.id] ?? 0;
      if (current >= product.stockQuantity) {
        setFeedback({
          type: "error",
          text: `Estoque máximo atingido para ${product.name}.`,
        });
        return prev;
      }
      return { ...prev, [product.id]: current + 1 };
    });
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      return;
    }
    setCart((prev) => ({ ...prev, [productId]: qty }));
  }

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = products.find((p) => p.id === productId);
      return product ? { product, quantity } : null;
    })
    .filter((x): x is { product: Product; quantity: number } => x !== null);

  const totalCents = cartItems.reduce(
    (acc, item) => acc + item.product.priceCents * item.quantity,
    0
  );

  function handleCheckout() {
    if (cartItems.length === 0) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await createStoreSale({
        paymentMethod,
        buyerText: buyerText || null,
        items: cartItems.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({ type: "ok", text: res.message ?? "Venda concluída!" });
      setCart({});
      setBuyerText("");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {feedback && (
          <div
            className={`rounded-[2px] border px-4 py-2 text-sm ${
              feedback.type === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={p.stockQuantity <= 0}
              onClick={() => addToCart(p)}
              className="flex flex-col justify-between rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 text-left hover:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-40"
            >
              <div>
                <p className="font-semibold text-neutral-900">{p.name}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Estoque: {p.stockQuantity}
                </p>
              </div>
              <p className="mt-3 text-base font-bold text-neutral-900">
                {formatCents(p.priceCents)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2px] border border-neutral-200 bg-neutral-0 p-4 space-y-4 h-fit">
        <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
          <ShoppingCart className="h-4 w-4 text-neutral-700" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            Carrinho
          </h2>
        </div>

        {cartItems.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-500">
            Clique nos produtos para adicionar.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-neutral-500">
                    {quantity} x {formatCents(product.priceCents)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, quantity - 1)}
                    className="h-6 w-6 rounded-[2px] border border-neutral-300 text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono text-xs">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, quantity + 1)}
                    className="h-6 w-6 rounded-[2px] border border-neutral-300 text-xs"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, 0)}
                    className="ml-1 text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 border-t border-neutral-200 pt-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Forma de registro
            </label>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value as
                    | "dinheiro"
                    | "transferencia_manual"
                    | "cartao_manual"
                )
              }
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 bg-neutral-0 px-2 text-sm"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="transferencia_manual">Transferência manual</option>
              <option value="cartao_manual">Cartão manual</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Comprador (opcional)
            </label>
            <input
              type="text"
              value={buyerText}
              onChange={(e) => setBuyerText(e.target.value)}
              placeholder="Nome do comprador"
              className="mt-1 h-9 w-full rounded-[2px] border border-neutral-300 px-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatCents(totalCents)}</span>
          </div>

          <button
            type="button"
            disabled={isPending || cartItems.length === 0}
            onClick={handleCheckout}
            className="h-10 w-full rounded-[2px] bg-neutral-900 text-xs font-bold uppercase tracking-wider text-neutral-0 hover:bg-neutral-800 disabled:opacity-40"
          >
            {isPending ? "Finalizando..." : "Finalizar Venda"}
          </button>
        </div>
      </div>
    </div>
  );
}
