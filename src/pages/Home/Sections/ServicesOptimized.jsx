import {
  IoKeyOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import { TbAward } from "react-icons/tb";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import SectionHeader from "../../../components/SectionHeader/SectionHeader";

/* ============================================================
   SHARED DATA — single source of truth for both layouts
   ============================================================ */
const services = [

  {
    icon: IoHomeOutline,
    title: "Rent Real Estate",
    description:
      "Find your perfect rental home, or list your property with our thorough tenant screening and management services.",
    cta: "View Properties for Rent",
    number: "01",
    accent: "Perfect Match",
    to: "/properties/rent",
  },
    {
    icon: IoKeyOutline,
    title: "Buy Real Estate",
    description:
      "Expert guidance to secure your property at the best market value, backed by sharp negotiation and professional marketing.",
    cta: "View Properties for Sale",
    number: "02",
    accent: "Maximize Value",
    to: "/properties/sale",
  },
  {
    icon: TbAward,
    title: "Property Concierge",
    description:
      "Premium property management and personalized care for homeowners and investors who expect more in Tangier.",
    cta: "Discover Concierge Services",
    number: "03",
    accent: "White Glove Service",
    to: "/concierge",
  },
];

const CARD_STACK_DEPTH = 2; // mobile: how many cards behind the active one stay visible

// Shared focus style for every interactive element — keeps keyboard users
// oriented and gives every control the same accessible affordance.
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/* ============================================================
   MobileCarousel — stacked / swipeable card design.
   ============================================================ */
function MobileCarousel({ onSelectService }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % services.length);
  }, []);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  }, []);

  const handleDotClick = useCallback(
    (index) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  const handleDragEnd = useCallback(
    (event, info) => {
      const swipeThreshold = 50;
      if (info.offset.x > swipeThreshold) {
        handlePrevious();
      } else if (info.offset.x < -swipeThreshold) {
        handleNext();
      }
    },
    [handleNext, handlePrevious],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      }
    },
    [handleNext, handlePrevious],
  );

  const cardTransition = { type: "tween", duration: 0.32, ease: "easeOut" };
  const contentTransition = { duration: 0.2, ease: "easeOut" };

  return (
    <>
      {/* Stacked Cards Container */}
      <div
        id="services-carousel-region"
        className={`relative h-[400px] mb-6 rounded-[28px] ${FOCUS_RING}`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Our services"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <p className="sr-only" aria-live="polite">
          {`Showing service ${currentIndex + 1} of ${services.length}: ${
            services[currentIndex].title
          }`}
        </p>

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {services.map((service, index) => {
            const offset =
              (index - currentIndex + services.length) % services.length;
            const isActive = offset === 0;

            if (offset > CARD_STACK_DEPTH) return null;

            const zIndex = isActive ? 30 : 30 - offset;

            return (
              <motion.div
                key={service.number}
                initial={false}
                animate={{
                  x: isActive ? 0 : -10 * offset,
                  scale: isActive ? 1 : Math.max(0.86, 1 - offset * 0.08),
                  opacity: isActive ? 1 : Math.max(0.2, 0.6 - offset * 0.2),
                }}
                exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                transition={cardTransition}
                drag={isActive ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.12}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 w-full cursor-grab active:cursor-grabbing"
                style={{ transformOrigin: "center bottom", zIndex }}
                aria-hidden={!isActive}
              >
                <div
                  className="
                    relative
                    bg-white/95
                    rounded-[28px] p-7
                    border border-gold-400/30
                    shadow-[0_6px_18px_rgba(0,0,0,0.06)]
                    h-full
                    flex flex-col
                    overflow-hidden
                  "
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-accent-500 rounded-tr-3xl"></div>
                  </div>

                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <div>
                      <span className="text-[72px] font-bold leading-none bg-linear-to-br from-accent-500/15 via-accent-500/10 to-transparent bg-clip-text text-transparent">
                        {service.number}
                      </span>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            key="accent"
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={contentTransition}
                            className="text-[10px] uppercase tracking-[0.15em] text-gold-600 font-medium mt-1"
                          >
                            {service.accent}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div
                      className="
                        w-16 h-16 rounded-[20px]
                        bg-linear-to-br from-accent-500/10 to-accent-500/5
                        border border-accent-500/30
                        flex items-center justify-center
                        shadow-[0_2px_8px_rgba(109,33,60,0.06)]
                      "
                    >
                      <service.icon
                        className="w-7 h-7 text-accent-500"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <h3 className="text-[24px] font-semibold text-main mb-1.5 leading-[1.2]">
                    {service.title}
                  </h3>
                  <span
                    className="block h-[2px] w-8 bg-gold-500 rounded-full mb-3"
                    aria-hidden="true"
                  />

                  {/* min-h-0 lets this flex child actually shrink so overflow-y-auto
                      can take effect instead of silently clipping text — a safety
                      net for text reflow from accessibility zoom or translations. */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        key="description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={contentTransition}
                        className="text-[14px] text-secondary leading-[1.75] flex-1 min-h-0 pr-1"
                      >
                        {service.description}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Single full-width CTA per card. Navigation to the next
                      card is handled by swipe + the dots below; this button's
                      only job is routing to the specific service. */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key="footer-actions"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={contentTransition}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="mt-6"
                      >
                        <button
                          type="button"
                          onClick={() => onSelectService?.(service)}
                          className={`
                            w-full inline-flex items-center justify-center gap-1.5
                            px-4 py-3 rounded-full
                            bg-linear-to-br from-accent-500 to-accent-600
                            text-white text-[12px] font-medium
                            uppercase tracking-[0.08em]
                            shadow-[0_4px_14px_rgba(109,33,60,0.18)]
                            active:scale-95
                            transition-transform duration-200
                            touch-manipulation
                            ${FOCUS_RING}
                          `}
                        >
                          {service.cta}
                          <IoChevronForwardOutline
                            className="w-3.5 h-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div
        className="flex items-center justify-center gap-4 mb-4"
        role="tablist"
        aria-label="Select a service"
      >
        {services.map((service, index) => (
          <button
            key={service.number}
            type="button"
            role="tab"
            aria-selected={currentIndex === index}
            aria-controls="services-carousel-region"
            aria-label={`Go to ${service.title}`}
            onClick={() => handleDotClick(index)}
            // p-2 -m-2 enlarges the tap target to ~24px without changing the
            // visual dot size or the spacing between dots — small dots are a
            // common source of missed taps on touch devices.
            className={`group relative p-2 -m-2 touch-manipulation rounded-full ${FOCUS_RING}`}
          >
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "w-10 bg-linear-to-r from-accent-500 to-accent-600"
                  : "w-2 bg-accent-500/25 group-hover:bg-accent-500/50"
              }`}
            />
            {currentIndex === index && (
              <motion.div
                className="absolute -inset-1 bg-accent-500/10 rounded-full -z-10"
                initial={false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.18 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Swipe hint — takes the slot the numeric counter used to occupy.
          The dots above already show position, so this space is better
          spent telling first-time users the card responds to a swipe. */}
      <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.15em] text-tertiary">
        <IoChevronBackOutline
          className="w-3 h-3 text-accent-500/40"
          aria-hidden="true"
        />
        <span>Swipe to explore</span>
        <IoChevronForwardOutline
          className="w-3 h-3 text-accent-500/40"
          aria-hidden="true"
        />
      </div>
    </>
  );
}

/* ============================================================
   DesktopGrid — all 3 services shown at once. No active/inactive
   state, no drag, no stacking, no counter.
   ============================================================ */
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09 },
  },
};

const gridCardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

function DesktopGrid({ onSelectService }) {
  return (
    <>
      <motion.div
        role="list"
        className="grid grid-cols-3 gap-5 lg:gap-8 mb-8"
        variants={gridContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {services.map((service) => (
          <motion.div
            key={service.number}
            role="listitem"
            variants={gridCardVariants}
            whileHover={{ y: -6 }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="
              group relative
              bg-white/95
              rounded-[28px] p-6 lg:p-8
              border border-gold-400/30
              shadow-[0_6px_18px_rgba(0,0,0,0.06)]
              hover:shadow-[0_16px_32px_rgba(109,33,60,0.1)]
              hover:border-gold-400/60
              flex flex-col
              overflow-hidden
            "
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
              <div className="absolute top-4 right-4 w-20 h-20 border-t-2 border-r-2 border-accent-500 rounded-tr-3xl"></div>
            </div>

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <span className="text-[48px] lg:text-[64px] font-bold leading-none bg-linear-to-br from-accent-500/15 via-accent-500/10 to-transparent bg-clip-text text-transparent">
                  {service.number}
                </span>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gold-600 font-medium mt-1">
                  {service.accent}
                </p>
              </div>

              <div
                className="
                  w-12 h-12 lg:w-14 lg:h-14 rounded-[18px]
                  bg-linear-to-br from-accent-500/10 to-accent-500/5
                  border border-accent-500/30
                  flex items-center justify-center
                  shadow-[0_2px_8px_rgba(109,33,60,0.06)]
                  transition-transform duration-300
                  group-hover:scale-105
                "
              >
                <service.icon
                  className="w-5 h-5 lg:w-6 lg:h-6 text-accent-500"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
            </div>

            <h3 className="text-[21px] lg:text-[24px] font-semibold text-main mb-1.5 leading-[1.2]">
              {service.title}
            </h3>
            <span className="block h-[2px] w-8 bg-gold-500 rounded-full mb-3 transition-all duration-300 group-hover:w-14" />

            <p className="text-[14px] text-secondary leading-[1.75] flex-1">
              {service.description}
            </p>

            <button
              type="button"
              onClick={() => onSelectService?.(service)}
              className={`
                mt-6 self-start
                inline-flex items-center gap-2
                px-5 py-2.5 rounded-full
                border border-accent-500/30
                text-accent-500 text-[12px] font-medium
                uppercase tracking-[0.1em]
                group-hover:bg-linear-to-br group-hover:from-accent-500 group-hover:to-accent-600
                group-hover:text-white
                group-hover:border-transparent
                transition-colors duration-200
                active:scale-95
                ${FOCUS_RING}
              `}
            >
              {service.cta}
              <IoChevronForwardOutline
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary */}
      <p className="text-center text-[12px] text-tertiary">
        <span className="text-accent-500 font-medium">{services.length}</span>{" "}
        <span className="text-secondary">Signature Services</span>
      </p>
    </>
  );
}

/* ============================================================
   ServicesOptimized — root.
   ============================================================ */
function ServicesOptimized({ onSelectService } = {}) {
  return (
    <MotionConfig reducedMotion="user">
      <section className="relative bg-linear-to-b from-primary-600 via-primary-500 to-primary-600 py-9 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute top-10 right-10 w-48 h-48 bg-accent-500 rounded-full blur-[48px]"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-gold-500 rounded-full blur-[48px]"></div>
        </div>

        <div className="wrapper relative z-10">
          <SectionHeader
            eyebrow="What We Offer"
            eyebrowIcon={IoSparklesOutline}
            title="Every Step, Expertly Guided"
            description="From your first visit to years of ownership, we bring local expertise and a discreet, white-glove standard to every property journey in Tangier."
          />

          <div className="md:hidden">
            <MobileCarousel onSelectService={onSelectService} />
          </div>
          <div className="hidden md:block">
            <DesktopGrid onSelectService={onSelectService} />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

export default ServicesOptimized;
