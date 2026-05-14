"use client";

import { useState } from "react";

type Photo = {
  id: string;
  fileUrl: string;
  fileName: string | null;
};

type PhotoGalleryProps = {
  photos: Photo[];
};

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActivePhoto(photo)}
            className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-left transition hover:border-white/30 active:scale-[0.98]"
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

      {activePhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative max-h-full w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
            >
              Schließen
            </button>

            <img
              src={activePhoto.fileUrl}
              alt={activePhoto.fileName || "Dokumentationsfoto"}
              className="max-h-[85vh] w-full rounded-2xl object-contain"
            />

            {activePhoto.fileName && (
              <p className="mt-3 text-center text-sm text-slate-300">
                {activePhoto.fileName}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}