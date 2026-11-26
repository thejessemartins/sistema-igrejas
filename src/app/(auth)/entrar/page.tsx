"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Church } from "lucide-react";
import { SeraCard } from "@/components/shared/sera-card";
import { loginAction } from "@/server/actions/auth";

export default function EntrarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginAction({ email, password });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-blue-600 text-neutral-0">
          <Church className="h-4 w-4" />
        </span>
        <span className="font-heading text-lg font-semibold text-neutral-900">
          Sistema para Igrejas
        </span>
      </div>

      <SeraCard
        title="Entrar"
        description="Acesse sua conta com e-mail e senha locais."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@igreja.local"
              className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-9 w-full items-center justify-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 focus:outline-2 focus:outline-blue-600 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="text-center">
            <Link
              href="/recuperar-senha"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </SeraCard>
    </div>
  );
}
