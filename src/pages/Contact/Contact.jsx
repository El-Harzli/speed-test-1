import { useState, lazy, Suspense } from "react";
import {
  IoLogoWhatsapp,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoSendOutline,
} from "react-icons/io5";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { useProperties } from "../../context/PropertiesContext";

// Same reasoning as the property detail/browse pages — Leaflet stays out
// of this page's initial bundle until it's actually needed.
const PropertyLocationMap = lazy(() => import("../BrowseProperties/Sections/PropertyLocationMap"));

function MapLoadingFallback() {
  return (
    <div className="w-full h-64 rounded-[16px] border border-accent-500/10 flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500/20 border-t-accent-500" />
    </div>
  );
}

// Tangier city center — swap for the actual office coordinates if there's
// a physical address to pin (same fallback used on the /properties map).
// The phone number, email, and location below now all come from Settings
// (admin dashboard) via PropertiesContext — see `settings` in the
// component below. CHANNELS is built there so it can use those values.
function buildChannels(settings) {
  return [
    {
      icon: IoLogoWhatsapp,
      label: "WhatsApp",
      value: settings.phone_display,
      href: `https://wa.me/${settings.phone_number}`,
      highlight: true,
    },
    {
      icon: IoCallOutline,
      label: "Call Us",
      value: settings.phone_display,
      href: `tel:+${settings.phone_number}`,
    },
    {
      icon: IoMailOutline,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: IoLocationOutline,
      label: "Location",
      value: settings.address,
      href: `https://www.google.com/maps?q=${settings.office_lat},${settings.office_lng}`,
    },
  ];
}

function Contact() {
  usePageTitle("Contact Us");
  usePageMeta(
    "Get in touch with BSI Properties — reach us by WhatsApp, phone, or email, or visit our office in Tangier, Morocco."
  );
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { settings } = useProperties();
  const CHANNELS = buildChannels(settings);

  // No backend to submit to — rather than a form that silently goes
  // nowhere, this composes a pre-filled WhatsApp message, the same
  // channel every other inquiry on this site already routes through
  // (property contact buttons, the agent cards on /about, etc.).
  const whatsappHref = `https://wa.me/${settings.phone_number}?text=${encodeURIComponent(
    `Hi, I'm ${name || "..."}. ${message || "I'd like to get in touch."}`,
  )}`;

  return (
    <>
      <section className="bg-primary-500 pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-10 md:pb-14 text-center">
        <div className="wrapper max-w-2xl mx-auto">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} className="justify-center mb-4" />
          <p className="uppercase text-[11px] font-medium text-accent-500 tracking-[0.22em] mb-3">
            We&rsquo;d Love To Hear From You
          </p>
          <h1 className="text-[32px] sm:text-[40px] md:text-[46px] font-semibold tracking-tight leading-[1.15] text-main mb-4">
            Get in Touch
          </h1>
          <p className="text-[14px] sm:text-[15px] text-secondary leading-relaxed max-w-lg mx-auto">
            Questions about a listing, our concierge service, or just want to
            talk through what you&rsquo;re looking for? Reach us directly, or
            send a message below.
          </p>
        </div>
      </section>

      <section className="bg-white pb-14 md:pb-20">
        <div className="wrapper">
          {/* Channels */}
          <address className="not-italic grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
            {CHANNELS.map((channel) => {
              const Wrapper = channel.href ? "a" : "div";
              return (
                <Wrapper
                  key={channel.label}
                  {...(channel.href
                    ? {
                        href: channel.href,
                        target: channel.href.startsWith("http") ? "_blank" : undefined,
                        rel: channel.href.startsWith("http") ? "noopener noreferrer" : undefined,
                      }
                    : {})}
                  className={`flex flex-col items-center text-center gap-2.5 rounded-[20px] border p-5 md:p-6 transition-colors ${
                    channel.highlight
                      ? "bg-accent-500/5 border-accent-500/20 hover:bg-accent-500/10"
                      : "bg-white border-accent-500/10 hover:border-accent-500/30"
                  } ${channel.href ? "cursor-pointer" : ""}`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center ${
                      channel.highlight
                        ? "bg-accent-500 text-white"
                        : "bg-accent-500/10 text-accent-500"
                    }`}
                  >
                    <channel.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-secondary/70 mb-0.5">
                      {channel.label}
                    </p>
                    <p className="text-[13px] font-medium text-main break-words">
                      {channel.value}
                    </p>
                  </div>
                </Wrapper>
              );
            })}
          </address>

          {/* Map + form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <h2 className="text-[20px] font-semibold text-main mb-4">
                Find Us
              </h2>
              <Suspense fallback={<MapLoadingFallback />}>
                <PropertyLocationMap lat={settings.office_lat} lng={settings.office_lng} />
              </Suspense>
            </div>

            <div>
              <h2 className="text-[20px] font-semibold text-main mb-4">
                Send a Message
              </h2>
              <div className="bg-primary-600 rounded-[24px] p-6 md:p-7 space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-secondary mb-1.5">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amina El Fassi"
                    className="w-full rounded-[12px] border border-accent-500/10 bg-white px-3.5 py-2.5 text-sm text-main placeholder:text-secondary/40 focus:border-accent-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-secondary mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I'm looking for a 2-bedroom apartment in Malabata..."
                    rows={4}
                    className="w-full rounded-[12px] border border-accent-500/10 bg-white px-3.5 py-2.5 text-sm text-main placeholder:text-secondary/40 focus:border-accent-500 focus:outline-none resize-none"
                  />
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent-500 text-white text-sm font-semibold uppercase tracking-wide px-6 py-3 rounded-full hover:bg-accent-600 transition-colors cursor-pointer"
                >
                  <IoSendOutline className="w-4 h-4" />
                  Send via WhatsApp
                </a>
                <p className="text-[11px] text-secondary/60 text-center">
                  Opens WhatsApp with your message pre-filled — nothing sends
                  until you do.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

export default Contact;
