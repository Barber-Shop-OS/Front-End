import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import BarberCard, { Barber } from "@/features/booking/components/BarberCard";
import BookingSummaryBar from "@/features/booking/components/BookingSummaryBar";
import AsyncStatus from "@/components/feedback/AsyncStatus";
import { usePublicBarbershop } from "@/features/barbershop-profile/api/publicBarbershopApi";
import BookingLayout from "@/layouts/BookingLayout";
import { initialsAvatar } from "@/utils/avatar";

const ANY_BARBER: Barber = {
  id: "any",
  name: "Qualquer Barbeiro",
  description: "Encontraremos o profissional disponível mais rápido para você.",
  isAnyBarber: true,
};

const SelectBarberPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  // Hooks antes de qualquer retorno antecipado.
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  const { data: barbershop, loading, error } = usePublicBarbershop(slug);

  if (loading || error || !barbershop) {
    return (
      <BookingLayout currentStep="barbeiro">
        <AsyncStatus loading={loading} error={error} notFoundMessage="Barbearia não encontrada." />
      </BookingLayout>
    );
  }

  const branchId = searchParams.get("filial");
  const serviceId = searchParams.get("servico");
  const branch = barbershop.branches.find((item) => String(item.id) === branchId);
  const service = barbershop.services.find((item) => String(item.id) === serviceId);
  const serviceLabel = service?.name ?? "Serviço a escolher";
  const branchLabel = branch?.name ?? "Unidade a escolher";

  // Barbeiros da filial escolhida (ou de todas) que fazem o serviço escolhido.
  const barbers: Barber[] = [
    ANY_BARBER,
    ...barbershop.barbers
      .filter((barber) => !branch || barber.branch_id === branch.id)
      .filter((barber) => !service || barber.services.some((item) => item.id === service.id))
      .map((barber) => {
        const name = barber.display_name ?? "Profissional";
        return {
          id: String(barber.id),
          name,
          description: barber.bio ?? barber.services.map((item) => item.name).join(" · "),
          avatar: barber.photo_url ?? initialsAvatar(name),
        };
      }),
  ];

  const handleNext = () => {
    if (!selectedBarberId) return;
    navigate(`/b/${slug}/agendar/horario?profissional=${selectedBarberId}`);
  };

  return (
    <BookingLayout currentStep="barbeiro">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Escolha seu Barbeiro
          </h1>
          <p className="mt-1 text-slate-500">
            Nossos especialistas estão prontos para transformar seu visual.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              selected={selectedBarberId === barber.id}
              onSelect={setSelectedBarberId}
            />
          ))}
        </div>

        <BookingSummaryBar
          label="Resumo da seleção"
          summary={`${serviceLabel} + ${branchLabel}`}
          disabled={!selectedBarberId}
          onNext={handleNext}
        />
      </div>
    </BookingLayout>
  );
};

export default SelectBarberPage;