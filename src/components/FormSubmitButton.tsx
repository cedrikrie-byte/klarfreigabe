"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export default function FormSubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
  variant = "primary",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  const className =
    variant === "secondary"
      ? "w-full rounded-2xl border border-white/10 px-5 py-4 font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      : "w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button type="submit" disabled={disabled || pending} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}