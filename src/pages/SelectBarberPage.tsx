import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import BarberCard, { Barber } from "@/features/booking/components/BarberCard";
import BookingSummaryBar from "@/features/booking/components/BookingSummaryBar";
import BookingLayout from "@/layouts/BookingLayout";

// TODO: substituir por chamada real assim que a API estiver pronta
// (ex: useGetBarbersByBranchQuery(branchId))
const barbers: Barber[] = [
  {
    id: "any",
    name: "Qualquer Barbeiro",
    description: "Encontraremos o profissional disponível mais rápido para você.",
    isAnyBarber: true,
  },
  {
    id: "arthur-santos",
    name: 'Arthur "Blade" Santos',
    description: "Especialista em Degradê e Navalha",
    avatar: "https://i.pravatar.cc/160?img=52",
    rating: 4.9,
  },
  {
    id: "ricardo-stark",
    name: "Ricardo Stark",
    description: "Mestre Barbeiro & Visagista",
    avatar: "https://i.pravatar.cc/160?img=13",
    rating: 5.0,
  },
  {
    id: "lucas-ferreira",
    name: "Lucas Ferreira",
    description: "Cortes Clássicos e Barba Terapia",
    avatar: "https://i.pravatar.cc/160?img=33",
    rating: 4.8,
  },
];

const SelectBarberPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  // TODO: idealmente esse estado de seleção vive num slice de "booking" no
  // Redux (persistindo entre os passos), não em useState local da página.
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);

  const serviceLabel = searchParams.get("servico") ?? "Corte de Cabelo";
  const branchLabel = searchParams.get("filial") ?? "Unidade Central";

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