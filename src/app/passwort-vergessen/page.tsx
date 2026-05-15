"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_NAME } from "@/lib/branding";

type ResetRequestResult = {
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRequestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setWasSent(false);

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const result = await readJsonSafely<ResetRequestResult>(response);

      if (!response.ok) {
        setErrorMessage(
          result?.error ??
            `Zurücksetzen konnte nicht gestartet werden. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      setWasSent(true);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setErrorMessage("Unerwarteter Fehler beim Anfordern des Reset-Links.");
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
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
          >
            ← Zurück zum Login
          </Link>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {APP_NAME}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Passwort vergessen?
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Gib deine E-Mail-Adresse ein. Wenn ein Konto existiert, senden wir
              dir einen Link zum Zurücksetzen deines Passworts.
            </p>

            <form onSubmit={handleRequestReset} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="max@werkstatt.de"
                  autoComplete="email"
                  disabled={isLoading || wasSent}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              {wasSent && (
                <div className="rounded-2xl border border-green-300/20 bg-green-300/10 p-4 text-sm font-semibold text-green-200">
                  Wenn ein Konto zu dieser E-Mail existiert, wurde ein Link zum
                  Zurücksetzen gesendet.
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
                  {errorMessage}
                </div>
              )}

              {isLoading && (
                <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
                  E-Mail wird vorbereitet...
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || wasSent}
                className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Wird gesendet..." : "Reset-Link senden"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}