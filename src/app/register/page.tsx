"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_NAME } from "@/lib/branding";

type RegisterResult = {
  success?: boolean;
  error?: string;
};

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function RegisterPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const result = await readJsonSafely<RegisterResult>(response);

      if (!response.ok) {
        setErrorMessage(
          result?.error ??
            `Registrierung fehlgeschlagen. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unerwarteter Fehler bei der Registrierung.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="font-bold tracking-tight">
            {APP_NAME}
          </Link>

          <Link
            href="/login"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
          >
            Einloggen
          </Link>
        </div>
      </header>

      <section className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">
              Betrieb registrieren
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Starte mit digitaler Foto-Dokumentation.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Lege dein Betriebskonto an und erfasse anschließend direkt deinen
              ersten Auftrag mit Fahrzeugannahme, Fotos und Kundenfreigabe.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-400">
              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold text-white">
                  Für freie Kfz-Werkstätten
                </p>
                <p className="mt-1 leading-6">
                  Annahme, Zusatzarbeiten, Fotos und Nachweise an einem Ort.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold text-white">
                  Direkt nach Registrierung nutzbar
                </p>
                <p className="mt-1 leading-6">
                  Nach dem Erstellen deines Kontos landest du direkt im
                  Dashboard.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-4">
                <p className="font-semibold text-white">
                  Betriebsdaten später ergänzen
                </p>
                <p className="mt-1 leading-6">
                  Telefon, Adresse und E-Mail kannst du danach in den
                  Einstellungen pflegen.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {APP_NAME}
            </p>

            <h2 className="text-2xl font-bold tracking-tight">
              Konto erstellen
            </h2>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Betriebsname <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Muster AutoService GmbH"
                  autoComplete="organization"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Dein Name <span className="text-red-300">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Max Mustermann"
                  autoComplete="name"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  E-Mail <span className="text-red-300">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="max@werkstatt.de"
                  autoComplete="email"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Diese E-Mail nutzt du später zum Einloggen.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Passwort <span className="text-red-300">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">
                  Verwende ein sicheres Passwort mit mindestens 8 Zeichen.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
                  {errorMessage}
                </div>
              )}

              {isLoading && (
                <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
                  Konto wird erstellt. Bitte kurz warten...
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Konto wird erstellt..." : "Konto erstellen"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Schon registriert?{" "}
              <Link
                href="/login"
                className="font-semibold text-white underline underline-offset-4"
              >
                Einloggen
              </Link>
            </p>

            <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
              <Link href="/impressum" className="transition hover:text-white">
                Impressum
              </Link>
              <Link href="/datenschutz" className="transition hover:text-white">
                Datenschutz
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}