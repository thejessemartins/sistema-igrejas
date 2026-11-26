import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireSession();
  return <AppShell session={session}>{children}</AppShell>;
}
