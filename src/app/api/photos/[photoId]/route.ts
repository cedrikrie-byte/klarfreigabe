import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PhotoRouteProps = {
  params: Promise<{
    photoId: string;
  }>;
};

function canEditDocumentationItem(status: string, approvalRequired: boolean) {
  if (!approvalRequired) {
    return true;
  }

  return status === "PENDING";
}

export async function DELETE(request: Request, { params }: PhotoRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  try {
    const { photoId } = await params;

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
        documentationItem: {
          job: {
            companyId: user.companyId,
          },
        },
      },
      include: {
        documentationItem: {
          include: {
            job: true,
          },
        },
      },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Foto nicht gefunden." },
        { status: 404 }
      );
    }

    if (photo.documentationItem.job.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Archivierte Aufträge können nicht bearbeitet werden." },
        { status: 400 }
      );
    }

    const canEdit = canEditDocumentationItem(
      photo.documentationItem.status,
      photo.documentationItem.approvalRequired
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

    await prisma.photo.delete({
      where: {
        id: photoId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Photo delete failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unbekannter Fehler beim Löschen des Fotos.";

    return NextResponse.json(
      { error: `Foto konnte nicht gelöscht werden: ${message}` },
      { status: 500 }
    );
  }
}