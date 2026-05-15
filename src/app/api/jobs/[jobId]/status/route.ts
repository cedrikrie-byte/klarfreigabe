import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type JobStatusRouteProps = {
  params: Promise<{
    jobId: string;
  }>;
};

const updateJobStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]),
});

function getErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "Status ist ungültig.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Status konnte nicht geändert werden.";
}

export async function PATCH(
  request: Request,
  { params }: JobStatusRouteProps
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  try {
    const { jobId } = await params;
    const body = await request.json();
    const data = updateJobStatusSchema.parse(body);

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

    if (job.status === "ARCHIVED") {
      return NextResponse.json(
        { error: "Archivierte Aufträge können nicht mehr geändert werden." },
        { status: 400 }
      );
    }

    await prisma.job.update({
      where: {
        id: job.id,
      },
      data: {
        status: data.status,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Update job status failed:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 400 }
    );
  }
}