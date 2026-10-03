// navigator.clipboard requires a secure context (HTTPS, or localhost) —
// it's entirely undefined otherwise, e.g. a phone hitting a LAN address
// over plain HTTP (the same restriction that broke crypto.randomUUID()
// earlier). Falls back to the older document.execCommand approach, which
// isn't subject to that restriction, so the Share button still works when
// testing on a real device this way.
export async function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy approach below.
    }
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}
