import Link from "next/link";
import { SeraCard } from "@/components/shared/sera-card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <SeraCard
          title="Erro 404"
          description="Página não encontrada"
          footer="Verifique o endereço digitado ou retorne à página inicial."
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              O recurso solicitado não existe ou ainda não foi implementado.
            </p>
            <Link
              href="/"
              className="inline-flex h-8 items-center rounded-[2px] bg-blue-600 px-3 text-xs font-medium text-neutral-0 hover:bg-blue-700"
            >
              Voltar ao início
            </Link>
          </div>
        </SeraCard>
      </div>
    </div>
  );
}
