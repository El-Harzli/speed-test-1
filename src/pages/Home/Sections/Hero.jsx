import Button from "@components/Button";
import heroTp from "@assets/hero_transparent.webp";
import Badges from "@components/Badges";

import { FiHome, FiCheckCircle } from "react-icons/fi";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { TfiMedallAlt } from "react-icons/tfi";

function Hero() {
  return (
    <section className="bg-primary-500 text-center lg:text-left pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40 pb-10 sm:pb-12 md:pb-16 lg:pb-24 xl:pb-28 overflow-hidden">
      <div className="wrapper flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Text column */}
        <div className="flex flex-col items-center lg:items-start lg:w-[46%] lg:shrink-0 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-none mx-auto lg:mx-0">
          <p className="uppercase text-[10px] sm:text-[11px] md:text-xs font-medium text-accent-500 tracking-[0.18em]">
            Verified Listings in Tangier
          </p>

          <h1 className="text-[32px] sm:text-[38px] md:text-[44px] lg:text-[50px] xl:text-[58px] font-semibold tracking-tight leading-[1.15] md:leading-[1.12] lg:leading-[1.08] text-main mt-2 sm:mt-3">
            Find a Place <br className="md:hidden" />
            you&rsquo;ll Call Home
          </h1>

          <p className="font-medium text-[14px] sm:text-[15px] md:text-base lg:text-lg text-secondary max-w-[85%] sm:max-w-[90%] md:max-w-md lg:max-w-md mt-2.5 sm:mt-3 leading-[1.6] sm:leading-[1.65]">
            Curated villas and apartments <br className="lg:hidden" />
            to rent or buy in Tangier&rsquo;s finest neighborhoods.
          </p>

          <div className="w-12 sm:w-14 h-0.5 bg-accent-500/30 mt-3 sm:mt-4 rounded-full"></div>

          <div className="w-full sm:w-auto flex flex-col justify-center sm:flex-row gap-3 mt-6 sm:mt-7 md:mt-8">
            <Button
              variant="primary"
              label="Browse Properties"
              to="/properties/rent"
              customCss="sm:px-7 lg:px-8"
            />
            <Button
              variant="outline"
              label="Property Concierge"
              to="/concierge"
              customCss="sm:px-7 lg:px-8"
            />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 gap-y-2.5 sm:gap-2.5 lg:gap-3 mt-8 sm:mt-9 md:mt-10 lg:mt-12">
            <Badges Icon={TfiMedallAlt} label="Years Expertise" count={15} />
            <Badges Icon={FiHome} label="Properties Listed" count={120} />
            <Badges
              Icon={HiOutlineEmojiHappy}
              label="Happy Clients"
              count={300}
            />
          </div>
        </div>

        {/* Image column */}
        <div className="relative w-full lg:w-[50%] mt-8 sm:mt-9 md:mt-10 lg:mt-0 shrink-0">
          <div className="absolute inset-0 bg-accent-500/15 blur-3xl rounded-[55px]"></div>

          <img
            src={heroTp}
            alt="Modern home exterior"
            className="relative w-full h-auto max-h-[30dvh] sm:max-h-[35dvh] md:max-h-[45vh] lg:max-h-[60vh] xl:max-h-[65vh] object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.2)] mx-auto"
          />

          {/* Top-right floating badge — visible from md up */}
          <div className="hidden md:flex absolute top-2 right-4 lg:top-4 items-center gap-1.5 bg-white rounded-full border border-accent-500/10 shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-3 py-1.5 lg:px-3.5 lg:py-2">
            <FiCheckCircle className="text-accent-500 shrink-0" size={13} />
            <span className="text-[11px] lg:text-[12px] font-medium text-main">
              100% Verified
            </span>
          </div>

          {/* Bottom-left floating listing card — desktop only, needs the two-column layout to have room */}
          <div className="hidden lg:block absolute bottom-6 left-2 bg-white rounded-2xl border border-accent-500/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-5 py-4 min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"></div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-main leading-tight">
                  Villa in Malabata
                </p>
                <p className="text-[12px] text-secondary mt-0.5">
                  4.2M MAD &middot; Available now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-accent-500/10">
              <div className="w-6 h-6 rounded-full bg-accent-500/15 flex items-center justify-center text-[10px] font-semibold text-accent-500 shrink-0">
                A
              </div>
              <p className="text-[11px] text-secondary">
                Listed by Amina, verified agent
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
