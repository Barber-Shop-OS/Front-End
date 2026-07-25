import { CalendarDays, Droplet, Ruler, Scissors, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import BranchHero from "@/features/branch-profile/components/BranchHero";
import OpeningHoursCard, {
  OpeningHour,
} from "@/features/branch-profile/components/OpeningHoursCard";
import BranchServicesGrid, {
  BranchService,
} from "@/features/branch-profile/components/BranchServicesGrid";
import ArtisansList, {
  Artisan,
} from "@/features/branch-profile/components/ArtisansList";
import AppLayout from "@/layouts/AppLayout";

// TODO: substituir por chamada real usando o :branchId da rota
// (ex: useGetBranchByIdQuery(branchId))
const openingHours: OpeningHour[] = [
  { label: "Segunda - Sexta", hours: "09:00 - 21:00" },
  { label: "Sábado", hours: "08:00 - 19:00" },
  { label: "Domingo", hours: "Fechado", closed: true },
];

const services: BranchService[] = [
  {
    id: "corte-stark-signature",
    icon: Scissors,
    name: "Corte Stark Signature",
    description:
      "Corte tesoura e máquina com acabamento em navalha e visagismo personalizado.",
    durationMinutes: 45,
    priceInReais: 95,
  },
  {
    id: "barba-imperial",
    icon: Sparkles,
    name: "Barba Imperial",
    description:
      "Barbear clássico com toalha quente, óleos essenciais e massagem facial.",
    durationMinutes: 30,
    priceInReais: 75,
  },
  {
    id: "blade-combo",
    icon: Ruler,
    name: "The Blade Combo",
    description:
      "O protocolo completo: Corte Signature + Barba Imperial + Alinhamento de fios.",
    durationMinutes: 90,
    priceInReais: 150,
  },
  {
    id: "tratamento-capilar",
    icon: Droplet,
    name: "Tratamento Capilar",
    description:
      "Hidratação profunda e detox do couro cabeludo com produtos premium.",
    durationMinutes: 20,
    priceInReais: 60,
  },
];

const artisans: Artisan[] = [
  {
    id: "arthur-stark",
    name: "Arthur Stark",
    role: "Master Barber • 12 anos exp.",
    avatar: "https://i.pravatar.cc/120?img=13",
  },
  {
    id: "gabriel-lima",
    name: "Gabriel Lima",
    role: "Especialista em Navalha",
    avatar: "https://i.pravatar.cc/120?img=15",
  },
  {
    id: "ricardo-alves",
    name: "Ricardo Alves",
    role: "Visagista e Colorista",
    avatar: "https://i.pravatar.cc/120?img=68",
  },
];

const BranchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { branchId } = useParams();

  const handleSelectService = (serviceId: string) =>
    navigate(`/agendar?filial=${branchId}&servico=${serviceId}`);
  const handleSelectArtisan = (artisanId: string) =>
    navigate(`/agendar?filial=${branchId}&profissional=${artisanId}`);
  const handleBookNow = () => navigate(`/agendar?filial=${branchId}`);

  return (
    <AppLayout>
      <div className="px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-10">
          {/* Linha 1: hero + card de horário */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <BranchHero
              badge="Flagship Store"
              name="Unidade Jardins"
              address="Alameda Lorena, 1250 - SP"
              rating={4.9}
              reviewsCount={2400}
              coverImage="https://images.unsplash.com/photo-1521490727435-5a1cf3a2af9f?auto=format&fit=crop&w=1200&q=80"
            />
            <OpeningHoursCard
              title="Horário de Precisão"
              openingHours={openingHours}
              phone="+55 11 3088-9000"
            />
          </div>

          {/* Linha 2: serviços + artesãos */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <BranchServicesGrid
              services={services}
              onSelectService={handleSelectService}
            />
            <ArtisansList
              artisans={artisans}
              quote="A precisão não é um ato, é um hábito na BarberOS."
              onSelectArtisan={handleSelectArtisan}
            />
          </div>

          {/* CTA final */}
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