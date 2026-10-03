import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  IoList,
  IoGridOutline,
  IoMapOutline,
  IoSearchOutline,
  IoCloseCircleOutline,
  IoOptionsOutline,
} from "react-icons/io5";
import PropertyCard from "./PropertyCard";
import SortDropdown from "./SortDropdown";
import FilterChips from "./FilterChips";

// Leaflet is a genuinely heavy dependency (core JS + CSS + marker assets),
// and most visitors browse in grid view and never touch the map toggle —
// this keeps it out of the initial bundle entirely, only fetched the
// moment someone actually clicks "Map".
const PropertyMap = lazy(() => import("./PropertyMap"));

function MapLoadingFallback() {
  return (
    <div className="w-full h-[420px] sm:h-[520px] lg:h-[600px] rounded-[16px] border border-accent-500/10 flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
    </div>
  );
}

function PropertyList({
  properties = [],
  selectedId = null,
  favorites = new Set(),
  onSelectProperty = () => {},
  onToggleFavorite = () => {},
  search = "",
  onSearchChange = () => {},
  onOpenFilters = () => {},
  filters,
  setFilters,
  listingType,
  priceBounds,
}) {
  const [viewMode, setViewMode] = useState("grid");
  const [sort, setSort] = useState("popular");

  const sortedProperties = useMemo(() => {
    const result = [...properties];

    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result.sort((a, b) => (b.yearBuilt ?? 0) - (a.yearBuilt ?? 0));
        break;
      case "popular":
      default:
        result.sort((a, b) => Number(b.popular) - Number(a.popular));
        break;
    }

    return result;
  }, [properties, sort]);

  return (
    <div className="w-full bg-white rounded-[24px] border border-accent-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6">
      <h2 className="text-lg font-semibold text-main mb-4">
        Search results{" "}
        <span className="text-secondary/60 font-normal">
          ({sortedProperties.length})
        </span>
      </h2>

      {/* Search + filter toggle */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-white border border-accent-500/10 rounded-[12px] px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-accent-500 transition-shadow">
          <IoSearchOutline className="w-4 h-4 text-secondary/50 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or neighborhood..."
            className="flex-1 min-w-0 bg-transparent outline-none text-sm text-main placeholder:text-secondary/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="inline-flex items-center gap-1 text-secondary/40 hover:text-accent-500 transition-colors shrink-0 cursor-pointer"
            >
              <IoCloseCircleOutline className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Clear</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          aria-label="Open filters"
          className="2xl:hidden shrink-0 w-11 h-11 rounded-[12px] border border-accent-500/10 bg-white flex items-center justify-center text-secondary hover:border-accent-500/30 hover:text-accent-500 transition-colors"
        >
          <IoOptionsOutline className="w-5 h-5" />
        </button>
      </div>

      {/* Active filter chips */}
      {filters && setFilters && (
        <FilterChips
          filters={filters}
          setFilters={setFilters}
          search={search}
          onSearchChange={onSearchChange}
          listingType={listingType}
          priceBounds={priceBounds}
        />
      )}

      {/* Sort + view toggle */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <SortDropdown value={sort} onChange={setSort} />

        <div className="flex items-center gap-1 border border-accent-500/10 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-accent-500 text-white"
                : "text-secondary/50 hover:text-secondary"
            }`}
          >
            <IoList className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-accent-500 text-white"
                : "text-secondary/50 hover:text-secondary"
            }`}
          >
            <IoGridOutline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            aria-label="Map view"
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "map"
                ? "bg-accent-500 text-white"
                : "text-secondary/50 hover:text-secondary"
            }`}
          >
            <IoMapOutline className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {sortedProperties.length === 0 ? (
        <div className="text-center text-sm text-secondary/60 py-16 px-4">
          No properties match your filters. Try widening your price range or
          room count.
        </div>
      ) : viewMode === "map" ? (
        <Suspense fallback={<MapLoadingFallback />}>
          <PropertyMap
            properties={sortedProperties}
            selectedId={selectedId}
            onSelectProperty={onSelectProperty}
          />
        </Suspense>
      ) : viewMode === "list" ? (
        <div className="space-y-2.5">
          {sortedProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              variant="list"
              isSelected={p.id === selectedId}
              isFavorited={favorites.has(p.id)}
              onSelect={() => onSelectProperty(p.id)}
              onToggleFavorite={() => onToggleFavorite(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sortedProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              variant="grid"
              isSelected={p.id === selectedId}
              isFavorited={favorites.has(p.id)}
              onSelect={() => onSelectProperty(p.id)}
              onToggleFavorite={() => onToggleFavorite(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PropertyList;