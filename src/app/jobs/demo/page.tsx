"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewDocumentationPage() {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    const previews = files.map((file) => URL.createObjectURL(file));

    setPhotoPreviews(previews);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/jobs/demo" className="text-sm font-semibold text-slate-300">
          ← Zurück zum Auftrag
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Dokumentation
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Zusatzarbeit dokumentieren
          </h1>

          <p className="mt-3 text-slate-300">
            Beschreibe die Zusatzarbeit, füge Fotos hinzu und erstelle daraus
            einen Freigabelink für den Kunden.
          </p>
        </div>

        <form className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Art der Dokumentation
            </label>
            <select className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none">
              <option>Zusatzarbeit</option>
              <option>Schaden entdeckt</option>
              <option>Fahrzeugannahme</option>
              <option>Nachher-Dokumentation</option>
              <option>Sonstiges</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Titel
            </label>
            <input
              type="text"
              placeholder="Bremsscheiben vorne ersetzen"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Beschreibung für den Kunden
            </label>
            <textarea
              rows={5}
              placeholder="Bei der Prüfung wurde festgestellt, dass die Bremsscheiben vorne stark verschlissen sind. Wir empfehlen den Austausch."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Preis / Kostenschätzung
            </label>
            <input
              type="text"
              placeholder="ca. 320 € inkl. MwSt."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-5">
            <p className="font-semibold">Fotos hinzufügen</p>
            <p className="mt-2 text-sm text-slate-400">
              Wähle ein oder mehrere Fotos aus. Auf dem Handy kann hier direkt
              die Kamera geöffnet werden.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300"
            />

            {photoPreviews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photoPreviews.map((previewUrl) => (
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt="Ausgewähltes Werkstattfoto"
                    className="h-32 w-full rounded-2xl object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <Link
            href="/f/demo-token"
            className="block w-full rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-950"
          >
            Freigabelink erstellen
          </Link>
        </form>
      </div>
    </main>
  );
}
