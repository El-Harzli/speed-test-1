export const DEFAULT_ROOMS = null;

// Fallback only — used before properties have loaded, or if a listing
// type genuinely has zero properties yet. Once real data exists, the
// slider's actual min/max come from computePriceBounds below instead.
export const FALLBACK_PRICE_BOUNDS = {
  rent: [0, 7000],
  sale: [0, 1600000],
};

export const PRICE_STEP = {
  rent: 50,
  sale: 5000,
};

// Detecting the real min/max from already-loaded properties is
// essentially free — the full property list for this listing type is
// already fetched for browsing regardless, so this needs no extra
// request and no meaningful added computation (a couple of Math.min/max
// calls over an array that's realistically dozens to a few hundred items
// for a boutique agency, not something that needs a heavier sync-with-
// dashboard-settings fallback).
export function computePriceBounds(properties, listingType) {
  const step = PRICE_STEP[listingType] ?? PRICE_STEP.rent;
  const relevant = properties.filter((p) => p.listingType === listingType);

  if (relevant.length === 0) {
    return [...(FALLBACK_PRICE_BOUNDS[listingType] ?? FALLBACK_PRICE_BOUNDS.rent)];
  }

  const prices = relevant.map((p) => p.price);
  const min = Math.floor(Math.min(...prices) / step) * step;
  const max = Math.ceil(Math.max(...prices) / step) * step;
  // Guard against a degenerate zero-width range (e.g. every property
  // currently costs exactly the same) so the slider always has room to move.
  return min === max ? [min, max + step] : [min, max];
}

// `type: null` means "All" — categories are admin-managed and can be
// reordered/renamed, so defaulting to "whichever happens to be first" was
// an arbitrary, easy-to-miss filter rather than a deliberate choice.
export function createDefaultFilters(listingType = "rent", priceBounds) {
  return {
    type: null,
    subcategory: null,
    neighborhood: null,
    rooms: DEFAULT_ROOMS,
    price: [...(priceBounds ?? FALLBACK_PRICE_BOUNDS[listingType] ?? FALLBACK_PRICE_BOUNDS.rent)],
    conveniences: new Set(),
  };
}
