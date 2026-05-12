import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type PdfPageProps = {
  params: Promise<{
    jobId: string;
    itemId: string;
  }>;
};

type PdfPhoto = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

function getTypeLabel(type: string) {
  if (type === "VEHICLE_INTAKE") return "Fahrzeugannahme";
  if (type === "ADDITIONAL_WORK") return "Zusatzarbeit";
  if (type === "DAMAGE_FOUND") return "Schaden entdeckt";
  if (type === "AFTER_DOCUMENTATION") return "Nachher-Dokumentation";
  if (type === "OTHER") return "Sonstige Dokumentation";

  return "Dokumentation";
}

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
  const photos: PdfPhoto[] = item.photos;

  const statusLabel = getStatusLabel(
    item.status,
    item.type,
    item.approvalRequired
  );

  const isVehicleIntake = item.type === "VEHICLE_INTAKE";

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm print:rounded-none print:shadow-none">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {APP_NAME} Nachweis
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

            {company.phone && (
              <p className="mt-1 text-sm text-slate-600">{company.phone}</p>
            )}

            {company.email && (
              <p className="mt-1 text-sm text-slate-600">{company.email}</p>
            )}

            {company.address && (
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {company.address}
              </p>
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

          {job.notes && (
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {job.notes}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">{getTypeLabel(item.type)}</p>
          <h2 className="mt-1 text-2xl font-bold">{item.title}</h2>

          {isVehicleIntake ? (
            <p className="mt-3 leading-7 text-slate-700">
              Zustand des Fahrzeugs bei Abgabe dokumentiert. Diese Fotos dienen
              als Nachweis bei späteren Rückfragen oder Reklamationen.
            </p>
          ) : (
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
              {item.description}
            </p>
          )}

          {item.priceText && item.approvalRequired && (
            <p className="mt-4 text-lg font-semibold">
              Kostenschätzung: {item.priceText}
            </p>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Status</p>
          <p className="mt-1 text-xl font-bold">{statusLabel}</p>

          {item.approval?.emailSentAt && (
            <p className="mt-2 text-sm text-slate-700">
              Freigabe-Mail zuletzt gesendet am:{" "}
              {new Date(item.approval.emailSentAt).toLocaleString("de-DE")}
            </p>
          )}

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
              <p className="mt-1 whitespace-pre-line text-sm leading-6 text-orange-900">
                {item.approval.customerComment}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Fotos</h2>
              {photos.length > 0 && (
                <p className="mt-1 text-sm text-slate-600">
                  {photos.length} Foto{photos.length === 1 ? "" : "s"}{" "}
                  dokumentiert
                </p>
              )}
            </div>
          </div>

          {photos.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Es wurden keine Fotos hinterlegt.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {photos.map((photo: PdfPhoto, index) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="relative">
                    <img
                      src={photo.fileUrl}
                      alt={photo.fileName || `Dokumentationsfoto ${index + 1}`}
                      loading="lazy"
                      className="h-52 w-full object-cover print:h-44"
                    />

                    <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                  </div>

                  <div className="p-3 text-xs text-slate-500">
                    Foto {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500">
          <p>
            Dieser Nachweis wurde mit {APP_NAME} erstellt. Die Angaben basieren
            auf den im System gespeicherten Auftrags-, Dokumentations- und
            Freigabedaten.
          </p>
        </footer>

        <div className="mt-6 print:hidden">
          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98]"
          >
            Zurück zum Auftrag
          </Link>
        </div>
      </div>
    </main>
  );
}