import Link from "next/link";
import { APP_NAME } from "@/lib/branding";

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zur Startseite
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {APP_NAME}
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Datenschutzerklärung
          </h1>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="text-lg font-bold text-white">
                1. Verantwortlicher
              </h2>

              <div className="mt-3 rounded-2xl bg-slate-900 p-4">
                <p>
                  Cedrik Riekewald
                  <br />
                  Adresse ergänzen
                  <br />
                  E-Mail:{" "}
                  <a
                    href="mailto:cedrikrie@gmail.com"
                    className="font-semibold text-white underline underline-offset-4"
                  >
                    cedrikrie@gmail.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                2. Zweck der Verarbeitung
              </h2>

              <p>
                {APP_NAME} dient der digitalen Dokumentation von Werkstattaufträgen,
                Fahrzeugzuständen, Fotos, Kundenfreigaben und Nachweisen.
                Dabei können insbesondere Kunden- und Fahrzeugdaten,
                Kontaktdaten, Auftragsdaten, Fotos sowie Freigabeentscheidungen
                verarbeitet werden.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                3. Verarbeitete Daten
              </h2>

              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Name und Kontaktdaten von Kunden</li>
                <li>Fahrzeugdaten wie Modell oder Kennzeichen</li>
                <li>Auftrags- und Dokumentationsdaten</li>
                <li>Fotos zur Fahrzeug- oder Schadensdokumentation</li>
                <li>Freigabestatus, Zeitpunkte und Kundenkommentare</li>
                <li>Technische Daten wie IP-bezogene Sicherheitsinformationen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                4. Hosting und technische Dienstleister
              </h2>

              <p>
                Die Anwendung kann technische Dienstleister für Hosting,
                Datenbank, Dateiablage und E-Mail-Versand nutzen. Dazu gehören
                insbesondere Dienste für Webhosting, Datenbankbetrieb,
                Bildspeicherung und E-Mail-Zustellung.
              </p>

              <p className="mt-3">
                Bitte ergänze hier die final verwendeten Anbieter, zum Beispiel
                Vercel, Neon, Vercel Blob und Resend, inklusive passender
                Datenschutzinformationen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                5. Speicherdauer
              </h2>

              <p>
                Daten werden grundsätzlich so lange gespeichert, wie sie für die
                Bearbeitung von Aufträgen, Nachweisen, Kundenkommunikation oder
                gesetzliche Aufbewahrungspflichten erforderlich sind.
                Archivierte Aufträge bleiben erhalten, bis sie gelöscht werden.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                6. Rechte betroffener Personen
              </h2>

              <p>
                Betroffene Personen haben im Rahmen der gesetzlichen Vorgaben
                Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der
                Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen
                bestimmte Verarbeitungen.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                7. Hinweis
              </h2>

              <p>
                Diese Datenschutzerklärung ist als technische Platzhalterseite
                vorbereitet. Bitte ersetze sie vor einer öffentlichen Nutzung
                durch eine vollständige, auf deinen tatsächlichen Betrieb und
                deine eingesetzten Dienste abgestimmte Datenschutzerklärung.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}