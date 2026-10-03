import { Link } from "react-router";
import { IoRefreshOutline, IoHomeOutline } from "react-icons/io5";

// Shown by the ErrorBoundary wrapping the routed content in App.jsx.
// Header stays mounted above this, so a visitor never loses navigation —
// only the page that actually crashed gets replaced.
function PublicErrorFallback({ onReset }) {
  return (
    <main className="bg-primary-500 min-h-[70vh] flex items-center pt-20">
      <div className="wrapper text-center max-w-lg mx-auto">
        <p className="text-[80px] sm:text-[110px] font-semibold leading-none bg-linear-to-br from-error-500/25 via-error-500/15 to-transparent bg-clip-text text-transparent">
          Oops
        </p>

        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight leading-[1.2] text-main mt-2 mb-3">
          Something went wrong
        </h1>

        <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed mb-8 max-w-sm mx-auto">
          This page hit an unexpected error. That&rsquo;s on us, not you —
          try again, or head back home.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-600 transition-colors cursor-pointer"
          >
            <IoRefreshOutline className="w-4 h-4" />
            Try Again
          </button>
          <Link
            to="/"
            onClick={onReset}
            className="inline-flex items-center gap-2 border border-accent-500 text-accent-500 text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-500 hover:text-white transition-colors cursor-pointer"
          >
            <IoHomeOutline className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default PublicErrorFallback;
