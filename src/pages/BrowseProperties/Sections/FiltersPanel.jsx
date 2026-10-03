import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { FiltersContent } from "./Filters";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";

/* ------------------------------------------------------------------ */
/*  FiltersPanel — responsive filter overlay.                          */
/*  Below md: bottom sheet (slides up, flush to bottom, drag handle).  */
/*  md and up (until the 2xl inline sidebar takes over): centered      */
/*  modal dialog. Same component, same animation — just repositioned   */
/*  and re-rounded via breakpoint classes.                             */
/* ------------------------------------------------------------------ */

function FiltersPanel({ open, onClose, filters, setFilters, resultCount, listingType, priceBounds }) {
  useBodyScrollLock(open);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(26, 26, 26, 0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="relative w-full md:max-w-md bg-white rounded-t-[28px] md:rounded-[24px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] flex flex-col max-h-[88vh] md:max-h-[85vh] overflow-hidden"
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {/* Drag handle — mobile bottom-sheet affordance only */}
            <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-9 h-1 rounded-full bg-accent-500/15" />
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-b border-accent-500/10 shrink-0">
              <h3 className="text-base font-semibold text-main">Filters</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="text-secondary/60 hover:text-main transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
              <FiltersContent filters={filters} setFilters={setFilters} listingType={listingType} priceBounds={priceBounds} />
            </div>

            <div className="p-4 border-t border-accent-500/10 shrink-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-accent-500 hover:bg-accent-600 text-white rounded-[12px] py-3 text-sm font-medium transition-colors"
              >
                Show {resultCount} {resultCount === 1 ? "result" : "results"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default FiltersPanel;