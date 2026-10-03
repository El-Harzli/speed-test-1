import React from "react";
import {
  IoLocationOutline,
  IoBedOutline,
  IoWaterOutline,
  IoExpandOutline,
  IoCarSportOutline,
  IoHeart,
  IoHeartOutline,
} from "react-icons/io5";
import { formatPrice, onImgError } from "./format";

/* ------------------------------------------------------------------ */
/*  StatChip — small icon + label pill, shared with PropertyDetail     */
/* ------------------------------------------------------------------ */

export function StatChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-secondary bg-primary-600 rounded-md px-2 py-1">
      <Icon className="w-3 h-3 text-accent-500" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  FavoriteButton                                                     */
/* ------------------------------------------------------------------ */

function FavoriteButton({ isFavorited, onToggleFavorite, className = "" }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavorite?.();
      }}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorited}
      className={`text-secondary/50 hover:text-accent-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-full ${className}`}
    >
      {isFavorited ? (
        <IoHeart className="w-4 h-4 text-accent-500" />
      ) : (
        <IoHeartOutline className="w-4 h-4" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  PropertyCard — one component, two layouts via `variant`            */
/* ------------------------------------------------------------------ */

function PropertyCard({
  property,
  variant = "grid",
  isSelected = false,
  isFavorited = false,
  onSelect,
  onToggleFavorite,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
    }
  };

  if (variant === "list") {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        className={`w-full flex gap-3 p-2.5 rounded-[16px] border cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
          isSelected
            ? "border-accent-500 bg-accent-500/5 ring-1 ring-accent-500"
            : "border-transparent hover:bg-primary-600"
        }`}
      >
        <div className="relative w-24 h-24 shrink-0 rounded-[12px] overflow-hidden bg-primary-600">
          <img
            src={property.image}
            alt={property.title}
            loading="lazy"
            onError={onImgError}
            className="w-full h-full object-cover"
            style={
              property.imageFocal
                ? { objectPosition: `${property.imageFocal.x * 100}% ${property.imageFocal.y * 100}%` }
                : undefined
            }
          />
          {property.popular && (
            <span className="absolute top-1.5 left-1.5 bg-gold-400 text-main text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded">
              Popular
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-base font-semibold text-accent-500 leading-none">
              {formatPrice(property.price)}
              {property.listingType === "rent" && (
                <span className="text-xs font-normal text-secondary/70">
                  {" "}
                  / month
                </span>
              )}
            </p>
            <FavoriteButton
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite}
              className="shrink-0"
            />
          </div>

          <h3 className="text-sm font-medium text-main truncate mt-1">
            {property.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-secondary/70 truncate mt-0.5">
            <IoLocationOutline className="w-3 h-3 shrink-0" />
            {property.location}
          </p>

          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {property.beds > 0 && (
              <StatChip icon={IoBedOutline}>
                {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
              </StatChip>
            )}
            <StatChip icon={IoExpandOutline}>{property.area}m²</StatChip>
            {property.garage > 0 && (
              <StatChip icon={IoCarSportOutline}>
                {property.garage} Garage
              </StatChip>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className="flex flex-col rounded-[24px] border border-accent-500/10 bg-white overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
    >
      <div className="relative h-44 shrink-0 overflow-hidden bg-primary-600">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          onError={onImgError}
          className="w-full h-full object-cover"
          style={
            property.imageFocal
              ? { objectPosition: `${property.imageFocal.x * 100}% ${property.imageFocal.y * 100}%` }
              : undefined
          }
        />
        {property.popular && (
          <span className="absolute top-3 left-3 bg-gold-400 text-main text-xs font-medium uppercase tracking-wide px-2 py-1 rounded-md">
            Popular
          </span>
        )}
        <FavoriteButton
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <p className="text-lg font-semibold text-accent-500">
          {formatPrice(property.price)}
          {property.listingType === "rent" && (
            <span className="text-xs font-normal text-secondary/70"> / month</span>
          )}
        </p>
        <h3 className="text-sm font-medium text-main truncate">
          {property.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-secondary/70 truncate">
          <IoLocationOutline className="w-3 h-3 shrink-0" />
          {property.location}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap mt-1">
          {property.beds > 0 && (
            <StatChip icon={IoBedOutline}>
              {property.beds} {property.beds === 1 ? "Bed" : "Beds"}
            </StatChip>
          )}
          {property.baths > 0 && (
            <StatChip icon={IoWaterOutline}>
              {property.baths} {property.baths === 1 ? "Bath" : "Baths"}
            </StatChip>
          )}
          <StatChip icon={IoExpandOutline}>{property.area}m²</StatChip>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;