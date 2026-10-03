import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { IoLocationOutline, IoArrowForward, IoChevronForward } from "react-icons/io5";
import { useProperties } from "../../../context/PropertiesContext";
import { onImgError, FALLBACK_IMG } from "../../BrowseProperties/Sections/format";
import SectionHeader from "../../../components/SectionHeader/SectionHeader";

// First 3 by sort_order (managed at /admin/neighborhoods) — same grid
// layout as before, now driven by real, admin-editable content instead of
// a hardcoded array with stock photos.
const GRID_CLASSES = ["sm:col-span-2 lg:col-span-1", "sm:col-span-1 lg:col-span-2", "sm:col-span-1 lg:col-span-2"];

// Handles its own navigation (like the standalone /neighborhoods page)
// rather than taking onSelectDistrict/onViewAllDistricts callback props —
// one less thing to keep in sync between the two.
function Neighborhoods() {
  const navigate = useNavigate();
  const { neighborhoods, loading, getPropertyCountForNeighborhoodByType } = useProperties();
  const featured = neighborhoods.slice(0, 3);

  if (loading || featured.length === 0) return null;

  function goToNeighborhoodType(area, listingType) {
    navigate(`/properties/${listingType}?neighborhood=${area.id}`);
  }

  return (
    <section className="bg-primary-500 py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
      <div className="wrapper">
        {/* HEADER */}
        <SectionHeader
          eyebrow="Tangier Lifestyle"
          title={
            <>
              Discover the <br />
              <span className="text-accent-500">Perfect District</span>
            </>
          }
        />

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {featured.map((area, index) => (
            <DistrictCard
              key={area.id}
              area={area}
              index={index}
              rentCount={getPropertyCountForNeighborhoodByType(area.id, "rent")}
              saleCount={getPropertyCountForNeighborhoodByType(area.id, "sale")}
              onSelectType={goToNeighborhoodType}
              className={`h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px] ${GRID_CLASSES[index] ?? ""}`}
            />
          ))}

          {/* INTEGRATED CTA TILE - now part of the grid at every breakpoint */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: featured.length * 0.1, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
            role="button"
            tabIndex={0}
            onClick={() => navigate("/neighborhoods")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/neighborhoods");
              }
            }}
            aria-label="Browse all districts"
            className="relative overflow-hidden rounded-[24px] bg-white border border-accent-500/10 shadow-sm p-7 sm:p-8 md:p-9 lg:p-10 flex flex-col justify-between group cursor-pointer h-[260px] sm:h-[320px] md:h-[360px] lg:h-[420px] sm:col-span-2 lg:col-span-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
          >
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-2xl bg-accent-500/5 flex items-center justify-center">
                <IoLocationOutline className="text-accent-500 w-6 h-6 sm:w-6.5 sm:h-6.5 md:w-7 md:h-7" />
              </div>
              <h3 className="text-main text-[clamp(1.5rem,1.2rem+1vw,1.875rem)] font-semibold leading-[1.1] tracking-tight">
                Explore All <br /> <span className="text-accent-500">Neighborhoods</span>
              </h3>
              <p className="text-secondary/60 text-[13px] sm:text-[14px] leading-relaxed max-w-[220px]">
                Discover every district handpicked for sophistication.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-accent-500 transition-transform duration-300 group-hover:translate-x-2">
              Browse More <IoChevronForward className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-500/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DistrictCard({ area, className, index, rentCount, saleCount, onSelectType }) {
  // Same reasoning as the standalone /neighborhoods page: a district with
  // both rent and sale listings shows both as their own destinations
  // instead of guessing which one to send someone to.
  const hasRent = rentCount > 0;
  const hasSale = saleCount > 0;
  const hasBoth = hasRent && hasSale;
  const singleType = hasRent ? "rent" : "sale";
  const singleCount = hasRent ? rentCount : saleCount;

  const cardInteractionProps = hasBoth
    ? {}
    : {
        role: "button",
        tabIndex: 0,
        onClick: () => onSelectType(area, singleType),
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectType(area, singleType);
          }
        },
        "aria-label": `Explore ${area.name} district`,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      {...cardInteractionProps}
      className={`relative overflow-hidden rounded-[24px] border border-gold-400/10 shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
        hasBoth ? "" : "cursor-pointer"
      } ${className}`}
    >
      <img
        src={area.image_url || FALLBACK_IMG}
        alt={area.name}
        onError={onImgError}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-1000 group-hover:scale-105"
        style={{ objectPosition: `${(area.focal_x ?? 0.5) * 100}% ${(area.focal_y ?? 0.5) * 100}%` }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-6 md:p-8 flex flex-col justify-end">
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-white/70 mb-1">
            <IoLocationOutline className="w-3.5 h-3.5 text-gold-400" />
            <span className="uppercase text-[9px] font-bold tracking-[0.18em]">Tangier, Morocco</span>
          </div>
          <h3 className="text-white text-[clamp(1.375rem,1.05rem+1.1vw,1.75rem)] font-semibold mb-1 tracking-tight">
            {area.name}
          </h3>
          {area.description && (
            <p className="text-white/60 text-[12px] sm:text-[13px] max-w-[280px] leading-snug">
              {area.description}
            </p>
          )}
        </div>

        {hasBoth ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSelectType(area, "rent")}
              className="flex-1 flex items-center justify-between gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 text-white text-[11px] font-semibold transition-colors hover:bg-accent-500 hover:border-accent-500 cursor-pointer"
            >
              <span>{rentCount} Rent</span>
              <IoArrowForward className="w-3.5 h-3.5 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => onSelectType(area, "sale")}
              className="flex-1 flex items-center justify-between gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-2 text-white text-[11px] font-semibold transition-colors hover:bg-accent-500 hover:border-accent-500 cursor-pointer"
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
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg transition-colors duration-300 group-hover:bg-accent-500 group-hover:border-accent-500 group-active:scale-90">
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

export default Neighborhoods;
