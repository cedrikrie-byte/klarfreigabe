import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CopyLinkButton from "@/components/CopyLinkButton";

type JobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

function getStatusLabel(status: string) {
  if (status === "PENDING") return "Offen";
  if (status === "APPROVED") return "Freigegeben";
  if (status === "REJECTED") return "Rückfrage / abgelehnt";

  return status;
}

function getApprovalUrl(token: string) {
  return `http://localhost:3000/f/${token}`;
}

export default async function JobPage({ params }: JobPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId } = await params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: user.companyId,
    },
    include: {
      customer: true,
      items: {
        include: {
          approval: true,
          photos: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!job) {
    notFound();
  }

  async function deleteJob() {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: currentUser.companyId,
      },
    });

    if (!existingJob) {
      redirect("/dashboard");
    }

    await prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-300">
          ← Zurück zum Dashboard
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Auftrag
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {job.title}
              </h1>
            </div>

            <div className="grid gap-2 sm:flex sm:items-center">
              <Link
                href={`/jobs/${job.id}/edit`}
                className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white sm:py-2"
              >
                Auftrag bearbeiten
              </Link>

              <form action={deleteJob}>
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 sm:w-auto sm:py-2"
                >
                  Auftrag löschen
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Kunde</p>
              <p className="mt-1 font-semibold">{job.customer.name}</p>

              {job.customer.phone && (
                <p className="mt-1 break-words text-sm text-slate-400">
                  {job.customer.phone}
                </p>
              )}

              {job.customer.email && (
                <p className="mt-1 break-words text-sm text-slate-400">
                  {job.customer.email}
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Fahrzeug</p>
              <p className="mt-1 font-semibold">
                {job.vehicle || "Kein Fahrzeug angegeben"}
              </p>

              {job.licensePlate && (
                <p className="mt-1 text-sm text-slate-400">
                  {job.licensePlate}
                </p>
              )}
            </div>
          </div>

          {job.notes && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Notiz</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">
                {job.notes}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Dokumentationen</p>
                <p className="mt-1 text-sm text-slate-500">
                  {job.items.length === 0
                    ? "Noch keine Einträge"
                    : `${job.items.length} Eintrag/Einträge`}
                </p>
              </div>

              <Link
                href={`/jobs/${job.id}/documentation/new`}
                className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 sm:py-2"
              >
                Dokumentation hinzufügen
              </Link>
            </div>

            {job.items.length === 0 ? (
              <p className="mt-5 font-semibold text-yellow-300">
                Noch keine Dokumentation angelegt
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {job.items.map((item) => {
                  const approvalToken = item.approval?.token;
                  const approvalUrl = approvalToken
                    ? getApprovalUrl(approvalToken)
                    : "";

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                    >
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold">{item.title}</p>

                              <p className="mt-1 text-sm leading-6 text-slate-400">
                                {item.description}
                              </p>
                            </div>

                            <span className="w-fit rounded-full bg-yellow-300/10 px-3 py-1 text-sm font-semibold text-yellow-300">
                              {getStatusLabel(item.status)}
                            </span>
                          </div>

                          {item.priceText && (
                            <p className="mt-2 text-sm font-semibold text-slate-200">
                              Kostenschätzung: {item.priceText}
                            </p>
                          )}

                          {item.approval?.approvedAt && (
                            <p className="mt-2 text-sm text-green-300">
                              Freigegeben am:{" "}
                              {new Date(
                                item.approval.approvedAt
                              ).toLocaleString("de-DE")}
                            </p>
                          )}

                          {item.approval?.rejectedAt && (
                            <p className="mt-2 text-sm text-orange-300">
                              Rückfrage gesendet am:{" "}
                              {new Date(
                                item.approval.rejectedAt
                              ).toLocaleString("de-DE")}
                            </p>
                          )}

                          {item.approval?.customerComment && (
                            <div className="mt-3 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3">
                              <p className="text-sm font-semibold text-orange-200">
                                Rückfrage vom Kunden
                              </p>
                              <p className="mt-1 text-sm leading-6 text-orange-100">
                                {item.approval.customerComment}
                              </p>
                            </div>
                          )}

                          {item.photos.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {item.photos.map((photo) => (
                                <img
                                  key={photo.id}
                                  src={photo.fileUrl}
                                  alt={photo.fileName || "Dokumentationsfoto"}
                                  className="h-28 w-full rounded-2xl border border-white/10 object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-4">
                          {item.status === "PENDING" && (
                            <Link
                              href={`/jobs/${job.id}/documentation/${item.id}/edit`}
                              className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white sm:py-2"
                            >
                              Bearbeiten
                            </Link>
                          )}

                          {item.approval && (
                            <>
                              <Link
                                href={`/f/${item.approval.token}`}
                                className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-950 sm:py-2"
                              >
                                Freigabelink öffnen
                              </Link>

                              <CopyLinkButton url={approvalUrl} />
                            </>
                          )}

                          <Link
                            href={`/jobs/${job.id}/documentation/${item.id}/pdf`}
                            className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white sm:py-2"
                          >
                            PDF-Nachweis öffnen
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6">
            <Link
              href="/dashboard"
              className="block rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-white sm:inline-flex"
            >
              Zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}