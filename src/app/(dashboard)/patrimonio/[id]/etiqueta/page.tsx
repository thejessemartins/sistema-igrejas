import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/session";
import { getAssetById } from "@/server/queries/assets";

export default async function EtiquetaPatrimonioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("membros", "ver");
  const { id } = await params;
  const data = await getAssetById(id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-sm rounded-[2px] border border-neutral-900 bg-neutral-0 p-6 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        Patrimônio · Sistema Igrejas
      </p>
      <p className="mt-2 font-mono text-2xl font-bold text-neutral-900">
        {data.asset.patrimonyCode}
      </p>
      <p className="mt-1 text-sm font-medium text-neutral-800">
        {data.asset.name}
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        {data.asset.locationText ?? "Sem local"}
      </p>
    </div>
  );
}
