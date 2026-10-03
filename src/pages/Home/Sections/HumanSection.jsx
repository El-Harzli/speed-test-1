import { motion } from "framer-motion";
import { IoStar } from "react-icons/io5";
import { Link } from "react-router";

const testimonials = [
  {
    initials: "MA",
    name: "M. Alami",
    location: "Malabata",
    time: "2 days ago",
    text: "Professionalism and discretion are rare to find. They helped me secure an off-market villa that wasn't even listed yet.",
  },
  {
    initials: "SH",
    name: "S. Haddad",
    location: "California",
    time: "1 week ago",
    text: "The 15 years of expertise truly show. The legal guidance was seamless, making the move to Tangier stress-free.",
  },
];

const HumanSection = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: MISSION */}
          <div className="lg:col-span-5 space-y-7 sm:space-y-8">
            <div className="space-y-4">
              <span className="text-accent-500 font-bold uppercase tracking-[0.3em] text-[11px] block">
                Since 2011
              </span>
              <h2 className="text-[clamp(1.75rem,1.4rem+1.4vw,2.625rem)] font-semibold text-[#1A1A1A] leading-tight tracking-tight">
                Our Mission in <br />
                <span className="italic font-serif text-accent-500">
                  Tangier
                </span>
              </h2>
            </div>

            <p className="text-[#1A1A1A]/70 text-[15px] sm:text-[16px] leading-relaxed max-w-md">
              With 15 years of deep-rooted expertise in the Tangier market, we
              specialize in connecting high-net-worth individuals with the
              city&rsquo;s most exclusive residences. Our commitment goes beyond real
              estate; we are your local partners in navigating the Mediterranean
              lifestyle.
            </p>

            <Link to="/about">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block bg-[#1A1A1A] text-white px-8 py-4 rounded-full text-[14px] font-medium hover:bg-accent-500 transition-colors cursor-pointer"
              >
                Learn Our Story
              </motion.span>
            </Link>
          </div>

          {/* RIGHT: CHAT-STYLE CLIENT MESSAGES */}
          <div className="lg:col-span-7">
            <div className="rounded-[32px] bg-[#F8F8F8] border border-black/5 p-5 sm:p-7 md:p-8">
              <div className="flex items-center gap-2 mb-6 sm:mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500/60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                <span className="text-[#1A1A1A]/50 text-[11px] font-bold uppercase tracking-[0.2em]">
                  Client Messages
                </span>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {testimonials.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500 font-bold text-[12px] shrink-0">
                      {item.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#1A1A1A] font-bold text-[13px]">
                          {item.name}
                        </span>
                        <span className="text-[#1A1A1A]/40 text-[11px] px-2 py-0.5 rounded-full bg-black/5">
                          {item.location}
                        </span>
                        <time className="text-[#1A1A1A]/30 text-[11px] ml-auto shrink-0">
                          {item.time}
                        </time>
                      </div>
                      <div className="flex gap-0.5 text-accent-500 text-[11px] mt-1 mb-3 ml-1">
                        {[...Array(5)].map((_, idx) => (
                          <IoStar key={idx} />
                        ))}
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm border border-black/5 shadow-sm px-4 py-10 sm:px-5 sm:py-4">
                        <p className="text-[#1A1A1A]/80 text-[14px] sm:text-[15px] leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HumanSection;
