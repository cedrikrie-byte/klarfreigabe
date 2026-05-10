import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ApproveRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

export async function POST(
  request: Request,
  { params }: ApproveRouteProps
) {
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
    redirect(`/f/${token}`);
  }

  await prisma.approval.update({
    where: {
      token,
    },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
    },
  });

  await prisma.documentationItem.update({
    where: {
      id: approval.documentationItemId,
    },
    data: {
      status: "APPROVED",
    },
  });

  redirect(`/f/${token}/approved`);
}