import { useNavigate } from "react-router-dom";

import BarbershopHero from "@/features/barbershop-profile/components/BarbershopHero";
import BranchesSection, {
  Branch,
} from "@/features/barbershop-profile/components/BranchesSection";
import ServicesSection, {
  Service,
} from "@/features/barbershop-profile/components/ServicesSection";
import SpecialistsSection, {
  Specialist,
} from "@/features/barbershop-profile/components/SpecialistsSection";
import AppLayout from "@/layouts/AppLayout";

// TODO: substituir por chamada real assim que a API estiver pronta
// (ex: useGetBarbershopBySlugQuery(slug) vindo do params da rota /b/:slug)
const branches: Branch[] = [
  {
    id: "jardins",
    name: "Jardins",
    street: "Rua Oscar Freire, 1234",
    cityState: "São Paulo - SP",
  },
  {
    id: "itaim-bibi",
    name: "Itaim Bibi",
    street: "Rua Joaquim Floriano, 800",
    cityState: "São Paulo - SP",
  },
  {
    id: "pinheiros",
    name: "Pinheiros",
    street: "Rua dos Pinheiros, 500",
    cityState: "São Paulo - SP",
  },
];

const services: Service[] = [
  { id: "corte-classico", name: "Corte Clássico", durationMinutes: 45, priceInReais: 80 },
  { id: "barba-tradicional", name: "Barba Tradicional", durationMinutes: 30, priceInReais: 60 },
  { id: "corte-barba", name: "Corte + Barba", durationMinutes: 75, priceInReais: 130 },
  { id: "pigmentacao", name: "Pigmentação", durationMinutes: 40, priceInReais: 90 },
];

const specialists: Specialist[] = [
  {
    id: "ricardo-silva",
    name: "Ricardo Silva",
    specialty: "Corte clássico",
    avatar: "https://i.pravatar.cc/160?img=13",
  },
  {
    id: "marcelo-costa",
    name: "Marcelo Costa",
    specialty: "Barboterapia",
    avatar: "https://i.pravatar.cc/160?img=15",
  },
  {
    id: "andre-santos",
    name: "André Santos",
    specialty: "Pigmentação",
    avatar: "https://i.pravatar.cc/160?img=17",
  },
  {
    id: "joao-mendes",
    name: "João Mendes",
    specialty: "Master barber",
    avatar: "https://i.pravatar.cc/160?img=33",
  },
];

const BarbershopPage = (): JSX.Element => {
  const navigate = useNavigate();

  // TODO: :slug deve vir de useParams() quando a rota /b/:slug existir
  const handleBookNow = () => navigate("/agendar");
  const handleSelectBranch = (branchId: string) => navigate(`/filiais/${branchId}`);
  const handleAddService = (serviceId: string) => navigate(`/agendar?servico=${serviceId}`);
  const handleSelectSpecialist = (specialistId: string) =>
    navigate(`/agendar?profissional=${specialistId}`);

  return (
    <AppLayout>
      <BarbershopHero
        name="A Arte da Precisão Digital."
        tagline="Experimente o rigor de uma navalha e a sofisticação de uma alfaiataria clássica. Bem-vindo ao BarberOS."
        coverImage="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80"
        onBookNow={handleBookNow}
      />

      <BranchesSection branches={branches} onSelectBranch={handleSelectBranch} />

      <ServicesSection services={services} onAddService={handleAddService} />

      <SpecialistsSection
        specialists={specialists}
        onSelectSpecialist={handleSelectSpecialist}
      />
    </AppLayout>
  );
};

export default BarbershopPage;