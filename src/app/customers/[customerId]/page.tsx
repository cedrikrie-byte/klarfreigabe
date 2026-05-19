import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

type CustomerJob = {
  id: string;
  title: string;
  status: string;
  vehicle: string | null;
  licensePlate: string | null;
  createdAt: Date;
  items: {
    id: string;
    type: string;
    approvalRequired: boolean;
    approval: {
      status: string;
    } | null;
  }[];
};

type ObjectGroup = {
  key: string;
  label: string;
  jobs: CustomerJob[];
  latestJob: CustomerJob;
};

function getJobStatusLabel(status: string) {
  if (status === "ARCHIVED") return "Archiviert";
  if (status === "COMPLETED") return "Abgeschlossen";
  if (status === "IN_PROGRESS") return "In Arbeit";
  if (status === "OPEN") return "Offen";

  return status;
}

function getJobStatusClass(status: string) {
  if (status === "ARCHIVED") return "bg-slate-700 text-slate-200";
  if (status === "COMPLETED") return "bg-green-300/10 text-green-300";
  if (status === "IN_PROGRESS") return "bg-blue-300/10 text-blue-300";

  return "bg-yellow-300/10 text-yellow-300";
}

function getObjectKey(job: CustomerJob) {
  const reference = job.licensePlate?.trim().toLowerCase();
  const object = job.vehicle?.trim().toLowerCase();

  if (reference) {
    return `reference:${reference}`;
  }

  if (object) {
    return `object:${object}`;
  }

  return "unknown";
}

function getObjectLabel(job: CustomerJob) {
  const object = job.vehicle?.trim();
  const reference = job.licensePlate?.trim();

  if (object && reference) {
    return `${object} · ${reference}`;
  }

  if (reference) {
    return reference;
  }

  if (object) {
    return object;
  }

  return "Ohne Einsatzort / Referenz";
}

function getNewObjectJobUrl(customerId: string, group: ObjectGroup) {
  const params = new URLSearchParams();

  const object = group.latestJob.vehicle?.trim() || "";
  const reference = group.latestJob.licensePlate?.trim() || "";

  if (object) {
    params.set("vehicle", object);
  }

  if (reference) {
    params.set("licensePlate", reference);
  }

  const queryString = params.toString();

  return queryString
    ? `/customers/${customerId}/jobs/new?${queryString}`
    : `/customers/${customerId}/jobs/new`;
}

function groupJobsByObject(jobs: CustomerJob[]) {
  const groups = new Map<string, ObjectGroup>();

  for (const job of jobs) {
    const key = getObjectKey(job);
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.jobs.push(job);

      if (job.createdAt > existingGroup.latestJob.createdAt) {
        existingGroup.latestJob = job;
      }
    } else {
      groups.set(key, {
        key,
        label: getObjectLabel(job),
        jobs: [job],
        latestJob: job,
      });
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.latestJob.createdAt.getTime() - a.latestJob.createdAt.getTime()
  );
}

