import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type CustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
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

  const activeJobs = customer.jobs.filter((job) => job.status !== "ARCHIVED");
  const archivedJobs = customer.jobs.filter((job) => job.status === "ARCHIVED");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-4xl">
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
                Kunde
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

            <Link
              href={`/customers/${customer.id}/jobs/new`}
              className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Auftrag für Kunden anlegen
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Aufträge gesamt</p>
              <p className="mt-2 text-3xl font-bold">{customer.jobs.length}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Aktive Aufträge</p>
              <p className="mt-2 text-3xl font-bold">{activeJobs.length}</p>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Archiviert</p>
              <p className="mt-2 text-3xl font-bold">{archivedJobs.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Auftragshistorie</h2>
              <p className="mt-1 text-sm text-slate-400">
                Alle bekannten Aufträge dieses Kunden.
              </p>
            </div>
          </div>

          {customer.jobs.length === 0 ? (
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
              {customer.jobs.map((job) => {
                const openApprovals = job.items.filter(
                  (item) => item.approval?.status === "PENDING"
                ).length;

                const hasVehicleIntake = job.items.some(
                  (item) => item.type === "VEHICLE_INTAKE"
                );

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
                          {job.vehicle || "Kein Fahrzeug angegeben"}
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

                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            {job.items.length} Dokumentation
                            {job.items.length === 1 ? "" : "en"}
                          </span>

                          {openApprovals > 0 && (
                            <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-semibold text-yellow-300">
                              {openApprovals} offene Freigabe
                              {openApprovals === 1 ? "" : "n"}
                            </span>
                          )}

                          {hasVehicleIntake && (
                            <span className="rounded-full bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-300">
                              Annahme vorhanden
                            </span>
                          )}
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