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
      {pending ? "Auftrag wird gelöscht..." : "Auftrag löschen"}
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
        ? `Auftrag wirklich löschen?\n\nDabei werden auch ${documentationCount} Dokumentation(en), Fotos, Freigaben und Nachweise zu diesem Auftrag entfernt.`
        : "Auftrag wirklich löschen?";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <SubmitButton />
    </form>
  );
}