function getJobSummary(job: CustomerJob) {
  const openApprovals = job.items.filter(
    (item) => item.approval?.status === "PENDING"
  ).length;

  const rejectedApprovals = job.items.filter(
    (item) => item.approval?.status === "REJECTED"
  ).length;

  const approvedApprovals = job.items.filter(
    (item) => item.approval?.status === "APPROVED"
  ).length;

  const hasBeforeDocumentation = job.items.some(
    (item) => item.type === "VEHICLE_INTAKE"
  );

  if (openApprovals > 0) {
    return {
      label: `${openApprovals} offene Freigabe${openApprovals === 1 ? "" : "n"}`,
      className: "bg-yellow-300/10 text-yellow-300",
    };
  }

  if (rejectedApprovals > 0) {
    return {
      label: "Rückfrage / abgelehnt",
      className: "bg-orange-300/10 text-orange-300",
    };
  }

  if (approvedApprovals > 0) {
    return {
      label: "Freigabe vorhanden",
      className: "bg-green-300/10 text-green-300",
    };
  }

  if (hasBeforeDocumentation) {
    return {
      label: "Vorher-Doku vorhanden",
      className: "bg-blue-300/10 text-blue-300",
    };
  }

  return {
    label: "Ohne Dokumentation",
    className: "bg-white/5 text-slate-300",
  };
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { customerId } = await params;

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId: user.companyId,
    },
    include: {
      jobs: {
        include: {
          items: {
            select: {
              id: true,
              type: true,
              approvalRequired: true,
              approval: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const jobs: CustomerJob[] = customer.jobs;
  const archivedJobs = jobs.filter((job) => job.status === "ARCHIVED");
  const objectGroups = groupJobsByObject(jobs);

  const jobsWithBeforeDocumentation = jobs.filter((job) =>
    job.items.some((item) => item.type === "VEHICLE_INTAKE")
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/customers"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zur Kundenkartei
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Kunde / Firma
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {customer.name}
              </h1>

              <div className="mt-3 space-y-1 text-sm text-slate-400">
                {customer.phone ? (
                  <p>{customer.phone}</p>
                ) : (
                  <p>Keine Telefonnummer hinterlegt</p>
                )}

                {customer.email ? (
                  <p className="break-words">{customer.email}</p>
                ) : (
                  <p>Keine E-Mail-Adresse hinterlegt</p>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:flex sm:items-center">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Kunde bearbeiten
              </Link>

              <Link
                href={`/customers/${customer.id}/jobs/new`}
                className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Auftrag für Kunden anlegen
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Aufträge gesamt</p>
              <p className="mt-2 text-3xl font-bold">{jobs.length}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Einsatzorte/Referenzen</p>
              <p className="mt-2 text-3xl font-bold">{objectGroups.length}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Vorher-Dokus</p>
              <p className="mt-2 text-3xl font-bold">
                {jobsWithBeforeDocumentation}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Archiviert</p>
              <p className="mt-2 text-3xl font-bold">{archivedJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div>
            <h2 className="text-xl font-bold">Einsatzort-Historie</h2>
            <p className="mt-1 text-sm text-slate-400">
              Aufträge gruppiert nach Einsatzort, Objekt oder Referenz.
            </p>
          </div>

          {objectGroups.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="font-semibold">
                Noch keine Einsatzort-Historie vorhanden
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Sobald ein Auftrag angelegt wird, erscheint hier die Historie.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {objectGroups.map((group) => {
                const activeObjectJobs = group.jobs.filter(
                  (job) => job.status !== "ARCHIVED"
                );

                const beforeDocumentations = group.jobs.filter((job) =>
                  job.items.some((item) => item.type === "VEHICLE_INTAKE")
                ).length;

                const openApprovals = group.jobs.reduce((count, job) => {
                  return (
                    count +
                    job.items.filter(
                      (item) => item.approval?.status === "PENDING"
                    ).length
                  );
                }, 0);

                return (
                  <div
                    key={group.key}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Einsatzort / Objekt / Referenz
                        </p>
                        <h3 className="mt-1 text-lg font-bold">
                          {group.label}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            {group.jobs.length} Auftrag
                            {group.jobs.length === 1 ? "" : "e"}
                          </span>

                          <span className="rounded-full bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-300">
                            {beforeDocumentations} Vorher-Doku
                            {beforeDocumentations === 1 ? "" : "s"}
                          </span>

                          {openApprovals > 0 && (
                            <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                              {openApprovals} offene Freigabe
                              {openApprovals === 1 ? "" : "n"}
                            </span>
                          )}

                          {activeObjectJobs.length === 0 && (
                            <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-semibold text-slate-200">
                              Nur archivierte Aufträge
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={getNewObjectJobUrl(customer.id, group)}
                        className="rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-3 text-center text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20 active:scale-[0.98] sm:py-2"
                      >
                        Auftrag für diesen Einsatzort
                      </Link>
                    </div>

                    <div className="mt-4 space-y-2">
                      {group.jobs.map((job) => {
                        const summary = getJobSummary(job);

                        return (
                          <Link
                            key={job.id}
                            href={`/jobs/${job.id}`}
                            className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:bg-slate-800 active:scale-[0.99]"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="font-semibold">{job.title}</p>

                                <p className="mt-1 text-sm text-slate-400">
                                  {new Date(job.createdAt).toLocaleDateString(
                                    "de-DE"
                                  )}
                                  {job.vehicle ? ` · ${job.vehicle}` : ""}
                                  {job.licensePlate
                                    ? ` · ${job.licensePlate}`
                                    : ""}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getJobStatusClass(
                                      job.status
                                    )}`}
                                  >
                                    {getJobStatusLabel(job.status)}
                                  </span>

                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${summary.className}`}
                                  >
                                    {summary.label}
                                  </span>

                                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                                    {job.items.length} Dokumentation
                                    {job.items.length === 1 ? "" : "en"}
                                  </span>
                                </div>
                              </div>

                              <div className="text-sm font-semibold text-slate-300 sm:text-right">
                                Öffnen →
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div>
            <h2 className="text-xl font-bold">Alle Aufträge</h2>
            <p className="mt-1 text-sm text-slate-400">
              Chronologische Auftragshistorie dieses Kunden oder dieser Firma.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="font-semibold">Noch keine Aufträge vorhanden</p>

              <Link
                href={`/customers/${customer.id}/jobs/new`}
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Ersten Auftrag anlegen
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {jobs.map((job) => {
                const summary = getJobSummary(job);

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{job.title}</p>

                        <p className="mt-1 text-sm text-slate-400">
                          {new Date(job.createdAt).toLocaleDateString("de-DE")}
                          {" · "}
                          {job.vehicle || "Kein Einsatzort angegeben"}
                          {job.licensePlate ? ` · ${job.licensePlate}` : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getJobStatusClass(
                              job.status
                            )}`}
                          >
                            {getJobStatusLabel(job.status)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${summary.className}`}
                          >
                            {summary.label}
                          </span>

                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            {job.items.length} Dokumentation
                            {job.items.length === 1 ? "" : "en"}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-slate-300 sm:text-right">
                        Auftrag öffnen →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}