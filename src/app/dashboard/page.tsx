import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

type DashboardJobItem = {
  type: string;
  approvalRequired: boolean;
  approval: {
    status: string;
  } | null;
};

type DashboardJob = {
  id: string;
  title: string;
  status: string;
  vehicle: string | null;
  licensePlate: string | null;
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
  };
  items: DashboardJobItem[];
};

function getJobSummary(job: DashboardJob) {
  if (job.status === "ARCHIVED") {
    return {
      label: "Archiviert",
      className: "bg-slate-700 text-slate-200",
    };
  }

  const hasBeforeDocumentation = job.items.some(
    (item) => item.type === "VEHICLE_INTAKE"
  );

  const openApprovals = job.items.filter(
    (item) => item.approval?.status === "PENDING"
  ).length;

  const approvedApprovals = job.items.filter(
    (item) => item.approval?.status === "APPROVED"
  ).length;

  const rejectedApprovals = job.items.filter(
    (item) => item.approval?.status === "REJECTED"
  ).length;

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
    className: "bg-slate-700 text-slate-200",
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { q, status } = await searchParams;
  const searchQuery = q?.trim() || "";
  const statusFilter = status?.trim() || "all";

  const allJobs: DashboardJob[] = await prisma.job.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      customer: true,
      items: {
        select: {
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
  });

  const customerCount = await prisma.customer.count({
    where: {
      companyId: user.companyId,
    },
  });

  const activeJobs = allJobs.filter((job) => job.status !== "ARCHIVED");
  const archivedJobs = allJobs.filter((job) => job.status === "ARCHIVED");

  const filteredJobs = allJobs.filter((job: DashboardJob) => {
    const searchText = [
      job.title,
      job.vehicle,
      job.licensePlate,
      job.customer.name,
      job.customer.phone,
      job.customer.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !searchQuery || searchText.includes(searchQuery.toLowerCase());

    const hasBeforeDocumentation = job.items.some(
      (item) => item.type === "VEHICLE_INTAKE"
    );

    const statuses = job.items
      .map((item) => item.approval?.status)
      .filter(Boolean);

    const matchesStatus =
      statusFilter === "archived"
        ? job.status === "ARCHIVED"
        : job.status !== "ARCHIVED" &&
          (statusFilter === "all" ||
            (statusFilter === "pending" && statuses.includes("PENDING")) ||
            (statusFilter === "approved" && statuses.includes("APPROVED")) ||
            (statusFilter === "rejected" && statuses.includes("REJECTED")) ||
            (statusFilter === "before" && hasBeforeDocumentation) ||
            (statusFilter === "none" && job.items.length === 0));

    return matchesSearch && matchesStatus;
  });

  const openApprovals = activeJobs.reduce((count: number, job: DashboardJob) => {
    return (
      count +
      job.items.filter((item) => item.approval?.status === "PENDING").length
    );
  }, 0);

  const approvedApprovals = activeJobs.reduce(
    (count: number, job: DashboardJob) => {
      return (
        count +
        job.items.filter((item) => item.approval?.status === "APPROVED").length
      );
    },
    0
  );

  const rejectedApprovals = activeJobs.reduce(
    (count: number, job: DashboardJob) => {
      return (
        count +
        job.items.filter((item) => item.approval?.status === "REJECTED").length
      );
    },
    0
  );

  const jobsWithoutDocumentation = activeJobs.filter(
    (job) => job.items.length === 0
  ).length;

  const jobsWithBeforeDocumentation = activeJobs.filter((job) =>
    job.items.some((item) => item.type === "VEHICLE_INTAKE")
  ).length;

  function buildFilterUrl(nextStatus: string) {
    const params = new URLSearchParams();

    if (searchQuery) {
      params.set("q", searchQuery);
    }

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    const queryString = params.toString();

    return queryString ? `/dashboard?${queryString}` : "/dashboard";
  }

  function getStatusLabel() {
    if (statusFilter === "pending") return "Offen";
    if (statusFilter === "approved") return "Freigegeben";
    if (statusFilter === "rejected") return "Rückfrage / abgelehnt";
    if (statusFilter === "before") return "Mit Vorher-Dokumentation";
    if (statusFilter === "none") return "Ohne Dokumentation";
    if (statusFilter === "archived") return "Archiviert";
    return "Alle aktiven";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {APP_NAME}
            </p>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              {user.company.name} · {user.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Link
              href="/jobs/new"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] sm:py-2"
            >
              Neuer Auftrag
            </Link>

            <Link
              href="/customers"
              className="rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-3 text-center text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20 active:scale-[0.98] sm:py-2"
            >
              Kundenkartei
            </Link>

            <Link
              href="/settings"
              className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
            >
              Einstellungen
            </Link>

            <form
              action="/api/logout"
              method="post"
              className="col-span-2 sm:col-span-1"
            >
              <button
                type="submit"
                className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-4 sm:grid-cols-5">
          <Link
            href={buildFilterUrl("pending")}
            className="rounded-3xl border border-yellow-300/20 bg-yellow-300/10 p-5 transition hover:bg-yellow-300/15 active:scale-[0.98]"
          >
            <p className="text-sm text-yellow-100">Offene Freigaben</p>
            <p className="mt-2 text-4xl font-bold text-yellow-300">
              {openApprovals}
            </p>
          </Link>

          <Link
            href={buildFilterUrl("before")}
            className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5 transition hover:bg-blue-300/15 active:scale-[0.98]"
          >
            <p className="text-sm text-blue-100">Vorher-Dokus</p>
            <p className="mt-2 text-4xl font-bold text-blue-300">
              {jobsWithBeforeDocumentation}
            </p>
          </Link>

          <Link
            href="/customers"
            className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5 transition hover:bg-blue-300/15 active:scale-[0.98]"
          >
            <p className="text-sm text-blue-100">Kunden</p>
            <p className="mt-2 text-4xl font-bold text-blue-300">
              {customerCount}
            </p>
          </Link>

          <Link
            href={buildFilterUrl("none")}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 active:scale-[0.98]"
          >
            <p className="text-sm text-slate-400">Ohne Dokumentation</p>
            <p className="mt-2 text-4xl font-bold">
              {jobsWithoutDocumentation}
            </p>
          </Link>

          <Link
            href={buildFilterUrl("archived")}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10 active:scale-[0.98]"
          >
            <p className="text-sm text-slate-400">Archiviert</p>
            <p className="mt-2 text-4xl font-bold">{archivedJobs.length}</p>
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/jobs/new"
            className="rounded-3xl bg-white p-5 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
          >
            + Neuen Auftrag anlegen
            <p className="mt-2 text-sm font-normal text-slate-600">
              Neuen Kunden, Einsatzort und Aufgabe erfassen.
            </p>
          </Link>

          <Link
            href="/customers"
            className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5 font-semibold text-blue-100 transition hover:bg-blue-300/20 active:scale-[0.98]"
          >
            Kundenkartei öffnen
            <p className="mt-2 text-sm font-normal text-blue-100/80">
              Bestehenden Kunden finden und Auftrag zur Historie hinzufügen.
            </p>
          </Link>

          <Link
            href={buildFilterUrl("none")}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            Aufträge ohne Dokumentation prüfen
            <p className="mt-2 text-sm font-normal text-slate-400">
              Schnell sehen, wo noch keine Fotos oder Nachweise vorhanden sind.
            </p>
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:mt-8 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                {statusFilter === "archived"
                  ? "Archivierte Aufträge"
                  : "Aktive Aufträge"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Suche nach Kunde, Firma, Einsatzort, Referenz oder Aufgabe.
              </p>
            </div>

            <form action="/dashboard" className="flex flex-col gap-2 sm:flex-row">
              {statusFilter !== "all" && (
                <input type="hidden" name="status" value={statusFilter} />
              )}

              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Kunde, Einsatzort, Referenz..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:w-80"
              />

              <button
                type="submit"
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Suchen
              </button>
            </form>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            <Link
              href={buildFilterUrl("all")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "all"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Aktive
            </Link>

            <Link
              href={buildFilterUrl("pending")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "pending"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Offen
            </Link>

            <Link
              href={buildFilterUrl("approved")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "approved"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Freigegeben
            </Link>

            <Link
              href={buildFilterUrl("rejected")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "rejected"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Rückfrage / abgelehnt
            </Link>

            <Link
              href={buildFilterUrl("before")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "before"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Vorher-Dokumentation
            </Link>

            <Link
              href={buildFilterUrl("none")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "none"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Ohne Dokumentation
            </Link>

            <Link
              href={buildFilterUrl("archived")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.98] ${
                statusFilter === "archived"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Archiviert
            </Link>
          </div>

          {(searchQuery || statusFilter !== "all") && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                Aktive Filter:{" "}
                <span className="font-semibold text-white">
                  Suche: {searchQuery || "Keine"}
                </span>
                <span className="font-semibold text-white">
                  {" "}
                  · Status: {getStatusLabel()}
                </span>
              </p>

              <Link
                href="/dashboard"
                className="text-sm font-semibold text-white transition hover:text-slate-300 active:scale-[0.98]"
              >
                Filter zurücksetzen
              </Link>
            </div>
          )}

          {filteredJobs.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="font-semibold">Keine passenden Aufträge gefunden</p>
              <p className="mt-2 text-sm text-slate-400">
                Ändere den Suchbegriff oder setze die Filter zurück.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredJobs.map((job: DashboardJob) => {
                const summary = getJobSummary(job);
                const hasBeforeDocumentation = job.items.some(
                  (item) => item.type === "VEHICLE_INTAKE"
                );

                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{job.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {job.customer.name}
                          {job.vehicle ? ` · ${job.vehicle}` : ""}
                          {job.licensePlate ? ` · ${job.licensePlate}` : ""}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${summary.className}`}
                          >
                            {summary.label}
                          </span>

                          {hasBeforeDocumentation && (
                            <span className="rounded-full bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-300">
                              Vorher-Doku vorhanden
                            </span>
                          )}

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
          )}
        </div>
      </section>
    </main>
  );
}