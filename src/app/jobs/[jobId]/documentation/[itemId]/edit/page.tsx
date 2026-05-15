import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DocumentationPhotoManager from "@/components/DocumentationPhotoManager";
import FormSubmitButton from "@/components/FormSubmitButton";

type EditDocumentationPageProps = {
  params: Promise<{
    jobId: string;
    itemId: string;
  }>;
};

type EditPhoto = {
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

function canEditItem(status: string, approvalRequired: boolean) {
  if (!approvalRequired) {
    return true;
  }

  return status === "PENDING";
}

export default async function EditDocumentationPage({
  params,
  searchParams,
}: EditDocumentationPageProps & {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId, itemId } = await params;
  const { error } = await searchParams;

  const item = await prisma.documentationItem.findFirst({
    where: {
      id: itemId,
      job: {
        id: jobId,
        companyId: user.companyId,
      },
    },
    include: {
      approval: true,
      photos: true,
      job: true,
    },
  });

  if (!item) {
    notFound();
  }

  const photos: EditPhoto[] = item.photos;
  const isArchived = item.job.status === "ARCHIVED";
  const canEdit = canEditItem(item.status, item.approvalRequired) && !isArchived;
  const isVehicleIntake = item.type === "VEHICLE_INTAKE";
  const isSimplePhotoDocumentation =
    item.type === "VEHICLE_INTAKE" || item.type === "AFTER_DOCUMENTATION";

  async function updateDocumentation(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceText = String(formData.get("priceText") || "").trim();

    const existingItem = await prisma.documentationItem.findFirst({
      where: {
        id: itemId,
        job: {
          id: jobId,
          companyId: currentUser.companyId,
        },
      },
      include: {
        approval: true,
        job: true,
      },
    });

    if (!existingItem) {
      redirect(`/jobs/${jobId}`);
    }

    const existingCanEdit =
      canEditItem(existingItem.status, existingItem.approvalRequired) &&
      existingItem.job.status !== "ARCHIVED";

    if (!existingCanEdit) {
      redirect(`/jobs/${jobId}`);
    }

    const existingIsSimplePhotoDocumentation =
      existingItem.type === "VEHICLE_INTAKE" ||
      existingItem.type === "AFTER_DOCUMENTATION";

    const finalTitle =
      existingIsSimplePhotoDocumentation && !title
        ? existingItem.title
        : title;

    const finalDescription =
      existingIsSimplePhotoDocumentation && !description
        ? existingItem.description
        : description;

    if (!finalTitle || !finalDescription) {
      redirect(`/jobs/${jobId}/documentation/${itemId}/edit?error=missing`);
    }

    await prisma.documentationItem.update({
      where: {
        id: itemId,
      },
      data: {
        title: finalTitle,
        description: finalDescription,
        priceText: existingItem.approvalRequired ? priceText || null : null,
      },
    });

    redirect(`/jobs/${jobId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zum Auftrag
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {getTypeLabel(item.type)} bearbeiten
          </p>

          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>

          <p className="mt-3 text-slate-300">
            {item.approvalRequired
              ? "Du kannst diese Freigabe bearbeiten, solange sie noch offen ist."
              : "Diese Dokumentation ist ein interner Nachweis ohne Kundenfreigabe."}
          </p>
        </div>

        {isArchived && (
          <div className="mt-6 rounded-2xl border border-slate-500/30 bg-slate-800 p-4 text-sm leading-6 text-slate-200">
            Dieser Auftrag ist archiviert. Dokumentationen und Fotos können
            angesehen, aber nicht bearbeitet werden.
          </div>
        )}

        {!canEdit && !isArchived && (
          <div className="mt-6 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
            Diese Dokumentation wurde bereits beantwortet und kann nicht mehr
            bearbeitet werden. Dadurch bleiben Freigabe und Nachweis
            nachvollziehbar.
          </div>
        )}

        {error === "missing" && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            Bitte fülle Titel und Beschreibung aus.
          </div>
        )}

        <form
          action={updateDocumentation}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          {isVehicleIntake ? (
            <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
              <p className="font-semibold">Fahrzeugannahme</p>
              <p className="mt-2">
                Die Fahrzeugannahme ist als reine Foto-Dokumentation gedacht.
                Titel, Beschreibung und Preis werden bewusst nicht benötigt.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Titel <span className="text-red-300">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  defaultValue={item.title}
                  disabled={!canEdit}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  required={!isSimplePhotoDocumentation}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Beschreibung für den Kunden{" "}
                  <span className="text-red-300">*</span>
                </label>
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={item.description}
                  disabled={!canEdit}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  required={!isSimplePhotoDocumentation}
                />
              </div>

              {item.approvalRequired && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Preis / Kostenschätzung
                  </label>
                  <input
                    name="priceText"
                    type="text"
                    defaultValue={item.priceText || ""}
                    disabled={!canEdit}
                    placeholder="ca. 320 € inkl. MwSt."
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              )}
            </>
          )}

          <DocumentationPhotoManager
            itemId={item.id}
            photos={photos}
            canEdit={canEdit}
          />

          <FormSubmitButton
            idleLabel={
              isVehicleIntake
                ? "Fahrzeugannahme schließen"
                : "Änderungen speichern"
            }
            pendingLabel={
              isVehicleIntake
                ? "Wird geschlossen..."
                : "Änderungen werden gespeichert..."
            }
            disabled={!canEdit}
          />
        </form>
      </div>
    </main>
  );
}