import { NextResponse } from "next/server";
import { db } from "@/db";
import { exportLogs } from "@/db/schema";
import { hasPermission } from "@/lib/permissions";
import { getServerSession } from "@/lib/session";
import { getReportData, type ReportType } from "@/server/queries/reports";

function buildSimplePdf(title: string, headers: string[], rows: string[][]): Buffer {
  const lines = [
    title,
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    "------------------------------------------------------------",
    headers.join(" | "),
    "------------------------------------------------------------",
    ...rows.map((r) => r.join(" | ")),
  ];

  const escaped = lines
    .map((l) => l.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"))
    .map((l, idx) => `BT /F1 10 Tf 40 ${760 - idx * 14} Td (${l}) Tj ET`)
    .join("\n");

  const pdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${escaped.length} >> stream
${escaped}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000241 00000 n 
0000000000 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session || !hasPermission(session, "relatorios", "exportar")) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") ?? "membros") as ReportType;
  const format = searchParams.get("format") === "pdf" ? "pdf" : "csv";

  try {
    const data = await getReportData(type, session);

    await db.insert(exportLogs).values({
      userId: session.user.id,
      reportType: type,
      format,
      filters: {},
    });

    const filename = `relatorio-${type}-${new Date().toISOString().slice(0, 10)}.${format}`;

    if (format === "pdf") {
      const buffer = buildSimplePdf(
        `Relatorio: ${type.toUpperCase()}`,
        data.headers,
        data.rows
      );
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const csvContent =
      "\uFEFF" +
      [data.headers.join(";"), ...data.rows.map((r) => r.join(";"))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao exportar." },
      { status: 403 }
    );
  }
}
