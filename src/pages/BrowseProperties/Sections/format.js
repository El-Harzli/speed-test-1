export const formatPrice = (n) => `${n.toLocaleString("en-US")} MAD`;

export const FALLBACK_IMG =
  "https://placehold.co/800x600/f8f7f6/6d213c?text=Property+Photo";

export function onImgError(e) {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMG;
}