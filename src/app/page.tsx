import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/branding";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
            {APP_NAME}
          </p>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Reparaturen und Zusatzarbeiten per Fotolink freigeben lassen.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-200">
            {APP_TAGLINE} Für freie Kfz-Werkstätten: Fotos dokumentieren,
            Kundenfreigabe einholen und später alles sauber als Nachweis
            archivieren.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-6 py-4 text-center font-semibold text-slate-950"
            >
              Betrieb registrieren
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/15 px-6 py-4 text-center font-semibold text-white"
            >
              Einloggen
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-400">
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>

            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}