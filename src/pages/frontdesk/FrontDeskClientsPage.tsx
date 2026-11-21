// Clientes do atendimento (lista de 1:5856): busca rápida, cadastro e atalho para agendar.
import { ClientsScreen } from '@/features/owner-ops/ClientsScreen';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const FrontDeskClientsPage = () => {
  usePageTitle('Clientes');
  const ctx = useActiveContext('frontdesk');
  return (
    <WorkspaceGate ctx={ctx} requireBranch={false}>
      {ctx.barbershop ? <ClientsScreen barbershopId={ctx.barbershop.id} title="Clientes" newClientPath="/atendimento/clientes/novo" newAppointmentPath="/atendimento/agendamentos/novo" /> : null}
    </WorkspaceGate>
  );
};

export default FrontDeskClientsPage;
