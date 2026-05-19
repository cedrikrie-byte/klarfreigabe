import Link from "next/link";
import { APP_NAME } from "@/lib/branding";

const CONTACT_EMAIL = "aiserviceengine@gmail.com";

export default function PilotbetriebPage() {
  const mailSubject = encodeURIComponent(
    `Pilotphase für ${APP_NAME} anfragen`
  );

  const mailBody = encodeURIComponent(
    `Hallo,

ich interessiere mich für die Pilotphase von ${APP_NAME}.

Betrieb:
Ansprechpartner:
Telefon:
Gewerk / Branche:
Ort / Einsatzgebiet:

Viele Grüße`
  );

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
              href="/register"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Registrieren
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
            >
              ← Zurück zur Startseite
            </Link>

            <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-blue-200">
              Pilotphase
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
              Teste {APP_NAME} 30 Tage kostenlos in deinem Betrieb.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Für Handwerks- und Servicebetriebe, die Arbeiten, Mängel,
              Zusatzleistungen und Abnahmen einfacher mit Fotos dokumentieren
              möchten.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
                className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                Pilotphase per E-Mail anfragen
              </a>

              <Link
                href="/register"
                className="rounded-2xl border border-white/15 px-6 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Direkt registrieren
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Kontakt:{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-slate-300 underline underline-offset-4 transition hover:text-white"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>

          <div className="rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">
              Pilotangebot
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              30 Tage kostenlos testen
            </h2>

            <div className="mt-5 space-y-3 text-sm leading-6 text-blue-100/90">
              <div className="rounded-2xl bg-slate-950/40 p-4">
                Einrichtung gemeinsam oder selbstständig
              </div>

              <div className="rounded-2xl bg-slate-950/40 p-4">
                Kurze Einführung in Auftrag, Fotos, Freigabe und PDF-Nachweis
              </div>

              <div className="rounded-2xl bg-slate-950/40 p-4">
                Test mit echten Aufträgen, Einsatzorten oder Kundenfällen
              </div>

              <div className="rounded-2xl bg-slate-950/40 p-4">
                Keine langfristige Bindung in der Pilotphase
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Für welchen Alltag?
          </p>

          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight">
            Wenn später nachvollziehbar sein soll, was dokumentiert, besprochen
            oder freigegeben wurde.
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">
                „Das war vorher schon beschädigt“
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Zustand vor Arbeitsbeginn oder vor Übergabe mit Fotos sichern.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">
                „Das habe ich nicht freigegeben“
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Zusatzleistung oder Nachtrag per Link bestätigen lassen.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="font-semibold">
                „Was wurde eigentlich erledigt?“
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Fotos, Beschreibung, Preis/Kostenhinweis und PDF-Nachweis im
                Auftrag behalten.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Nächster Schritt
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Interesse an der Pilotphase?
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Schick kurz Betrieb, Ansprechpartner, Gewerk, Ort und Telefonnummer.
            Dann können wir klären, ob {APP_NAME} zu deinem Ablauf passt.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`}
            className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
          >
            E-Mail an {CONTACT_EMAIL}
          </a>
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