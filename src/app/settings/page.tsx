import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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

    redirect("/settings");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/dashboard" className="text-sm font-semibold text-slate-300">
          ← Zurück zum Dashboard
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Einstellungen
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Betriebsdaten bearbeiten
          </h1>

          <p className="mt-3 text-slate-300">
            Diese Daten werden später auf Kundenfreigaben und PDF-Nachweisen
            angezeigt.
          </p>
        </div>

        <form
          action={updateCompany}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Betriebsname
            </label>
            <input
              name="name"
              type="text"
              defaultValue={user.company.name}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
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
                placeholder="+49 170 1234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
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
              placeholder="Musterstraße 1, 12345 Musterstadt"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Betriebsdaten speichern
          </button>
        </form>
      </div>
    </main>
  );
}