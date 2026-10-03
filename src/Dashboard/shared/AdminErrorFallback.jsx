import { IoRefreshOutline } from "react-icons/io5";

// Shown by the ErrorBoundary wrapping <Outlet /> in Dashboard.jsx. The
// sidebar and topbar stay mounted above this, so a broken page never takes
// the rest of the admin down with it — you can still switch sections from
// the sidebar, or try the page again in place.
function AdminErrorFallback({ onReset }) {
  return (
    <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col items-center text-center gap-3 px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-error-500">
        Something went wrong
      </p>
      <h2 className="text-lg font-semibold text-main">
        This page hit an unexpected error
      </h2>
      <p className="text-sm text-secondary max-w-sm">
        The rest of the dashboard is unaffected — try again, or use the
        sidebar to switch sections.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-semibold uppercase tracking-wide px-5 py-2.5 rounded-full hover:bg-accent-600 transition-colors cursor-pointer"
      >
        <IoRefreshOutline className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}

export default AdminErrorFallback;
