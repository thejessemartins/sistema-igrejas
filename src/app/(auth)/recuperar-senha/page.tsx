"use client";

import { useState } from "react";
import Link from "next/link";
import { SeraCard } from "@/components/shared/sera-card";
import { recoverPasswordAction } from "@/server/actions/auth";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await recoverPasswordAction({ email });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setMessage(res.message);
  }

  return (
    <SeraCard
      title="Recuperar Senha"
      description="Fluxo local de solicitação de redefinição de senha."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="space-y-2 rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
            <p>{message}</p>
            <p className="text-neutral-700">
              Em ambiente local sem servidor de e-mail, solicite ao administrador
              a redefinição ou acesse{" "}
              <Link href="/redefinir-senha" className="font-semibold underline">
                /redefinir-senha
              </Link>
              .
            </p>
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@igreja.local"
            className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-full items-center justify-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Solicitar redefinição"}
        </button>

        <div className="text-center">
          <Link
            href="/entrar"
            className="text-xs font-medium text-neutral-600 hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </form>
    </SeraCard>
  );
}
