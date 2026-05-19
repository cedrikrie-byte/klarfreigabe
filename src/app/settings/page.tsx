import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/branding";
import { prisma } from "@/lib/prisma";
import FormSubmitButton from "@/components/FormSubmitButton";

type SettingsPageProps = {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { saved, error } = await searchParams;

  async function updateCompany(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const address = String(formData.get("address") || "").trim();

    if (!name) {
      redirect("/settings?error=missing-name");
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
      <div className="mx-auto w-full max-w-3xl">
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

          <p className="mt-3 max-w-2xl text-slate-300">
            Diese Daten werden auf Kundenfreigaben, E-Mails und PDF-Nachweisen
            angezeigt. Vollständige Betriebsdaten wirken für Kunden deutlich
            professioneller.
          </p>
        </div>

        {saved === "1" && (
          <div className="mt-6 rounded-2xl border border-green-300/20 bg-green-300/10 p-4 text-sm font-semibold text-green-200">
            Betriebsdaten wurden gespeichert.
          </div>
        )}

        {error === "missing-name" && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            Bitte gib mindestens den Betriebsnamen ein.
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <form
            action={updateCompany}
            className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Betriebsname <span className="text-red-300">*</span>
              </label>
              <input
                name="name"
                type="text"
                defaultValue={user.company.name}
                placeholder="Muster Service GmbH"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                required
              />
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
                  placeholder="+49 201 123456"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Wird auf Kundenseiten und PDF-Nachweisen angezeigt.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Betriebs-E-Mail
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.company.email || ""}
                  placeholder="info@betrieb.de"
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Wird als Antwortadresse für Freigabe-E-Mails verwendet.
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
                placeholder={"Musterstraße 1\n45127 Essen"}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Die Adresse erscheint auf Freigabelinks und Nachweisen.
              </p>
            </div>

            <FormSubmitButton
              idleLabel="Betriebsdaten speichern"
              pendingLabel="Betriebsdaten werden gespeichert..."
            />
          </form>

          <div className="space-y-4">
            <div className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5">
              <p className="font-semibold text-blue-100">
                Für Pilotkunden und Demos wichtig
              </p>
              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                Vor einer Vorführung oder einem echten Test solltest du hier
                mindestens Betriebsname, E-Mail und Telefonnummer eintragen.
                Dadurch sehen E-Mails, Freigabelinks und PDF-Nachweise nicht
                nach Testsystem aus.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Aktuelle Vorschau</p>

              <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-sm leading-6 text-slate-300">
                <p className="font-semibold text-white">{user.company.name}</p>

                {user.company.phone ? (
                  <p className="mt-1">{user.company.phone}</p>
                ) : (
                  <p className="mt-1 text-slate-500">Keine Telefonnummer</p>
                )}

                {user.company.email ? (
                  <p className="mt-1 break-words">{user.company.email}</p>
                ) : (
                  <p className="mt-1 text-slate-500">Keine Betriebs-E-Mail</p>
                )}

                {user.company.address ? (
                  <p className="mt-2 whitespace-pre-line">
                    {user.company.address}
                  </p>
                ) : (
                  <p className="mt-2 text-slate-500">Keine Adresse</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Hinweis zur E-Mail</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Freigabe-E-Mails werden technisch über {APP_NAME} versendet. Wenn
                hier eine Betriebs-E-Mail hinterlegt ist, kann der Kunde darauf
                antworten und landet direkt bei deinem Betrieb.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}