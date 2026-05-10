import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type DocumentationItemRouteProps = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: DocumentationItemRouteProps
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  const { itemId } = await params;

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

  if (item.status !== "PENDING") {
    return NextResponse.json(
      { error: "Nur offene Dokumentationen können gelöscht werden." },
      { status: 400 }
    );
  }

  await prisma.documentationItem.delete({
    where: {
      id: itemId,
    },
  });

  return NextResponse.json({
    success: true,
    jobId: item.jobId,
  });
}