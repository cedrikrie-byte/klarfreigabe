"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CustomerJobFormProps = {
  customerId: string;
  customerName: string;
};

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

export default function CustomerJobForm({
  customerId,
  customerName,
}: CustomerJobFormProps) {
  const router = useRouter();

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
          customerId,
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
    <form
      onSubmit={handleCreateJob}
      className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
    >
      <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
        <p className="font-semibold">Auftrag für bestehenden Kunden</p>
        <p className="mt-1">
          Der Auftrag wird direkt in der Kundenkartei von{" "}
          <strong>{customerName}</strong> gespeichert.
        </p>
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
            placeholder="E KF 1234"
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
          placeholder="Inspektion / Bremsenprüfung / Geräusch vorne rechts"
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

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/customers/${customerId}`}
          className="rounded-2xl border border-white/10 px-5 py-4 text-center font-semibold text-white transition hover:bg-white/10 active:scale-[0.98]"
        >
          Abbrechen
        </Link>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Auftrag wird erstellt..."
            : nextStep === "intake"
              ? "Erstellen und Annahme starten"
              : "Auftrag erstellen"}
        </button>
      </div>
    </form>
  );
}