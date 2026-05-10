import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">
            KlarFreigabe MVP
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Reparaturen und Zusatzarbeiten per Fotolink freigeben lassen.
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Für freie Kfz-Werkstätten: Fotos dokumentieren, Kundenfreigabe
            einholen und später alles sauber als Nachweis archivieren.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-950"
            >
              Betrieb registrieren
            </Link>

            <Link
              href="/login"
              className="rounded-2xl border border-white/20 px-5 py-3 text-center font-semibold text-white"
            >
              Einloggen
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
