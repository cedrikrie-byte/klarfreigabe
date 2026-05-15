import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicUrl } from "@/lib/branding";
import { prisma } from "@/lib/prisma";
import CopyLinkButton from "@/components/CopyLinkButton";
import DeleteDocumentationButton from "@/components/DeleteDocumentationButton";
import DeleteJobButton from "@/components/DeleteJobButton";
import JobStatusControl from "@/components/JobStatusControl";
import PhotoGallery from "@/components/PhotoGallery";
import SendApprovalEmailButton from "@/components/SendApprovalEmailButton";

type JobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

type JobPhoto = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

type JobApproval = {
  token: string;
  status: string;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  emailSentAt: Date | null;
  customerComment: string | null;
};

type JobItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  priceText: string | null;
  status: string;
  approvalRequired: boolean;
  photos: JobPhoto[];
  approval: JobApproval | null;
};

type JobDetail = {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  vehicle: string | null;
  licensePlate: string | null;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
  items: JobItem[];
};

function getStatusLabel(status: string, type: string, approvalRequired: boolean) {
  if (!approvalRequired && type === "VEHICLE_INTAKE") {
    return "Annahme dokumentiert";
  }

  if (!approvalRequired && type === "AFTER_DOCUMENTATION") {
    return "Nachher dokumentiert";
  }

  if (!approvalRequired) {
    return "Dokumentiert";
  }

  if (status === "PENDING") return "Offen";
  if (status === "APPROVED") return "Freigegeben";
  if (status === "REJECTED") return "Rückfrage / abgelehnt";

  return status;
}

function getTypeLabel(type: string) {
  if (type === "VEHICLE_INTAKE") return "Fahrzeugannahme";
  if (type === "ADDITIONAL_WORK") return "Zusatzarbeit";
  if (type === "DAMAGE_FOUND") return "Schaden entdeckt";
  if (type === "AFTER_DOCUMENTATION") return "Nachher-Dokumentation";
  if (type === "OTHER") return "Sonstige Dokumentation";

  return "Dokumentation";
}

function getStatusClass(status: string, approvalRequired: boolean) {
  if (!approvalRequired) {
    return "bg-blue-300/10 text-blue-300";
  }

  if (status === "APPROVED") {
    return "bg-green-300/10 text-green-300";
  }

  if (status === "REJECTED") {
    return "bg-orange-300/10 text-orange-300";
  }

  return "bg-yellow-300/10 text-yellow-300";
}

function getApprovalUrl(token: string) {
  return getPublicUrl(`/f/${token}`);
}

