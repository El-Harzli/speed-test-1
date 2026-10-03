// FeaturedProperties.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import PropertyCard from "../../BrowseProperties/Sections/PropertyCard";
import { useProperties } from "../../../context/PropertiesContext";
import { useFavorites } from "../../../context/FavoritesContext";
import SectionHeader from "../../../components/SectionHeader/SectionHeader";
import { buildPropertyUrl } from "../../../lib/propertyUrl";
import { Swiper, SwiperSlide } from "swiper/react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import "swiper/css";

function FeaturedProperties() {
  const [activeFilter, setActiveFilter] = useState("For Rent");
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const saleRef = useRef(null);
  const rentRef = useRef(null);
  const underlineRef = useRef(null);
  const tabsContainerRef = useRef(null);
  const swiperRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { properties, loading } = useProperties();
  const { favorites, toggleFavorite } = useFavorites();

  const listingType = activeFilter === "For Sale" ? "sale" : "rent";

  // Curated by the admin (Dashboard → Featured) — only properties with a
  // featured_order set show here, in the order they were arranged there.
  // Nothing here falls back to "just show recent properties": an agency
  // may deliberately want zero featured listings for a segment at a given
  // moment, and silently substituting something else would take that
  // choice away from them.
  const filtered = useMemo(
    () =>
      properties
        .filter((p) => p.listingType === listingType && p.featuredOrder != null)
        .sort((a, b) => a.featuredOrder - b.featuredOrder),
    [properties, listingType],
  );

  const recalcUnderline = useCallback(() => {
    const currentRef = activeFilter === "For Sale" ? saleRef : rentRef;
    const underline = underlineRef.current;
    const container = tabsContainerRef.current;

    if (currentRef.current && underline && container) {
      const rect = currentRef.current.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      underline.style.width = `${rect.width}px`;
      underline.style.transform = `translateX(${rect.left - containerRect.left}px)`;
    }
  }, [activeFilter]);

  // Recalculates on filter change, container resize, font-load reflow,
  // AND window resize/orientation change - the original only recalculated
  // once on mount/filter-change, so rotating a phone or resizing a window
  // would leave the underline stuck in the wrong place.
  useEffect(() => {
    recalcUnderline();

    const container = tabsContainerRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(recalcUnderline)
        : null;

    if (container && resizeObserver) resizeObserver.observe(container);

    window.addEventListener("resize", recalcUnderline);
    window.addEventListener("orientationchange", recalcUnderline);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", recalcUnderline);
      window.removeEventListener("orientationchange", recalcUnderline);
    };
  }, [recalcUnderline]);

  // Same overlay-on-top-of-the-current-page navigation BrowsePage uses —
  // keeps the homepage underneath instead of losing scroll position.
  const openDetail = (id) => {
    const property = properties.find((p) => p.id === id);
    if (!property) return;
    navigate(buildPropertyUrl(property), { state: { backgroundLocation: location } });
  };

  return (
    <div className="wrapper w-full py-9">
      <SectionHeader
        eyebrow="Exclusive Collection"
        title="Featured Properties"
        description="Discover handpicked residences that embody sophistication and timeless elegance in Tangier."
        className="mb-0!"
      />

      {/* FILTER TABS */}
      <div className="flex justify-center mt-6 mb-8">
        <div
          ref={tabsContainerRef}
          className="relative inline-flex items-center gap-6"
        >
          <span
            ref={underlineRef}
            className="absolute -bottom-[3px] h-[2px] bg-accent-400 transition-all duration-300 ease-out pointer-events-none"
            style={{ width: 0, transform: "translateX(0)" }}
          />

          {/* py + negative my enlarges the tap target on mobile without
              disturbing the visual layout or underline alignment */}

          <button
            type="button"
            onClick={() => setActiveFilter("For Rent")}
            aria-pressed={activeFilter === "For Rent"}
            className="py-2.5 -my-2.5 px-1"
          >
            <span
              ref={rentRef}
              className={`uppercase tracking-[0.15em] text-[10.5px] ${
                activeFilter === "For Rent"
                  ? "text-accent-500"
                  : "text-secondary"
              }`}
            >
              For Rent
            </span>
          </button>

          <div className="w-px h-4 bg-gold-500/20" />

          <button
            type="button"
            onClick={() => setActiveFilter("For Sale")}
            aria-pressed={activeFilter === "For Sale"}
            className="py-2.5 -my-2.5 px-1"
          >
            <span
              ref={saleRef}
              className={`uppercase tracking-[0.15em] text-[10.5px] ${
                activeFilter === "For Sale"
                  ? "text-accent-500"
                  : "text-secondary"
              }`}
            >
              For Sale
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[13px] text-secondary py-10">
          No properties available in this category yet.
        </p>
      ) : (
        <div className="relative">
          <Swiper
            // remounts cleanly on filter switch instead of carrying over
            // a slide index that may no longer exist in the new list
            key={activeFilter}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            onSlideChange={(swiper) => {
              setIsBeginning(swiper.isBeginning);
              setIsEnd(swiper.isEnd);
            }}
            watchOverflow
            grabCursor
            className="!px-0.5 !pt-2 !pb-8"
            breakpoints={{
              0: { slidesPerView: 1.15, spaceBetween: 12 },
              640: { slidesPerView: 1.5, spaceBetween: 16 }, // sm
              768: { slidesPerView: 2.5, spaceBetween: 18 }, // md (bump to 3.5 if you want it denser)
              1024: { slidesPerView: 3.5, spaceBetween: 20 }, // lg
              1280: { slidesPerView: 4.5, spaceBetween: 24 }, // xl
              1536: { slidesPerView: 5.2, spaceBetween: 24 }, // 2xl - keeps cards from stretching too wide
            }}
          >
            {filtered.map((property) => (
              <SwiperSlide key={property.id} className="h-auto self-stretch">
                <PropertyCard
                  property={property}
                  onSelect={() => openDetail(property.id)}
                  isFavorited={favorites.has(property.id)}
                  onToggleFavorite={() => toggleFavorite(property.id)}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav arrows for mouse/trackpad users; hidden on touch-first
              breakpoints where swipe is the natural gesture */}
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            aria-label="Previous properties"
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-5 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] items-center justify-center text-main transition-all duration-300 hover:bg-accent-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            <IoChevronBackOutline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            aria-label="Next properties"
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-5 z-10 w-10 h-10 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] items-center justify-center text-main transition-all duration-300 hover:bg-accent-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            <IoChevronForwardOutline className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="text-center mt-8">
        <button
          type="button"
          onClick={() => navigate(`/properties/${listingType}`)}
          className="inline-flex items-center gap-2 px-6 py-3 border border-accent-500 text-accent-500 uppercase tracking-[0.14em] text-[10.5px] rounded-md transition-colors duration-300 hover:bg-accent-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
        >
          View All Properties
        </button>
      </div>
    </div>
  );
}

export default FeaturedProperties;