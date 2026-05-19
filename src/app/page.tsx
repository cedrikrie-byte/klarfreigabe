import Link from "next/link";
import { APP_NAME } from "@/lib/branding";

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
              Kostenlos testen
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
              Foto-Dokumentation und Freigaben für Handwerks- und
              Servicebetriebe.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
              Dokumentiere Arbeiten, Schäden, Zusatzleistungen oder
              Vorher-Nachher-Zustände mit Fotos. Kunden können Leistungen per
              Link freigeben oder Rückfragen stellen. Danach bleibt alles als
              Nachweis im Auftrag gespeichert.
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
              Für Handwerk, Service, Reinigung, Gartenbau, Malerarbeiten,
              Hausmeisterservice und ähnliche Betriebe. Kontakt:{" "}
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
              Ablauf
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">1. Auftrag anlegen</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Kunde oder Firma, Einsatzort und Aufgabe erfassen.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">2. Fotos dokumentieren</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Vorher-Zustand, Mängel, Schäden oder erledigte Arbeiten mit
                  Fotos festhalten.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">3. Freigabe einholen</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Zusatzleistung, Nachtrag oder Kostenhinweis per Link vom
                  Kunden bestätigen lassen.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold">4. Nachweis sichern</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Fotos, Status, Kundenantwort und PDF-Nachweis bleiben im
                  Auftrag nachvollziehbar gespeichert.
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
              Typische Einsatzfälle
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Für Arbeiten, bei denen später ein sauberer Nachweis zählt.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Vorher-/Nachher-Dokumentation</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Zustand vor Beginn und Ergebnis nach Abschluss mit Fotos
                dokumentieren.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Zusatzleistung / Nachtrag</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Wenn vor Ort mehr Aufwand entsteht, kann der Kunde die
                Zusatzleistung online freigeben.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">Abnahme / Rückfrage</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Kunden können bestätigen oder eine Rückfrage senden. Die Antwort
                bleibt dokumentiert.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-blue-300/20 bg-blue-300/10 p-6">
            <p className="text-lg font-bold text-blue-100">
              Aktuell gesucht: 3 bis 5 Betriebe für die Pilotphase.
            </p>
            <p className="mt-2 text-sm leading-6 text-blue-100/80">
              Ich begleite die Einrichtung, zeige den Ablauf kurz und nehme
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

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Geeignet für
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              Gebäudereinigung
            </div>
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              Malerarbeiten
            </div>
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              Garten- und Landschaftsbau
            </div>
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              Hausmeisterservice
            </div>
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              Sanierung / Schadenservice
            </div>
            <div className="rounded-2xl bg-slate-900 p-4 text-sm font-semibold text-slate-200">
              SHK, Elektro und weitere Gewerke
            </div>
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