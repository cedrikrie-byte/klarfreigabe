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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 active:scale-[0.98]"
          >
            ← Zurück zum Dashboard
          </Link>

          <Link
            href="/customers"
            className="inline-flex rounded-2xl border border-blue-300/20 bg-blue-300/10 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-300/20 active:scale-[0.98]"
          >
            Bestehenden Kunden suchen
          </Link>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Neuer Auftrag
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Auftrag anlegen
          </h1>

          <p className="mt-3 text-slate-300">
            Erfasse Kunde oder Firma, Einsatzort und Aufgabe. Wenn der Kunde
            bereits existiert, öffne zuerst die Kundenkartei und lege den Auftrag
            dort an.
          </p>
        </div>

        <form
          onSubmit={handleCreateJob}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
            <p className="font-semibold">Neuer Kunde oder bekannter Kunde?</p>
            <p className="mt-1">
              Diese Seite erstellt einen neuen Kunden. Für bekannte Kunden nutze
              die Kundenkartei, damit alle Aufträge in einer Kundenakte bleiben.
            </p>

            <Link
              href="/customers"
              className="mt-4 inline-flex rounded-2xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              Kundenkartei öffnen
            </Link>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Kunde / Firma <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Muster GmbH / Max Mustermann"
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
                placeholder="+49 201 123456"
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

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Einsatzort / Adresse / Objekt
            </label>
            <input
              type="text"
              value={vehicle}
              onChange={(event) => setVehicle(event.target.value)}
              placeholder="Musterstraße 1, 45127 Essen / Objekt A"
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Referenz / Objekt-Nr. optional
            </label>
            <input
              type="text"
              value={licensePlate}
              onChange={(event) => setLicensePlate(event.target.value)}
              placeholder="Objekt 12 / Baustelle A / Auftrag 2026-001"
              disabled={isLoading}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Aufgabe / Auftrag <span className="text-red-300">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Treppenhausreinigung / Malerarbeiten / Gartenpflege"
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
              placeholder="Kurze Beschreibung des Auftrags, besondere Hinweise oder Absprachen..."
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
                <span className="font-semibold">Vorher-Dokumentation starten</span>
                <p className="mt-1 text-xs text-slate-400">
                  Empfohlen: direkt Fotos vom Zustand vor Beginn aufnehmen.
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
                ? "Auftrag erstellen und Vorher-Dokumentation starten"
                : "Auftrag erstellen"}
          </button>
        </form>
      </div>
    </main>
  );
}