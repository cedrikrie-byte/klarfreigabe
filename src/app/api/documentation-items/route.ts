import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const photoSchema = z.object({
  fileUrl: z.string().min(1, "Foto-URL fehlt."),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

const createDocumentationItemSchema = z.object({
  jobId: z.string().min(1, "Auftrag fehlt."),
  type: z.enum([
    "VEHICLE_INTAKE",
    "ADDITIONAL_WORK",
    "DAMAGE_FOUND",
    "AFTER_DOCUMENTATION",
    "OTHER",
  ]),
  title: z.string().optional(),
  description: z.string().optional(),
  priceText: z.string().optional(),
  photos: z.array(photoSchema).optional(),
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Eingaben sind ungültig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Dokumentation konnte nicht gespeichert werden.";
}

function getDefaultTitle(type: string) {
  if (type === "VEHICLE_INTAKE") return "Fahrzeugannahme";
  if (type === "DAMAGE_FOUND") return "Schaden entdeckt";
  if (type === "AFTER_DOCUMENTATION") return "Nachher-Dokumentation";
  if (type === "OTHER") return "Dokumentation";

  return "Zusatzarbeit";
}

function getDefaultDescription(type: string) {
  if (type === "VEHICLE_INTAKE") {
    return "Zustand des Fahrzeugs bei Abgabe dokumentiert.";
  }

  if (type === "AFTER_DOCUMENTATION") {
    return "Nachher-Zustand dokumentiert.";
  }

  if (type === "DAMAGE_FOUND") {
    return "Schaden dokumentiert.";
  }

  return "Dokumentation erstellt.";
}

function shouldCreateApproval(type: string) {
  return type === "ADDITIONAL_WORK" || type === "DAMAGE_FOUND";
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const data = createDocumentationItemSchema.parse(body);

    const photos = data.photos ?? [];
    const needsApproval = shouldCreateApproval(data.type);

    const title = data.title?.trim() || getDefaultTitle(data.type);
    const description =
      data.description?.trim() || getDefaultDescription(data.type);

    if (needsApproval && title.length < 2) {
      return NextResponse.json(
        { error: "Titel ist zu kurz." },
        { status: 400 }
      );
    }

    if (needsApproval && description.length < 5) {
      return NextResponse.json(
        { error: "Beschreibung ist zu kurz." },
        { status: 400 }
      );
    }

    if (data.type === "VEHICLE_INTAKE" && photos.length === 0) {
      return NextResponse.json(
        {
          error:
            "Für eine Fahrzeugannahme muss mindestens ein Foto hochgeladen werden.",
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.findFirst({
      where: {
        id: data.jobId,
        companyId: user.companyId,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Auftrag nicht gefunden." },
        { status: 404 }
      );
    }

    const documentationItem = await prisma.documentationItem.create({
      data: {
        jobId: data.jobId,
        type: data.type,
        title,
        description,
        priceCents: null,
        priceText: needsApproval ? data.priceText || null : null,
        approvalRequired: needsApproval,
        status: needsApproval ? "PENDING" : "APPROVED",
        approval: needsApproval
          ? {
              create: {
                token: nanoid(24),
                status: "PENDING",
              },
            }
          : undefined,
        photos: {
          create: photos.map((photo) => ({
            fileUrl: photo.fileUrl,
            fileName: photo.fileName,
            mimeType: photo.mimeType,
          })),
        },
      },
      include: {
        approval: true,
        photos: true,
      },
    });

    return NextResponse.json({
      success: true,
      documentationItemId: documentationItem.id,
      approvalToken: documentationItem.approval?.token ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}