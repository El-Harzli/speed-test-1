import { useEffect } from "react";

// Applied once at the top of AdminApp — adds <meta name="robots"
// content="noindex, nofollow"> for as long as the admin app is mounted,
// and removes it again on unmount. The removal matters: Header now has a
// "View Site" link back to "/", and since AdminApp/PublicSite share one
// BrowserRouter (see App.jsx), that's a client-side navigation, not a
// fresh page load — without cleanup, the tag this hook added while in
// /admin would still be sitting in <head> after navigating back to the
// public site, silently noindexing it too.
//
// robots.txt already disallows crawling /admin at all, so in practice
// this is defense-in-depth for the case where an /admin URL gets linked
// from somewhere external despite that — robots.txt stops crawling, this
// stops indexing the bare URL if it ever gets requested anyway.
export default function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    meta.setAttribute("content", "noindex, nofollow");
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