export default async function JobPage({ params }: JobPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId } = await params;

  const job: JobDetail | null = await prisma.job.findFirst({
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

  const isArchived = job.status === "ARCHIVED";

  const openApprovalsCount = job.items.filter(
    (item) => item.approval?.status === "PENDING"
  ).length;

  async function deleteJob(formData: FormData) {
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

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: "ARCHIVED",
      },
    });

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
          >
            ← Zurück zum Dashboard
          </Link>

          <Link
            href={`/customers/${job.customer.id}`}
            className="inline-flex rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20 active:scale-[0.98]"
          >
            Kundenakte öffnen
          </Link>
        </div>

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
              {!isArchived && (
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
                >
                  Auftrag bearbeiten
                </Link>
              )}

              <DeleteJobButton
                action={deleteJob}
                documentationCount={job.items.length}
              />
            </div>
          </div>

          <div className="mt-6">
            <JobStatusControl
              jobId={job.id}
              currentStatus={job.status}
              openApprovalsCount={openApprovalsCount}
            />
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
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-200">
                {job.notes}
              </p>
            </div>
          )}

          {isArchived && (
            <div className="mt-6 rounded-2xl border border-slate-500/30 bg-slate-800 p-4 text-sm leading-6 text-slate-200">
              Dieser Auftrag ist archiviert. Dokumentationen und Nachweise
              bleiben sichtbar, neue Änderungen sind eingeschränkt.
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

              {!isArchived && (
                <div className="grid gap-2 sm:flex sm:items-center">
                  <Link
                    href={`/jobs/${job.id}/documentation/new?type=VEHICLE_INTAKE`}
                    className="rounded-2xl bg-blue-300 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-blue-200 active:scale-[0.98] sm:py-2"
                  >
                    Fahrzeugannahme starten
                  </Link>

                  <Link
                    href={`/jobs/${job.id}/documentation/new`}
                    className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] sm:py-2"
                  >
                    Dokumentation hinzufügen
                  </Link>
                </div>
              )}
            </div>

            {job.items.length === 0 ? (
              <p className="mt-5 font-semibold text-yellow-300">
                Noch keine Dokumentation angelegt
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {job.items.map((item: JobItem) => {
                  const approval = item.approval;
                  const isVehicleIntake = item.type === "VEHICLE_INTAKE";
                  const isApprovalItem =
                    item.approvalRequired && approval !== null;
                  const approvalUrl = approval
                    ? getApprovalUrl(approval.token)
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
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {getTypeLabel(item.type)}
                              </p>

                              <p className="mt-1 font-semibold">
                                {item.title}
                              </p>

                              {!isVehicleIntake && (
                                <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-400">
                                  {item.description}
                                </p>
                              )}

                              {isVehicleIntake && (
                                <p className="mt-1 text-sm leading-6 text-slate-400">
                                  Zustand des Fahrzeugs bei Abgabe dokumentiert.
                                  Diese Fotos dienen als Nachweis bei späteren
                                  Rückfragen oder Reklamationen.
                                </p>
                              )}
                            </div>

                            <span
                              className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                                item.status,
                                item.approvalRequired
                              )}`}
                            >
                              {getStatusLabel(
                                item.status,
                                item.type,
                                item.approvalRequired
                              )}
                            </span>
                          </div>

                          {item.priceText && item.approvalRequired && (
                            <p className="mt-2 text-sm font-semibold text-slate-200">
                              Kostenschätzung: {item.priceText}
                            </p>
                          )}

                          {approval?.emailSentAt && (
                            <p className="mt-2 text-sm text-blue-300">
                              Freigabe-Mail zuletzt gesendet am:{" "}
                              {new Date(approval.emailSentAt).toLocaleString(
                                "de-DE"
                              )}
                            </p>
                          )}

                          {approval?.approvedAt && (
                            <p className="mt-2 text-sm text-green-300">
                              Freigegeben am:{" "}
                              {new Date(approval.approvedAt).toLocaleString(
                                "de-DE"
                              )}
                            </p>
                          )}

                          {approval?.rejectedAt && (
                            <p className="mt-2 text-sm text-orange-300">
                              Rückfrage gesendet am:{" "}
                              {new Date(approval.rejectedAt).toLocaleString(
                                "de-DE"
                              )}
                            </p>
                          )}

                          {approval?.customerComment && (
                            <div className="mt-3 rounded-2xl border border-orange-300/20 bg-orange-400/10 p-3">
                              <p className="text-sm font-semibold text-orange-200">
                                Rückfrage vom Kunden
                              </p>
                              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-orange-100">
                                {approval.customerComment}
                              </p>
                            </div>
                          )}

                          {item.photos.length > 0 && (
                            <PhotoGallery photos={item.photos} />
                          )}
                        </div>

                        <div className="grid gap-2 sm:grid-cols-6">
                          {!isArchived && item.status === "PENDING" && (
                            <>
                              <Link
                                href={`/jobs/${job.id}/documentation/${item.id}/edit`}
                                className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
                              >
                                Bearbeiten
                              </Link>

                              <DeleteDocumentationButton itemId={item.id} />
                            </>
                          )}

                          {!isArchived && !item.approvalRequired && (
                            <DeleteDocumentationButton itemId={item.id} />
                          )}

                          {isApprovalItem && approval && (
                            <>
                              <Link
                                href={`/f/${approval.token}`}
                                className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] sm:py-2"
                              >
                                Freigabelink öffnen
                              </Link>

                              <CopyLinkButton url={approvalUrl} />

                              {!isArchived &&
                                item.status === "PENDING" &&
                                job.customer.email && (
                                  <SendApprovalEmailButton
                                    token={approval.token}
                                  />
                                )}
                            </>
                          )}

                          <Link
                            href={`/jobs/${job.id}/documentation/${item.id}/pdf`}
                            className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
                          >
                            PDF-Nachweis öffnen
                          </Link>
                        </div>

                        {isApprovalItem && approval && !job.customer.email && (
                          <p className="text-sm text-slate-500">
                            Keine E-Mail-Adresse beim Kunden hinterlegt. Füge
                            eine E-Mail-Adresse in der Kundenakte hinzu, um den
                            Freigabelink per E-Mail zu senden.
                          </p>
                        )}
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
              className="block rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:inline-flex"
            >
              Zur Übersicht
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}