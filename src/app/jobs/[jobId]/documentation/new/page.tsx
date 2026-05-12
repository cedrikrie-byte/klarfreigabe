"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

type SelectedPhoto = {
  file: File;
  previewUrl: string;
  originalName: string;
  originalSize: number;
};

type UploadResult = {
  success?: boolean;
  error?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
};

type DocumentationResult = {
  success?: boolean;
  error?: string;
  documentationItemId?: string;
  approvalToken?: string;
};

const MAX_IMAGE_WIDTH = 1600;
const JPEG_QUALITY = 0.78;

async function readJsonSafely<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getDefaultTitle(type: string) {
  if (type === "VEHICLE_INTAKE") return "Fahrzeugannahme";
  if (type === "DAMAGE_FOUND") return "Schaden entdeckt";
  if (type === "AFTER_DOCUMENTATION") return "Nachher-Dokumentation";
  if (type === "OTHER") return "Dokumentation";

  return "";
}

function getDefaultDescription(type: string) {
  if (type === "VEHICLE_INTAKE") {
    return "Zustand des Fahrzeugs bei Abgabe dokumentiert.";
  }

  if (type === "AFTER_DOCUMENTATION") {
    return "Nachher-Zustand dokumentiert.";
  }

  return "";
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Bild konnte nicht gelesen werden."));
    };

    image.src = objectUrl;
  });
}

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  const image = await loadImageFromFile(file);

  const scale = Math.min(1, MAX_IMAGE_WIDTH / image.width);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    return file;
  }

  if (blob.size >= file.size) {
    return file;
  }

  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const compressedName = `${baseName}.jpg`;

  return new File([blob], compressedName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export default function NewDocumentationPage() {
  const router = useRouter();
  const params = useParams<{ jobId: string }>();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [type, setType] = useState("ADDITIONAL_WORK");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);

  const [isPreparingPhotos, setIsPreparingPhotos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isVehicleIntake = type === "VEHICLE_INTAKE";
  const isSimplePhotoDocumentation =
    type === "VEHICLE_INTAKE" || type === "AFTER_DOCUMENTATION";

  function handleTypeChange(nextType: string) {
    setType(nextType);

    if (nextType === "VEHICLE_INTAKE") {
      setTitle("");
      setDescription("");
      setPriceText("");
    }
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setIsPreparingPhotos(true);

    try {
      const newPhotos: SelectedPhoto[] = [];

      for (const file of files) {
        const compressedFile = await compressImage(file);

        newPhotos.push({
          file: compressedFile,
          previewUrl: URL.createObjectURL(compressedFile),
          originalName: file.name,
          originalSize: file.size,
        });
      }

      setSelectedPhotos((currentPhotos) => [...currentPhotos, ...newPhotos]);
    } catch (error) {
      console.error(error);
      alert("Ein oder mehrere Fotos konnten nicht vorbereitet werden.");
    } finally {
      setIsPreparingPhotos(false);
    }
  }

  function removePhoto(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);

    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.previewUrl !== previewUrl)
    );
  }

  async function handleCreateApproval(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isVehicleIntake && selectedPhotos.length === 0) {
      alert(
        "Bitte füge mindestens ein Foto hinzu, um die Fahrzeugannahme zu dokumentieren."
      );
      return;
    }

    setIsLoading(true);

    try {
      const uploadedPhotos = [];

      for (const photo of selectedPhotos) {
        const formData = new FormData();
        formData.append("file", photo.file);

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const uploadResult = await readJsonSafely<UploadResult>(uploadResponse);

        if (!uploadResponse.ok) {
          alert(
            uploadResult?.error ??
              `Foto konnte nicht hochgeladen werden. Status: ${uploadResponse.status}`
          );
          setIsLoading(false);
          return;
        }

        if (!uploadResult?.fileUrl) {
          alert(
            "Foto konnte nicht hochgeladen werden. Die Upload-API hat keine gültige Antwort gesendet."
          );
          setIsLoading(false);
          return;
        }

        uploadedPhotos.push({
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          mimeType: uploadResult.mimeType,
        });
      }

      const finalTitle =
        isSimplePhotoDocumentation && !title.trim()
          ? getDefaultTitle(type)
          : title.trim();

      const finalDescription =
        isSimplePhotoDocumentation && !description.trim()
          ? getDefaultDescription(type)
          : description.trim();

      const response = await fetch("/api/documentation-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: params.jobId,
          type,
          title: finalTitle,
          description: finalDescription,
          priceText: isVehicleIntake ? "" : priceText,
          photos: uploadedPhotos,
        }),
      });

      const result = await readJsonSafely<DocumentationResult>(response);

      if (!response.ok) {
        alert(
          result?.error ??
            `Dokumentation konnte nicht gespeichert werden. Status: ${response.status}`
        );
        setIsLoading(false);
        return;
      }

      router.push(`/jobs/${params.jobId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Unerwarteter Fehler beim Speichern der Dokumentation.");
      setIsLoading(false);
    }
  }

  const isBusy = isLoading || isPreparingPhotos;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href={`/jobs/${params.jobId}`}
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition active:scale-[0.98]"
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
            {isVehicleIntake
              ? "Dokumentiere den Zustand des Fahrzeugs bei Abgabe mit mehreren Fotos. Diese Dokumentation dient später als Nachweis bei Rückfragen oder Reklamationen."
              : "Beschreibe die Arbeit, füge Fotos hinzu und erstelle bei Bedarf einen Nachweis oder Freigabelink für den Kunden."}
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
              onChange={(event) => handleTypeChange(event.target.value)}
              disabled={isBusy}
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="ADDITIONAL_WORK">Zusatzarbeit</option>
              <option value="DAMAGE_FOUND">Schaden entdeckt</option>
              <option value="VEHICLE_INTAKE">Fahrzeugannahme</option>
              <option value="AFTER_DOCUMENTATION">Nachher-Dokumentation</option>
              <option value="OTHER">Sonstiges</option>
            </select>
          </div>

          {isVehicleIntake ? (
            <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm leading-6 text-blue-100">
              <p className="font-semibold">Fahrzeugannahme ohne Freigabe</p>
              <p className="mt-2">
                Für die Fahrzeugannahme brauchst du keinen Titel, keine
                Beschreibung und keinen Preis. Speichere einfach Fotos vom
                Zustand bei Abgabe, zum Beispiel Außenansichten, Innenraum,
                Felgen, vorhandene Kratzer, Dellen oder Schäden.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Titel
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={
                    type === "DAMAGE_FOUND"
                      ? "Kratzer an der Stoßstange"
                      : "Bremsscheiben vorne ersetzen"
                  }
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required={!isSimplePhotoDocumentation}
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
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                  required={!isSimplePhotoDocumentation}
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
                  disabled={isBusy}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </>
          )}

          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-5">
            <p className="font-semibold">
              {isVehicleIntake
                ? "Fahrzeugzustand fotografieren"
                : "Fotos hinzufügen"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {isVehicleIntake
                ? "Nimm direkt Fotos auf oder wähle vorhandene Bilder aus. Mehrere Fotos sind möglich. Bilder werden vor dem Upload automatisch verkleinert."
                : "Nimm direkt Fotos auf oder wähle ein oder mehrere vorhandene Fotos aus. Bilder werden vor dem Upload automatisch verkleinert."}
            </p>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isBusy}
                className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                📷 Foto aufnehmen
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isBusy}
                className="rounded-2xl border border-white/10 px-4 py-4 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                🖼️ Foto auswählen
              </button>
            </div>

            {isPreparingPhotos && (
              <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
                Fotos werden vorbereitet und verkleinert...
              </div>
            )}

            {selectedPhotos.length > 0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedPhotos.length} Foto
                    {selectedPhotos.length === 1 ? "" : "s"} ausgewählt
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedPhotos.map((photo, index) => (
                    <div
                      key={photo.previewUrl}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
                    >
                      <div className="relative">
                        <img
                          src={photo.previewUrl}
                          alt={`Ausgewähltes Werkstattfoto ${index + 1}`}
                          className="h-32 w-full object-cover"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                          {index + 1}
                        </span>
                      </div>

                      <div className="border-t border-white/10 px-3 py-2 text-xs text-slate-400">
                        <p className="truncate">{photo.originalName}</p>
                        <p>
                          {formatFileSize(photo.originalSize)} →{" "}
                          {formatFileSize(photo.file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePhoto(photo.previewUrl)}
                        disabled={isBusy}
                        className="w-full bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Foto entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
              Fotos und Dokumentation werden gespeichert. Bitte kurz warten...
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Speichert..."
              : isPreparingPhotos
                ? "Fotos werden vorbereitet..."
                : isVehicleIntake
                  ? "Fahrzeugannahme speichern"
                  : "Dokumentation speichern"}
          </button>
        </form>
      </div>
    </main>
  );
}