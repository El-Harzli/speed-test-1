// Single source of truth for the site's primary navigation — used by both
// Header (desktop nav + mobile drawer) and Footer. Previously each kept
// its own hand-copied list; Footer's had drifted to three dead `href="#"`
// placeholders instead of real routes. One shared list means there's only
// one place left to update when a route changes.
export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Buy", to: "/properties/sale" },
  { label: "Rent", to: "/properties/rent" },
  { label: "Neighborhoods", to: "/neighborhoods" },
  { label: "Concierge", to: "/concierge" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];
