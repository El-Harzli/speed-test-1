import React, { useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import PropertyDetail from "../BrowseProperties/Sections/PropertyDetail";
import { useProperties } from "../../context/PropertiesContext";
import { buildPropertyUrl } from "../../lib/propertyUrl";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { useFavorites } from "../../context/FavoritesContext";
import usePageTitle from "../../hooks/usePageTitle";

function PropertyDetailOverlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, toggleFavorite } = useFavorites();
  const { properties, loading } = useProperties();

  const property = properties.find((p) => String(p.id) === id) || null;
  usePageTitle(property?.title);

  // Always a true modal on top of the browse page underneath, regardless
  // of screen size, so it always locks scroll (unlike the old inline-panel
  // version, which was only a real overlay below lg).
  useBodyScrollLock(true);

  const close = useCallback(() => {
    if (location.key === "default") {
      navigate(`/properties/${property?.listingType ?? "rent"}`);
    } else {
      navigate(-1);
    }
  }, [navigate, location, property]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  // Still loading the property list on first paint (e.g. someone opened a
  // /property/:id link directly, so the overlay mounts before the fetch
  // that BrowsePage would normally have already triggered underneath it) —
  // wait rather than bouncing to the "not found" fallback prematurely.
  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-main/60 backdrop-blur-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!property) {
    // A dead/removed id shouldn't render a broken modal — fall through to
    // the full page, which has its own proper "not found" state.
    navigate(`/property/${id}`, { replace: true });
    return null;
  }

  // Similar-property clicks inside the overlay should open another
  // overlay, not lose the modal — and the "background" underneath needs
  // to stay the original browse page, not the property we're leaving.
  const backgroundLocation = location.state?.backgroundLocation ?? location;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-main/60 backdrop-blur-sm"
      />
      <div className="relative z-10 h-full overflow-y-auto p-3 lg:flex lg:items-start lg:justify-center lg:p-8">
        <div className="lg:max-w-4xl lg:w-full">
          <PropertyDetail
            property={property}
            allProperties={properties}
            onClose={close}
            onSelectProperty={(nextProperty) =>
              navigate(buildPropertyUrl(nextProperty), { state: { backgroundLocation } })
            }
            isFavorited={favorites.has(property.id)}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailOverlay;
