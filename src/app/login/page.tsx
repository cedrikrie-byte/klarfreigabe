"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/branding";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setErrorMessage(result.error ?? "Login fehlgeschlagen.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zur Startseite
        </Link>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          {APP_NAME}
        </p>

        <h1 className="text-3xl font-bold tracking-tight">Einloggen</h1>

        <p className="mt-3 text-slate-300">
          Melde dich an, um Aufträge, Foto-Dokumentationen, Freigaben und
          Nachweise zu verwalten.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              E-Mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@betrieb.de"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Dein Passwort"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Login läuft..." : "Einloggen"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Noch kein Konto?{" "}
          <Link href="/register" className="font-semibold text-white">
            Betrieb registrieren
          </Link>
        </p>
      </div>
    </main>
  );
}