export const APP_NAME = "FreigabeOnline";
export const APP_DOMAIN = "freigabeonline.de";
export const APP_TAGLINE =
  "Reparaturen und Zusatzarbeiten online freigeben lassen.";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function getPublicUrl(path: string) {
  const baseUrl = APP_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
}