# Before going live

## Set the real production domain

The site doesn't have a live domain yet, so three places currently fall back
to a placeholder — `https://REPLACE-WITH-PRODUCTION-DOMAIN.example`:

- `scripts/generate-sitemap.js` → every URL in `public/sitemap.xml` and `public/robots.txt`
- `index.html` → the default `og:image` / `og:url` meta tags
- `netlify/edge-functions/property-og-tags.js` → the fallback image URL used if a property has no photos

The quickest fix once the domain is live: search the repo for
`REPLACE-WITH-PRODUCTION-DOMAIN.example` and replace every occurrence with
the real domain (e.g. `https://bsiproperties.ma`).

Alternatively, for the sitemap script and the edge function (not
`index.html` — see note below), set a `VITE_SITE_URL` env var instead of
editing the fallback directly:

- In `.env` (for local builds) and in Netlify's build environment variables,
  for `scripts/generate-sitemap.js`.
- In Netlify's site settings with the **Edge functions** scope specifically
  (build-time env vars aren't automatically available to edge functions),
  for `netlify/edge-functions/property-og-tags.js`.

`index.html` is a static file with no build-time templating, so it always
needs the direct search-and-replace regardless.

After updating, run `npm run sitemap` (or `npm run build`, which runs it
automatically) and check `public/sitemap.xml` / `public/robots.txt` before
deploying.

## Verify Open Graph tags after the domain is live

Once deployed, share a `/property/:id` link through
[Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/)
or [Twitter's Card Validator](https://cards-dev.twitter.com/validator) to
confirm the edge function is actually injecting that listing's title/photo —
these tools show you the raw HTML a crawler would see, same as WhatsApp or
iMessage would fetch.

