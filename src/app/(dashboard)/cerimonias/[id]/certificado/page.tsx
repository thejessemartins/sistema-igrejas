import { notFound } from "next/navigation";
import { formatDate } from "@/lib/format";
import { getCeremonyById } from "@/server/queries/ceremonies";
import { getChurchSettings } from "@/server/actions/settings";

export default async function CertificadoCerimoniaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, settings] = await Promise.all([
    getCeremonyById(id),
    getChurchSettings(),
  ]);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-xl rounded-[2px] border border-neutral-900 bg-neutral-0 p-10 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
        {settings?.churchName ?? "Igreja Local"}
      </p>
      <h1 className="mt-4 font-heading text-2xl font-bold uppercase text-neutral-900">
        Certificado de {data.ceremony.kind.replace("_", " ")}
      </h1>
      <p className="mt-4 text-sm text-neutral-700">{data.ceremony.title}</p>
      <p className="mt-2 font-mono text-xs text-neutral-500">
        {data.ceremony.scheduledAt
          ? formatDate(data.ceremony.scheduledAt)
          : formatDate(new Date())}
      </p>
    </div>
  );
}
