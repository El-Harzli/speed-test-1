import { useState } from "react";
import { Link } from "react-router";
import SectionHeader from "../../../components/SectionHeader/SectionHeader";
import { motion } from "framer-motion";
import { IoShieldCheckmarkOutline, IoSparklesOutline } from "react-icons/io5";
import { TbAward, TbHeartHandshake } from "react-icons/tb";
import { PiPlantBold } from "react-icons/pi";
import { BiSupport } from "react-icons/bi";
import ReasonCard from "../../../components/cards/ReasonCard";

const reasons = [
  {
    id: 1,
    icon: IoShieldCheckmarkOutline,
    title: "Verified Listings Only",
    description:
      "Every property is personally vetted by our team to ensure authenticity, quality, and accurate representation.",
    stat: "100%",
    label: "Verified",
  },
  {
    id: 2,
    icon: TbAward,
    title: "15 Years of Excellence",
    description:
      "Over a decade of expertise in Tangier's luxury real estate market with unmatched local knowledge.",
    stat: "15+",
    label: "Years",
  },
  {
    id: 3,
    icon: TbHeartHandshake,
    title: "Personalized Service",
    description:
      "Dedicated consultants work one-on-one with you, understanding your unique needs and preferences.",
    stat: "1:1",
    label: "Support",
  },
  {
    id: 4,
    icon: BiSupport,
    title: "24/7 Concierge",
    description:
      "Round-the-clock support for viewings, inquiries, and property management—whenever you need us.",
    stat: "24/7",
    label: "Available",
  },
  {
    id: 5,
    icon: PiPlantBold,
    title: "Sustainable Properties",
    description:
      "Curated selection of eco-conscious homes with modern amenities and environmental responsibility.",
    stat: "Green",
    label: "Certified",
  },
  {
    id: 6,
    icon: IoSparklesOutline,
    title: "Exclusive Access",
    description:
      "First look at premium off-market properties before they're publicly listed to the general market.",
    stat: "VIP",
    label: "Access",
  },
];

function WhyChooseUs() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleCard = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="relative bg-primary-600 py-10 overflow-hidden lg:py-16">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent-500 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-500 rounded-full blur-[80px]"></div>
      </div>

      <div className="wrapper relative z-10">
        {/* Header */}
        <SectionHeader
          eyebrow="Our Distinction"
          title="Why Choose Us"
          description="Experience the difference of working with Tangier's most trusted real estate experts"
        />

        {/* Phones only */}
        <div className="space-y-3 md:hidden">
          {reasons.map((reason, index) => {
            const isExpanded = expandedId === reason.id;
            return (
              <ReasonCard
                key={reason.id}
                reason={reason}
                index={index}
                isExpanded={isExpanded}
                toggleCard={toggleCard}
              />
            );
          })}
        </div>

        {/* Tablet (2 cols) + Desktop (3 cols) — one grid, responsive column count */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 lg:gap-6 md:max-w-[820px] lg:max-w-[1400px] md:mx-auto">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="relative bg-white/95 border border-gold-400/30 rounded-2xl p-5 lg:p-6 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(109,33,60,0.08)] hover:border-gold-400/50 transition-all duration-400 h-full flex flex-col">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full shrink-0 flex items-center justify-center border bg-linear-to-br from-accent-500/10 to-accent-500/5 border-accent-500/20 group-hover:bg-accent-500 group-hover:border-accent-500 transition-all duration-300 mb-4 lg:mb-5">
                  <reason.icon
                    className="w-6 h-6 lg:w-7 lg:h-7 text-accent-500 group-hover:text-white transition-colors duration-300"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-[16px] lg:text-[18px] font-medium text-main leading-tight mb-1">
                  {reason.title}
                </h3>
                <p className="text-[11px] text-gold-600 uppercase tracking-[0.12em] mb-4">
                  {reason.stat} {reason.label}
                </p>
                <p className="text-[13px] lg:text-[14px] text-secondary leading-[1.7] flex-1">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center lg:mt-12">
          <p className="text-[12px] text-secondary mb-3 lg:text-[14px] lg:mb-4">
            Ready to experience the difference?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-accent-500 to-accent-600 text-white rounded-xl uppercase tracking-[0.14em] text-[11px] shadow-[0_4px_14px_rgba(109,33,60,0.15)] hover:shadow-[0_6px_20px_rgba(109,33,60,0.25)] transition-all duration-300 lg:px-8 lg:py-4"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
