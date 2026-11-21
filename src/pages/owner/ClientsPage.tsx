// Figma 1:3360 "Base de Clientes".
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@/components/ui';
import { ClientsScreen } from '@/features/owner-ops/ClientsScreen';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { ClientForm } from '@/features/owner-ops/staff';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';

const ClientsPage = () => {
  usePageTitle('Clientes');
  const ctx = useActiveContext();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  return (
    <WorkspaceGate ctx={ctx} requireBranch={false}>
      {ctx.barbershop ? (
        <>
          <ClientsScreen
            barbershopId={ctx.barbershop.id}
            title="Base de Clientes"
            newAppointmentPath="/dashboard/agendamentos/novo"
            detailPath={(id) => `/dashboard/clientes/${id}`}
            onNewClient={() => setCreating(true)}
          />
          <Modal open={creating} onClose={() => setCreating(false)} title="Novo cliente">
            <ClientForm
              barbershopId={ctx.barbershop.id}
              onCancel={() => setCreating(false)}
              onSaved={(client) => {
                setCreating(false);
                if (client?.id) navigate(`/dashboard/clientes/${client.id}`);
              }}
            />
          </Modal>
        </>
      ) : null}
    </WorkspaceGate>
  );
};

export default ClientsPage;
