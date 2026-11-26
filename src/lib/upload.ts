import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "members");

function detectImageExtension(buffer: Buffer): "jpg" | "png" | "webp" | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }

  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

export async function saveMemberPhoto(file: File): Promise<string> {
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("A foto deve ter no máximo 2 MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = detectImageExtension(buffer);

  if (!ext) {
    throw new Error("Formato inválido. Aceito apenas JPG, PNG ou WebP.");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  await writeFile(fullPath, buffer);

  return `/uploads/members/${filename}`;
}

export async function deleteMemberPhoto(photoPath: string | null | undefined): Promise<void> {
  if (!photoPath || !photoPath.startsWith("/uploads/members/")) return;
  const filename = path.basename(photoPath);
  const fullPath = path.join(UPLOAD_DIR, filename);
  try {
    await unlink(fullPath);
  } catch {
    // Ignora se o arquivo já não existir
  }
}
