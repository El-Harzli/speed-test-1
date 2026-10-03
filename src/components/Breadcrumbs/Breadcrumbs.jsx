import { Link } from "react-router";
import { IoChevronForward } from "react-icons/io5";

/**
 * items: [{ label, to }] — every item except the last should have `to`.
 * The last item is the current page: rendered as plain text with
 * aria-current="page", not a link (you don't link to where you already are).
 *
 * variant: "dark" (default) for light page backgrounds, "light" for use
 * over a photo/dark-overlay hero (e.g. Concierge) — swaps the text colors,
 * nothing structural.
 *
 * Renders both the visible trail and its BreadcrumbList structured data
 * from the same `items` array on purpose — two separate hand-maintained
 * copies (one JSX, one JSON-LD) are exactly how these end up silently
 * contradicting each other after the next edit.
 */
function Breadcrumbs({ items, className = "", variant = "dark" }) {
  const isLight = variant === "light";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      // Absolute URLs are what BreadcrumbList expects. window.location.origin
      // reflects whatever domain is actually serving the page — this stays
      // correct across local dev, staging, and production with nothing to
      // update by hand, unlike a hardcoded domain constant.
      ...(item.to ? { item: `${window.location.origin}${item.to}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <nav aria-label="Breadcrumb">
        <ol
          className={`flex flex-wrap items-center gap-1.5 text-[13px] ${
            isLight ? "text-white/60" : "text-secondary/70"
          } ${className}`}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                {index > 0 && (
                  <IoChevronForward
                    className={`w-3 h-3 shrink-0 ${isLight ? "text-white/30" : "text-secondary/40"}`}
                  />
                )}
                {isLast || !item.to ? (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={`font-medium truncate max-w-[200px] ${isLight ? "text-white" : "text-main"}`}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className={`transition-colors ${isLight ? "hover:text-white" : "hover:text-accent-500"}`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

export default Breadcrumbs;
