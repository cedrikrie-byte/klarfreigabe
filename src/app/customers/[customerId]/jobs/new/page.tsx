import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerJobForm from "@/components/CustomerJobForm";

type NewCustomerJobPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function NewCustomerJobPage({
  params,
}: NewCustomerJobPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { customerId } = await params;

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      companyId: user.companyId,
    },
  });

  if (!customer) {
    notFound();
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
            Neuer Auftrag
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Auftrag für {customer.name}
          </h1>

          <p className="mt-3 text-slate-300">
            Lege einen neuen Auftrag für diesen bestehenden Kunden an. Die
            Kundenhistorie bleibt dadurch sauber zusammen.
          </p>
        </div>

        <CustomerJobForm customerId={customer.id} customerName={customer.name} />
      </div>
    </main>
  );
}