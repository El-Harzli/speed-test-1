import React, { useState } from "react";
import { IoSwapVerticalOutline, IoChevronDownOutline } from "react-icons/io5";

export const SORT_OPTIONS = [
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "newest", label: "Newest" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = SORT_OPTIONS.find((o) => o.id === value);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm text-secondary hover:text-main transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-md"
      >
        <IoSwapVerticalOutline className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Sort:</span>
        <span className="font-medium text-main">{current?.label}</span>
        <IoChevronDownOutline className="w-3.5 h-3.5 shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-48 bg-white rounded-[16px] border border-accent-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === opt.id
                    ? "text-accent-500 font-medium bg-accent-500/5"
                    : "text-secondary hover:bg-primary-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SortDropdown;