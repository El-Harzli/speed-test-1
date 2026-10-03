import React from "react";
import { IoClose } from "react-icons/io5";
import { useProperties } from "../../../context/PropertiesContext";
import { GARAGE_CONVENIENCE } from "../../../lib/garageConvenience";
import { FALLBACK_PRICE_BOUNDS } from "./filterDefaults";

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-main bg-accent-500/5 border border-accent-500/15 rounded-full pl-3 pr-2 py-1.5">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove filter"
        className="text-secondary/50 hover:text-accent-500 transition-colors"
      >
        <IoClose className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterChips — shows every non-default filter as a removable chip.  */
/*  Type defaults to "All" (null) now, so any specific category chosen  */
/*  shows a chip, and clearing it goes back to All rather than to       */
/*  whichever category happened to be first.                           */
/* ------------------------------------------------------------------ */

function FilterChips({ filters, setFilters, search, onSearchChange, listingType, priceBounds }) {
  const { categories, subcategories, amenities, neighborhoods } = useProperties();
  const chips = [];
  const defaultPrice = priceBounds ?? FALLBACK_PRICE_BOUNDS[listingType] ?? FALLBACK_PRICE_BOUNDS.rent;

  const selectedCategory = categories.find((c) => c.id === filters.type);
  if (selectedCategory) {
    chips.push({
      key: "type",
      label: selectedCategory.name,
      onRemove: () => setFilters((f) => ({ ...f, type: null })),
    });
  }

  if (filters.subcategory) {
    const subLabel = subcategories.find((s) => s.id === filters.subcategory)?.name ?? filters.subcategory;
    chips.push({
      key: "subcategory",
      label: subLabel,
      onRemove: () => setFilters((f) => ({ ...f, subcategory: null })),
    });
  }

  if (filters.neighborhood) {
    const label = neighborhoods.find((n) => n.id === filters.neighborhood)?.name ?? filters.neighborhood;
    chips.push({
      key: "neighborhood",
      label,
      onRemove: () => setFilters((f) => ({ ...f, neighborhood: null })),
    });
  }

  const [minPrice, maxPrice] = filters.price;
  const [defaultMin, defaultMax] = defaultPrice;
  if (minPrice !== defaultMin || maxPrice !== defaultMax) {
    chips.push({
      key: "price",
      label: `${minPrice.toLocaleString("en-US")} – ${maxPrice.toLocaleString(
        "en-US",
      )} MAD`,
      onRemove: () =>
        setFilters((f) => ({ ...f, price: [...defaultPrice] })),
    });
  }

  if (filters.rooms) {
    chips.push({
      key: "rooms",
      label: `${filters.rooms}+ rooms`,
      onRemove: () => setFilters((f) => ({ ...f, rooms: null })),
    });
  }

  for (const id of filters.conveniences) {
    const label = id === GARAGE_CONVENIENCE.id ? GARAGE_CONVENIENCE.name : amenities.find((a) => a.id === id)?.name ?? id;
    chips.push({
      key: `amenity-${id}`,
      label,
      onRemove: () =>
        setFilters((f) => {
          const next = new Set(f.conveniences);
          next.delete(id);
          return { ...f, conveniences: next };
        }),
    });
  }

  if (search.trim()) {
    chips.push({
      key: "search",
      label: `"${search.trim()}"`,
      onRemove: () => onSearchChange(""),
    });
  }

  if (chips.length === 0) return null;

  const clearAll = () => {
    setFilters((f) => ({
      ...f,
      type: null,
      subcategory: null,
      neighborhood: null,
      rooms: null,
      price: [...defaultPrice],
      conveniences: new Set(),
    }));
    onSearchChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip) => (
        <Chip key={chip.key} onRemove={chip.onRemove}>
          {chip.label}
        </Chip>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-accent-500 hover:underline px-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export default FilterChips;
