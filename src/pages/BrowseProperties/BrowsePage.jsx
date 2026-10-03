import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation, useParams, useSearchParams, Navigate } from "react-router";
import Filters from "./Sections/Filters";
import FiltersPanel from "./Sections/FiltersPanel";
import PropertyList from "./Sections/PropertyList";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { createDefaultFilters, computePriceBounds } from "./Sections/filterDefaults";
import { useFavorites } from "../../context/FavoritesContext";
import { useProperties } from "../../context/PropertiesContext";
import { GARAGE_CONVENIENCE } from "../../lib/garageConvenience";
import { buildPropertyUrl } from "../../lib/propertyUrl";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";

const VALID_LISTING_TYPES = new Set(["rent", "sale"]);

function BrowsePage() {
  const { listingType } = useParams();
  usePageTitle(
    listingType === "sale" ? "Properties for Sale in Tangier" : "Properties for Rent in Tangier",
  );
  usePageMeta(
    listingType === "sale"
      ? "Browse verified apartments and villas for sale in Tangier. Updated listings across Tangier's finest neighborhoods from BSI Properties."
      : "Browse verified apartments and villas for rent in Tangier. Updated listings across Tangier's finest neighborhoods from BSI Properties.",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { properties, loading, error, reload } = useProperties();

  const [filters, setFilters] = useState(() =>
    createDefaultFilters(listingType, computePriceBounds(properties, listingType)),
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const { favorites, toggleFavorite } = useFavorites();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // A neighborhood card (or any other link) can send someone here with
  // ?q=Malabata pre-filled — this only pulls in a *new* term from the URL,
  // so it never fights with someone typing/clearing the box by hand.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  // Same idea, but for an exact neighborhood filter (?neighborhood=<id>) —
  // this is what the Neighborhoods pages actually link with now, since a
  // real relationship exists between properties and neighborhoods.
  useEffect(() => {
    const neighborhoodId = searchParams.get("neighborhood");
    if (neighborhoodId) {
      setFilters((f) => ({ ...f, neighborhood: neighborhoodId }));
    }
  }, [searchParams]);

  // Price ranges (and available property types/conveniences) differ enough
  // between renting and buying that carrying filters across a rent<->sale
  // switch would leave them showing a stale, wrong-scale range — reset to
  // that segment's defaults whenever it changes. This effect also fires on
  // mount, same as the ?neighborhood= sync effect above — re-reading the
  // URL here (rather than always resetting to null) is what stops this one
  // from silently wiping out a neighborhood filter that effect just set.
  useEffect(() => {
    const neighborhoodId = searchParams.get("neighborhood");
    setFilters({
      ...createDefaultFilters(listingType, computePriceBounds(properties, listingType)),
      neighborhood: neighborhoodId || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType]);

  // On first mount, `properties` is still empty when the state above
  // initializes (the lazy initializer runs before the async fetch
  // resolves), so the price slider starts out using the fallback range.
  // Once real data has actually arrived, sync it to the real detected
  // bounds. This only fires when `loading` itself flips — not on every
  // properties/filters change — so it can never clobber a price range the
  // user has since adjusted by hand; the whole filter UI is hidden behind
  // a loading spinner until this has already happened once anyway.
  useEffect(() => {
    if (loading) return;
    setFilters((f) => ({ ...f, price: computePriceBounds(properties, listingType) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const priceBounds = useMemo(
    () => computePriceBounds(properties, listingType),
    [properties, listingType],
  );

  const listingProperties = useMemo(
    () => properties.filter((p) => p.listingType === listingType),
    [properties, listingType],
  );

  const filteredProperties = useMemo(() => {
    return listingProperties.filter((p) => {
      if (filters.type && p.categoryId !== filters.type) return false;
      if (filters.subcategory && p.subcategoryId !== filters.subcategory) return false;
      if (filters.neighborhood && p.neighborhoodId !== filters.neighborhood) return false;

      const [minPrice, maxPrice] = filters.price;
      if (p.price < minPrice || p.price > maxPrice) return false;

      if (filters.rooms && p.beds < Number(filters.rooms)) return false;

      for (const c of filters.conveniences) {
        if (c === GARAGE_CONVENIENCE.id) {
          if (p.garage <= 0) return false;
        } else if (!p.amenityIds.includes(c)) {
          return false;
        }
      }

      if (search) {
        const haystack = `${p.title} ${p.location}`.toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [listingProperties, filters, search]);


  // Navigating to a real route (not just local state) is what makes each
  // listing shareable, bookmarkable, and indexable. Carrying the current
  // location as `backgroundLocation` lets App.jsx render it as an overlay
  // on top of this page instead of a full navigation — see App.jsx.
  const openDetail = useCallback(
    (id) => {
      const property = properties.find((p) => p.id === id);
      if (!property) return;
      navigate(buildPropertyUrl(property), { state: { backgroundLocation: location } });
    },
    [navigate, location, properties],
  );

  if (!VALID_LISTING_TYPES.has(listingType)) {
    return <Navigate to="/properties/rent" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-base font-medium text-main mb-1">
            Couldn&rsquo;t load properties.
          </p>
          <p className="text-sm text-secondary/70 mb-4">
            There was a problem reaching the server. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={reload}
            className="rounded-[12px] bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const pageHeading =
    listingType === "sale" ? "Properties for Sale in Tangier" : "Properties for Rent in Tangier";

  return (
    <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* This page had no heading at all before — PropertyList's internal
            "Search results" h2 was the first heading on the page, with
            nothing above it. That's both a broken heading hierarchy and a
            missed page title for search engines, since "Properties for
            Rent/Sale in Tangier" is exactly the kind of phrase this page
            should rank for. */}
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: listingType === "sale" ? "Buy" : "Rent" },
          ]}
        />

        <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-main mt-2 mb-5">
          {pageHeading}
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Inline filters sidebar — large desktop only (2xl+) */}
          <aside aria-label="Filter properties" className="hidden 2xl:block 2xl:w-80 2xl:shrink-0">
            <Filters filters={filters} setFilters={setFilters} listingType={listingType} priceBounds={priceBounds} />
          </aside>

          <div className="w-full">
            <PropertyList
              properties={filteredProperties}
              favorites={favorites}
              onSelectProperty={openDetail}
              onToggleFavorite={toggleFavorite}
              search={search}
              onSearchChange={setSearch}
              onOpenFilters={() => setFiltersOpen(true)}
              filters={filters}
              setFilters={setFilters}
              listingType={listingType}
              priceBounds={priceBounds}
            />
          </div>
        </div>
      </div>

      <FiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        resultCount={filteredProperties.length}
        listingType={listingType}
        priceBounds={priceBounds}
      />
    </div>
  );
}

export default BrowsePage;
