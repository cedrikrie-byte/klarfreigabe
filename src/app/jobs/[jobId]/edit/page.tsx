import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EditJobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { jobId } = await params;

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
    const customerEmail = String(formData.get("customerEmail") || "")
      .trim()
      .toLowerCase();
    const licensePlate = String(formData.get("licensePlate") || "").trim();
    const vehicle = String(formData.get("vehicle") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    if (!customerName || !title) {
      redirect(`/jobs/${jobId}/edit`);
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

    await prisma.customer.update({
      where: {
        id: existingJob.customerId,
      },
      data: {
        name: customerName,
        phone: customerPhone || null,
        email: customerEmail || null,
      },
    });

    await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title,
        licensePlate: licensePlate || null,
        vehicle: vehicle || null,
        notes: notes || null,
      },
    });

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
            Bearbeite Kundendaten, Einsatzort, Referenz und Aufgabe.
          </p>
        </div>

        <form
          action={updateJob}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kunde / Firma <span className="text-red-300">*</span>
            </label>
            <input
              name="customerName"
              type="text"
              defaultValue={job.customer.name}
              placeholder="Muster GmbH / Max Mustermann"
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
                placeholder="+49 201 123456"
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
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Einsatzort / Adresse / Objekt
            </label>
            <input
              name="vehicle"
              type="text"
              defaultValue={job.vehicle || ""}
              placeholder="Musterstraße 1, 45127 Essen / Objekt A"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Referenz / Objekt-Nr. optional
            </label>
            <input
              name="licensePlate"
              type="text"
              defaultValue={job.licensePlate || ""}
              placeholder="Objekt 12 / Baustelle A / Auftrag 2026-001"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Aufgabe / Auftrag <span className="text-red-300">*</span>
            </label>
            <input
              name="title"
              type="text"
              defaultValue={job.title}
              placeholder="Treppenhausreinigung / Malerarbeiten / Gartenpflege"
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
              placeholder="Kurze Beschreibung des Auftrags, besondere Hinweise oder Absprachen..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href={`/jobs/${job.id}`}
              className="rounded-2xl border border-white/10 px-5 py-3 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Abbrechen
            </Link>

            <button
              type="submit"
              className="rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Änderungen speichern
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}