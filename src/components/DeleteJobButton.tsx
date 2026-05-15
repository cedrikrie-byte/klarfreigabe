"use client";

import { useFormStatus } from "react-dom";

type DeleteJobButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  documentationCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
    >
      {pending ? "Wird endgültig gelöscht..." : "Endgültig löschen"}
    </button>
  );
}

export default function DeleteJobButton({
  action,
  documentationCount,
}: DeleteJobButtonProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const message =
      documentationCount > 0
        ? `Auftrag ENDGÜLTIG löschen?\n\nDabei werden auch ${documentationCount} Dokumentation(en), Freigaben und Nachweise zu diesem Auftrag aus der Datenbank entfernt.\n\nDiese Aktion kann nicht rückgängig gemacht werden.`
        : "Auftrag ENDGÜLTIG löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      event.preventDefault();
      return;
    }

    const secondConfirm = window.confirm(
      "Bitte nochmal bestätigen: Der Auftrag wird wirklich gelöscht, nicht nur archiviert."
    );

    if (!secondConfirm) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <SubmitButton />
    </form>
  );
}