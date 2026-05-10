import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

type DashboardJob = {
  id: string;
  title: string;
  vehicle: string | null;
  licensePlate: string | null;
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
  };
  items: {
    approval: {
      status: string;
    } | null;
  }[];
};

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
        include: {
          approval: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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

    const statuses = job.items
      .map((item) => item.approval?.status)
      .filter(Boolean);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && statuses.includes("PENDING")) ||
      (statusFilter === "approved" && statuses.includes("APPROVED")) ||
      (statusFilter === "rejected" && statuses.includes("REJECTED")) ||
      (statusFilter === "none" && statuses.length === 0);

    return matchesSearch && matchesStatus;
  });

  const openApprovals = allJobs.reduce((count: number, job: DashboardJob) => {
    return (
      count +
      job.items.filter((item) => item.approval?.status === "PENDING").length
    );
  }, 0);

  const approvedApprovals = allJobs.reduce(
    (count: number, job: DashboardJob) => {
      return (
        count +
        job.items.filter((item) => item.approval?.status === "APPROVED").length
      );
    },
    0
  );

  const rejectedApprovals = allJobs.reduce(
    (count: number, job: DashboardJob) => {
      return (
        count +
        job.items.filter((item) => item.approval?.status === "REJECTED").length
      );
    },
    0
  );

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
    if (statusFilter === "none") return "Ohne Dokumentation";
    return "Alle";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              KlarFreigabe
            </p>
            <h1 className="text-xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              {user.company.name} · {user.name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Link
              href="/jobs/new"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 sm:py-2"
            >
              Neuer Auftrag
            </Link>

            <Link
              href="/settings"
              className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white sm:py-2"
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
                className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white sm:py-2"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Offene Freigaben</p>
            <p className="mt-2 text-4xl font-bold">{openApprovals}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Freigegeben</p>
            <p className="mt-2 text-4xl font-bold">{approvedApprovals}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Abgelehnt</p>
            <p className="mt-2 text-4xl font-bold">{rejectedApprovals}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4 sm:mt-8 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">Letzte Aufträge</h2>
              <p className="mt-1 text-sm text-slate-400">
                Suche und filtere deine Werkstattaufträge.
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
                placeholder="Auftrag suchen..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:w-72"
              />

              <button
                type="submit"
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
              >
                Suchen
              </button>
            </form>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            <Link
              href={buildFilterUrl("all")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ${
                statusFilter === "all"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white"
              }`}
            >
              Alle
            </Link>

            <Link
              href={buildFilterUrl("pending")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ${
                statusFilter === "pending"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white"
              }`}
            >
              Offen
            </Link>

            <Link
              href={buildFilterUrl("approved")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ${
                statusFilter === "approved"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white"
              }`}
            >
              Freigegeben
            </Link>

            <Link
              href={buildFilterUrl("rejected")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ${
                statusFilter === "rejected"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white"
              }`}
            >
              Rückfrage / abgelehnt
            </Link>

            <Link
              href={buildFilterUrl("none")}
              className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold ${
                statusFilter === "none"
                  ? "bg-white text-slate-950"
                  : "border border-white/10 text-white"
              }`}
            >
              Ohne Dokumentation
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

              <Link href="/dashboard" className="text-sm font-semibold text-white">
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
              {filteredJobs.map((job: DashboardJob) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:bg-slate-800"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{job.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {job.customer.name}
                        {job.vehicle ? ` · ${job.vehicle}` : ""}
                        {job.licensePlate ? ` · ${job.licensePlate}` : ""}
                      </p>
                    </div>

                    <div className="text-sm text-slate-400 sm:text-right">
                      {job.items.length === 0 ? (
                        "Keine Dokumentation"
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span>{job.items.length} Dokumentation(en)</span>
                          <span>
                            {job.items.some(
                              (item) => item.approval?.status === "PENDING"
                            )
                              ? "Offene Freigabe"
                              : job.items.some(
                                    (item) =>
                                      item.approval?.status === "APPROVED"
                                  )
                                ? "Freigegeben"
                                : job.items.some(
                                      (item) =>
                                        item.approval?.status === "REJECTED"
                                    )
                                  ? "Rückfrage / abgelehnt"
                                  : "Keine Freigabe"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}