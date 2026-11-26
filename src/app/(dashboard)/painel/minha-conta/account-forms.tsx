"use client";

import { useState } from "react";
import { SeraCard } from "@/components/shared/sera-card";
import {
  changePasswordAction,
  updateProfileAction,
} from "@/server/actions/auth";

export function AccountForms({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [savingPass, setSavingPass] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileErr(null);
    setSavingProfile(true);
    const res = await updateProfileAction({ name });
    setSavingProfile(false);
    if (!res.ok) {
      setProfileErr(res.error);
      return;
    }
    setProfileMsg(res.message);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg(null);
    setPassErr(null);
    setSavingPass(true);
    const res = await changePasswordAction({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setSavingPass(false);
    if (!res.ok) {
      setPassErr(res.error);
      return;
    }
    setPassMsg(res.message);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SeraCard title="Dados do Perfil" description="Atualize seu nome de exibição.">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileErr ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {profileErr}
            </div>
          ) : null}
          {profileMsg ? (
            <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
              {profileMsg}
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full border-b border-neutral-200 bg-neutral-25 py-2 text-sm text-neutral-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
          >
            {savingProfile ? "Salvando..." : "Salvar perfil"}
          </button>
        </form>
      </SeraCard>

      <SeraCard
        title="Alterar Senha"
        description="Mínimo de 8 caracteres com letra e número."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passErr ? (
            <div className="rounded-[2px] border border-red-600/30 bg-red-600/10 px-3 py-2 text-xs text-red-600">
              {passErr}
            </div>
          ) : null}
          {passMsg ? (
            <div className="rounded-[2px] border border-green-600/30 bg-green-600/10 px-3 py-2 text-xs text-green-600">
              {passMsg}
            </div>
          ) : null}

          <div className="space-y-1">
            <label
              htmlFor="currentPassword"
              className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600"
            >
              Senha Atual
            </label>
            <input
              id="currentPassword"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border-b border-neutral-300 bg-transparent py-2 text-sm text-neutral-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
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
            disabled={savingPass}
            className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-4 text-[11px] font-bold uppercase tracking-wider text-neutral-0 hover:bg-blue-700 disabled:opacity-50"
          >
            {savingPass ? "Alterando..." : "Alterar senha"}
          </button>
        </form>
      </SeraCard>
    </div>
  );
}
