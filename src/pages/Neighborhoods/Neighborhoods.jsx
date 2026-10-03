import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { IoLocationOutline, IoArrowForward } from "react-icons/io5";
import { useProperties } from "../../context/PropertiesContext";
import { onImgError, FALLBACK_IMG } from "../BrowseProperties/Sections/format";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

// The pill buttons/badge below use a plain semi-opaque `bg-black/35`
// rather than `backdrop-blur` — backdrop-filter forces the browser to
// continuously resample whatever's beneath it, every frame it's on
// screen. With several cards visible at once in this grid (each with 1-2
// of these), plus the page header's own blurred backdrop, that compounds
// into exactly the kind of scroll frame-rate drop this page was seeing,
// especially on integrated-GPU laptops. A flat translucent background
// sitting on the existing dark gradient overlay reads almost identically
// but costs nothing to composite.
function NeighborhoodCard({ neighborhood, index, rentCount, saleCount, onSelectType }) {
  // A neighborhood can have listings in one type, both, or neither — rather
  // than guessing which one someone wants (that was the actual bug: always
  // linking to rent silently hid sale-only listings, and a hardcoded sale
  // default would just hide rent-only ones instead), show both counts as
  // their own destinations when both genuinely exist, so nobody has to
  // land on the wrong list and hunt for a toggle.
  const hasRent = rentCount > 0;
  const hasSale = saleCount > 0;
  const hasBoth = hasRent && hasSale;
  const singleType = hasRent ? "rent" : "sale";
  const singleCount = hasRent ? rentCount : saleCount;

  // Nested interactive elements (a clickable card containing clickable
  // buttons) are an accessibility anti-pattern, so the whole-card click
  // only applies when there's a single, unambiguous destination — when
  // both exist, the two buttons below are the only interactive elements.
  const cardInteractionProps = hasBoth
    ? {}
    : {
        role: "button",
        tabIndex: 0,
        onClick: () => onSelectType(neighborhood, singleType),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectType(neighborhood, singleType);
          }
        },
        "aria-label": `Explore ${neighborhood.name} district`,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
      {...cardInteractionProps}
      className={`relative overflow-hidden rounded-[24px] border border-gold-400/10 shadow-sm group h-[280px] sm:h-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
        hasBoth ? "" : "cursor-pointer"
      }`}
    >
      <img
        src={neighborhood.image_url || FALLBACK_IMG}
        alt={neighborhood.name}
        onError={onImgError}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-1000 group-hover:scale-105"
        style={{ objectPosition: `${(neighborhood.focal_x ?? 0.5) * 100}% ${(neighborhood.focal_y ?? 0.5) * 100}%` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-white/70 mb-1">
            <IoLocationOutline className="w-3.5 h-3.5 text-gold-400" />
            <span className="uppercase text-[9px] font-bold tracking-[0.18em]">
              Tangier, Morocco
            </span>
          </div>
          <h3 className="text-white text-[22px] font-semibold mb-1 tracking-tight">
            {neighborhood.name}
          </h3>
          {neighborhood.description && (
            <p className="text-white/60 text-[13px] max-w-[280px] leading-snug">
              {neighborhood.description}
            </p>
          )}
        </div>

        {hasBoth ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelectType(neighborhood, "rent")}
              className="flex-1 flex items-center justify-between gap-1.5 rounded-full bg-black/35 border border-white/20 px-3.5 py-2 text-white text-[11px] font-semibold transition-colors hover:bg-accent-500 hover:border-accent-500 cursor-pointer"
            >
              <span>{rentCount} Rent</span>
              <IoArrowForward className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onSelectType(neighborhood, "sale")}
              className="flex-1 flex items-center justify-between gap-1.5 rounded-full bg-black/35 border border-white/20 px-3.5 py-2 text-white text-[11px] font-semibold transition-colors hover:bg-accent-500 hover:border-accent-500 cursor-pointer"
            >
              <span>{saleCount} Sale</span>
              <IoArrowForward className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        ) : singleCount > 0 ? (
          <div className="flex items-end justify-between gap-4">
            <p className="text-gold-400/90 text-[11px] font-medium uppercase tracking-[0.1em]">
              {singleCount} {singleCount === 1 ? "property" : "properties"}
            </p>
            <div className="w-11 h-11 rounded-full bg-black/35 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg transition-colors duration-300 group-hover:bg-accent-500 group-hover:border-accent-500 group-active:scale-90">
              <IoArrowForward className="w-5 h-5" />
            </div>
          </div>
        ) : (
          <p className="text-white/50 text-[11px] uppercase tracking-[0.1em]">No listings yet</p>
        )}
      </div>
    </motion.div>
  );
}

function Neighborhoods() {
  usePageTitle("Neighborhoods");
  usePageMeta(
    "Explore Tangier's neighborhoods, from the historic Kasbah to the modern Malabata coastline, and see available properties in each district."
  );
  const navigate = useNavigate();
  const { neighborhoods, loading, getPropertyCountForNeighborhoodByType } = useProperties();

  // Real filters now (properties have a neighborhood_id) — the listing
  // type is whichever one the person explicitly picked (see the two-button
  // split above), not guessed.
  function goToNeighborhoodType(neighborhood, listingType) {
    navigate(`/properties/${listingType}?neighborhood=${neighborhood.id}`);
  }

  return (
    <>
      <section className="bg-primary-500 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-10 md:pb-14 text-center">
        <div className="wrapper max-w-2xl mx-auto">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Neighborhoods" }]} className="justify-center mb-4" />
          <p className="uppercase text-[11px] font-medium text-accent-500 tracking-[0.22em] mb-3">
            Tangier Lifestyle
          </p>
          <h1 className="text-[32px] sm:text-[40px] md:text-[46px] font-semibold tracking-tight leading-[1.15] text-main mb-4">
            Discover Every District
          </h1>
          <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed max-w-lg mx-auto">
            Every neighborhood in Tangier has its own character. Pick one to
            see what&rsquo;s currently available there.
          </p>
        </div>
      </section>

      <section className="bg-white pb-14 md:pb-20">
        <div className="wrapper">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
            </div>
          ) : neighborhoods.length === 0 ? (
            <p className="text-center text-sm text-secondary/70 py-16">
              Our neighborhood guides are being put together — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {neighborhoods.map((neighborhood, index) => (
                <NeighborhoodCard
                  key={neighborhood.id}
                  neighborhood={neighborhood}
                  index={index}
                  rentCount={getPropertyCountForNeighborhoodByType(neighborhood.id, "rent")}
                  saleCount={getPropertyCountForNeighborhoodByType(neighborhood.id, "sale")}
                  onSelectType={goToNeighborhoodType}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </>
  );
}

export default Neighborhoods;
