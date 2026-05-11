import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Blob-Token fehlt in .env." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Keine Datei erhalten." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Nur Bilddateien sind erlaubt." },
        { status: 400 }
      );
    }

    const fileExtension = file.name.split(".").pop() || "jpg";
    const safeFileName = `${user.companyId}/${nanoid(16)}.${fileExtension}`;

    const blob = await put(safeFileName, file, {
      access: "public",
      contentType: file.type,
      token,
    });

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      fileName: file.name,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Blob upload failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Blob-Upload.";

    return NextResponse.json(
      { error: `Blob-Upload fehlgeschlagen: ${message}` },
      { status: 500 }
    );
  }
}