import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type RejectedPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function RejectedPage({ params }: RejectedPageProps) {
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-3xl text-slate-950">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Rückfrage gesendet
          </h1>

          <p className="mt-3 text-slate-600">
            Vielen Dank. {company.name} wurde informiert, dass Sie die Freigabe
            noch nicht erteilen möchten oder eine Rückfrage haben.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-sm text-slate-500">Betroffene Zusatzarbeit</p>
            <p className="mt-1 font-semibold">{item.title}</p>
            <p className="mt-2 text-sm text-slate-600">{job.title}</p>
          </div>

          {approval.rejectedAt && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-left">
              <p className="text-sm text-slate-500">Gesendet am</p>
              <p className="mt-1 font-semibold">
                {new Date(approval.rejectedAt).toLocaleString("de-DE")}
              </p>
            </div>
          )}

          {approval.customerComment && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-left">
              <p className="text-sm text-slate-500">Ihre Nachricht</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {approval.customerComment}
              </p>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Der Rückfragestatus wurde gespeichert. Die Werkstatt kann Ihre
            Nachricht im Auftrag einsehen.
          </p>
        </div>
      </div>
    </main>
  );
}