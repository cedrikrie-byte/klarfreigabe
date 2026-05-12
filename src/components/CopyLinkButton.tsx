"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  url: string;
};

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle"
  );

  async function handleCopy() {
    if (!url || status === "copying") {
      return;
    }

    setStatus("copying");

    try {
      await navigator.clipboard.writeText(url);

      setStatus("copied");

      setTimeout(() => {
        setStatus("idle");
      }, 2000);
    } catch (error) {
      console.error(error);

      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  const label =
    status === "copying"
      ? "Kopiert..."
      : status === "copied"
        ? "Kopiert ✓"
        : status === "error"
          ? "Fehler"
          : "Link kopieren";

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!url || status === "copying"}
      className="rounded-xl border border-white/10 px-3 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
    >
      {label}
    </button>
  );
}