import LandingHero from "@/features/landing/components/LandingHero";
import BenefitsSection from "@/features/landing/components/BenefitsSection";
import HowItWorks from "@/features/landing/components/HowItWorks";
import TestimonialsSection from "@/features/landing/components/TestimonialsSection";
import PricingSection from "@/features/landing/components/PricingSection";
import CtaBanner from "@/features/landing/components/CtaBanner";
import LandingFooter from "@/features/landing/components/LandingFooter";
import LandingLayout from "@/layouts/LandingLayout";

const LandingPage = (): JSX.Element => {
  return (
    <LandingLayout>
      <LandingHero />
      <div id="beneficios">
        <BenefitsSection />
      </div>
      <HowItWorks />
      <div id="depoimentos">
        <TestimonialsSection />
      </div>
      <div id="planos">
        <PricingSection />
      </div>
      <CtaBanner />
      <LandingFooter />
    </LandingLayout>
  );
};

export default LandingPage;