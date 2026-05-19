import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PhotoGallery from "@/components/PhotoGallery";

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
  if (type === "VEHICLE_INTAKE") return "Vorher-Dokumentation";
  if (type === "ADDITIONAL_WORK") return "Zusatzleistung / Nachtrag";
  if (type === "DAMAGE_FOUND") return "Mangel / Schaden dokumentiert";
  if (type === "AFTER_DOCUMENTATION") return "Abschluss-Dokumentation";
  if (type === "OTHER") return "Allgemeine Dokumentation";

  return "Dokumentation";
}

export default async function EditDocumentationPage({
  params,
}: EditDocumentationPageProps) {
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
      approval: true,
      photos: true,
      job: true,
    },
  });

  if (!item) {
    notFound();
  }

  const photos: EditPhoto[] = item.photos;
  const canEdit = item.status === "PENDING";
  const isBeforeDocumentation = item.type === "VEHICLE_INTAKE";

  async function updateDocumentation(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceText = String(formData.get("priceText") || "").trim();

    if (!title || !description) {
      redirect(`/jobs/${jobId}/documentation/${itemId}/edit`);
    }

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
      },
    });

    if (!existingItem) {
      redirect(`/jobs/${jobId}`);
    }

    if (existingItem.status !== "PENDING") {
      redirect(`/jobs/${jobId}`);
    }

    await prisma.documentationItem.update({
      where: {
        id: itemId,
      },
      data: {
        title,
        description,
        priceText: priceText || null,
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
            Dokumentation bearbeiten
          </p>

          <h1 className="text-3xl font-bold tracking-tight">{item.title}</h1>

          <p className="mt-3 text-slate-300">
            Du kannst diese Dokumentation bearbeiten, solange sie noch offen ist.
          </p>
        </div>

        {!canEdit && (
          <div className="mt-6 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-yellow-100">
            Diese Dokumentation wurde bereits beantwortet und kann nicht mehr
            bearbeitet werden.
          </div>
        )}

        <form
          action={updateDocumentation}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
            <p className="font-semibold">{getTypeLabel(item.type)}</p>
            <p className="mt-1">
              Diese Angaben erscheinen im Auftrag, im Freigabelink und im
              PDF-Nachweis.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Titel
            </label>
            <input
              name="title"
              type="text"
              defaultValue={item.title}
              disabled={!canEdit || isBeforeDocumentation}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            {isBeforeDocumentation && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Bei einer Vorher-Dokumentation wird der Standardtitel
                normalerweise automatisch gesetzt.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Beschreibung für den Kunden
            </label>
            <textarea
              name="description"
              rows={6}
              defaultValue={item.description}
              disabled={!canEdit || isBeforeDocumentation}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              required
            />

            {isBeforeDocumentation && (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Bei einer Vorher-Dokumentation reicht meist der Foto-Nachweis.
              </p>
            )}
          </div>

          {!isBeforeDocumentation && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Preis / Kostenhinweis
              </label>
              <input
                name="priceText"
                type="text"
                defaultValue={item.priceText || ""}
                disabled={!canEdit}
                placeholder="z. B. ca. 320 € inkl. MwSt. / nach Aufwand"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          )}

          {photos.length > 0 && (
            <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-5">
              <p className="font-semibold">Dokumentationsfotos</p>

              <PhotoGallery photos={photos} />

              <p className="mt-3 text-sm text-slate-400">
                Fotos können aktuell angesehen, aber noch nicht nachträglich
                ersetzt oder ergänzt werden.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!canEdit}
            className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Änderungen speichern
          </button>
        </form>
      </div>
    </main>
  );
}