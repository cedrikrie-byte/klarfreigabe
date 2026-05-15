"use client";

import { useFormStatus } from "react-dom";

type ArchiveJobButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  documentationCount: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl border border-yellow-300/30 bg-yellow-300/10 px-4 py-3 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-300/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
    >
      {pending ? "Archiviert..." : "Auftrag archivieren"}
    </button>
  );
}

export default function ArchiveJobButton({
  action,
  documentationCount,
}: ArchiveJobButtonProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const message =
      documentationCount > 0
        ? `Auftrag archivieren?\n\nDer Auftrag bleibt mit ${documentationCount} Dokumentation(en), Fotos, Freigaben und Nachweisen erhalten, wird aber ins Archiv verschoben.`
        : "Auftrag archivieren? Der Auftrag bleibt erhalten und wird ins Archiv verschoben.";

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