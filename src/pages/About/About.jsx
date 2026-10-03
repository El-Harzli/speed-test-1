import { useMemo } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  IoShieldCheckmarkOutline,
  IoLocationOutline,
  IoHeartOutline,
  IoStar,
  IoLogoWhatsapp,
  IoHomeOutline,
} from "react-icons/io5";
import { FiHome } from "react-icons/fi";
import { TfiMedallAlt } from "react-icons/tfi";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import Badges from "@components/Badges";
import { useProperties } from "../../context/PropertiesContext";
import { onImgError, FALLBACK_IMG } from "../BrowseProperties/Sections/format";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

const VALUES = [
  {
    icon: IoShieldCheckmarkOutline,
    title: "Trust & Transparency",
    description:
      "Every listing is personally vetted. What you see is what you get — no surprises at closing.",
  },
  {
    icon: IoLocationOutline,
    title: "Deep Local Roots",
    description:
      "We don't just sell property in Tangier, we live here. Every neighborhood recommendation comes from lived experience.",
  },
  {
    icon: IoHeartOutline,
    title: "Client-First, Always",
    description:
      "A family-run agency means every client gets the same care we'd want for our own family — not a sales quota.",
  },
];

function sanitizePhone(phone) {
  return (phone || "").replace(/[^\d]/g, "");
}

function AgentCard({ agent, listingCount }) {
  const whatsappLink = sanitizePhone(agent.phone)
    ? `https://wa.me/${sanitizePhone(agent.phone)}?text=${encodeURIComponent(
        `Hi ${agent.name}, I'd like to get in touch about a property in Tangier.`,
      )}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[24px] border border-accent-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6 text-center flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400/40 mb-4">
        <img
          src={agent.avatar_url || FALLBACK_IMG}
          alt={agent.name}
          onError={onImgError}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-[17px] font-semibold text-main">{agent.name}</h3>

      {agent.rating > 0 && (
        <div className="flex items-center gap-1 mt-1.5">
          <IoStar className="w-3.5 h-3.5 text-gold-500" />
          <span className="text-[13px] text-secondary">
            {Number(agent.rating).toFixed(1)}{" "}
            <span className="text-secondary/60">
              ({agent.reviews_count ?? 0} reviews)
            </span>
          </span>
        </div>
      )}

      <p className="text-[12px] text-secondary/70 mt-1">
        {listingCount} {listingCount === 1 ? "listing" : "listings"}
      </p>

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent-500 border border-accent-500/30 rounded-full px-4 py-2 hover:bg-accent-500 hover:text-white hover:border-transparent transition-colors cursor-pointer"
        >
          <IoLogoWhatsapp className="w-3.5 h-3.5" />
          Message
        </a>
      )}
    </motion.div>
  );
}

function About() {
  usePageTitle("About Us");
  usePageMeta(
    "Family-run since 2011, BSI Properties is Tangier's trusted name in real estate — built on discretion, deep local knowledge, and personal service."
  );
  const { agents, properties, loading } = useProperties();

  // Only published listings ever reach this context in the first place
  // (see PropertiesContext), so this count naturally reflects each agent's
  // active, publicly-visible workload.
  const listingCountByAgent = useMemo(() => {
    const counts = new Map();
    for (const property of properties) {
      const id = property.agent?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    return counts;
  }, [properties]);

  return (
    <>
      {/* Hero / intro */}
      <section className="bg-primary-500 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 md:pb-16 text-center">
        <div className="wrapper max-w-2xl mx-auto">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} className="justify-center mb-4" />
          <p className="uppercase text-[11px] font-medium text-accent-500 tracking-[0.22em] mb-3">
            Since 2011
          </p>
          <h1 className="text-[32px] sm:text-[40px] md:text-[46px] font-semibold tracking-tight leading-[1.15] text-main mb-4">
            Tangier&rsquo;s Trusted Name <br className="hidden sm:block" />
            in Real Estate
          </h1>
          <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed max-w-lg mx-auto">
            A family-run agency built on discretion, deep local knowledge, and
            the belief that finding a home should feel personal — not
            transactional.
          </p>
        </div>
      </section>

      {/* Story + stats */}
      <section className="bg-white py-14 md:py-20">
        <div className="wrapper grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <h2 className="text-[24px] sm:text-[28px] font-semibold tracking-tight text-main mb-4">
              Our Story
            </h2>
            <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed mb-4">
              What began as a small, family-run practice in Tangier has grown
              into one of the city&rsquo;s most trusted names in real estate —
              without ever losing the personal touch that started it all.
              We&rsquo;ve watched neighborhoods evolve, helped families put
              down roots, and guided investors to properties they wouldn&rsquo;t
              have found on their own.
            </p>
            <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed">
              Today, that same philosophy guides everything we do: every
              listing personally vetted, every client treated like the only
              one, and every transaction handled with the discretion Tangier&rsquo;s
              real estate market deserves.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-8">
              <Badges Icon={TfiMedallAlt} label="Years Expertise" count={15} />
              <Badges Icon={FiHome} label="Properties Listed" count={120} />
              <Badges
                Icon={HiOutlineEmojiHappy}
                label="Happy Clients"
                count={300}
              />
            </div>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative rounded-[28px] overflow-hidden aspect-4/3 bg-primary-600">
              <img
                src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1000"
                alt="Tangier coastline"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-primary-600 py-14 md:py-20">
        <div className="wrapper">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-linear-to-r from-transparent to-accent-500"></div>
              <p className="uppercase text-[10px] font-medium text-accent-500 tracking-[0.22em]">
                What Guides Us
              </p>
              <div className="h-px w-10 bg-linear-to-l from-transparent to-accent-500"></div>
            </div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight text-main">
              Our Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
            {VALUES.map((value) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-gold-400/30 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="w-12 h-12 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-accent-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-[16px] font-semibold text-main mb-1.5">
                  {value.title}
                </h3>
                <p className="text-[13px] text-secondary leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the team — live from Supabase, same agents assigned to
          listings across the site */}
      <section className="bg-white py-14 md:py-20">
        <div className="wrapper">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-linear-to-r from-transparent to-accent-500"></div>
              <p className="uppercase text-[10px] font-medium text-accent-500 tracking-[0.22em]">
                Meet The Team
              </p>
              <div className="h-px w-10 bg-linear-to-l from-transparent to-accent-500"></div>
            </div>
            <h2 className="text-[26px] md:text-[34px] font-semibold tracking-tight text-main mb-2">
              The People Behind Every Deal
            </h2>
            <p className="text-[13px] md:text-[15px] text-secondary max-w-md mx-auto">
              Every listing on this site is personally handled by one of our
              agents, start to finish.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-center text-sm text-secondary/70">
              Our team profiles are being updated — check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  listingCount={listingCountByAgent.get(agent.id) ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Closer */}
      <section className="bg-primary-500 py-14 md:py-16 text-center">
        <div className="wrapper">
          <h2 className="text-[22px] sm:text-[26px] font-semibold text-main mb-5">
            Ready to find your place in Tangier?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/properties/rent"
              className="inline-flex items-center gap-2 bg-accent-500 text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-600 transition-colors cursor-pointer"
            >
              <IoHomeOutline className="w-4 h-4" />
              Browse Properties
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-accent-500 text-accent-500 text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-500 hover:text-white transition-colors cursor-pointer"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}

export default About;
