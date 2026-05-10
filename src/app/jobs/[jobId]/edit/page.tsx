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
    const customerEmail = String(formData.get("customerEmail") || "").trim();
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
        <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-slate-300">
          ← Zurück zum Auftrag
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Auftrag bearbeiten
          </p>

          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>

          <p className="mt-3 text-slate-300">
            Bearbeite Kundendaten, Fahrzeugdaten und den Auftragstitel.
          </p>
        </div>

        <form
          action={updateJob}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kunde
            </label>
            <input
              name="customerName"
              type="text"
              defaultValue={job.customer.name}
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
                name="customerPhone"
                type="tel"
                defaultValue={job.customer.phone || ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Auftragstitel
            </label>
            <input
              name="title"
              type="text"
              defaultValue={job.title}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
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
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950"
          >
            Änderungen speichern
          </button>
        </form>
      </div>
    </main>
  );
}