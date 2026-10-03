import { useEffect } from "react";

const SITE_NAME = "BSI Properties";

// Sets the browser tab title. Every route calls this with its own
// page-specific title (or, for the admin, it's wired once in Dashboard.jsx
// using the same PAGE_TITLES map already driving the topbar heading —
// rather than adding this call to every individual admin page).
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  }, [title]);
}
