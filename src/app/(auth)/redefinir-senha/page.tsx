"use client";

import { useState } from "react";
import Link from "next/link";
import { SeraCard } from "@/components/shared/sera-card";
import { resetPasswordAction } from "@/server/actions/auth";

export default function RedefinirSenhaPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    const res = await resetPasswordAction({
      token,
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setMessage(res.message);
  }

  return (
    <SeraCard
      title="Redefinir Senha"
      description="Informe o token de redefinição e sua nova senha."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error ? (
          <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
            {message}
          </div>
        ) : null}

        <div className="space-y-1.5">
          <label
            htmlFor="token"
            className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
          >
            Token
          </label>
          <input
            id="token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="newPassword"
            className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
          >
            Nova Senha
          </label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
          >
            Confirmar Nova Senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-full items-center justify-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Redefinir senha"}
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
