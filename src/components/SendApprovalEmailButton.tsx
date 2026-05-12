"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SendApprovalEmailButtonProps = {
  token: string;
};

export default function SendApprovalEmailButton({
  token,
}: SendApprovalEmailButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSend() {
    if (status === "sending") {
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(`/api/approvals/${token}/send-email`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? "E-Mail konnte nicht gesendet werden.");
        setStatus("error");

        setTimeout(() => {
          setStatus("idle");
        }, 2500);

        return;
      }

      setStatus("sent");
      router.refresh();

      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error) {
      console.error(error);
      alert("E-Mail konnte nicht gesendet werden.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  const label =
    status === "sending"
      ? "Sendet..."
      : status === "sent"
        ? "Gesendet ✓"
        : status === "error"
          ? "Fehler"
          : "Per E-Mail senden";

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={status === "sending"}
      className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
    >
      {label}
    </button>
  );
}