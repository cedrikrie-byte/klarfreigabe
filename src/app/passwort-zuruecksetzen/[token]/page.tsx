"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { APP_NAME } from "@/lib/branding";

type ResetConfirmResult = {
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

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{
    token: string;
  }>();

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    if (password !== passwordRepeat) {
      setErrorMessage("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      });

      const result = await readJsonSafely<ResetConfirmResult>(response);

      if (!response.ok) {
        setErrorMessage(
          result?.error ??
            `Passwort konnte nicht geändert werden. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unerwarteter Fehler beim Zurücksetzen des Passworts.");
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {APP_NAME}
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Neues Passwort festlegen
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Wähle ein neues Passwort mit mindestens 8 Zeichen.
            </p>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Neues Passwort
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
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Passwort wiederholen
                </label>
                <input
                  type="password"
                  value={passwordRepeat}
                  onChange={(event) => setPasswordRepeat(event.target.value)}
                  placeholder="Passwort erneut eingeben"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
                  {errorMessage}
                </div>
              )}

              {isLoading && (
                <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
                  Passwort wird gespeichert...
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Wird gespeichert..." : "Passwort speichern"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Link abgelaufen?{" "}
              <Link
                href="/passwort-vergessen"
                className="font-semibold text-white underline underline-offset-4"
              >
                Neuen Link anfordern
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}