// Single source of truth for property URLs — every internal link, the
// canonical-redirect check on PropertyDetailPage, the sitemap generator,
// and the edge function all need to agree on exactly the same slug for a
// given property, or they'd each produce a different "canonical" URL for
// the same listing.
//
// The slug is generated from the title at call time rather than stored in
// Supabase — it can never go stale relative to the title (no migration,
// no backfill, no risk of the two drifting apart), at the cost of the
// slug changing if the title is ever edited. That's fine: routing here
// always keys off the id, never the slug — see PropertyDetailPage's
// redirect-to-canonical handling for how an old/stale slug in a URL is
// handled if that happens.

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (é -> e, etc.)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

// The id is the full Supabase UUID, not a shortened version — an 8-char
// prefix would only start risking collisions at a listing volume this
// agency will never reach, so there's no real payoff for that tradeoff.
// Slug and id stay as separate path segments rather than one hyphenated
// string specifically because the id already contains hyphens itself;
// two clean segments avoid ever having to guess where one ends and the
// other begins.
export function buildPropertyUrl(property) {
  const slug = slugify(property.title) || "property";
  return `/property/${slug}/${property.id}`;
}
