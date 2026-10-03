import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  IoLockClosedOutline, 
  IoLogoWhatsapp, 
  IoCallOutline, 
  IoChatbubbleEllipsesOutline, 
  IoArrowForward,
  IoShieldCheckmarkOutline 
} from "react-icons/io5";
import { useProperties } from "../../../context/PropertiesContext";

function PrivateList() {
  const { settings } = useProperties();
  const tickerText = Array(8).fill("OFF-MARKET PROPERTIES • VIP ACCESS ONLY • ");
  const tags = ["100% Confidential", "Verified Listings", "Professional Discretion", "Legal Guidance"];

  // Same fix as Footer.jsx's Instagram marquee: only animate while this
  // ticker is actually on screen, rather than running an Infinity-repeat
  // animation the whole time the homepage is open.
  const tickerRef = useRef(null);
  const isTickerInView = useInView(tickerRef, { margin: "200px" });

  return (
    <section className="bg-[#0F0F0F] py-16 md:py-24 lg:py-32 overflow-hidden text-left">
      {/* 1. SCROLLING TICKER */}
      <div ref={tickerRef} className="border-y border-white/10 py-4 md:py-6 mb-16 md:mb-20 flex whitespace-nowrap overflow-hidden">
        <motion.div 
          animate={isTickerInView ? { x: [0, -1000] } : undefined}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex"
        >
          {tickerText.map((text, i) => (
            <span key={i} className="text-white/10 text-[12px] md:text-[14px] font-bold uppercase tracking-[0.4em] flex-shrink-0">
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="wrapper px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* 2. LEFT COLUMN: BRANDING */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)]">
                <IoLockClosedOutline className="text-accent-500 w-7 h-7" />
              </div>
            </div>
            <div>
              <h2 className="text-white text-[32px] md:text-[42px] lg:text-[52px] font-semibold leading-[1.1] mb-6 tracking-tight uppercase">
                The Private <br /> 
                <span className="text-accent-500">Collection</span>
              </h2>
              <p className="text-white/50 text-[15px] md:text-[16px] leading-relaxed max-w-[400px] mx-auto lg:mx-0">
                Access Tangier&rsquo;s most prestigious residences before they hit the public market. We provide full discretion for high-net-worth acquisitions.
              </p>
            </div>
          </div>

          {/* 3. RIGHT COLUMN: ACTIONS */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 md:gap-6">
            
            {/* CALLBACK SERVICE */}
            <div className="col-span-2 bg-white/[0.03] border border-white/10 rounded-[32px] p-8 md:p-10 flex flex-col justify-between group">
              <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center">
                    <IoChatbubbleEllipsesOutline className="text-accent-500 w-5 h-5" />
                  </div>
                  <span className="text-white text-[14px] font-medium uppercase tracking-widest leading-none">VIP Callback Service</span>
                </div>
                <p className="text-white/40 text-[13px]">Leave your number and our lead consultant will contact you within 24 hours.</p>
              </div>
              
              <div className="flex gap-3">
                <input 
                  type="tel" 
                  placeholder="Enter phone number" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-white text-[15px] focus:outline-none focus:border-accent-500/50 transition-all placeholder:text-white/20"
                />
                <button className="bg-accent-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-accent-500/20 active:scale-95 transition-all shrink-0">
                  <IoArrowForward className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* WHATSAPP */}
            <a 
              href={`https://wa.me/${settings.phone_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 bg-[#25D366]/5 border border-[#25D366]/10 rounded-[28px] p-6 hover:bg-[#25D366]/10 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0">
                <IoLogoWhatsapp className="text-[#25D366] w-6 h-6" />
              </div>
              <div className="text-center md:text-left">
                <span className="block text-white text-[11px] font-bold uppercase tracking-wider mb-0.5 leading-none">WhatsApp</span>
                <span className="hidden md:block text-[#25D366] text-[10px] uppercase font-bold opacity-60">Instant Access</span>
              </div>
            </a>
            
            {/* DIRECT CALL */}
            <a 
              href={`tel:+${settings.phone_number}`}
              className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-4 bg-white/5 border border-white/10 rounded-[28px] p-6 hover:bg-white/10 transition-all"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <IoCallOutline className="text-white w-6 h-6" />
              </div>
              <div className="text-center md:text-left">
                <span className="block text-white text-[11px] font-bold uppercase tracking-wider mb-0.5 leading-none">Direct Line</span>
                <span className="hidden md:block text-white/40 text-[10px] uppercase font-bold">Available 24/7</span>
              </div>
            </a>
          </div>
        </div>

        {/* 4. FIXED CONFIDENTIALITY TAGS: Grouped and Centered */}
        <div className="mt-20 flex flex-wrap justify-center gap-3 md:gap-6">
          {tags.map((tag, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 whitespace-nowrap"
            >
              <IoShieldCheckmarkOutline className="text-accent-500 w-3 h-3" />
              <span className="text-white/60 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PrivateList;