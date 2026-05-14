"use client";

import { useEffect, useState } from "react";

type Photo = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

type PhotoGalleryProps = {
  photos: Photo[];
  variant?: "dark" | "light";
};

export default function PhotoGallery({
  photos,
  variant = "dark",
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;
  const hasMultiplePhotos = photos.length > 1;

  function closeGallery() {
    setActiveIndex(null);
  }

  function showPreviousPhoto() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    });
  }

  function showNextPhoto() {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    });
  }

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeGallery();
      }

      if (event.key === "ArrowLeft") {
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        showNextPhoto();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  if (photos.length === 0) {
    return null;
  }

  const thumbnailClass =
    variant === "light"
      ? "overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-left transition hover:border-slate-400 active:scale-[0.98]"
      : "overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-left transition hover:border-white/30 active:scale-[0.98]";

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={thumbnailClass}
          >
            <div className="relative">
              <img
                src={photo.fileUrl}
                alt={photo.fileName || `Dokumentationsfoto ${index + 1}`}
                loading="lazy"
                className="h-28 w-full object-cover"
              />

              <span className="absolute left-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                {index + 1}
              </span>

              <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-white">
                Anzeigen
              </span>
            </div>
          </button>
        ))}
      </div>

      {activePhoto && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4"
          onClick={closeGallery}
        >
          <div
            className="relative flex max-h-full w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-sm font-semibold">
                  Foto {activeIndex + 1} von {photos.length}
                </p>

                {activePhoto.fileName && (
                  <p className="mt-1 max-w-[70vw] truncate text-xs text-slate-300">
                    {activePhoto.fileName}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closeGallery}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                Schließen
              </button>
            </div>

            <div className="relative flex min-h-0 items-center justify-center">
              {hasMultiplePhotos && (
                <button
                  type="button"
                  onClick={showPreviousPhoto}
                  className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl font-bold text-white transition hover:bg-black active:scale-[0.98] sm:left-4"
                  aria-label="Vorheriges Foto"
                >
                  ‹
                </button>
              )}

              <img
                src={activePhoto.fileUrl}
                alt={activePhoto.fileName || "Dokumentationsfoto"}
                className="max-h-[78vh] w-full rounded-2xl object-contain"
              />

              {hasMultiplePhotos && (
                <button
                  type="button"
                  onClick={showNextPhoto}
                  className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-2xl font-bold text-white transition hover:bg-black active:scale-[0.98] sm:right-4"
                  aria-label="Nächstes Foto"
                >
                  ›
                </button>
              )}
            </div>

            {hasMultiplePhotos && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2.5 rounded-full transition ${
                      index === activeIndex
                        ? "w-8 bg-white"
                        : "w-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Foto ${index + 1} anzeigen`}
                  />
                ))}
              </div>
            )}

            <p className="mt-3 text-center text-xs text-slate-400">
              Mit Pfeiltasten wechseln · ESC zum Schließen
            </p>
          </div>
        </div>
      )}
    </>
  );
}