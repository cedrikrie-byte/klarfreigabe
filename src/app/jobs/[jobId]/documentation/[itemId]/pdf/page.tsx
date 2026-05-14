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

function getDocumentTitle(type: string, approvalRequired: boolean) {
  if (type === "VEHICLE_INTAKE") return "Zustandsnachweis Fahrzeugannahme";
  if (approvalRequired) return "Freigabe- und Dokumentationsnachweis";
  if (type === "AFTER_DOCUMENTATION") return "Nachher-Dokumentationsnachweis";

  return "Dokumentationsnachweis";
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

  if (status === "PENDING") return "Offen / noch nicht beantwortet";
  if (status === "APPROVED") return "Vom Kunden freigegeben";
  if (status === "REJECTED") return "Rückfrage / abgelehnt";

  return status;
}

function getStatusBoxClass(status: string, approvalRequired: boolean) {
  if (!approvalRequired) {
    return "border-blue-200 bg-blue-50 text-blue-950";
  }

  if (status === "APPROVED") {
    return "border-green-200 bg-green-50 text-green-950";
  }

  if (status === "REJECTED") {
    return "border-orange-200 bg-orange-50 text-orange-950";
  }

  return "border-yellow-200 bg-yellow-50 text-yellow-950";
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("de-DE");
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

  const isVehicleIntake = item.type === "VEHICLE_INTAKE";
  const documentTitle = getDocumentTitle(item.type, item.approvalRequired);
  const statusLabel = getStatusLabel(
    item.status,
    item.type,
    item.approvalRequired
  );
  const statusBoxClass = getStatusBoxClass(item.status, item.approvalRequired);

  const createdAt = formatDate(item.createdAt);
  const updatedAt = formatDate(item.updatedAt);
  const emailSentAt = formatDate(item.approval?.emailSentAt);
  const approvedAt = formatDate(item.approval?.approvedAt);
  const rejectedAt = formatDate(item.approval?.rejectedAt);

  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-sm print:rounded-none print:p-6 print:shadow-none">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {APP_NAME} Nachweis
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {documentTitle}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Erstellt am: {createdAt}
            </p>
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
          <div className="rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Betrieb
            </p>
            <p className="mt-2 font-semibold">{company.name}</p>

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

          <div className="rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Kunde
            </p>
            <p className="mt-2 font-semibold">{customer.name}</p>

            {customer.phone && (
              <p className="mt-1 text-sm text-slate-600">{customer.phone}</p>
            )}

            {customer.email && (
              <p className="mt-1 text-sm text-slate-600">{customer.email}</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Auftrag
          </p>
          <p className="mt-2 font-semibold">{job.title}</p>

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {getTypeLabel(item.type)}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{item.title}</h2>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${statusBoxClass}`}
            >
              {statusLabel}
            </div>
          </div>

          {isVehicleIntake ? (
            <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-950">
              Der Zustand des Fahrzeugs wurde bei Abgabe dokumentiert. Diese
              Fotodokumentation dient als Nachweis bei späteren Rückfragen,
              Reklamationen oder Unklarheiten zum Fahrzeugzustand.
            </div>
          ) : (
            <p className="mt-4 whitespace-pre-line leading-7 text-slate-700">
              {item.description}
            </p>
          )}

          {item.priceText && item.approvalRequired && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Kostenschätzung</p>
              <p className="mt-1 text-xl font-bold">{item.priceText}</p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zeitpunkte und Status
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
              <p className="text-sm text-slate-500">Dokumentation erstellt</p>
              <p className="mt-1 font-semibold">{createdAt}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
              <p className="text-sm text-slate-500">Zuletzt aktualisiert</p>
              <p className="mt-1 font-semibold">{updatedAt}</p>
            </div>

            {emailSentAt && (
              <div className="rounded-2xl bg-slate-100 p-4 print:border print:border-slate-200 print:bg-white">
                <p className="text-sm text-slate-500">
                  Freigabe-Mail zuletzt gesendet
                </p>
                <p className="mt-1 font-semibold">{emailSentAt}</p>
              </div>
            )}

            {approvedAt && (
              <div className="rounded-2xl bg-green-50 p-4 text-green-950 print:border print:border-green-200">
                <p className="text-sm">Kundenfreigabe erteilt</p>
                <p className="mt-1 font-semibold">{approvedAt}</p>
              </div>
            )}

            {rejectedAt && (
              <div className="rounded-2xl bg-orange-50 p-4 text-orange-950 print:border print:border-orange-200">
                <p className="text-sm">Rückfrage / Ablehnung gesendet</p>
                <p className="mt-1 font-semibold">{rejectedAt}</p>
              </div>
            )}
          </div>

          {item.approvalRequired && (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Dieser Nachweis dokumentiert den gespeicherten Stand der
              Kundenfreigabe. Bei Freigabe wurde die Durchführung der oben
              beschriebenen Zusatzarbeit durch den Kunden bestätigt.
            </p>
          )}

          {item.approval?.customerComment && (
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-orange-950 print:border print:border-orange-200">
              <p className="text-sm font-semibold">Rückfrage vom Kunden</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">
                {item.approval.customerComment}
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 print:break-before-auto">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Fotodokumentation</h2>
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
            <div className="mt-4 grid grid-cols-2 gap-4 print:gap-3">
              {photos.map((photo: PdfPhoto, index) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 print:rounded-xl"
                >
                  <div className="relative">
                    <img
                      src={photo.fileUrl}
                      alt={photo.fileName || `Dokumentationsfoto ${index + 1}`}
                      loading="lazy"
                      className="h-56 w-full object-cover print:h-44"
                    />

                    <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                      Foto {index + 1}
                    </span>
                  </div>

                  <div className="p-3 text-xs text-slate-500">
                    <p className="font-semibold text-slate-700">
                      Foto {index + 1}
                    </p>
                    {photo.fileName && (
                      <p className="mt-1 truncate">{photo.fileName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-xs leading-5 text-slate-500">
          <p>
            Dieser Nachweis wurde mit {APP_NAME} erstellt. Die Angaben basieren
            auf den im System gespeicherten Auftrags-, Dokumentations-,
            Foto- und Freigabedaten.
          </p>
          <p className="mt-2">
            Änderungen an Auftrag, Dokumentation oder Fotos nach Erstellung des
            Nachweises können den sichtbaren Inhalt dieses Nachweises verändern.
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