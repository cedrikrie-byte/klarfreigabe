import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FormSubmitButton from "@/components/FormSubmitButton";

type EditJobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function EditJobPage({
  params,
  searchParams,
}: EditJobPageProps & {
  searchParams: Promise<{
    error?: string;
  }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId } = await params;
  const { error } = await searchParams;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      companyId: user.companyId,
    },
    include: {
      customer: true,
    },
  });

  if (!job) {
    notFound();
  }

  async function updateJob(formData: FormData) {
    "use server";

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      redirect("/login");
    }

    const customerName = String(formData.get("customerName") || "").trim();
    const customerPhone = String(formData.get("customerPhone") || "").trim();
    const customerEmail = String(formData.get("customerEmail") || "").trim();
    const licensePlate = String(formData.get("licensePlate") || "")
      .trim()
      .toUpperCase();
    const vehicle = String(formData.get("vehicle") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!customerName || !title) {
      redirect(`/jobs/${jobId}/edit?error=missing`);
    }

    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: currentUser.companyId,
      },
      include: {
        customer: true,
      },
    });

    if (!existingJob) {
      redirect("/dashboard");
    }

    await prisma.$transaction([
      prisma.customer.update({
        where: {
          id: existingJob.customerId,
        },
        data: {
          name: customerName,
          phone: customerPhone || null,
          email: customerEmail || null,
        },
      }),

      prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          title,
          licensePlate: licensePlate || null,
          vehicle: vehicle || null,
          notes: notes || null,
        },
      }),
    ]);

    redirect(`/jobs/${jobId}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zum Auftrag
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Auftrag bearbeiten
          </p>

          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>

          <p className="mt-3 text-slate-300">
            Bearbeite Kundendaten, Fahrzeugdaten und den Auftragstitel. Die
            Änderungen erscheinen danach auch auf Kundenseiten und Nachweisen.
          </p>
        </div>

        {error === "missing" && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
            Bitte fülle mindestens Kunde und Auftragstitel aus.
          </div>
        )}

        <form
          action={updateJob}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
            <p className="font-semibold">Hinweis</p>
            <p className="mt-1">
              Wenn du die E-Mail-Adresse ergänzt, kannst du Freigabelinks direkt
              aus dem Auftrag per E-Mail senden.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kunde <span className="text-red-300">*</span>
            </label>
            <input
              name="customerName"
              type="text"
              defaultValue={job.customer.name}
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
                name="customerPhone"
                type="tel"
                defaultValue={job.customer.phone || ""}
                placeholder="+49 170 1234567"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                E-Mail
              </label>
              <input
                name="customerEmail"
                type="email"
                defaultValue={job.customer.email || ""}
                placeholder="kunde@email.de"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <p className="mt-2 text-xs text-slate-500">
                Wird für den Versand von Freigabelinks verwendet.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Kennzeichen
              </label>
              <input
                name="licensePlate"
                type="text"
                defaultValue={job.licensePlate || ""}
                placeholder="B KF 1234"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 uppercase text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Fahrzeug
              </label>
              <input
                name="vehicle"
                type="text"
                defaultValue={job.vehicle || ""}
                placeholder="VW Golf 7"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Auftragstitel <span className="text-red-300">*</span>
            </label>
            <input
              name="title"
              type="text"
              defaultValue={job.title}
              placeholder="Bremsenprüfung / Geräusch vorne rechts"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Notiz
            </label>
            <textarea
              name="notes"
              rows={4}
              defaultValue={job.notes || ""}
              placeholder="Interne Notiz zum Auftrag..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <FormSubmitButton
            idleLabel="Änderungen speichern"
            pendingLabel="Änderungen werden gespeichert..."
          />
        </form>
      </div>
    </main>
  );
}