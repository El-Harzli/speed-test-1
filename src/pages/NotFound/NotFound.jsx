import { Link } from "react-router";
import { IoHomeOutline, IoSearchOutline } from "react-icons/io5";
import usePageTitle from "../../hooks/usePageTitle";

// Catch-all for any unmatched public route — see App.jsx. Without this,
// a typo'd or dead link previously rendered a fully blank page, since
// <Routes> renders nothing when nothing matches.
function NotFound() {
  usePageTitle("Page Not Found");
  return (
    <section className="bg-primary-500 min-h-screen flex items-center pt-20">
      <div className="wrapper text-center max-w-lg mx-auto">
        <p className="text-[80px] sm:text-[110px] font-semibold leading-none bg-linear-to-br from-accent-500/25 via-accent-500/15 to-transparent bg-clip-text text-transparent">
          404
        </p>

        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight leading-[1.2] text-main mt-2 mb-3">
          This page doesn&rsquo;t exist
        </h1>

        <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&rsquo;re looking for may have been moved, renamed, or
          never existed. Let&rsquo;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-600 transition-colors cursor-pointer"
          >
            <IoHomeOutline className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/properties/rent"
            className="inline-flex items-center gap-2 border border-accent-500 text-accent-500 text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-500 hover:text-white transition-colors cursor-pointer"
          >
            <IoSearchOutline className="w-4 h-4" />
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
