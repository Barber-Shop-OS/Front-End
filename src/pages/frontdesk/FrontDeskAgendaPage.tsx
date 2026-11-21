// Figma 1:5337 "Agenda - Atendimento".
import { AgendaScreen } from '@/features/owner-ops/AgendaScreen';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const FrontDeskAgendaPage = () => {
  usePageTitle('Agenda');
  const ctx = useActiveContext('frontdesk');
  return (
    <WorkspaceGate ctx={ctx}>
      <AgendaScreen ctx={ctx} title="Agenda" newAppointmentPath="/atendimento/agendamentos/novo" />
    </WorkspaceGate>
  );
};

export default FrontDeskAgendaPage;
