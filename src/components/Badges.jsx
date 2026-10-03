function Badges({ Icon, label, count }) {
  return (
    <span
      className="
        flex items-center 
        gap-x-1.5 md:gap-x-2.5 lg:gap-x-3
        p-1 md:px-3 md:py-2 lg:px-3.5 lg:py-2.5
        border border-gold-400/40
        rounded-md md:rounded-lg
        bg-white/60
        backdrop-blur-sm
        shadow-[0_2px_10px_rgba(0,0,0,0.04)]
      "
    >
      <div
        className="
          p-1 md:p-2 rounded-full 
          bg-[radial-gradient(circle_at_center,rgba(201,176,139,0.55),rgba(201,176,139,0.15)_70%)]
          flex items-center justify-center
          shadow-[0_0_8px_rgba(201,176,139,0.35)]
        "
      >
        <Icon className="text-accent-500 text-[14px] md:text-[18px] lg:text-[20px]" />
      </div>

      <div className="flex flex-col leading-tight gap-y-0.5">
        <span className="text-main font-semibold text-[9px] md:text-[13px] lg:text-[15px] tracking-wide">
          {count}+
        </span>
        <span className="text-secondary text-[9px] md:text-[12px] lg:text-[13px] font-medium whitespace-nowrap">
          {label}
        </span>
      </div>
    </span>
  );
}

export default Badges;