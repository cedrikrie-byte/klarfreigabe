"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type JobStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

type JobStatusControlProps = {
  jobId: string;
  currentStatus: JobStatus;
  openApprovalsCount: number;
};

type ApiResult = {
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

function getStatusLabel(status: JobStatus, openApprovalsCount: number) {
  if (status === "ARCHIVED") return "Archiviert";

  if (openApprovalsCount > 0) {
    return `Wartet auf Freigabe (${openApprovalsCount})`;
  }

  if (status === "OPEN") return "Offen";
  if (status === "IN_PROGRESS") return "In Arbeit";
  if (status === "COMPLETED") return "Fertig";

  return status;
}

function getStatusClass(status: JobStatus, openApprovalsCount: number) {
  if (status === "ARCHIVED") return "bg-slate-700 text-slate-200";

  if (openApprovalsCount > 0) {
    return "bg-yellow-300/10 text-yellow-300";
  }

  if (status === "COMPLETED") return "bg-green-300/10 text-green-300";
  if (status === "IN_PROGRESS") return "bg-blue-300/10 text-blue-300";

  return "bg-slate-700 text-slate-200";
}

export default function JobStatusControl({
  jobId,
  currentStatus,
  openApprovalsCount,
}: JobStatusControlProps) {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<JobStatus>(
    currentStatus
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const isArchived = currentStatus === "ARCHIVED";
  const hasChanged = selectedStatus !== currentStatus;

  async function handleSaveStatus() {
    if (isSaving || isArchived || !hasChanged) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      const result = await readJsonSafely<ApiResult>(response);

      if (!response.ok) {
        setMessage(result?.error ?? "Status konnte nicht geändert werden.");
        setIsSaving(false);
        return;
      }

      setMessage("Status wurde gespeichert.");
      router.refresh();

      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error(error);
      setMessage("Unerwarteter Fehler beim Speichern des Status.");
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Auftragsstatus</p>

          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
              currentStatus,
              openApprovalsCount
            )}`}
          >
            {getStatusLabel(currentStatus, openApprovalsCount)}
          </span>

          {openApprovalsCount > 0 && currentStatus !== "ARCHIVED" && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Der Auftrag wartet automatisch auf Kundenfreigabe, solange offene
              Freigaben vorhanden sind.
            </p>
          )}

          {isArchived && (
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Archivierte Aufträge können nicht mehr bearbeitet werden.
            </p>
          )}
        </div>

        {!isArchived && (
          <div className="w-full sm:w-64">
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Manuell setzen
            </label>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as JobStatus)
              }
              disabled={isSaving}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="OPEN">Offen</option>
              <option value="IN_PROGRESS">In Arbeit</option>
              <option value="COMPLETED">Fertig</option>
            </select>

            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={isSaving || !hasChanged}
              className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Speichert..." : "Status speichern"}
            </button>

            {message && (
              <p className="mt-3 text-sm font-semibold text-slate-300">
                {message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}