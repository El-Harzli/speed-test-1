import Hero from "./Sections/Hero";
import ServicesOptimized from "./Sections/ServicesOptimized";
import FeaturedProperties from "./Sections/FeaturedProperties"
import WhyUs from "./Sections/WhyUs";
import Neighborhoods from "./Sections/Neighborhoods";
import PrivateList from "./Sections/PrivateList";
import LifestyleBento from "./Sections/LifestyleBento";
import HumanSection from "./Sections/HumanSection";
import { useNavigate } from "react-router";
import usePageTitle from "../../hooks/usePageTitle";
import usePageMeta from "../../hooks/usePageMeta";

import PropertyConcierge from "./Sections/PropertyConcierge";


function Home() {
  const navigate = useNavigate();
  usePageTitle("Luxury Real Estate in Tangier");
  usePageMeta(
    "Browse verified villas and apartments for sale and rent in Tangier, Morocco. Curated listings, private concierge service, and 15+ years of local real estate expertise from BSI Properties."
  );

  return (
    <>
      <Hero />
      <ServicesOptimized onSelectService={(service) => navigate(service.to)} />
      <FeaturedProperties />
      <WhyUs />
      <Neighborhoods />
      {/* <LifestyleBento /> */}
      <HumanSection />
      {/* <PrivateList /> */}
      <PropertyConcierge />

    </>
  );
}

export default Home;
