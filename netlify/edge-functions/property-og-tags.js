// Injects per-listing Open Graph / Twitter Card meta tags into the HTML for
// a property page — both the canonical /property/:slug/:id and the legacy
// bare /property/:id (old links, anything already shared/indexed before
// slugs existed) — so sharing a listing link (WhatsApp, Facebook, iMessage,
// etc.) shows that property's own title/photo/price instead of the
// site-wide defaults baked into index.html. Link-preview crawlers fetch the
// raw HTML and don't execute JavaScript, so this can't be solved client-side
// the way the tab title is (see src/hooks/usePageTitle.js) — the tags have
// to already be in the response before it reaches them.
//
// Declared inline via `config` below (Netlify's in-source configuration),
// so no netlify.toml entry is needed — this scopes the function to exactly
// this one route; every other request on the site is untouched by it.
//
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be set as
// environment variables with the "Edge functions" scope in Netlify's site
// settings — the build-time env vars used elsewhere in this project aren't
// automatically available to edge functions, which run per-request at
// deploy time, not at build time. Same values already used in
// src/lib/supabaseClient.js; the anon key is safe to reuse here since RLS
// (not this file) is what restricts what it can read.

const SITE_URL = Deno.env.get("VITE_SITE_URL") || "https://REPLACE-WITH-PRODUCTION-DOMAIN.example";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Mirrors src/pages/BrowseProperties/Sections/format.js's formatPrice —
// duplicated rather than imported since this file runs on Deno at the
// edge, a separate runtime from the Vite/React build.
function formatPrice(amount) {
  return `${Number(amount).toLocaleString("en-US")} MAD`;
}

// Mirrors src/lib/propertyUrl.js's slugify/buildPropertyUrl — duplicated
// for the same reason formatPrice above is: this runs on Deno at the
// edge, a separate runtime from the Vite/React build, so there's no
// module to share directly.
function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function buildPropertyPath(property) {
  const slug = slugify(property.title) || "property";
  return `/property/${slug}/${property.id}`;
}

async function fetchProperty(id, supabaseUrl, supabaseAnonKey) {
  const headers = { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` };

  // Same public, anon-role query the app itself runs (see
  // src/context/PropertiesContext.jsx) — RLS already scopes this to
  // published listings, so a draft or deleted property's id just comes
  // back empty rather than ever being fetchable here.
  const propertyRes = await fetch(
    `${supabaseUrl}/rest/v1/properties?id=eq.${id}&status=eq.published&select=id,title,description,location,price,listing_type,beds,baths&limit=1`,
    { headers },
  );
  if (!propertyRes.ok) return null;
  const [property] = await propertyRes.json();
  if (!property) return null;

  const imageRes = await fetch(
    `${supabaseUrl}/rest/v1/property_images?property_id=eq.${id}&select=url&order=sort_order.asc&limit=1`,
    { headers },
  );
  const [image] = imageRes.ok ? await imageRes.json() : [];

  return { ...property, image: image?.url ?? null };
}

function buildDescription(property) {
  const priceLabel =
    property.listing_type === "rent" ? `${formatPrice(property.price)} / month` : formatPrice(property.price);

  const fallbackDescription = [
    property.beds ? `${property.beds} bed` : null,
    property.baths ? `${property.baths} bath` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const descriptionSource =
    property.description?.trim() ||
    `${fallbackDescription ? `${fallbackDescription} property` : "Property"} in ${property.location}. ${priceLabel}.`;

  return descriptionSource.length > 200 ? `${descriptionSource.slice(0, 197)}...` : descriptionSource;
}

function buildMetaTags(property, description, pageUrl) {
  const title = `${property.title} — BSI Properties`;
  const image = property.image ?? `${SITE_URL}/og-image.jpg`;

  return `
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  `;
}

export default async (request, context) => {
  const response = await context.next();

  // Only ever touch actual HTML documents. The SPA's catch-all rewrite
  // (public/_redirects: /* -> /index.html) means this route pattern could
  // in principle see something other than the document itself; bail out
  // rather than risk mangling a non-HTML response.
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("VITE_SUPABASE_ANON_KEY");
  const id = context.params.id;

  if (!supabaseUrl || !supabaseAnonKey || !id) return response;

  let property;
  try {
    property = await fetchProperty(id, supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("[property-og-tags] Failed to fetch property:", error);
    return response; // Fall back to index.html's default tags.
  }

  // Unpublished, deleted, or a bad id — nothing to inject. The SPA's own
  // client-side handling for a missing property takes over as normal.
  if (!property) return response;

  const html = await response.text();
  const description = buildDescription(property);
  // Always the real canonical URL, regardless of which path pattern the
  // incoming request actually matched (the bare legacy /property/:id, a
  // slug that's since gone stale, or a hand-edited URL) — og:url and the
  // canonical tag should point at the one real URL for this listing, not
  // just echo back whatever was requested.
  const canonicalUrl = `${new URL(request.url).origin}${buildPropertyPath(property)}`;
  let withTags = html.replace("</head>", `${buildMetaTags(property, description, canonicalUrl)}</head>`);

  // index.html ships a static <meta name="description"> and <link
  // rel="canonical"> as page-wide defaults — replace them here rather than
  // appending new ones alongside, which would leave two of each in the
  // document (invalid/ambiguous for both tags).
  withTags = withTags.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`,
  );
  withTags = withTags.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
  );

  // The body length changed, so the original Content-Length header is now
  // wrong — drop it and let the runtime recompute it, or some clients will
  // truncate the response at the old byte count.
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(withTags, { status: response.status, headers });
};

export const config = { path: ["/property/:id", "/property/:slug/:id"] };
