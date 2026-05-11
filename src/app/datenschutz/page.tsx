import Link from "next/link";
import { APP_NAME, APP_DOMAIN } from "@/lib/branding";

export default function DatenschutzPage() {
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
            Datenschutzerklärung
          </h1>

          <p className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
            Platzhalter: Bitte vor Veröffentlichung durch echte Angaben ersetzen
            und rechtlich prüfen lassen.
          </p>

          <section className="mt-8 space-y-6 text-sm leading-7 text-slate-200">
            <div>
              <h2 className="text-lg font-bold text-white">
                1. Verantwortlicher
              </h2>
              <p className="mt-2">
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="mt-2">
                Max Mustermann
                <br />
                Musterstraße 1
                <br />
                12345 Musterstadt
                <br />
                E-Mail: kontakt@{APP_DOMAIN}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                2. Verarbeitung personenbezogener Daten
              </h2>
              <p className="mt-2">
                {APP_NAME} verarbeitet Daten, die zur Erstellung und Verwaltung
                von Aufträgen, Kundenfreigaben, Dokumentationen und Nachweisen
                erforderlich sind. Dazu können insbesondere Namen, Kontaktdaten,
                Fahrzeugdaten, Auftragsdaten, Fotos, Freigabestatus,
                Zeitstempel und Kundenkommentare gehören.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                3. Zweck der Verarbeitung
              </h2>
              <p className="mt-2">
                Die Verarbeitung erfolgt zur digitalen Dokumentation von
                Werkstatt- oder Serviceaufträgen, zur Einholung von
                Kundenfreigaben und zur Erstellung von Nachweisen.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                4. Hosting und technische Dienstleister
              </h2>
              <p className="mt-2">
                Die Anwendung wird über technische Dienstleister betrieben.
                Dazu können Hosting, Datenbankbetrieb, Dateiablage und
                Bereitstellung der Anwendung gehören. Die konkreten Anbieter,
                Verträge zur Auftragsverarbeitung und Speicherorte müssen vor
                dem produktiven Einsatz geprüft und ergänzt werden.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                5. Speicherdauer
              </h2>
              <p className="mt-2">
                Personenbezogene Daten werden nur so lange gespeichert, wie sie
                für die genannten Zwecke erforderlich sind oder gesetzliche
                Aufbewahrungspflichten bestehen.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                6. Rechte betroffener Personen
              </h2>
              <p className="mt-2">
                Betroffene Personen haben im Rahmen der gesetzlichen Vorgaben
                Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der
                Verarbeitung, Datenübertragbarkeit und Widerspruch.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                7. Hinweis
              </h2>
              <p className="mt-2">
                Diese Datenschutzerklärung ist ein technischer Platzhalter und
                ersetzt keine individuelle rechtliche Prüfung.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}