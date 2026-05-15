"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import PhotoGallery from "@/components/PhotoGallery";

type Photo = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

type UploadResult = {
  success?: boolean;
  error?: string;
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
};

type ApiResult = {
  success?: boolean;
  error?: string;
};

type SelectedPhoto = {
  file: File;
  previewUrl: string;
  originalName: string;
  originalSize: number;
};

type DocumentationPhotoManagerProps = {
  itemId: string;
  photos: Photo[];
  canEdit: boolean;
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

export default function DocumentationPhotoManager({
  itemId,
  photos,
  canEdit,
}: DocumentationPhotoManagerProps) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

  const isBusy = isPreparing || isUploading || deletingPhotoId !== null;

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    setIsPreparing(true);

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
      setIsPreparing(false);
    }
  }

  function removeSelectedPhoto(previewUrl: string) {
    URL.revokeObjectURL(previewUrl);

    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((photo) => photo.previewUrl !== previewUrl)
    );
  }

  async function handleDeletePhoto(photoId: string) {
    if (isBusy || !canEdit) {
      return;
    }

    const confirmed = window.confirm(
      "Dieses Foto wirklich löschen?\n\nEs wird aus dieser Dokumentation entfernt."
    );

    if (!confirmed) {
      return;
    }

    setDeletingPhotoId(photoId);

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "DELETE",
      });

      const result = await readJsonSafely<ApiResult>(response);

      if (!response.ok) {
        alert(result?.error ?? "Foto konnte nicht gelöscht werden.");
        setDeletingPhotoId(null);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Foto konnte nicht gelöscht werden.");
      setDeletingPhotoId(null);
    }
  }

  async function handleUploadSelectedPhotos() {
    if (isBusy || !canEdit || selectedPhotos.length === 0) {
      return;
    }

    setIsUploading(true);

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
          setIsUploading(false);
          return;
        }

        if (!uploadResult?.fileUrl) {
          alert(
            "Foto konnte nicht hochgeladen werden. Die Upload-API hat keine gültige Antwort gesendet."
          );
          setIsUploading(false);
          return;
        }

        uploadedPhotos.push({
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          mimeType: uploadResult.mimeType,
        });
      }

      const attachResponse = await fetch(
        `/api/documentation-items/${itemId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photos: uploadedPhotos,
          }),
        }
      );

      const attachResult = await readJsonSafely<ApiResult>(attachResponse);

      if (!attachResponse.ok) {
        alert(
          attachResult?.error ??
            `Fotos konnten nicht gespeichert werden. Status: ${attachResponse.status}`
        );
        setIsUploading(false);
        return;
      }

      selectedPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.previewUrl);
      });

      setSelectedPhotos([]);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Fotos konnten nicht gespeichert werden.");
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-5">
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Fotos</p>
        <p className="text-sm text-slate-400">
          {photos.length === 0
            ? "Noch keine Fotos hinterlegt."
            : `${photos.length} Foto${photos.length === 1 ? "" : "s"} hinterlegt.`}
        </p>
      </div>

      {photos.length > 0 && (
        <div className="mt-4">
          <PhotoGallery photos={photos} />

          {canEdit && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={isBusy}
                  className="rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingPhotoId === photo.id
                    ? "Löscht..."
                    : `Foto ${index + 1} löschen`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {canEdit ? (
        <div className="mt-5 border-t border-white/10 pt-5">
          <p className="font-semibold">Neue Fotos hinzufügen</p>
          <p className="mt-2 text-sm text-slate-400">
            Du kannst weitere Fotos aufnehmen oder auswählen. Sie werden vor dem
            Upload automatisch verkleinert.
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

          {isPreparing && (
            <div className="mt-4 rounded-2xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold text-blue-100">
              Fotos werden vorbereitet und verkleinert...
            </div>
          )}

          {selectedPhotos.length > 0 && (
            <div className="mt-5">
              <p className="mb-3 text-sm font-semibold text-slate-200">
                {selectedPhotos.length} neues Foto
                {selectedPhotos.length === 1 ? "" : "s"} ausgewählt
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedPhotos.map((photo, index) => (
                  <div
                    key={photo.previewUrl}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
                  >
                    <div className="relative">
                      <img
                        src={photo.previewUrl}
                        alt={`Neues Foto ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                        Neu {index + 1}
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
                      onClick={() => removeSelectedPhoto(photo.previewUrl)}
                      disabled={isBusy}
                      className="w-full bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUploadSelectedPhotos}
                disabled={isBusy}
                className="mt-4 w-full rounded-2xl bg-white px-5 py-4 font-semibold text-slate-950 transition hover:bg-slate-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploading
                  ? "Fotos werden gespeichert..."
                  : "Neue Fotos speichern"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          Diese Fotos können nicht bearbeitet werden, weil die Dokumentation
          nicht mehr bearbeitbar ist.
        </p>
      )}
    </div>
  );
}