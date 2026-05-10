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
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Diese offene Dokumentation wirklich löschen?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    const response = await fetch(`/api/documentation-items/${itemId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error ?? "Dokumentation konnte nicht gelöscht werden.");
      setIsDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-3 text-center text-sm font-semibold text-red-200 disabled:cursor-not-allowed disabled:opacity-60 sm:py-2"
    >
      {isDeleting ? "Lösche..." : "Löschen"}
    </button>
  );
}