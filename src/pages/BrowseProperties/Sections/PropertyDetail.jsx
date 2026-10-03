import React, { useState, useMemo, useCallback, useRef, useLayoutEffect, lazy, Suspense } from "react";
import { buildWhatsAppLink } from "./contact";
import {
  IoLocationOutline,
  IoBedOutline,
  IoWaterOutline,
  IoExpandOutline,
  IoCarSportOutline,
  IoClose,
  IoArrowBack,
  IoStar,
  IoCallOutline,
  IoChatbubbleOutline,
  IoHeart,
  IoHeartOutline,
  IoCalendarOutline,
  IoShareSocialOutline,
  IoCalculatorOutline,
  IoCheckmark,
} from "react-icons/io5";
import { formatPrice, onImgError } from "./format";
import { StatChip } from "./PropertyCard";
import { copyToClipboard } from "../../../lib/copyToClipboard";
import { useProperties } from "../../../context/PropertiesContext";

// None of these render on first paint — Lightbox and the calculator are
// both behind explicit toggles, and the location map only shows for
// listings that have coordinates set. Deferring them (and Leaflet, which
// PropertyLocationMap pulls in) keeps every property page's first load
// lighter, since most visitors never open the gallery lightbox or the
// calculator at all.
const Lightbox = lazy(() => import("./Lightbox"));
const MortgageCalculator = lazy(() => import("./MortgageCalculator"));
const PropertyLocationMap = lazy(() => import("./PropertyLocationMap"));

function MapLoadingFallback() {
  return (
    <div className="w-full h-64 rounded-[16px] border border-accent-500/10 flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
    </div>
  );
}

