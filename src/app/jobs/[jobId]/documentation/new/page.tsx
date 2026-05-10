"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
};

export default function NewDocumentationPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();

  const [type, setType] = useState("ADDITIONAL_WORK");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    const newPhotos = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);

    event.target.value = "";
  }

  function removePhoto(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);

    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.previewUrl !== previewUrl)
    );
  }

  async function handleCreateApproval(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const uploadedPhotos = [];

    for (const photo of selectedPhotos) {
      const formData = new FormData();
      formData.append("file", photo.file);

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        alert(uploadResult.error ?? "Foto konnte nicht hochgeladen werden.");
        setIsLoading(false);
        return;
      }

      uploadedPhotos.push({
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        mimeType: uploadResult.mimeType,
      });
    }

    const response = await fetch("/api/documentation-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: params.jobId,
        type,
        title,
        description,
        priceText,
        photos: uploadedPhotos,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error ?? "Dokumentation konnte nicht gespeichert werden.");
      setIsLoading(false);
      return;
    }

    router.push(`/jobs/${params.jobId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/jobs/${params.jobId}`}
          className="text-sm font-semibold text-slate-300"
        >
          ← Zurück zum Auftrag
        </Link>

        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Dokumentation
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Dokumentation hinzufügen
          </h1>

          <p className="mt-3 text-slate-300">
            Beschreibe die Zusatzarbeit, füge Fotos hinzu und erstelle daraus
            einen Freigabelink für den Kunden.
          </p>
        </div>

        <form
          onSubmit={handleCreateApproval}
          className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-white/5 p-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Art der Dokumentation
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            >
              <option value="ADDITIONAL_WORK">Zusatzarbeit</option>
              <option value="DAMAGE_FOUND">Schaden entdeckt</option>
              <option value="VEHICLE_INTAKE">Fahrzeugannahme</option>
              <option value="AFTER_DOCUMENTATION">Nachher-Dokumentation</option>
              <option value="OTHER">Sonstiges</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Bremsscheiben vorne ersetzen"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Beschreibung für den Kunden
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Bei der Prüfung wurde festgestellt, dass die Bremsscheiben vorne stark verschlissen sind. Wir empfehlen den Austausch."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              Preis / Kostenschätzung
            </label>
            <input
              type="text"
              value={priceText}
              onChange={(event) => setPriceText(event.target.value)}
              placeholder="ca. 320 € inkl. MwSt."
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-5">
            <p className="font-semibold">Fotos hinzufügen</p>
            <p className="mt-2 text-sm text-slate-400">
              Wähle ein oder mehrere Fotos aus. Du kannst ausgewählte Fotos vor
              dem Speichern wieder entfernen.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-slate-300"
            />

            {selectedPhotos.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.previewUrl}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
                  >
                    <img
                      src={photo.previewUrl}
                      alt="Ausgewähltes Werkstattfoto"
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removePhoto(photo.previewUrl)}
                      className="w-full bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200"
                    >
                      Foto entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-white px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Dokumentation wird gespeichert..."
              : "Dokumentation speichern"}
          </button>
        </form>
      </div>
    </main>
  );
}