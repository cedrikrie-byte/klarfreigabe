export const APP_NAME = "FreigabeOnline";
export const APP_DOMAIN = "freigabeonline.de";
export const APP_TAGLINE =
  "Foto-Dokumentation, Kundenfreigaben und Nachweise für Handwerks- und Servicebetriebe.";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getPublicUrl(path: string) {
  const baseUrl = APP_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}