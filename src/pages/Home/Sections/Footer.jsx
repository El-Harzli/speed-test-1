import { useRef } from "react";
import { Link } from "react-router";
import { useInView } from "framer-motion";
import { 
  IoLogoInstagram, 
  IoLogoLinkedin, 
  IoLogoWhatsapp, 
  IoLocationOutline, 
  IoCallOutline,
  IoMailOutline 
} from "react-icons/io5";
import { useProperties } from "../../../context/PropertiesContext";
import { NAV_LINKS } from "../../../constants/navLinks";

// Static placeholder data — defined once instead of rebuilt on every render.
const INSTAGRAM_FEED = Array.from({ length: 6 }, (_, i) => ({ id: i + 1 }));

const Footer = () => {
  const { settings } = useProperties();

  // Brand mark: first word bold/white, the rest accent/italic.
  // Single-word names just render plain.
  const [agencyNameFirstWord, ...agencyNameRestWords] = settings.agency_name.split(" ");
  const agencyNameRest = agencyNameRestWords.join(" ");

  // The marquee is a CSS transform animation (compositor-only, no per-frame JS).
  // useInView only toggles play/pause, so it holds its position off-screen
  // and resumes where it left off instead of restarting.
  const marqueeRef = useRef(null);
  const isMarqueeInView = useInView(marqueeRef, { margin: "200px" });

  return (
    <footer className="bg-[#0A0A0A] pt-20">
      {/* 1. INSTAGRAM FEED */}
      <div className="mb-20">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-accent-500 font-bold uppercase tracking-[0.3em] text-[10px] block">
              Follow Our Journey
            </span>
            <h3 className="text-white text-2xl font-semibold tracking-tight">Live from Tangier</h3>
          </div>
          <a href={settings.instagram_url} className="flex items-center justify-center md:justify-start gap-2 text-white/40 hover:text-accent-500 transition-colors text-[13px] font-medium">
            <IoLogoInstagram className="text-lg" />
            {settings.instagram_handle}
          </a>
        </div>

        <div ref={marqueeRef} className="overflow-hidden" aria-hidden="true">
          {/* Two identical sets; each tile carries its own right margin (no flex gap)
              so the track is exactly 2x one set and -50% loops seamlessly. */}
          <div
            className="footer-marquee flex w-max"
            style={{ animationPlayState: isMarqueeInView ? "running" : "paused" }}
          >
            {[...INSTAGRAM_FEED, ...INSTAGRAM_FEED].map((img, i) => (
              <div
                key={i}
                className="shrink-0 mr-4 w-[240px] md:w-[280px] h-[300px] md:h-[350px] rounded-[24px] bg-white/5 overflow-hidden relative border border-white/5"
              >
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/10 text-[10px] uppercase tracking-widest">
                  BSI Lifestyle
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 border-t border-white/5 pt-16">
          
          {/* BRAND & CONTACT - Centered on mobile */}
          <div className="lg:col-span-5 space-y-8 text-center md:text-left flex flex-col items-center md:items-start">
            <h2 className="text-white text-2xl font-bold tracking-tighter uppercase">
              {agencyNameFirstWord}{' '}
              {agencyNameRest && <span className="text-accent-500 italic font-serif">{agencyNameRest}</span>}
            </h2>
            <p className="text-white/40 text-[15px] leading-relaxed max-w-[340px]">
              Tangier’s leading agency for premium real estate and private off-market acquisitions.
            </p>
            <address className="not-italic space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/60 text-[14px]">
                <IoLocationOutline className="text-accent-500 text-xl shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/60 text-[14px]">
                <IoCallOutline className="text-accent-500 text-xl shrink-0" />
                <a href={`tel:+${settings.phone_number}`} className="hover:text-accent-500 transition-colors">
                  {settings.phone_display}
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/60 text-[14px]">
                <IoMailOutline className="text-accent-500 text-xl shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-accent-500 transition-colors">
                  {settings.email}
                </a>
              </div>
            </address>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-3 space-y-6 text-center md:text-left">
            <h4 className="text-white text-[13px] font-bold uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-[14px] text-white/40">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-accent-500 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIALS */}
          <div className="lg:col-span-4 space-y-8 text-center md:text-left flex flex-col items-center md:items-start">
            <h4 className="text-white text-[13px] font-bold uppercase tracking-widest">Connect With Us</h4>
            <ul className="flex gap-5">
              {[
                { icon: <IoLogoInstagram />, link: settings.instagram_url },
                settings.linkedin_url ? { icon: <IoLogoLinkedin />, link: settings.linkedin_url } : null,
                { icon: <IoLogoWhatsapp />, link: `https://wa.me/${settings.phone_number}` }
              ].filter(Boolean).map((social, i) => (
                <li key={i}>
                  <a href={social.link} target="_blank" rel="noopener noreferrer" className="w-13 h-13 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-accent-500 hover:border-accent-500 transition-all text-xl shadow-lg">
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-white/20 text-[12px] leading-relaxed max-w-[280px]">
              Discretion is our priority. Available for private consultations 24/7.
            </p>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <span className="text-white/20 text-[10px] uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {settings.agency_name}. All Rights Reserved.
          </span>
          <div className="flex gap-8">
            <span className="text-white/20 text-[10px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Legal</span>
            <span className="text-white/20 text-[10px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;