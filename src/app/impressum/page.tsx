import Link from "next/link";
import { APP_NAME } from "@/lib/branding";

export default function ImpressumPage() {
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

          <h1 className="text-3xl font-bold tracking-tight">Impressum</h1>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="text-lg font-bold text-white">
                Angaben gemäß § 5 TMG
              </h2>

              <div className="mt-3 rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold text-white">
                  Cedrik Riekewald
                </p>
                <p className="mt-2">
                  Straße und Hausnummer ergänzen
                  <br />
                  PLZ und Ort ergänzen
                  <br />
                  Deutschland
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">Kontakt</h2>

              <div className="mt-3 rounded-2xl bg-slate-900 p-4">
                <p>
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
                Verantwortlich für den Inhalt
              </h2>

              <div className="mt-3 rounded-2xl bg-slate-900 p-4">
                <p>
                  Cedrik Riekewald
                  <br />
                  Adresse ergänzen
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">
                Hinweis
              </h2>

              <p>
                Dieses Impressum ist als technische Platzhalterseite vorbereitet.
                Bitte ergänze vor einer öffentlichen Nutzung alle rechtlich
                erforderlichen Angaben vollständig und lasse den Inhalt bei
                Bedarf rechtlich prüfen.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}