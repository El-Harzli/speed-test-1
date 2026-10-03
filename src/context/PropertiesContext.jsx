import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { resolveIcon } from "../lib/iconMap";
import { fetchAllWithRetry } from "../lib/fetchAllWithRetry";
import { FALLBACK_IMG } from "../pages/BrowseProperties/Sections/format";

const PropertiesContext = createContext(null);

const FALLBACK_AGENT = {
  id: null,
  name: "Agency team",
  rating: 0,
  reviews: 0,
  avatar:
    "https://images.pexels.com/photos/28442318/pexels-photo-28442318.jpeg?auto=compress&cs=tinysrgb&h=120&w=120",
  phone: "",
};

// Used only if the site_settings row itself fails to load — see the
// "non-critical" handling below, same treatment as neighborhoods. Keeps
// the Call/WhatsApp links, footer identity, and Contact page map across
// the site working with real values rather than breaking outright on a
// settings fetch hiccup.
const FALLBACK_SETTINGS = {
  phone_number: "212645234175",
  phone_display: "+212 (0) 645 23 41 75",
  agency_name: "BSI Properties",
  email: "hello@bsiproperties.ma",
  instagram_url: "https://www.instagram.com/b.s.i_properties/",
  instagram_handle: "@bsiproperties",
  linkedin_url: "",
  address: "Tangier, Morocco",
  office_lat: 35.7595,
  office_lng: -5.834,
};

// Postgres `numeric` columns come back as strings over PostgREST — coerce
// office_lat/office_lng back to numbers, same as everywhere else in this
// file that touches a numeric column.
function normalizeSettings(row) {
  return { ...row, office_lat: Number(row.office_lat), office_lng: Number(row.office_lng) };
}

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

// Postgres `numeric` columns come back as strings over PostgREST — coerce
// focal_x/focal_y back to numbers, same as price/area/lat/lng below.
function normalizeFocal(row) {
  return {
    ...row,
    focal_x: Number(row.focal_x ?? 0.5),
    focal_y: Number(row.focal_y ?? 0.5),
  };
}

