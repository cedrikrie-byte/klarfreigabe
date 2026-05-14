"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteDocumentationButtonProps = {
  itemId: string;
};

export default function DeleteDocumentationButton({
  itemId,
}: DeleteDocumentationButtonProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");

  async function handleDelete() {
    if (status === "deleting") {
      return;
    }

    const confirmed = window.confirm(
      "Diese Dokumentation wirklich löschen?\n\nFotos, Freigaben und Nachweise zu dieser Dokumentation werden dabei entfernt."
    );

    if (!confirmed) {
      return;
    }

    setStatus("deleting");

    try {
      const response = await fetch(`/api/documentation-items/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error ?? "Dokumentation konnte nicht gelöscht werden.");
        setStatus("error");

        setTimeout(() => {
          setStatus("idle");
        }, 2500);

        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Dokumentation konnte nicht gelöscht werden.");
      setStatus("error");

      setTimeout(() => {
        setStatus("idle");
      }, 2500);
    }
  }

  const label =
    status === "deleting"
      ? "Löscht..."
      : status === "error"
        ? "Fehler"
        : "Löschen";

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={status === "deleting"}
      className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-center text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
    >
      {label}
    </button>
  );
}