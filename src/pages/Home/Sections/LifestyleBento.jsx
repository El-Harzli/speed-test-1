import { motion } from "framer-motion";
import { 
  IoSunnyOutline, 
  IoBoatOutline, 
  IoTrainOutline, 
  IoTrendingUpOutline, 
  IoArrowForwardOutline 
} from "react-icons/io5";

const LifestyleBento = () => {
  const highlights = [
    {
      title: "15 Minutes to Europe",
      desc: "The unique gateway where the Mediterranean meets the Atlantic, just a ferry ride from Spain.",
      icon: <IoBoatOutline />,
      size: "md:col-span-2 md:row-span-1",
      bg: "bg-white",
      textColor: "text-[#1A1A1A]",
      iconBg: "bg-accent-500/10 text-accent-500"
    },
    {
      title: "300 Days of Sun",
      desc: "An exceptional Mediterranean climate.",
      icon: <IoSunnyOutline />,
      size: "md:col-span-1 md:row-span-1",
      bg: "bg-accent-500",
      textColor: "text-white",
      iconBg: "bg-white/20 text-white"
    },
    {
      title: "High-Speed Connectivity",
      desc: "Home to Al Boraq, connecting you to Casablanca in just 2 hours.",
      icon: <IoTrainOutline />,
      size: "md:col-span-1 md:row-span-1",
      bg: "bg-white",
      textColor: "text-[#1A1A1A]",
      iconBg: "bg-accent-500/10 text-accent-500"
    },
    {
      title: "Economic Powerhouse",
      desc: "Tanger Med is the #1 port in Africa, driving unprecedented value and luxury growth in the region.",
      icon: <IoTrendingUpOutline />,
      size: "md:col-span-2 md:row-span-1",
      bg: "bg-[#1A1A1A]",
      textColor: "text-white",
      iconBg: "bg-accent-500/20 text-accent-500"
    }
  ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#F8F8F8] to-[#0F0F0F] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-xl">
            <span className="text-accent-500 font-bold uppercase tracking-[0.3em] text-[11px] block">
              The Mediterranean Lifestyle
            </span>
            <h2 className="text-[36px] md:text-[48px] font-semibold text-[#1A1A1A] leading-[1.1] tracking-tight">
              Beyond the Walls: <br />
              <span className="italic font-serif">Discover Tangier</span>
            </h2>
          </div>
          <p className="text-[#1A1A1A]/50 text-[15px] max-w-[320px] leading-relaxed">
            Investing in Tangier is more than a property acquisition; it’s a gateway to Africa’s most dynamic coastal lifestyle.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[260px]">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`${item.size} ${item.bg} ${item.textColor} rounded-[40px] p-8 md:p-10 flex flex-col justify-between border border-black/5 shadow-sm group relative overflow-hidden`}
            >
              <div className="relative z-10 space-y-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-500 group-hover:scale-110 ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-3">{item.title}</h3>
                  <p className="text-[14px] md:text-[15px] opacity-70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Subtle Decorative Background Icon */}
              <div className="absolute -bottom-6 -right-6 text-[140px] opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                {item.icon}
              </div>

              {/* Action Indicator (Subtle) */}
              <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <IoArrowForwardOutline className="text-xl" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LifestyleBento;