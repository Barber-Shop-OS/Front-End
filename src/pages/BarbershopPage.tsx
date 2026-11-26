import { useNavigate, useParams } from "react-router-dom";

import AsyncStatus, { EmptyState } from "@/components/feedback/AsyncStatus";
import {
  formatAddressLine,
  formatCityState,
  toNumberPrice,
  usePublicBarbershop,
} from "@/features/barbershop-profile/api/publicBarbershopApi";
import BarbershopHero from "@/features/barbershop-profile/components/BarbershopHero";
import BranchesSection, {
  type Branch,
} from "@/features/barbershop-profile/components/BranchesSection";
import ServicesSection, {
  type Service,
} from "@/features/barbershop-profile/components/ServicesSection";
import SpecialistsSection, {
  type Specialist,
} from "@/features/barbershop-profile/components/SpecialistsSection";
import AppLayout from "@/layouts/AppLayout";
import { initialsAvatar } from "@/utils/avatar";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80";

/** Página pública da barbearia — dados de GET /api/barbershop/slug/:slug. */
const BarbershopPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: barbershop, loading, error } = usePublicBarbershop(slug);

  if (loading || error || !barbershop) {
    return (
      <AppLayout>
        <AsyncStatus loading={loading} error={error} notFoundMessage="Barbearia não encontrada." />
      </AppLayout>
    );
  }

  const branches: Branch[] = barbershop.branches.map((branch) => ({
    id: String(branch.id),
    name: branch.name,
    street: formatAddressLine(branch.address),
    cityState: formatCityState(branch.address),
  }));

  const services: Service[] = barbershop.services.map((service) => ({
    id: String(service.id),
    name: service.name,
    durationMinutes: service.duration,
    priceInReais: toNumberPrice(service.price),
  }));

  const specialists: Specialist[] = barbershop.barbers.map((barber) => {
    const name = barber.display_name ?? "Profissional";
    return {
      id: String(barber.id),
      name,
      specialty: barber.services.map((service) => service.name).slice(0, 2).join(" · ") || "Barbeiro",
      avatar: barber.photo_url ?? initialsAvatar(name),
    };
  });

  const handleBookNow = () => navigate(`/b/${barbershop.slug}/agendar`);
  const handleSelectBranch = (branchId: string) => navigate(`/b/${barbershop.slug}/${branchId}`);
  const handleAddService = (serviceId: string) =>
    navigate(`/b/${barbershop.slug}/agendar?servico=${serviceId}`);
  const handleSelectSpecialist = (specialistId: string) =>
    navigate(`/b/${barbershop.slug}/agendar?profissional=${specialistId}`);

  return (
    <AppLayout>
      <BarbershopHero
        name={barbershop.name}
        tagline={barbershop.description ?? ""}
        coverImage={barbershop.cover_url ?? DEFAULT_COVER}
        onBookNow={handleBookNow}
      />

      {branches.length > 0 ? (
        <BranchesSection branches={branches} onSelectBranch={handleSelectBranch} />
      ) : (
        <div className="px-6 py-8 lg:px-12">
          <EmptyState message="Nenhuma unidade disponível no momento." />
        </div>
      )}

      {services.length > 0 ? (
        <ServicesSection services={services} onAddService={handleAddService} />
      ) : null}

      {specialists.length > 0 ? (
        <SpecialistsSection specialists={specialists} onSelectSpecialist={handleSelectSpecialist} />
      ) : null}
    </AppLayout>
  );
};

export default BarbershopPage;
