"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  url: string;
};

export default function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-xl border border-white/10 px-3 py-2 text-center text-sm font-semibold text-white"
    >
      {copied ? "Kopiert" : "Link kopieren"}
    </button>
  );
}