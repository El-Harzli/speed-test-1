import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import Header from "@components/Header/Header";
import Footer from "./pages/Home/Sections/Footer";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider } from "./context/LanguageContext";
import { PropertiesProvider } from "./context/PropertiesContext";
import Home from "./pages/Home/Home";
import BrowsePage from "./pages/BrowseProperties/BrowsePage";
import PropertyDetailPage from "./pages/PropertyDetail/PropertyDetailPage";
import PropertyDetailOverlay from "./pages/PropertyDetail/PropertyDetailOverlay";
import Concierge from "./pages/Concierge/Concierge";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Neighborhoods from "./pages/Neighborhoods/Neighborhoods";
import NotFound from "./pages/NotFound/NotFound";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import PublicErrorFallback from "./components/ErrorBoundary/PublicErrorFallback";

// Lazy-loaded on purpose: this pulls in the entire admin dashboard (every
// Dashboard/* page, React Compiler's runtime, Framer Motion's Reorder,
// etc.) — none of which a public visitor should ever have to download just
// to browse listings. This single change means that code is now its own
// chunk, only fetched when someone actually navigates to /admin.
const AdminApp = lazy(() => import("./AdminApp"));

function AdminLoadingFallback() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-primary-500">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
    </div>
  );
}

// The dashboard's own routes were already written as absolute "/admin/..."
// paths from day one (see its App.jsx history), so AdminApp's <Routes>
// matches correctly no matter where in the tree it's rendered — no nested
// route/Outlet wiring needed here. This just decides WHICH app owns the
// current URL and renders that one, with its own chrome: the admin
// dashboard has its own sidebar/topbar (and its own Poppins-based type,
// via the body-level default in index.css) and shouldn't inherit the
// public site's Header or Space Grotesk font.
function isAdminPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function PublicSite() {
  const location = useLocation();
  // Set by BrowsePage (and the overlay itself, for similar-property
  // clicks) when navigating to a property from within the app — lets the
  // detail route render as a modal on top of the page it was opened from,
  // while still being a real, directly-navigable URL for anyone who lands
  // on it fresh (search engines, shared links, refreshes).
  const backgroundLocation = location.state?.backgroundLocation;
  const effectivePathname = (backgroundLocation || location).pathname;

  // Client-side navigation doesn't reset scroll position the way a normal
  // page load does — e.g. clicking "View All Properties" from partway down
  // the homepage previously landed on /properties/rent still scrolled to
  // wherever the homepage had been. Keyed on the *effective* pathname
  // (backgroundLocation when set) rather than the raw location, so opening
  // or closing the property overlay never triggers this — only a genuine
  // page change does, which is what should reset scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [effectivePathname]);

  return (
    <PropertiesProvider>
      <FavoritesProvider>
        <LanguageProvider>
          <div className="font-space_grotest">
            <Header />
            {/* Scoped to the routed content, not the whole app, so a crash on
                one page never takes Header (and its nav) down with it —
                resetKeys means navigating to a different page always clears
                a stuck fallback, even without the "Try Again" button. */}
            <ErrorBoundary
              resetKeys={[effectivePathname]}
              fallback={(error, reset) => <PublicErrorFallback onReset={reset} />}
            >
              {/* The public site had no <main> landmark at all before this —
                  every page's content just sat in plain <div>s. The overlay
                  Routes below stays outside <main> deliberately: it's a
                  modal dialog layered on top of the page (see
                  PropertyDetailOverlay's role="dialog"), not part of the
                  document's main content flow. */}
              <main>
                <Routes location={backgroundLocation || location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/properties" element={<Navigate to="/properties/rent" replace />} />
                  <Route path="/properties/:listingType" element={<BrowsePage />} />
                  <Route path="/property/:id" element={<PropertyDetailPage />} />
                  <Route path="/property/:slug/:id" element={<PropertyDetailPage />} />
                  <Route path="/concierge" element={<Concierge />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/neighborhoods" element={<Neighborhoods />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {backgroundLocation && (
                <Routes>
                  <Route path="/property/:id" element={<PropertyDetailOverlay />} />
                  <Route path="/property/:slug/:id" element={<PropertyDetailOverlay />} />
                </Routes>
              )}
            </ErrorBoundary>

            {/* Centralized here rather than imported separately by every
                page — previously Home/About/Concierge/Contact/Neighborhoods
                each rendered their own copy, while BrowsePage,
                PropertyDetailPage, and NotFound had none at all. One
                Footer, rendered once, fixes both: no more per-page
                duplication, and every page now gets one consistently.
                Placed as a sibling of <main> (not nested inside it) since
                that's the correct landmark structure, and outside the
                ErrorBoundary — like Header — so it stays visible even if a
                page's content errors out. */}
            <Footer />
          </div>
        </LanguageProvider>
      </FavoritesProvider>
    </PropertiesProvider>
  );
}

function App() {
  const location = useLocation();
  return isAdminPath(location.pathname) ? (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminApp />
    </Suspense>
  ) : (
    <PublicSite />
  );
}

export default App;
