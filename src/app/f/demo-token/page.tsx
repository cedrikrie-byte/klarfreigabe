import Link from "next/link";

export default function DemoApprovalPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-950">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Kundenfreigabe
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Zusatzarbeit freigeben
          </h1>

          <p className="mt-3 text-slate-600">
            AutoService Muster bittet um Ihre Freigabe für eine zusätzliche
            Reparatur an Ihrem Fahrzeug.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Fahrzeug</p>
            <p className="mt-1 font-semibold">VW Golf 7 · B KF 1234</p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Empfohlene Zusatzarbeit</p>
            <p className="mt-1 font-semibold">Bremsscheiben vorne ersetzen</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bei der Prüfung wurde festgestellt, dass die Bremsscheiben vorne
              stark verschlissen sind. Wir empfehlen den Austausch.
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-100 p-4">
            <p className="text-sm text-slate-500">Kostenschätzung</p>
            <p className="mt-1 text-2xl font-bold">ca. 320 € inkl. MwSt.</p>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4">
            <p className="font-semibold">Fotos</p>
            <p className="mt-2 text-sm text-slate-500">
              Hier werden später die Werkstattfotos angezeigt.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
  href="/f/demo-token/approved"
  className="block w-full rounded-2xl bg-slate-950 px-5 py-3 text-center font-semibold text-white"
>
  Freigeben
</Link>

            <Link
  href="/f/demo-token/rejected"
  className="block w-full rounded-2xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-950"
>
  Ablehnen / Rückfrage
</Link>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Mit der Freigabe bestätigen Sie, dass die oben beschriebene
            Zusatzarbeit auf Grundlage der angegebenen Kostenschätzung
            durchgeführt werden darf.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Erstellt mit KlarFreigabe
        </p>

        <div className="mt-6 text-center">
          <Link href="/jobs/demo" className="text-sm font-semibold text-slate-700">
            Zurück zur Demo
          </Link>
        </div>
      </div>
    </main>
  );
}
