import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";

const CONTACT_EMAIL = "aiserviceengine@gmail.com";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="font-bold tracking-tight">
            {APP_NAME}
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Einloggen
            </Link>

            <Link
              href="/pilotbetrieb"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Pilotbetrieb werden
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              {APP_NAME}
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              Weniger Diskussionen bei Zusatzarbeiten und Fahrzeugannahmen.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
              {APP_TAGLINE} Für freie Kfz-Werkstätten: Fotos aufnehmen,
              Fahrzeugzustand dokumentieren, Freigaben per Link einholen und
              später alles als Nachweis sichern.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pilotbetrieb"
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                30 Tage kostenlos testen
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-white/15 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Einloggen
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Pilotphase für freie Kfz-Werkstätten. Kontakt:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-slate-300 underline underline-offset-4 transition hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Demo-Ablauf
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">1. Auftrag anlegen</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Kunde, Fahrzeug und Auftrag erfassen.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">2. Fahrzeugannahme dokumentieren</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Fotos vom Zustand bei Abgabe aufnehmen und sichern.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">3. Freigabe senden</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Zusatzarbeit mit Foto, Beschreibung und Preis per Link an den
                  Kunden senden.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">4. Nachweis behalten</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Freigabe, Rückfrage, Fotos und PDF-Nachweis bleiben im Auftrag
                  nachvollziehbar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Warum Werkstätten testen sollten
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Für Situationen, die später sonst Diskussionen machen.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Fahrzeugannahme</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Zustand bei Abgabe mit mehreren Fotos dokumentieren.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Kundenfreigabe</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Zusatzarbeiten mit Foto, Beschreibung und Preis per Link
                freigeben lassen.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Nachweis</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                PDF-Nachweis für Rückfragen, Reklamationen und interne Ablage.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-blue-300/20 bg-blue-300/10 p-6">
            <p className="text-lg font-bold text-blue-100">
              Aktuell gesucht: 3 bis 5 freie Werkstätten für die Pilotphase.
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-100/80">
              Ich richte den Zugang ein, zeige den Ablauf kurz und nehme
              Feedback direkt auf.
            </p>

            <Link
              href="/pilotbetrieb"
              className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Pilotbetrieb werden
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {APP_NAME}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/impressum" className="transition hover:text-white">
              Impressum
            </Link>

            <Link href="/datenschutz" className="transition hover:text-white">
              Datenschutz
            </Link>

            <Link href="/login" className="transition hover:text-white">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}