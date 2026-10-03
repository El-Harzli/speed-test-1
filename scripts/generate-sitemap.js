#!/usr/bin/env node
// Generates public/sitemap.xml and public/robots.txt before every build (see
// the "prebuild" script in package.json — npm runs it automatically before
// "build", so `npm run build` always ships a fresh sitemap).
//
// Why build-time and not a Netlify Function returning live data on every
// request: this site is a client-rendered SPA with no server runtime of its
// own, so a "live" sitemap would mean standing up a function just for this.
// Regenerating at build time is the standard approach for SPAs and is
// simpler to reason about — the tradeoff is that a listing added or removed
// between deploys won't show up in the sitemap until the next deploy. Given
// how this site ships (a deploy per content batch, not continuous), that's
// a fine tradeoff; revisit with a Netlify Function if listings ever change
// on a schedule faster than deploys do.
//
// Run manually any time with `npm run sitemap`.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { buildPropertyUrl } from "../src/lib/propertyUrl.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

// This script runs under plain Node (not Vite), so unlike app code it
// doesn't get .env loaded for free via import.meta.env — load it ourselves.
// Node 20.6+ ships process.loadEnvFile for exactly this; harmless if the
// file doesn't exist (e.g. a CI environment that sets real env vars
// directly), so a missing .env is not treated as an error here.
try {
  process.loadEnvFile(join(rootDir, ".env"));
} catch {
  // No .env on disk — fine, env vars may already be set (CI/Netlify).
}

// TODO(production): this site isn't live yet — replace with the real
// domain once it is (see PRODUCTION_TODO.md, which tracks this same item).
// Everything below still runs and produces a valid sitemap/robots.txt with
// this placeholder, so nothing breaks in the meantime — the URLs inside
// them just won't be right until this line is updated.
const SITE_URL = process.env.VITE_SITE_URL || "https://REPLACE-WITH-PRODUCTION-DOMAIN.example";

// Every public, non-dynamic route from src/App.jsx. Keep this in sync if
// routes change there — there's no way to introspect React Router's config
// from a standalone script without importing the whole app.
const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/properties/rent", changefreq: "daily", priority: "0.9" },
  { path: "/properties/sale", changefreq: "daily", priority: "0.9" },
  { path: "/neighborhoods", changefreq: "weekly", priority: "0.7" },
  { path: "/concierge", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

function xmlEscape(value) {
  return String(value).replace(/&/g, "&amp;");
}

function isoDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${xmlEscape(SITE_URL + loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function fetchPublishedProperties() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not set — writing static routes only, no property pages.",
    );
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  // Same anon-role query the public site itself runs (see
  // src/context/PropertiesContext.jsx) — RLS already scopes this to
  // published listings only, so there's no risk of leaking a draft's URL.
  const { data, error } = await supabase
    .from("properties")
    .select("id, title, created_at")
    .eq("status", "published");

  if (error) {
    console.warn("[sitemap] Failed to fetch properties, omitting them from the sitemap:", error.message);
    return [];
  }
  return data ?? [];
}

async function main() {
  const properties = await fetchPublishedProperties();

  const urls = [
    ...STATIC_ROUTES.map((route) => urlEntry({ loc: route.path, changefreq: route.changefreq, priority: route.priority })),
    ...properties.map((property) =>
      urlEntry({
        loc: buildPropertyUrl(property),
        lastmod: isoDate(property.created_at),
        changefreq: "weekly",
        priority: "0.8",
      }),
    ),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  writeFileSync(join(rootDir, "public", "sitemap.xml"), sitemap, "utf8");

  // /admin is a real, working route in this SPA (see App.jsx / AdminApp.jsx),
  // just not one that should ever show up in search results.
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  writeFileSync(join(rootDir, "public", "robots.txt"), robots, "utf8");

  console.log(
    `[sitemap] Wrote ${urls.length} URLs to public/sitemap.xml (${STATIC_ROUTES.length} static + ${properties.length} properties) and public/robots.txt.`,
  );
}

main().catch((error) => {
  console.error("[sitemap] Failed:", error);
  process.exitCode = 1;
});
