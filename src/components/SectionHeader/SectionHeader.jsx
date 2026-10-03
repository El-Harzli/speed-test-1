/**
 * Shared "eyebrow / title / description" header used above the content of
 * each major Home section (Services, Featured Properties, Why Us,
 * Neighborhoods). Before this existed, each section had its own
 * hand-copied version of this block — same idea, but drifted apart on
 * alignment, font sizes, and spacing (ServicesOptimized.jsx even had its
 * own locally-defined SectionHeader already, just never shared). Centering
 * is fixed rather than a per-section choice, on purpose: three of the four
 * sections already centered theirs, and the one that didn't
 * (Neighborhoods, left-aligned with a border accent) wasn't paired with a
 * layout reason that justified being the odd one out.
 */
function SectionHeader({ eyebrow, eyebrowIcon: EyebrowIcon, title, description, className = "" }) {
  return (
    <div className={`text-center mb-8 md:mb-10 lg:mb-14 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-3 md:mb-4">
        <div className="h-px w-8 md:w-10 bg-linear-to-r from-transparent to-accent-500" />
        <p className="uppercase text-[10px] md:text-[11px] font-medium text-accent-500 tracking-[0.22em] inline-flex items-center gap-1.5">
          {EyebrowIcon && <EyebrowIcon className="hidden md:inline-block w-3 h-3 text-gold-500" aria-hidden="true" />}
          {eyebrow}
        </p>
        <div className="h-px w-8 md:w-10 bg-linear-to-l from-transparent to-accent-500" />
      </div>

      <h2 className="text-[26px] sm:text-[30px] md:text-[36px] lg:text-[42px] font-semibold tracking-tight leading-[1.2] text-main mb-3 md:mb-4">
        {title}
      </h2>

      {description && (
        <p className="text-[13px] md:text-[14px] lg:text-[15px] text-secondary leading-relaxed max-w-[300px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[560px] mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
