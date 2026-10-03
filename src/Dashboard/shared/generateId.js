// crypto.randomUUID() only works in a "secure context" — HTTPS, or
// localhost. It's unavailable when a browser connects over plain HTTP to a
// LAN address (e.g. a phone hitting http://192.168.x.x:5173, which is
// exactly what `vite --host` enables for testing on a real device). Used
// here only to make a unique-enough filename prefix for uploads, not for
// anything security-sensitive, so a simple fallback is perfectly fine.
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
