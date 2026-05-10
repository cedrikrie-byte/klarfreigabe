import { redirect } from "next/navigation";
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
    redirect(`/f/${token}`);
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

  redirect(`/f/${token}/rejected`);
}