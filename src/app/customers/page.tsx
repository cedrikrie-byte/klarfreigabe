import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

type CustomerListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  jobs: {
    id: string;
    title: string;
    vehicle: string | null;
    licensePlate: string | null;
    status: string;
    createdAt: Date;
  }[];
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { q } = await searchParams;
  const searchQuery = q?.trim() || "";

  const customers: CustomerListItem[] = await prisma.customer.findMany({
    where: {
      companyId: user.companyId,
    },
    include: {
      jobs: {
        orderBy: {
          createdAt: "desc",
        },
        take: 3,
        select: {
          id: true,
          title: true,
          vehicle: true,
          licensePlate: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const filteredCustomers = customers.filter((customer) => {
    const searchText = [
      customer.name,
      customer.phone,
      customer.email,
      ...customer.jobs.map((job) => job.title),
      ...customer.jobs.map((job) => job.vehicle),
      ...customer.jobs.map((job) => job.licensePlate),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return !searchQuery || searchText.includes(searchQuery.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {APP_NAME}
            </p>
            <h1 className="text-xl font-bold">Kundenkartei</h1>
            <p className="mt-1 text-sm text-slate-400">
              Kunden, Firmen, Einsatzorte und bisherige Aufträge durchsuchen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] sm:py-2"
            >
              Dashboard
            </Link>

            <Link
              href="/jobs/new"
              className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] sm:py-2"
            >
              Neuer Auftrag
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-bold">Kunden / Firmen</h2>
              <p className="mt-1 text-sm text-slate-400">
                {customers.length} Kunde{customers.length === 1 ? "" : "n"}{" "}
                oder Firma{customers.length === 1 ? "" : "en"} in deiner
                Kartei.
              </p>
            </div>

            <form action="/customers" className="flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Kunde, Firma, Einsatzort, Referenz..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:w-96"
              />

              <button
                type="submit"
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Suchen
              </button>
            </form>
          </div>

          {searchQuery && (
            <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-300">
                Suche: <span className="font-semibold">{searchQuery}</span>
              </p>

              <Link
                href="/customers"
                className="text-sm font-semibold text-white transition hover:text-slate-300"
              >
                Suche zurücksetzen
              </Link>
            </div>
          )}

          {filteredCustomers.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="font-semibold">
                Keine passenden Kunden oder Firmen gefunden
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Lege einen neuen Auftrag an, um einen neuen Kunden oder eine
                neue Firma zu erstellen.
              </p>

              <Link
                href="/jobs/new"
                className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Neuer Auftrag
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredCustomers.map((customer) => {
                const latestJob = customer.jobs[0];

                return (
                  <Link
                    key={customer.id}
                    href={`/customers/${customer.id}`}
                    className="block rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:bg-slate-800 active:scale-[0.99]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{customer.name}</p>

                        <div className="mt-1 space-y-1 text-sm text-slate-400">
                          {customer.phone && <p>{customer.phone}</p>}
                          {customer.email && (
                            <p className="break-words">{customer.email}</p>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                            {customer.jobs.length} letzter Auftrag
                            {customer.jobs.length === 1 ? "" : "e"} geladen
                          </span>

                          {latestJob?.vehicle && (
                            <span className="rounded-full bg-blue-300/10 px-3 py-1 text-xs font-semibold text-blue-300">
                              {latestJob.vehicle}
                            </span>
                          )}

                          {latestJob?.licensePlate && (
                            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                              {latestJob.licensePlate}
                            </span>
                          )}
                        </div>

                        {latestJob && (
                          <p className="mt-3 text-sm text-slate-500">
                            Letzter Auftrag: {latestJob.title}
                            {latestJob.vehicle
                              ? ` · ${latestJob.vehicle}`
                              : ""}
                            {latestJob.licensePlate
                              ? ` · ${latestJob.licensePlate}`
                              : ""}
                          </p>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-slate-300 sm:text-right">
                        Kundenakte öffnen →
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