import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { saved } = await searchParams;
  const wasSaved = saved === "1";

  async function updateCompany(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (!name) {
      redirect("/settings");
    }

    await prisma.company.update({
      where: {
        id: currentUser.companyId,
      },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      },
    });

    redirect("/settings?saved=1");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zum Dashboard
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {APP_NAME}
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Betriebsdaten bearbeiten
          </h1>

          <p className="mt-3 text-slate-300">
            Diese Angaben erscheinen auf Kundenfreigaben, PDF-Nachweisen und in
            Freigabe-E-Mails. Besonders die E-Mail-Adresse ist wichtig, damit
            Kunden direkt an deinen Betrieb antworten können.
          </p>
        </div>

        {wasSaved && (
          <div className="mt-6 rounded-2xl border border-green-300/20 bg-green-300/10 p-4 text-sm font-semibold text-green-200">
            Betriebsdaten wurden gespeichert.
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5 text-sm leading-6 text-blue-100">
          <p className="font-semibold">Wichtig für echte Kundenkommunikation</p>
          <p className="mt-2">
            Wenn hier eine Betriebs-E-Mail eingetragen ist, nutzt FreigabeOnline
            sie als Antwortadresse für Freigabe-Mails. Kunden können dann
            direkt auf die Mail antworten und landen bei deinem Betrieb.
          </p>
        </div>

        <form
          action={updateCompany}
          className="mt-5 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Betriebsname <span className="text-red-300">*</span>
            </label>
            <input
              name="name"
              type="text"
              defaultValue={user.company.name}
              placeholder="Musterwerkstatt GmbH"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
            <p className="mt-2 text-xs text-slate-500">
              Wird auf Kundenseiten, PDFs und E-Mails angezeigt.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Telefon
              </label>
              <input
                name="phone"
                type="tel"
                defaultValue={user.company.phone || ""}
                placeholder="+49 170 1234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Erscheint auf Kundenseite und PDF.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                E-Mail
              </label>
              <input
                name="email"
                type="email"
                defaultValue={user.company.email || ""}
                placeholder="info@werkstatt.de"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Wird als Antwortadresse für Kunden-E-Mails verwendet.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Adresse
            </label>
            <textarea
              name="address"
              rows={4}
              defaultValue={user.company.address || ""}
              placeholder={`Musterstraße 1
12345 Musterstadt`}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
            <p className="mt-2 text-xs text-slate-500">
              Wird auf Kundenseite und PDF-Nachweisen angezeigt.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
          >
            Betriebsdaten speichern
          </button>
        </form>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-semibold text-slate-200">
            Aktuelle Anzeige
          </p>

          <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
            <p className="font-semibold text-white">{user.company.name}</p>

            {user.company.phone && <p className="mt-1">{user.company.phone}</p>}

            {user.company.email && <p className="mt-1">{user.company.email}</p>}

            {user.company.address && (
              <p className="mt-2 whitespace-pre-line">{user.company.address}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}