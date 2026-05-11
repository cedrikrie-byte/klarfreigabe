"use client";

import { useState } from "react";

type SendApprovalEmailButtonProps = {
  token: string;
};

export default function SendApprovalEmailButton({
  token,
}: SendApprovalEmailButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setIsSending(true);
    setSent(false);

    const response = await fetch(`/api/approvals/${token}/send-email`, {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error ?? "E-Mail konnte nicht gesendet werden.");
      setIsSending(false);
      return;
    }

    setSent(true);
    setIsSending(false);

    setTimeout(() => {
      setSent(false);
    }, 3000);
  }

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={isSending}
      className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
    >
      {isSending ? "Sendet..." : sent ? "E-Mail gesendet" : "Per E-Mail senden"}
    </button>
  );
}