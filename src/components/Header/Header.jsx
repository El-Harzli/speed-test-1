import { useState, useEffect, useRef } from "react";
import { CgMenuLeftAlt, CgClose } from "react-icons/cg";
import { IoCallOutline, IoLogoWhatsapp, IoHeartOutline } from "react-icons/io5";
import logo_cropped from "@assets/logo_nt.webp";
import { Link, NavLink } from "react-router";
import { useProperties } from "../../context/PropertiesContext";
import { useFavorites } from "../../context/FavoritesContext";
import FavoritesPanel from "../Favorites/FavoritesPanel";
import LanguageDropdown from "./LanguageDropdown";
import { NAV_LINKS } from "../../constants/navLinks";

function Header() {
  const { settings } = useProperties();
  const { favorites } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const HIDE_THRESHOLD = 80; // px scrolled before hide/show kicks in

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 10);

      if (currentScrollY < HIDE_THRESHOLD) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY.current) {
        setIsHidden(true); // scrolling down
      } else {
        setIsHidden(false); // scrolling up
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } ${isScrolled ? "shadow-sm" : ""}`}
      >
        {/* Plain flex + justify-between at every breakpoint now — there's
            no longer a middle item (logo) that needs a grid to center, so
            the earlier md:grid-cols-3 trick isn't needed. Logo only shows
            from lg up (see below); below that, the drawer's own header
            carries the logo instead. */}
        <div className="wrapper w-full flex items-center justify-between py-3 lg:py-4">
          {/* Hamburger + a small mark, grouped so they move together as one
              unit — brand presence still matters on mobile (shared links,
              screenshots), it just can't be a full centered logo without
              recreating the crowding you flagged before. Hidden at lg,
              where the full logo below takes over instead. */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="text-[26px] text-accent-500"
            >
              <CgMenuLeftAlt />
            </button>
            <Link to="/" className="h-7 shrink-0">
              <img className="h-full w-auto" src={logo_cropped} alt="Logo" />
            </Link>
          </div>

          {/* Full logo — desktop only; see the grouped small mark above for
              mobile/tablet. */}
          <Link to="/" className="hidden lg:block h-9 shrink-0">
            <img className="h-full w-auto" src={logo_cropped} alt="Logo" />
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <ul className="flex items-center gap-6 xl:gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `text-[14px] uppercase tracking-wide font-medium transition-colors ${
                        isActive
                          ? "text-accent-500"
                          : "text-neutral-800 hover:text-accent-500"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Favorites + language show at every breakpoint now that the
              logo isn't competing for room next to them on mobile. The CTA
              still needs more width than a phone-size bar comfortably has
              alongside two icons, so it only joins in from md up — it's
              still fully reachable on mobile via the drawer footer below. */}
          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              onClick={() => setIsFavoritesOpen(true)}
              aria-label={`View favorites (${favorites.size} saved)`}
              className="relative text-[22px] text-accent-500 hover:opacity-80 transition-opacity"
            >
              <IoHeartOutline />
              {favorites.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-accent-500 text-white text-[10px] font-semibold leading-none">
                  {favorites.size > 99 ? "99+" : favorites.size}
                </span>
              )}
            </button>

            <LanguageDropdown />

            <Link
              to="/contact"
              className="hidden md:inline-flex items-center bg-accent-500 text-white text-[13px] font-semibold uppercase tracking-wide px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </header>

      <FavoritesPanel isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />

      {/* Mobile / tablet drawer — favorites and language both live in the
          header itself now (visible at every breakpoint), so this stays
          to just nav + contact, same as it was before either was added
          here. */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`absolute top-0 left-0 h-full w-[80%] max-w-[360px] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <Link to="/" onClick={closeMenu} className="h-8">
              <img className="h-full w-auto" src={logo_cropped} alt="Logo" />
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="text-[24px] text-neutral-500"
            >
              <CgClose />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-8 gap-6">
            <ul className="flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `text-[18px] font-medium uppercase tracking-wide ${
                        isActive ? "text-accent-500" : "text-neutral-800"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-6 py-6 border-t border-neutral-100 space-y-3">
            <Link
              to="/contact"
              onClick={closeMenu}
              className="flex items-center justify-center bg-accent-500 text-white text-[14px] font-semibold uppercase tracking-wide py-3 rounded-full"
            >
              Get in Touch
            </Link>
            <div className="flex items-center justify-center gap-4 pt-2">
              <a
                href={`tel:+${settings.phone_number}`}
                className="flex items-center gap-2 text-neutral-600 text-[13px]"
              >
                <IoCallOutline className="text-[18px]" /> Call
              </a>
              <a
                href={`https://wa.me/${settings.phone_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#25D366] text-[13px]"
              >
                <IoLogoWhatsapp className="text-[18px]" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
