"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Home,
  CheckSquare,
  Briefcase,
  ClipboardList,
  Megaphone,
  Wallet,
  Calendar,
  Shield,
  History,
  UserCog,
  Search,
  Menu,
  X,
  LogOut,
  Church,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hasPermission,
  ROLE_LABELS,
  type ModuleName,
} from "@/lib/permissions";
import type { AppSession } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  modulo: ModuleName;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Visão Geral",
    items: [
      {
        label: "Início",
        href: "/",
        icon: LayoutDashboard,
        modulo: "dashboard",
      },
    ],
  },
  {
    title: "Módulos",
    items: [
      { label: "Membros", href: "/membros", icon: Users, modulo: "membros" },
      {
        label: "Visitantes",
        href: "/visitantes",
        icon: UserPlus,
        modulo: "visitantes",
      },
      {
        label: "Células",
        href: "/celulas",
        icon: Home,
        modulo: "celulas",
      },
      {
        label: "Aniversariantes",
        href: "/membros/aniversariantes",
        icon: Calendar,
        modulo: "membros",
      },
      {
        label: "Financeiro",
        href: "/financeiro",
        icon: Wallet,
        modulo: "financeiro",
      },
      { label: "Eventos", href: "/cultos", icon: Calendar, modulo: "cultos" },
      {
        label: "Presença",
        href: "/presenca",
        icon: CheckSquare,
        modulo: "presenca",
      },
      {
        label: "Ministérios",
        href: "/ministerios",
        icon: Briefcase,
        modulo: "ministerios",
      },
      {
        label: "Escalas",
        href: "/escalas",
        icon: ClipboardList,
        modulo: "escalas",
      },
      {
        label: "Avisos",
        href: "/avisos",
        icon: Megaphone,
        modulo: "avisos",
      },
    ],
  },
  {
    title: "Configurações",
    items: [
      {
        label: "Usuários",
        href: "/configuracoes/usuarios",
        icon: Shield,
        modulo: "usuarios",
      },
      {
        label: "Auditoria",
        href: "/configuracoes/auditoria",
        icon: History,
        modulo: "auditoria",
      },
      {
        label: "Minha Conta",
        href: "/painel/minha-conta",
        icon: UserCog,
        modulo: "minha_conta",
      },
    ],
  },
];

export function AppShell({
  children,
  session,
}: {
  children: ReactNode;
  session: AppSession;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const initials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-neutral-950/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col border-r border-neutral-200 bg-neutral-0 transition-transform duration-150 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[2px] bg-blue-600 text-neutral-0">
              <Church className="h-4 w-4" />
            </span>
            <span className="font-heading text-sm font-semibold tracking-tight text-neutral-900">
              Sistema Igrejas
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-[2px] p-1 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasPermission(session, item.modulo, "ver")
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex h-8 items-center gap-2.5 rounded-[2px] px-2 text-sm transition-colors",
                            isActive
                              ? "bg-neutral-50 font-medium text-neutral-900"
                              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-neutral-500" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 px-4 py-3 text-[11px] text-neutral-400">
          {ROLE_LABELS[session.user.role]}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-0 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-[2px] border border-neutral-200 p-1.5 text-neutral-600 hover:bg-neutral-50 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-25 px-2.5 py-1.5 text-xs text-neutral-400 sm:flex sm:w-64">
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span>Buscar no sistema...</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-neutral-600 md:inline">
              Igreja Local
            </span>

            <Link
              href="/painel/minha-conta"
              className="flex items-center gap-2 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 py-1 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-[2px] bg-blue-50 text-[10px] font-semibold text-blue-700">
                {initials}
              </span>
              <span className="hidden sm:inline">{session.user.name}</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex h-7 items-center gap-1.5 rounded-[2px] border border-neutral-200 bg-neutral-0 px-2.5 text-[11px] font-bold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 focus:outline-2 focus:outline-blue-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
