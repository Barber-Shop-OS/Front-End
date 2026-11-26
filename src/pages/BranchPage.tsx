import { CalendarDays, Scissors } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import AsyncStatus, { EmptyState } from "@/components/feedback/AsyncStatus";
import {
  formatAddressLine,
  formatCityState,
  formatOpeningHours,
  toNumberPrice,
  usePublicBarbershop,
} from "@/features/barbershop-profile/api/publicBarbershopApi";
import ArtisansList, {
  type Artisan,
} from "@/features/branch-profile/components/ArtisansList";
import BranchHero from "@/features/branch-profile/components/BranchHero";
import BranchServicesGrid, {
  type BranchService,
} from "@/features/branch-profile/components/BranchServicesGrid";
import OpeningHoursCard from "@/features/branch-profile/components/OpeningHoursCard";
import AppLayout from "@/layouts/AppLayout";
import { initialsAvatar } from "@/utils/avatar";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1521490727435-5a1cf3a2af9f?auto=format&fit=crop&w=1200&q=80";

/**
 * Página pública da filial (/b/:slug/:branchId). Usa o perfil público da
 * barbearia (GET /api/barbershop/slug/:slug) e filtra a filial da rota.
 */
const BranchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { slug, branchId } = useParams();
  const { data: barbershop, loading, error } = usePublicBarbershop(slug);

  const branch = barbershop?.branches.find((item) => String(item.id) === branchId);

  if (loading || error || !barbershop || !branch) {
    return (
      <AppLayout>
        <AsyncStatus
          loading={loading}
          error={error ?? { status: 404, message: "Unidade não encontrada" }}
          notFoundMessage="Unidade não encontrada."
        />
      </AppLayout>
    );
  }

  const branchBarbers = barbershop.barbers.filter((barber) => barber.branch_id === branch.id);
  const offeredServiceIds = new Set(
    branchBarbers.flatMap((barber) => barber.services.map((service) => service.id)),
  );
  // Sem vínculo barbeiro↔serviço cadastrado, mostra o catálogo inteiro da barbearia.
  const branchServices =
    offeredServiceIds.size > 0
      ? barbershop.services.filter((service) => offeredServiceIds.has(service.id))
      : barbershop.services;

  const services: BranchService[] = branchServices.map((service) => ({
    id: String(service.id),
    icon: Scissors,
    name: service.name,
    description: service.description ?? "",
    durationMinutes: service.duration,
    priceInReais: toNumberPrice(service.price),
  }));

  const artisans: Artisan[] = branchBarbers.map((barber) => {
    const name = barber.display_name ?? "Profissional";
    return {
      id: String(barber.id),
      name,
      role: barber.bio ?? (barber.services.map((service) => service.name).slice(0, 2).join(" · ") || "Barbeiro"),
      avatar: barber.photo_url ?? initialsAvatar(name),
    };
  });

  const bookingBase = `/b/${barbershop.slug}/agendar?filial=${branch.id}`;
  const handleSelectService = (serviceId: string) => navigate(`${bookingBase}&servico=${serviceId}`);
  const handleSelectArtisan = (artisanId: string) => navigate(`${bookingBase}&profissional=${artisanId}`);
  const handleBookNow = () => navigate(bookingBase);

  const address = [formatAddressLine(branch.address), formatCityState(branch.address)]
    .filter(Boolean)
    .join(" - ");

  return (
    <AppLayout>
      <div className="px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <BranchHero
              badge={branch.open_now ? "Aberto agora" : "Fechado agora"}
              name={branch.name}
              address={address}
              coverImage={barbershop.cover_url ?? DEFAULT_COVER}
            />
            <OpeningHoursCard
              title="Horário de funcionamento"
              openingHours={formatOpeningHours(branch.opening_hours)}
              phone={branch.phone ?? branch.whatsapp ?? barbershop.phone}
            />
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {services.length > 0 ? (
              <BranchServicesGrid services={services} onSelectService={handleSelectService} />
            ) : (
              <EmptyState message="Nenhum serviço disponível nesta unidade." />
            )}
            {artisans.length > 0 ? (
              <ArtisansList artisans={artisans} onSelectArtisan={handleSelectArtisan} />
            ) : (
              <EmptyState message="Nenhum profissional cadastrado nesta unidade." />
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleBookNow}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <CalendarDays className="h-4 w-4" />
              Agendar Agora
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default BranchPage;
