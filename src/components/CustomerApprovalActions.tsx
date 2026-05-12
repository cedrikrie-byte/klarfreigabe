"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CustomerApprovalActionsProps = {
  token: string;
};

type ActionResult = {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
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

export default function CustomerApprovalActions({
  token,
}: CustomerApprovalActionsProps) {
  const router = useRouter();

  const [customerComment, setCustomerComment] = useState("");
  const [status, setStatus] = useState<
    "idle" | "approving" | "rejecting" | "error"
  >("idle");

  const isLoading = status === "approving" || status === "rejecting";

  async function handleApprove() {
    if (isLoading) {
      return;
    }

    setStatus("approving");

    try {
      const response = await fetch(`/api/approvals/${token}/approve`, {
        method: "POST",
      });

      const result = await readJsonSafely<ActionResult>(response);

      if (!response.ok) {
        alert(result?.error ?? "Freigabe konnte nicht gespeichert werden.");
        setStatus("error");

        setTimeout(() => {
          setStatus("idle");
        }, 2500);

        return;
      }

      router.push(result?.redirectUrl ?? `/f/${token}/approved`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Freigabe konnte nicht gespeichert werden.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  async function handleReject() {
    if (isLoading) {
      return;
    }

    setStatus("rejecting");

    try {
      const formData = new FormData();
      formData.append("customerComment", customerComment);

      const response = await fetch(`/api/approvals/${token}/reject`, {
        method: "POST",
        body: formData,
      });

      const result = await readJsonSafely<ActionResult>(response);

      if (!response.ok) {
        alert(result?.error ?? "Rückfrage konnte nicht gesendet werden.");
        setStatus("error");

        setTimeout(() => {
          setStatus("idle");
        }, 2500);

        return;
      }

      router.push(result?.redirectUrl ?? `/f/${token}/rejected`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Rückfrage konnte nicht gesendet werden.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">
          {status === "approving"
            ? "Freigabe wird gesendet..."
            : "Rückfrage wird gesendet..."}
        </div>
      )}

      <button
        type="button"
        onClick={handleApprove}
        disabled={isLoading}
        className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "approving" ? "Freigabe wird gesendet..." : "Freigeben"}
      </button>

      <div className="space-y-3">
        <textarea
          name="customerComment"
          rows={4}
          value={customerComment}
          onChange={(event) => setCustomerComment(event.target.value)}
          disabled={isLoading}
          placeholder="Optional: Rückfrage oder Grund für die Ablehnung..."
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleReject}
          disabled={isLoading}
          className="w-full rounded-2xl border border-slate-300 px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "rejecting"
            ? "Rückfrage wird gesendet..."
            : "Ablehnen / Rückfrage senden"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-sm font-semibold text-red-700">
          Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
        </p>
      )}
    </div>
  );
}