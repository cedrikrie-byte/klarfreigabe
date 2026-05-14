"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CreateJobResult = {
  success?: boolean;
  error?: string;
  jobId?: string;
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

export default function NewJobPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [nextStep, setNextStep] = useState<"job" | "intake">("intake");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim(),
          licensePlate: licensePlate.trim(),
          vehicle: vehicle.trim(),
          title: title.trim(),
          notes: notes.trim(),
        }),
      });

      const result = await readJsonSafely<CreateJobResult>(response);

      if (!response.ok) {
        setErrorMessage(
          result?.error ??
            `Auftrag konnte nicht erstellt werden. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      if (!result?.jobId) {
        setErrorMessage("Auftrag wurde erstellt, aber die Auftrags-ID fehlt.");
        setIsLoading(false);
        return;
      }

      if (nextStep === "intake") {
        router.push(`/jobs/${result.jobId}/documentation/new?type=VEHICLE_INTAKE`);
      } else {
        router.push(`/jobs/${result.jobId}`);
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMessage("Unerwarteter Fehler beim Erstellen des Auftrags.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
        >
          ← Zurück zum Dashboard
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Neuer Auftrag
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Werkstattauftrag anlegen
          </h1>

          <p className="mt-3 text-slate-300">
            Erfasse Kunde und Fahrzeug. Danach kannst du direkt die
            Fahrzeugannahme mit Fotos starten.
          </p>
        </div>

        <form
          onSubmit={handleCreateJob}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
            <p className="font-semibold">Empfohlener Ablauf</p>
            <p className="mt-1">
              Erst Auftrag anlegen, dann direkt den Fahrzeugzustand bei Abgabe
              fotografieren. Das hilft später bei Rückfragen oder Reklamationen.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kunde <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Max Mustermann"
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Telefon
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                placeholder="+49 170 1234567"
                disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                E-Mail
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                placeholder="kunde@email.de"
                disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-slate-500">
                Für Freigabelinks per E-Mail hilfreich, aber nicht zwingend.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Kennzeichen
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={(event) =>
                  setLicensePlate(event.target.value.toUpperCase())
                }
                placeholder="B KF 1234"
                disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 uppercase text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Fahrzeug
              </label>
              <input
                type="text"
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                placeholder="VW Golf 7"
                disabled={isLoading}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Auftragstitel <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Bremsenprüfung / Geräusch vorne rechts"
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Notiz
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Kurze Beschreibung des Auftrags..."
              rows={4}
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
            <p className="text-sm font-semibold text-slate-200">
              Nach dem Speichern
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <label className="cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:bg-white/10 active:scale-[0.98]">
                <input
                  type="radio"
                  name="nextStep"
                  value="intake"
                  checked={nextStep === "intake"}
                  onChange={() => setNextStep("intake")}
                  disabled={isLoading}
                  className="mr-2"
                />
                <span className="font-semibold">Fahrzeugannahme starten</span>
                <p className="mt-1 text-xs text-slate-400">
                  Empfohlen: direkt Fotos vom Zustand aufnehmen.
                </p>
              </label>

              <label className="cursor-pointer rounded-2xl border border-white/10 p-4 transition hover:bg-white/10 active:scale-[0.98]">
                <input
                  type="radio"
                  name="nextStep"
                  value="job"
                  checked={nextStep === "job"}
                  onChange={() => setNextStep("job")}
                  disabled={isLoading}
                  className="mr-2"
                />
                <span className="font-semibold">Zum Auftrag öffnen</span>
                <p className="mt-1 text-xs text-slate-400">
                  Erst später dokumentieren.
                </p>
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
              {errorMessage}
            </div>
          )}

          {isLoading && (
            <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
              Auftrag wird erstellt. Bitte kurz warten...
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Auftrag wird erstellt..."
              : nextStep === "intake"
                ? "Auftrag erstellen und Fahrzeugannahme starten"
                : "Auftrag erstellen"}
          </button>
        </form>
      </div>
    </main>
  );
}