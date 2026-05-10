import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PdfPageProps = {
  params: Promise<{
    jobId: string;
    itemId: string;
  }>;
};

export default async function DocumentationPdfPage({ params }: PdfPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId, itemId } = await params;

  const item = await prisma.documentationItem.findFirst({
    where: {
      id: itemId,
      job: {
        id: jobId,
        companyId: user.companyId,
      },
    },
    include: {
      photos: true,
      approval: true,
      job: {
        include: {
          company: true,
          customer: true,
        },
      },
    },
  });

  if (!item) {
    notFound();
  }

  const job = item.job;
  const company = job.company;
  const customer = job.customer;

  const statusLabel =
    item.status === "PENDING"
      ? "Offen"
      : item.status === "APPROVED"
        ? "Freigegeben"
        : item.status === "REJECTED"
          ? "Rückfrage / abgelehnt"
          : item.status;

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm print:rounded-none print:shadow-none">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              KlarFreigabe Nachweis
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Dokumentationsnachweis
            </h1>
          </div>

          <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700 print:hidden">
            <p className="font-semibold">PDF speichern</p>
            <p className="mt-1">
              Drücke <strong>Strg + P</strong> und wähle dann{" "}
              <strong>Als PDF speichern</strong>.
            </p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Betrieb</p>
            <p className="mt-1 font-semibold">{company.name}</p>

            {company.email && (
              <p className="mt-1 text-sm text-slate-600">{company.email}</p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Kunde</p>
            <p className="mt-1 font-semibold">{customer.name}</p>

            {customer.phone && (
              <p className="mt-1 text-sm text-slate-600">{customer.phone}</p>
            )}

            {customer.email && (
              <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-slate-100 p-4">
          <p className="text-sm text-slate-500">Auftrag</p>
          <p className="mt-1 font-semibold">{job.title}</p>

          {(job.vehicle || job.licensePlate) && (
            <p className="mt-1 text-sm text-slate-600">
              {job.vehicle}
              {job.vehicle && job.licensePlate ? " · " : ""}
              {job.licensePlate}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Dokumentation</p>
          <h2 className="mt-1 text-2xl font-bold">{item.title}</h2>

          <p className="mt-3 leading-7 text-slate-700">{item.description}</p>

          {item.priceText && (
            <p className="mt-4 text-lg font-semibold">
              Kostenschätzung: {item.priceText}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Freigabestatus</p>
          <p className="mt-1 text-xl font-bold">{statusLabel}</p>

          {item.approval?.approvedAt && (
            <p className="mt-2 text-sm text-slate-700">
              Freigegeben am:{" "}
              {new Date(item.approval.approvedAt).toLocaleString("de-DE")}
            </p>
          )}

          {item.approval?.rejectedAt && (
            <p className="mt-2 text-sm text-slate-700">
              Rückfrage gesendet am:{" "}
              {new Date(item.approval.rejectedAt).toLocaleString("de-DE")}
            </p>
          )}

          {item.approval?.customerComment && (
            <div className="mt-4 rounded-2xl bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-900">
                Rückfrage vom Kunden
              </p>
              <p className="mt-1 text-sm leading-6 text-orange-900">
                {item.approval.customerComment}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-bold">Fotos</h2>

          {item.photos.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Es wurden keine Fotos hinterlegt.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {item.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.fileUrl}
                  alt={photo.fileName || "Dokumentationsfoto"}
                  className="h-64 w-full rounded-2xl border border-slate-200 object-cover"
                />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500">
          <p>
            Dieser Nachweis wurde mit KlarFreigabe erstellt. Die Angaben basieren
            auf den im System gespeicherten Auftrags-, Dokumentations- und
            Freigabedaten.
          </p>
        </footer>

        <div className="mt-6 print:hidden">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-950"
          >
            Zurück zum Auftrag
          </Link>
        </div>
      </div>
    </main>
  );
}