export function PropertiesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [categoryAmenityLinks, setCategoryAmenityLinks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [rawProperties, setRawProperties] = useState([]);
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [
      categoriesRes,
      subcategoriesRes,
      amenitiesRes,
      categoryAmenitiesRes,
      agentsRes,
      neighborhoodsRes,
      propertiesRes,
      imagesRes,
      propertyAmenitiesRes,
      settingsRes,
    ] = await fetchAllWithRetry([
      () => supabase.from("categories").select("*").order("sort_order", { ascending: true }),
      () => supabase.from("subcategories").select("*").order("sort_order", { ascending: true }),
      () => supabase.from("amenities").select("*").order("name", { ascending: true }),
      () => supabase.from("category_amenities").select("*"),
      () => supabase.from("agents").select("*"),
      () => supabase.from("neighborhoods").select("*").order("sort_order", { ascending: true }),
      () => supabase.from("properties").select("*").eq("status", "published").order("created_at", { ascending: false }),
      () => supabase.from("property_images").select("*"),
      () => supabase.from("property_amenities").select("*"),
      () => supabase.from("site_settings").select("*").eq("id", 1).single(),
    ]);

    // Neighborhoods and site_settings are deliberately excluded from this
    // check — see below. Neither is core to browsing properties at all, so
    // a problem with either should never be able to take down the entire
    // public site the way a failure in properties/categories/etc.
    // legitimately should.
    const firstError =
      categoriesRes.error ||
      subcategoriesRes.error ||
      amenitiesRes.error ||
      categoryAmenitiesRes.error ||
      agentsRes.error ||
      propertiesRes.error ||
      imagesRes.error ||
      propertyAmenitiesRes.error;

    if (firstError) {
      console.error(firstError);
      setError(firstError);
      setLoading(false);
      return;
    }

    if (neighborhoodsRes.error) {
      console.error("Neighborhoods failed to load (non-critical):", neighborhoodsRes.error);
    }
    if (settingsRes.error) {
      console.error("Site settings failed to load (non-critical):", settingsRes.error);
    } else {
      setSettings(normalizeSettings(settingsRes.data));
    }

    const imagesByProperty = {};
    for (const image of imagesRes.data) {
      if (!imagesByProperty[image.property_id]) imagesByProperty[image.property_id] = [];
      imagesByProperty[image.property_id].push(normalizeFocal(image));
    }

    const amenityIdsByProperty = {};
    for (const link of propertyAmenitiesRes.data) {
      if (!amenityIdsByProperty[link.property_id]) amenityIdsByProperty[link.property_id] = [];
      amenityIdsByProperty[link.property_id].push(link.amenity_id);
    }

    setCategories(sortByOrder(categoriesRes.data));
    setSubcategories(sortByOrder(subcategoriesRes.data));
    setAmenities(amenitiesRes.data);
    setCategoryAmenityLinks(categoryAmenitiesRes.data);
    setAgents(agentsRes.data);
    setNeighborhoods(
      neighborhoodsRes.error ? [] : sortByOrder(neighborhoodsRes.data.map(normalizeFocal)),
    );
    setRawProperties(
      propertiesRes.data.map((property) => ({
        ...property,
        images: (imagesByProperty[property.id] ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
        amenityIds: amenityIdsByProperty[property.id] ?? [],
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---- lookups --------------------------------------------------------

  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const subcategoriesById = useMemo(() => new Map(subcategories.map((s) => [s.id, s])), [subcategories]);
  const amenitiesById = useMemo(() => new Map(amenities.map((a) => [a.id, a])), [amenities]);
  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const neighborhoodsById = useMemo(() => new Map(neighborhoods.map((n) => [n.id, n])), [neighborhoods]);

  function getPropertyCountForNeighborhood(neighborhoodId) {
    return rawProperties.filter((property) => property.neighborhood_id === neighborhoodId).length;
  }

  function getPropertyCountForNeighborhoodByType(neighborhoodId, listingType) {
    return rawProperties.filter(
      (property) => property.neighborhood_id === neighborhoodId && property.listing_type === listingType,
    ).length;
  }

  function getSubcategoriesForCategory(categoryId) {
    return subcategories.filter((s) => s.category_id === categoryId);
  }

  // categoryId -> Set(amenityId) — mirrors the dashboard's
  // `getAmenityIdsForCategory`, used to only show filters that are
  // actually applicable to the selected property type.
  const amenityIdsByCategory = useMemo(() => {
    const map = new Map();
    for (const link of categoryAmenityLinks) {
      if (!map.has(link.category_id)) map.set(link.category_id, new Set());
      map.get(link.category_id).add(link.amenity_id);
    }
    return map;
  }, [categoryAmenityLinks]);

  function getAmenitiesForCategory(categoryId) {
    const ids = amenityIdsByCategory.get(categoryId);
    if (!ids) return [];
    return amenities.filter((a) => ids.has(a.id));
  }

  // ---- normalization ----------------------------------------------------
  // Shapes every row into exactly what PropertyCard / PropertyDetail /
  // PropertyMap / Filters already expect from the old mock data, so those
  // components don't need to know Supabase exists.

  const properties = useMemo(() => {
    return rawProperties.map((property) => {
      const category = categoriesById.get(property.category_id);
      const subcategory = subcategoriesById.get(property.subcategory_id);
      const neighborhood = neighborhoodsById.get(property.neighborhood_id);
      const agent = agentsById.get(property.agent_id) ?? FALLBACK_AGENT;
      const images = property.images ?? [];
      const resolvedAmenities = (property.amenityIds ?? [])
        .map((id) => amenitiesById.get(id))
        .filter(Boolean)
        .map((a) => ({ id: a.id, name: a.name, icon: resolveIcon(a.icon) }));

      return {
        id: property.id,
        title: property.title,
        description: property.description ?? "",
        location: property.location,
        // Numeric Postgres columns come back as strings over PostgREST —
        // coerce them the same way the dashboard's PropertiesContext does.
        price: Number(property.price),
        beds: Number(property.beds ?? 0),
        baths: Number(property.baths ?? 0),
        area: Number(property.area ?? 0),
        garage: Number(property.garage ?? 0),
        yearBuilt: property.year_built ? Number(property.year_built) : null,
        listingType: property.listing_type,
        popular: Boolean(property.popular),
        type: category?.name ?? "Property",
        categoryId: property.category_id ?? null,
        subcategoryId: property.subcategory_id ?? null,
        subcategory: subcategory?.name ?? null,
        neighborhoodId: property.neighborhood_id ?? null,
        neighborhood: neighborhood?.name ?? null,
        featuredOrder: property.featured_order ?? null,
        image: images[0]?.url ?? FALLBACK_IMG,
        // Focal point for the cover photo (used wherever `image` is shown
        // cropped, e.g. listing cards) and one per remaining gallery photo
        // (used by the detail page's thumbnail strip) — falls back to
        // dead-center (0.5/0.5) for any image nobody's repositioned.
        imageFocal: { x: images[0]?.focal_x ?? 0.5, y: images[0]?.focal_y ?? 0.5 },
        gallery: images.slice(1).map((img) => img.url),
        galleryFocal: images.slice(1).map((img) => ({ x: img.focal_x ?? 0.5, y: img.focal_y ?? 0.5 })),
        amenityIds: property.amenityIds ?? [],
        amenities: resolvedAmenities,
        agent: {
          id: agent.id,
          name: agent.name,
          rating: Number(agent.rating ?? 0),
          reviews: agent.reviews_count ?? agent.reviews ?? 0,
          avatar: agent.avatar_url ?? agent.avatar ?? FALLBACK_AGENT.avatar,
          phone: agent.phone ?? "",
        },
        // Lat/lng are optional on the property form (only `location` text
        // is required), so these can genuinely be null — PropertyMap needs
        // to filter these out before it tries to plot them.
        lat: property.lat === null || property.lat === undefined ? null : Number(property.lat),
        lng: property.lng === null || property.lng === undefined ? null : Number(property.lng),
      };
    });
  }, [rawProperties, categoriesById, subcategoriesById, neighborhoodsById, agentsById, amenitiesById]);

  const value = useMemo(
    () => ({
      properties,
      categories,
      subcategories,
      amenities,
      agents,
      neighborhoods,
      settings,
      loading,
      error,
      reload: load,
      getAmenitiesForCategory,
      getSubcategoriesForCategory,
      getPropertyCountForNeighborhood,
      getPropertyCountForNeighborhoodByType,
    }),
    [properties, categories, subcategories, amenities, agents, neighborhoods, settings, loading, error, load, amenityIdsByCategory],
  );

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
}

export function useProperties() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error("useProperties must be used within a PropertiesProvider");
  }
  return context;
}
