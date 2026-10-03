import { useEffect } from "react";

// Sibling to usePageTitle.js — same pattern (a useEffect that every route
// calls with its own values), but for <meta name="description"> and
// <link rel="canonical">. Before this, every page shared the one static
// description in index.html, and there was no canonical tag at all.
//
// Canonical uses window.location.origin rather than a hardcoded domain
// constant, same reasoning as the Breadcrumbs JSON-LD: it's always correct
// for whatever's actually serving the page (local dev, staging,
// production) with nothing to update by hand once a real domain exists.
function setMetaDescription(content) {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(pathname) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", `${window.location.origin}${pathname}`);
}

/**
 * @param {string} description - page-specific meta description. Required
 *   in practice (every route should pass its own), but left optional here
 *   rather than throwing, so a page mid-loading state can skip it for a
 *   render or two without crashing.
 * @param {string} [path] - overrides the canonical path if the current
 *   URL isn't the canonical one for this content (not needed anywhere
 *   yet, but e.g. useful once property URLs grow a slug and /property/:id
 *   alone should point at the slugged version).
 */
export default function usePageMeta(description, path) {
  useEffect(() => {
    if (description) setMetaDescription(description);
    setCanonical(path ?? window.location.pathname);
  }, [description, path]);
}
