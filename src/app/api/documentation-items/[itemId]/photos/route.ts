import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type DocumentationPhotosRouteProps = {
  params: Promise<{
    itemId: string;
  }>;
};

const addPhotosSchema = z.object({
  photos: z
    .array(
      z.object({
        fileUrl: z.string().min(1, "Foto-URL fehlt."),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .min(1, "Mindestens ein Foto fehlt."),
});

function canEditDocumentationItem(status: string, approvalRequired: boolean) {
  if (!approvalRequired) {
    return true;
  }

  return status === "PENDING";
}

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Eingaben sind ungültig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Fotos konnten nicht gespeichert werden.";
}

export async function POST(
  request: Request,
  { params }: DocumentationPhotosRouteProps
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  try {
    const { itemId } = await params;
    const body = await request.json();
    const data = addPhotosSchema.parse(body);

    const item = await prisma.documentationItem.findFirst({
      where: {
        id: itemId,
        job: {
          companyId: user.companyId,
        },
      },
      include: {
        job: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Dokumentation nicht gefunden." },
        { status: 404 }
      );
    }

    if (item.job.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Archivierte Aufträge können nicht bearbeitet werden." },
        { status: 400 }
      );
    }

    const canEdit = canEditDocumentationItem(
      item.status,
      item.approvalRequired
    );

    if (!canEdit) {
      return NextResponse.json(
        {
          error:
            "Diese Dokumentation wurde bereits beantwortet und kann nicht mehr bearbeitet werden.",
        },
        { status: 400 }
      );
    }

    await prisma.photo.createMany({
      data: data.photos.map((photo) => ({
        documentationItemId: item.id,
        fileUrl: photo.fileUrl,
        fileName: photo.fileName || null,
        mimeType: photo.mimeType || null,
      })),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Add documentation photos failed:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}