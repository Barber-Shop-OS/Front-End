// Figma 1:4201 "Agenda da Filial".
import { AgendaScreen } from '@/features/owner-ops/AgendaScreen';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const AgendaPage = () => {
  usePageTitle('Agenda');
  const ctx = useActiveContext();
  return (
    <WorkspaceGate ctx={ctx}>
      <AgendaScreen ctx={ctx} title="Agenda da Filial" newAppointmentPath="/dashboard/agendamentos/novo" />
    </WorkspaceGate>
  );
};

export default AgendaPage;
