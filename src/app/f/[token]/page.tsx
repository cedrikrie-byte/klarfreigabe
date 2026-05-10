import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type ApprovalPageProps = {
  params: Promise<{
    token: string;
  }>;
};

type ApprovalPhoto = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

export default async function ApprovalPage({ params }: ApprovalPageProps) {
  const { token } = await params;

  const approval = await prisma.approval.findUnique({
    where: {
      token,
    },
    include: {
      documentationItem: {
        include: {
          photos: true,
          job: {
            include: {
              company: true,
              customer: true,
            },
          },
        },
      },
    },
  });

  if (!approval) {
    notFound();
  }

  const item = approval.documentationItem;
  const job = item.job;
  const company = job.company;

  const photos: ApprovalPhoto[] = item.photos;

  const isAlreadyAnswered =
    approval.status === "APPROVED" || approval.status === "REJECTED";

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-5 sm:py-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Kundenfreigabe
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Zusatzarbeit freigeben
          </h1>

          <p className="mt-3 text-slate-600">
            {company.name} bittet um Ihre Freigabe für eine zusätzliche Arbeit.
          </p>

          <div className="mt-5 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Werkstatt / Betrieb</p>
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

          {isAlreadyAnswered && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold">
                Diese Anfrage wurde bereits beantwortet.
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Aktueller Status:{" "}
                {approval.status === "APPROVED"
                  ? "Freigegeben"
                  : "Rückfrage / abgelehnt"}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Auftrag</p>
            <p className="mt-1 font-semibold">{job.title}</p>

            {(job.vehicle || job.licensePlate) && (
              <p className="mt-1 text-sm text-slate-600">
                {job.vehicle}
                {job.vehicle && job.licensePlate ? " · " : ""}
                {job.licensePlate}
              </p>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Empfohlene Zusatzarbeit</p>
            <p className="mt-1 font-semibold">{item.title}</p>

            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </div>

          {item.priceText && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">Kostenschätzung</p>
              <p className="mt-1 text-2xl font-bold">{item.priceText}</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4">
            <p className="font-semibold">Fotos</p>

            {photos.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Es wurden keine Fotos hinterlegt.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {photos.map((photo: ApprovalPhoto) => (
                  <img
                    key={photo.id}
                    src={photo.fileUrl}
                    alt={photo.fileName || "Dokumentationsfoto"}
                    className="h-36 w-full rounded-2xl border border-slate-200 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          {!isAlreadyAnswered && (
            <div className="mt-6 space-y-3">
              <form action={`/api/approvals/${token}/approve`} method="post">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-semibold text-white"
                >
                  Freigeben
                </button>
              </form>

              <form
                action={`/api/approvals/${token}/reject`}
                method="post"
                className="space-y-3"
              >
                <textarea
                  name="customerComment"
                  rows={4}
                  placeholder="Optional: Rückfrage oder Grund für die Ablehnung..."
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />

                <button
                  type="submit"
                  className="w-full rounded-2xl border border-slate-300 px-5 py-4 font-semibold text-slate-950"
                >
                  Ablehnen / Rückfrage senden
                </button>
              </form>
            </div>
          )}

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Mit der Freigabe bestätigen Sie, dass die oben beschriebene
            Zusatzarbeit durchgeführt werden darf. Bei einer Rückfrage wird Ihre
            Nachricht an die Werkstatt übermittelt.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Erstellt mit KlarFreigabe
        </p>
      </div>
    </main>
  );
}