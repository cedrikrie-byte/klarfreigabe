"use client";

import { useFormStatus } from "react-dom";

type ArchiveJobButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  mode: "archive" | "restore";
  documentationCount: number;
};

function SubmitButton({ mode }: { mode: "archive" | "restore" }) {
  const { pending } = useFormStatus();

  const isRestore = mode === "restore";

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        isRestore
          ? "w-full rounded-2xl bg-blue-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-blue-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
          : "w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
      }
    >
      {pending
        ? isRestore
          ? "Auftrag wird wieder geöffnet..."
          : "Auftrag wird archiviert..."
        : isRestore
          ? "Auftrag wieder öffnen"
          : "Auftrag archivieren"}
    </button>
  );
}

export default function ArchiveJobButton({
  action,
  mode,
  documentationCount,
}: ArchiveJobButtonProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const isRestore = mode === "restore";

    const message = isRestore
      ? "Auftrag wieder öffnen?\n\nDer Auftrag erscheint danach wieder im normalen Dashboard."
      : documentationCount > 0
        ? `Auftrag archivieren?\n\nDer Auftrag verschwindet aus der normalen Übersicht, bleibt aber mit ${documentationCount} Dokumentation(en), Fotos, Freigaben und Nachweisen erhalten.`
        : "Auftrag archivieren?\n\nDer Auftrag verschwindet aus der normalen Übersicht, bleibt aber erhalten.";

    const confirmed = window.confirm(message);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <SubmitButton mode={mode} />
    </form>
  );
}