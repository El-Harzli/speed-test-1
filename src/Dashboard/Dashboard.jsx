import { useState } from "react";
import { Outlet, useLocation } from "react-router";
import Aside from "./Aside/Aside";
import Header from "./Header/Header";
import usePageTitle from "../hooks/usePageTitle";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary";
import AdminErrorFallback from "./shared/AdminErrorFallback";

const PAGE_TITLES = {
  "/admin": "Dashboard",
  "/admin/properties": "Properties",
  "/admin/featured": "Featured on Homepage",
  "/admin/neighborhoods": "Neighborhoods",
  "/admin/agents": "Agents",
  "/admin/categories": "Categories",
  "/admin/conveniences": "Conveniences",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES).find(
    (path) => path !== "/admin" && pathname.startsWith(path),
  );
  return match ? PAGE_TITLES[match] : "Dashboard";
}

export default function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  usePageTitle(`Admin — ${title}`);

  return (
    <div className="min-h-dvh bg-primary-500 lg:flex">
      <Aside isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={title} onMenuClick={() => setIsDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Scoped to the outlet, not the whole shell, so a crash on one
              admin page never takes the sidebar/topbar down with it —
              resetKeys means switching sections always clears a stuck
              fallback, even without the "Try Again" button. */}
          <ErrorBoundary
            resetKeys={[location.pathname]}
            fallback={(error, reset) => <AdminErrorFallback onReset={reset} />}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
