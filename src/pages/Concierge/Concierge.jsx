import { motion } from "framer-motion";
import {
  IoHomeOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoMegaphoneOutline,
  IoBarChartOutline,
  IoHeadsetOutline,
  IoLogoWhatsapp,
} from "react-icons/io5";
import { FiHome } from "react-icons/fi";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { TfiMedallAlt } from "react-icons/tfi";
import conciergeHero from "@assets/concierge_hero.jpg";
import PropertyConcierge from "../Home/Sections/PropertyConcierge";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { useProperties } from "../../context/PropertiesContext";

const SERVICES = [
  {
    icon: IoHomeOutline,
    title: "Full Property Management",
    description:
      "Day-to-day upkeep, maintenance coordination, and inspections — your property stays in the same condition you left it.",
  },
  {
    icon: IoPeopleOutline,
    title: "Tenant & Buyer Screening",
    description:
      "Thorough background and reference checks before anyone steps through the door, so you only meet serious, qualified parties.",
  },
  {
    icon: IoDocumentTextOutline,
    title: "Legal & Administrative Support",
    description:
      "Contracts, permits, and paperwork handled by people who know Moroccan property law — one less thing on your plate.",
  },
  {
    icon: IoMegaphoneOutline,
    title: "Marketing & Staging",
    description:
      "Professional photography, staging guidance, and placement across our network to get your property seen by the right people.",
  },
  {
    icon: IoBarChartOutline,
    title: "Owner Reporting",
    description:
      "Regular, clear updates on your property's performance — no chasing us for answers.",
  },
  {
    icon: IoHeadsetOutline,
    title: "24/7 Support",
    description:
      "A dedicated point of contact for anything that comes up, whenever it comes up.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Consultation",
    description: "We learn your property, your goals, and what 'taken care of' means to you.",
  },
  {
    number: "02",
    title: "Proposal",
    description: "A clear plan and scope of service, tailored to your property — no generic packages.",
  },
  {
    number: "03",
    title: "Onboarding",
    description: "We handle the transition, from photography to paperwork, with minimal input needed from you.",
  },
  {
    number: "04",
    title: "Ongoing Care",
    description: "Your dedicated concierge manages it from here, with regular updates so you're never in the dark.",
  },
];

const STATS = [
  { Icon: TfiMedallAlt, count: 15, label: "Years Expertise" },
  { Icon: FiHome, count: 120, label: "Properties Listed" },
  { Icon: HiOutlineEmojiHappy, count: 300, label: "Happy Clients" },
];

function Concierge() {
  usePageTitle("Property Concierge");
  usePageMeta(
    "White-glove property management in Tangier — full-service care, tenant screening, legal support, and marketing for homeowners and investors."
  );
  const { settings } = useProperties();

  return (
    <>
      {/* Full-bleed photo hero — the rest of the page already had one very
          strong, dramatic section (the dark CTA reused below, PropertyConcierge.jsx);
          everything above it was flat, text-only sections with no imagery
          or depth. This brings the opening of the page up to that same
          level rather than easing into it. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={conciergeHero}
            alt="Tangier's marina and corniche at dusk"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
        </div>

        <div className="relative wrapper pt-28 sm:pt-32 md:pt-36 lg:pt-44 pb-24 md:pb-28 lg:pb-32 min-h-[480px] sm:min-h-[560px] md:min-h-[620px] flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <Breadcrumbs
              items={[{ label: "Home", to: "/" }, { label: "Concierge" }]}
              variant="light"
              className="justify-center mb-6"
            />
            <p className="uppercase text-[11px] font-medium text-gold-400 tracking-[0.28em] mb-4">
              White Glove Service
            </p>
            <h1 className="text-[34px] sm:text-[44px] md:text-[54px] font-semibold tracking-tight leading-[1.1] text-white mb-5">
              Property Concierge
            </h1>
            <p className="text-[15px] sm:text-[16px] text-white/70 leading-relaxed max-w-lg mx-auto mb-9">
              For homeowners and investors who want their property fully cared
              for — without being the one doing the caring. We manage it like
              it&rsquo;s our own.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/${settings.phone_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent-500 text-white text-[13px] font-semibold uppercase tracking-wide px-7 py-3.5 rounded-full hover:bg-accent-600 transition-colors"
              >
                <IoLogoWhatsapp className="w-4 h-4" />
                Speak to a Consultant
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 border border-white/25 text-white text-[13px] font-semibold uppercase tracking-wide px-7 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                What&rsquo;s Included
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Credentials strip, floated so it straddles the photo/white boundary
          rather than sitting flush inside either — same floating-card idea
          as the homepage hero's badges, just given more room to breathe
          here since it's the only floating element on this page. */}
      <div className="relative bg-white">
        <div className="wrapper">
          <div className="relative -mt-10 md:-mt-12 bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gold-400/20 px-6 py-7 md:px-10 flex flex-wrap items-center justify-center divide-x divide-accent-500/10">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-6 md:px-10 first:pl-0 last:pr-0">
                <div className="w-10 h-10 rounded-full bg-[radial-gradient(circle_at_center,rgba(201,176,139,0.5),rgba(201,176,139,0.12)_70%)] flex items-center justify-center shrink-0">
                  <stat.Icon className="text-accent-500 text-[17px]" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-main font-semibold text-[16px] md:text-[18px]">{stat.count}+</p>
                  <p className="text-secondary text-[11px] md:text-[12px] font-medium whitespace-nowrap">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <section id="services" className="scroll-mt-24 bg-white pt-10 md:pt-14 pb-14 md:pb-20">
        <div className="wrapper">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-linear-to-r from-transparent to-accent-500"></div>
              <p className="uppercase text-[10px] font-medium text-accent-500 tracking-[0.22em]">
                What&rsquo;s Included
              </p>
              <div className="h-px w-10 bg-linear-to-l from-transparent to-accent-500"></div>
            </div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight text-main">
              Everything, Handled
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {SERVICES.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative bg-white rounded-[24px] border border-gold-400/25 p-7 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(109,33,60,0.10)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-gold-400 via-accent-500 to-gold-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />

                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-[16px] bg-linear-to-br from-accent-500/10 to-accent-500/5 border border-accent-500/20 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-accent-500" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-semibold text-gold-500/70 tracking-widest">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-[16px] font-semibold text-main mb-1.5">
                  {service.title}
                </h3>
                <p className="text-[13px] text-secondary leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-primary-600 py-14 md:py-20">
        <div className="wrapper">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-linear-to-r from-transparent to-accent-500"></div>
              <p className="uppercase text-[10px] font-medium text-accent-500 tracking-[0.22em]">
                The Process
              </p>
              <div className="h-px w-10 bg-linear-to-l from-transparent to-accent-500"></div>
            </div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight text-main">
              How It Works
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
            {/* Connecting line, desktop only — the numbers' bg-clip-text
                gradient is translucent enough that the line reads faintly
                through them too, rather than looking cut off at each one. */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-transparent via-accent-500/25 to-transparent" />

            {STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="relative"
              >
                <span className="relative text-[48px] font-bold leading-none bg-linear-to-br from-accent-500/15 via-accent-500/10 to-transparent bg-clip-text text-transparent">
                  {step.number}
                </span>
                <h3 className="text-[16px] font-semibold text-main mt-2 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-[13px] text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Same dark CTA section used as a teaser on the homepage — reused
          here as the actual closer, since it's already built exactly for
          this: direct WhatsApp/call channels plus the confidentiality
          framing that matches a concierge offering. */}
      <PropertyConcierge />
    </>
  );
}

export default Concierge;
