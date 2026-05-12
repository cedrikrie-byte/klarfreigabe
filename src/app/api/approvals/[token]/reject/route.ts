import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RejectRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(request: Request, { params }: RejectRouteProps) {
  const { token } = await params;

  const formData = await request.formData();
  const customerComment = String(formData.get("customerComment") || "").trim();

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

  await prisma.approval.update({
    where: {
      token,
    },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      customerComment: customerComment || null,
    },
  });

  await prisma.documentationItem.update({
    where: {
      id: approval.documentationItemId,
    },
    data: {
      status: "REJECTED",
    },
  });

  return NextResponse.json({
    success: true,
    redirectUrl: `/f/${token}/rejected`,
  });
}