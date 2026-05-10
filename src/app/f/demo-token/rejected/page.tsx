import Link from "next/link";

export default function RejectedPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-xl items-center">
        <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-3xl text-slate-950">
            !
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Rückfrage gesendet
          </h1>

          <p className="mt-3 text-slate-600">
            Vielen Dank. Die Werkstatt wurde informiert, dass Sie die Freigabe
            noch nicht erteilen möchten oder eine Rückfrage haben.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-left">
            <p className="text-sm text-slate-500">Betroffene Zusatzarbeit</p>
            <p className="mt-1 font-semibold">Bremsscheiben vorne ersetzen</p>
            <p className="mt-2 text-sm text-slate-600">
              Kostenschätzung: ca. 320 € inkl. MwSt.
            </p>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            In der echten App kann der Kunde hier zusätzlich eine Nachricht an
            die Werkstatt schreiben.
          </p>

          <Link
            href="/f/demo-token"
            className="mt-6 inline-flex rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-950"
          >
            Zurück zur Freigabe
          </Link>
        </div>
      </div>
    </main>
  );
}
