import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const createDocumentationItemSchema = z.object({
  jobId: z.string().min(1, "Auftrag fehlt."),
  type: z.enum([
    "VEHICLE_INTAKE",
    "ADDITIONAL_WORK",
    "DAMAGE_FOUND",
    "AFTER_DOCUMENTATION",
    "OTHER",
  ]),
  title: z.string().min(2, "Titel ist zu kurz."),
  description: z.string().min(5, "Beschreibung ist zu kurz."),
  priceText: z.string().optional(),
  photos: z
    .array(
      z.object({
        fileUrl: z.string(),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
      })
    )
    .optional(),
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Eingaben sind ungültig.";
  }

  return "Dokumentation konnte nicht gespeichert werden.";
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
        title: data.title,
        description: data.description,
        priceCents: null,
        priceText: data.priceText || null,
        approvalRequired: true,
        status: "PENDING",
        approval: {
          create: {
            token: nanoid(24),
            status: "PENDING",
          },
        },
        photos: {
          create:
            data.photos?.map((photo) => ({
              fileUrl: photo.fileUrl,
              fileName: photo.fileName,
              mimeType: photo.mimeType,
            })) ?? [],
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
      approvalToken: documentationItem.approval?.token,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}