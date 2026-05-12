import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ApproveRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unbekannter Fehler beim Speichern der Freigabe.";
}

export async function POST(request: Request, { params }: ApproveRouteProps) {
  try {
    const { token } = await params;

    const approval = await prisma.approval.findUnique({
      where: {
        token,
      },
      include: {
        documentationItem: true,
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Freigabe nicht gefunden." },
        { status: 404 }
      );
    }

    if (approval.status === "APPROVED") {
      return NextResponse.json({
        success: true,
        redirectUrl: `/f/${token}/approved`,
      });
    }

    if (approval.status === "REJECTED") {
      return NextResponse.json({
        success: true,
        redirectUrl: `/f/${token}/rejected`,
      });
    }

    await prisma.$transaction([
      prisma.approval.update({
        where: {
          token,
        },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      }),

      prisma.documentationItem.update({
        where: {
          id: approval.documentationItemId,
        },
        data: {
          status: "APPROVED",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      redirectUrl: `/f/${token}/approved`,
    });
  } catch (error) {
    console.error("Approval approve failed:", error);

    return NextResponse.json(
      {
        error: `Freigabe konnte nicht gespeichert werden: ${getErrorMessage(
          error
        )}`,
      },
      { status: 500 }
    );
  }
}