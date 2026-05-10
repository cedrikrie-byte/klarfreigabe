import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type JobRouteProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function DELETE(
  request: Request,
  { params }: JobRouteProps
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  const { jobId } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: user.companyId,
    },
  });

  if (!job) {
    return NextResponse.json(
      { error: "Auftrag nicht gefunden." },
      { status: 404 }
    );
  }

  await prisma.job.delete({
    where: {
      id: jobId,
    },
  });

  return NextResponse.json({
    success: true,
  });
}