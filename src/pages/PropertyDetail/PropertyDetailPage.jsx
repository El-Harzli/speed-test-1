import React, { useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import PropertyDetail from "../BrowseProperties/Sections/PropertyDetail";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { formatPrice } from "../BrowseProperties/Sections/format";
import { buildPropertyUrl } from "../../lib/propertyUrl";
import { useProperties } from "../../context/PropertiesContext";
import { useFavorites } from "../../context/FavoritesContext";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";

function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, toggleFavorite } = useFavorites();
  const { properties, loading } = useProperties();

  const property = properties.find((p) => String(p.id) === id) || null;
  usePageTitle(property?.title);

  // Whatever URL got them here — the legacy bare /property/:id, a slug
  // that's gone stale because the title was edited since, or someone
  // hand-editing the address bar — there's exactly one canonical URL for
  // a given property, and every visit should end up on it. Without this,
  // Google could see the same listing as multiple different "pages".
  useEffect(() => {
    if (!property) return;
    const canonicalPath = buildPropertyUrl(property);
    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true, state: location.state });
    }
  }, [property, location.pathname, location.state, navigate]);

  // Same fallback shape the property-og-tags edge function uses (that one
  // runs server-side for the initial crawl/social-preview fetch; this
  // covers the same page when reached via in-app client-side navigation
  // instead, which the edge function never sees).
  const metaDescription = property
    ? property.description?.trim() ||
      `${[property.beds ? `${property.beds} bed` : null, property.baths ? `${property.baths} bath` : null]
        .filter(Boolean)
        .join(", ")} property in ${property.location}. ${formatPrice(property.price)}${
        property.listingType === "rent" ? " / month" : ""
      }.`
    : undefined;
  usePageMeta(metaDescription);

  // `location.key === "default"` means this page was loaded directly (a
  // fresh visit or a refresh) rather than reached by in-app navigation —
  // there's nothing to go back to, so send them to the browse page instead
  // of leaving the back button doing nothing (or leaving the app).
  const goBack = useCallback(() => {
    if (location.key === "default") {
      navigate(`/properties/${property?.listingType ?? "rent"}`);
    } else {
      navigate(-1);
    }
  }, [navigate, location, property]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-main mb-2">
            This property doesn&rsquo;t exist or is no longer listed.
          </p>
          <Link to="/properties/rent" className="text-accent-500 font-medium hover:underline">
            Back to properties
          </Link>
        </div>
      </div>
    );
  }

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: metaDescription,
    url: `${window.location.origin}${buildPropertyUrl(property)}`,
    image: property.image ? [property.image] : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.location,
      addressCountry: "MA",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "MAD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen bg-primary-500 pt-20 lg:pt-24">
      <script type="application/ld+json">{JSON.stringify(listingJsonLd)}</script>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumbs
          items={[
            { label: "Home", to: "/" },
            { label: property.listingType === "sale" ? "Buy" : "Rent", to: `/properties/${property.listingType}` },
            { label: property.title },
          ]}
        />
        <div className="mt-3">
          <PropertyDetail
            property={property}
            allProperties={properties}
            onClose={goBack}
            onSelectProperty={(nextProperty) => navigate(buildPropertyUrl(nextProperty))}
            isFavorited={favorites.has(property.id)}
            onToggleFavorite={toggleFavorite}
            isStandalonePage
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailPage;