function PropertyDetail({
  property,
  allProperties,
  onClose,
  onSelectProperty,
  isFavorited,
  onToggleFavorite,
  isStandalonePage = false,
}) {
  const { settings } = useProperties();
  // Standalone page (/property/:id direct visit — what a crawler always
  // sees) gets a real <h1> for the title. The overlay variant renders this
  // same component on top of whatever page opened it (Home, BrowsePage —
  // both already have their own <h1>), so it uses <h2>/<h3> instead to
  // avoid a second <h1> existing in the DOM at the same time.
  const TitleTag = isStandalonePage ? "h1" : "h2";
  const SubheadingTag = isStandalonePage ? "h2" : "h3";
  const [expanded, setExpanded] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const descriptionRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [copied, setCopied] = useState(false);

  const gallery = property.gallery || [];
  const allImages = [property.image, ...gallery];

  // The thumbnail grid always has exactly 3 slots (1 main + 3 side tiles =
  // 4 visible), regardless of how many photos the listing actually has —
  // so "how many more are there" only makes sense relative to those 4, not
  // relative to the total image count.
  const MAX_VISIBLE_THUMBS = 3;
  const visibleGallery = gallery.slice(0, MAX_VISIBLE_THUMBS);
  const hiddenImageCount = allImages.length - (MAX_VISIBLE_THUMBS + 1);

  // Reset per property so switching listings (without this component
  // remounting — e.g. clicking a "similar property" card) doesn't carry
  // over a stale expanded/truncated state from the previous description.
  useLayoutEffect(() => {
    setExpanded(false);
    setIsDescriptionTruncated(false);
  }, [property.id]);

  // Whether the description actually overflows 3 clamped lines can't be
  // known from character count alone (word length, container width, and
  // font all affect it), so measure the real DOM instead. Only measure
  // while still clamped (`expanded` false) — once expanded, the paragraph
  // is its full height and would always read as "not truncated", which
  // would wrongly hide the "Read less" button.
  useLayoutEffect(() => {
    if (expanded) return;
    const el = descriptionRef.current;
    if (el) {
      setIsDescriptionTruncated(el.scrollHeight > el.clientHeight + 1);
    }
  }, [property.description, expanded]);

  const similar = useMemo(
    () =>
      allProperties
        .filter(
          (p) =>
            p.id !== property.id &&
            p.type === property.type &&
            p.listingType === property.listingType,
        )
        .slice(0, 3),
    [allProperties, property],
  );

  const openLightbox = (idx) => {
    setLightboxStart(idx);
    setLightboxOpen(true);
  };

  const handleShare = useCallback(async () => {
    const succeeded = await copyToClipboard(window.location.href);
    if (succeeded) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.error("Could not copy link");
    }
  }, []);

  return (
    <div className="w-full bg-white rounded-[24px] border border-accent-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 border-b border-accent-500/10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to results"
          className="shrink-0 text-main hover:text-accent-500"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-main truncate">
          {property.title}
        </span>
      </div>

      <div className="p-5">
        {/* Gallery */}
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="hidden lg:flex absolute top-3 left-3 z-10 w-10 h-10 rounded-full text-white items-center justify-center hover:scale-105 transition-transform"
            style={{ backgroundColor: "rgba(26, 26, 26, 0.7)" }}
          >
            <IoClose className="w-4 h-4" />
          </button>

          {/* Layout adapts to how many photos there actually are, instead
              of always reserving 3 side slots — e.g. 2 photos total reads
              oddly as "one big + 3 tiny (2 empty)"; 2 roughly-equal tiles
              reads better. 4+ keeps the original big-photo layout. */}
          {(() => {
            const mainTile = (
              <div
                className="relative rounded-[16px] overflow-hidden h-64 lg:h-80 cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={property.image}
                  alt={property.title}
                  onError={onImgError}
                  className="w-full h-full object-cover"
                  style={
                    property.imageFocal
                      ? { objectPosition: `${property.imageFocal.x * 100}% ${property.imageFocal.y * 100}%` }
                      : undefined
                  }
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    aria-label="Share property"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-main"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  >
                    {copied ? (
                      <IoCheckmark className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <IoShareSocialOutline className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Expand photos"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(0);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-main"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                  >
                    <IoExpandOutline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );

            const renderThumb = (src, i, overlayCount = 0) => {
              const focal = property.galleryFocal?.[i];
              return (
              <div
                key={i}
                onClick={() => openLightbox(i + 1)}
                className="relative rounded-[12px] overflow-hidden cursor-pointer"
              >
                <img
                  src={src}
                  alt={`${property.title} photo ${i + 2}`}
                  onError={onImgError}
                  className="w-full h-full object-cover"
                  style={focal ? { objectPosition: `${focal.x * 100}% ${focal.y * 100}%` } : undefined}
                />
                {overlayCount > 0 && (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: "rgba(26, 26, 26, 0.55)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(MAX_VISIBLE_THUMBS + 1);
                    }}
                  >
                    +{overlayCount}
                  </div>
                )}
              </div>
              );
            };

            // No gallery photos at all — just the one image, full width.
            if (gallery.length === 0) {
              return mainTile;
            }

            // Exactly 2 total photos — two even tiles side by side, no
            // small/large distinction since there's nothing to summarize.
            if (gallery.length === 1) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {mainTile}
                  <div
                    className="relative rounded-[16px] overflow-hidden h-64 lg:h-80 cursor-pointer"
                    onClick={() => openLightbox(1)}
                  >
                    <img
                      src={gallery[0]}
                      alt={`${property.title} photo 2`}
                      onError={onImgError}
                      className="w-full h-full object-cover"
                      style={
                        property.galleryFocal?.[0]
                          ? {
                              objectPosition: `${property.galleryFocal[0].x * 100}% ${
                                property.galleryFocal[0].y * 100
                              }%`,
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              );
            }

            // Exactly 3 total photos — big left + 2 stacked right, instead
            // of reserving a 3rd slot that'd just be empty.
            if (gallery.length === 2) {
              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  <div className="lg:col-span-2">{mainTile}</div>
                  <div className="grid grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-2 h-24 lg:h-80">
                    {gallery.map((src, i) => renderThumb(src, i))}
                  </div>
                </div>
              );
            }

            // 4+ total photos — big left + 3 side slots, with a "+N"
            // overlay on the last slot only when there's genuinely more.
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2">{mainTile}</div>
                <div className="grid grid-cols-3 lg:grid-cols-1 lg:grid-rows-3 gap-2 h-24 lg:h-80">
                  {visibleGallery.map((src, i) =>
                    renderThumb(src, i, i === visibleGallery.length - 1 ? hiddenImageCount : 0),
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Title + price */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mt-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 bg-accent-500/5 px-2 py-0.5 rounded-md">
                {property.type}
              </span>
              {property.popular && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-main bg-gold-400/40 px-2 py-0.5 rounded-md">
                  <IoStar className="w-3 h-3" />
                  Popular
                </span>
              )}
            </div>
            <TitleTag className="text-xl font-semibold text-main truncate">
              {property.title}
            </TitleTag>
            <p className="flex items-center gap-1.5 text-sm text-secondary/70 mt-1">
              <IoLocationOutline className="w-3.5 h-3.5 shrink-0" />
              {property.location}
            </p>
          </div>
          <p className="text-xl font-semibold text-accent-500 whitespace-nowrap">
            {formatPrice(property.price)}
            {property.listingType === "rent" && (
              <span className="text-sm font-normal text-secondary/70">
                {" "}
                / month
              </span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <StatChip icon={IoExpandOutline}>{property.area}m²</StatChip>
          {property.beds > 0 && (
            <StatChip icon={IoBedOutline}>{property.beds} Bedrooms</StatChip>
          )}
          {property.baths > 0 && (
            <StatChip icon={IoWaterOutline}>
              {property.baths} Bathrooms
            </StatChip>
          )}
          {property.garage > 0 && (
            <StatChip icon={IoCarSportOutline}>
              {property.garage} Garage
            </StatChip>
          )}
          {property.yearBuilt > 0 && (
            <StatChip icon={IoCalendarOutline}>
              Built {property.yearBuilt}
            </StatChip>
          )}
          {(property.amenities || []).map((a) => (
            <StatChip key={a.id} icon={a.icon}>
              {a.name}
            </StatChip>
          ))}
        </div>

        {/* Description */}
        <div className="mt-5 pt-5 border-t border-accent-500/10">
          <SubheadingTag className="text-sm font-semibold text-main mb-2">
            Property details
          </SubheadingTag>
          <p
            ref={descriptionRef}
            className={`text-sm text-secondary leading-relaxed ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {property.description}
          </p>
          {isDescriptionTruncated && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-accent-500 text-sm font-medium hover:underline mt-1"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>

        {/* Location — only renders if this listing has exact coordinates
            set (optional on the property form; `location` text always
            shows above regardless). */}
        {property.lat != null && property.lng != null && (
          <div className="mt-5 pt-5 border-t border-accent-500/10">
            <SubheadingTag className="text-sm font-semibold text-main mb-2">Location</SubheadingTag>
            <Suspense fallback={<MapLoadingFallback />}>
              <PropertyLocationMap lat={property.lat} lng={property.lng} />
            </Suspense>
          </div>
        )}

        {/* Mortgage calculator toggle (sale listings only — a mortgage
            estimates payments to buy the property, not to rent it) */}
        {property.listingType === "sale" && (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowCalculator((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-accent-500 hover:underline"
            >
              <IoCalculatorOutline className="w-4 h-4" />
              {showCalculator ? "Hide calculator" : "Estimate monthly mortgage"}
            </button>
            {showCalculator && (
              <Suspense fallback={null}>
                <MortgageCalculator price={property.price} />
              </Suspense>
            )}
          </div>
        )}

        {/* Agent */}
        <address className="not-italic flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-accent-500/10">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={property.agent.avatar}
              alt={property.agent.name}
              onError={onImgError}
              className="w-11 h-11 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-main truncate">
                {property.agent.name}
              </p>
              <p className="flex items-center gap-1 text-xs text-secondary/70">
                <IoStar className="w-3.5 h-3.5 text-gold-500" />
                {property.agent.rating} ({property.agent.reviews} reviews)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={buildWhatsAppLink(property.title, property.agent.phone, settings.phone_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-5 py-2.5 rounded-[12px] transition-colors"
            >
              <IoCallOutline className="w-4 h-4" />
              Contact
            </a>
            <button
              type="button"
              aria-label="Message agent"
              className="w-10 h-10 rounded-[12px] bg-main hover:bg-main/90 text-white flex items-center justify-center transition-colors"
            >
              <IoChatbubbleOutline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onToggleFavorite(property.id)}
              aria-label={
                isFavorited ? "Remove from favorites" : "Add to favorites"
              }
              className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors ${
                isFavorited
                  ? "bg-accent-500/10 text-accent-500"
                  : "bg-primary-600 text-secondary/50 hover:text-accent-500"
              }`}
            >
              {isFavorited ? (
                <IoHeart className="w-4 h-4" />
              ) : (
                <IoHeartOutline className="w-4 h-4" />
              )}
            </button>
          </div>
        </address>

        {/* Similar properties */}
        {similar.length > 0 && (
          <div className="mt-6 pt-5 border-t border-accent-500/10">
            <SubheadingTag className="text-sm font-semibold text-main mb-3">
              Similar {property.type.toLowerCase()}s nearby
            </SubheadingTag>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similar.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProperty(p)}
                  className="flex flex-col rounded-[16px] border border-accent-500/10 overflow-hidden text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all"
                >
                  <div className="h-24 overflow-hidden bg-primary-600">
                    <img
                      src={p.image}
                      alt={p.title}
                      loading="lazy"
                      onError={onImgError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-accent-500">
                      {formatPrice(p.price)}
                    </p>
                    <p className="text-xs text-main truncate">{p.title}</p>
                    <p className="text-xs text-secondary/70 truncate">
                      {p.location}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center"
              style={{ backgroundColor: "rgba(26, 26, 26, 0.92)" }}
            >
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          }
        >
          <Lightbox
            images={allImages}
            startIndex={lightboxStart}
            onClose={() => setLightboxOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default PropertyDetail;
