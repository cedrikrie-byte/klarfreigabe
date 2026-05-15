import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormSubmitButton from "@/components/FormSubmitButton";

type EditCustomerPageProps = {
  params: Promise<{
    customerId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function EditCustomerPage({
  params,
  searchParams,
}: EditCustomerPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { customerId } = await params;
  const { error } = await searchParams;

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId: user.companyId,
    },
  });

  if (!customer) {
    notFound();
  }

  async function updateCustomer(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const name = String(formData.get("name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!name || name.length < 2) {
      redirect(`/customers/${customerId}/edit?error=missing-name`);
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        companyId: currentUser.companyId,
      },
    });

    if (!existingCustomer) {
      redirect("/customers");
    }

    await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name,
        phone: phone || null,
        email: email || null,
      },
    });

    redirect(`/customers/${customerId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/customers/${customer.id}`}
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zur Kundenakte
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Kunde bearbeiten
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            {customer.name}
          </h1>

          <p className="mt-3 text-slate-300">
            Korrigiere Kundendaten wie Name, Telefonnummer oder E-Mail-Adresse.
            Neue Aufträge und Freigabe-E-Mails nutzen danach die aktualisierten
            Daten.
          </p>
        </div>

        {error === "missing-name" && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            Bitte gib mindestens einen Kundennamen mit 2 Zeichen ein.
          </div>
        )}

        <form
          action={updateCustomer}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kundenname <span className="text-red-300">*</span>
            </label>
            <input
              name="name"
              type="text"
              defaultValue={customer.name}
              placeholder="Max Mustermann"
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
                defaultValue={customer.phone || ""}
                placeholder="+49 170 1234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Hilfreich für Rückfragen und spätere WhatsApp-/Telefonkontakte.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                E-Mail
              </label>
              <input
                name="email"
                type="email"
                defaultValue={customer.email || ""}
                placeholder="kunde@email.de"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Wird für Freigabelinks per E-Mail verwendet.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/customers/${customer.id}`}
              className="rounded-2xl border border-white/10 px-5 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Abbrechen
            </Link>

            <FormSubmitButton
              idleLabel="Kundendaten speichern"
              pendingLabel="Kundendaten werden gespeichert..."
            />
          </div>
        </form>
      </div>
    </main>
  );
}