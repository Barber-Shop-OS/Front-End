import LandingHero from "@/features/landing/components/LandingHero";
import FeaturedBarbershops from "@/features/landing/components/FeaturedBarbershops";
import HowItWorks from "@/features/landing/components/HowItWorks";
import CtaBanner from "@/features/landing/components/CtaBanner";
import LandingFooter from "@/features/landing/components/LandingFooter";
import MainLayout from "@/layouts/MainLayout";

const LandingPage = (): JSX.Element => {
  return (
    <MainLayout>
      <LandingHero />
      <FeaturedBarbershops />
      <HowItWorks />
      <CtaBanner />
      <LandingFooter />
    </MainLayout>
  );
};

export default LandingPage;