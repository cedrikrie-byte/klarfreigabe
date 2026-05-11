import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type ApprovedPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ApprovedPage({ params }: ApprovedPageProps) {
  const { token } = await params;

  const approval = await prisma.approval.findUnique({
    where: {
      token,
    },
    include: {
      documentationItem: {
        include: {
          job: {
            include: {
              company: true,
            },
          },
        },
      },
    },
  });

  if (!approval) {
    notFound();
  }

  const item = approval.documentationItem;
  const job = item.job;
  const company = job.company;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-5 sm:py-8">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-xl items-center">
        <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {APP_NAME}
          </p>

          <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-3xl text-white">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Freigabe erteilt
          </h1>

          <p className="mt-3 text-slate-600">
            Vielen Dank. {company.name} wurde über Ihre Freigabe informiert.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-sm text-slate-500">Freigegebene Zusatzarbeit</p>
            <p className="mt-1 font-semibold">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">{job.title}</p>
          </div>

          {approval.approvedAt && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-left">
              <p className="text-sm text-slate-500">Freigegeben am</p>
              <p className="mt-1 font-semibold">
                {new Date(approval.approvedAt).toLocaleString("de-DE")}
              </p>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Der Freigabestatus wurde gespeichert. Die Werkstatt kann den Nachweis
            später als PDF dokumentieren.
          </p>
        </div>
      </div>
    </main>
  );
}