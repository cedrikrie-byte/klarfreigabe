import Link from "next/link";
import { APP_NAME, APP_DOMAIN } from "@/lib/branding";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-slate-300">
          ← Zur Startseite
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {APP_NAME}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Impressum
          </h1>

          <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
            Platzhalter: Bitte vor Veröffentlichung durch deine echten Angaben
            ersetzen und rechtlich prüfen lassen.
          </p>

          <section className="mt-8 space-y-4 text-sm leading-7 text-slate-200">
            <div>
              <h2 className="text-lg font-bold text-white">
                Angaben gemäß § 5 TMG
              </h2>
              <p className="mt-2">
                Max Mustermann
                <br />
                Musterstraße 1
                <br />
                12345 Musterstadt
                <br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">Kontakt</h2>
              <p className="mt-2">
                E-Mail: kontakt@{APP_DOMAIN}
                <br />
                Telefon: +49 000 000000
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Verantwortlich für den Inhalt
              </h2>
              <p className="mt-2">
                Max Mustermann
                <br />
                Musterstraße 1
                <br />
                12345 Musterstadt
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Haftungsausschluss
              </h2>
              <p className="mt-2">
                Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine
                Haftung für die Inhalte externer Links. Für den Inhalt der
                verlinkten Seiten sind ausschließlich deren Betreiber
                verantwortlich.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}