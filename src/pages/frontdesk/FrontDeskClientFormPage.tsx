// Figma 1:5856 "Cadastro de Cliente - Atendimento": formulário rápido; ao salvar, oferece agendar já.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, CheckCircle2, UserPlus } from 'lucide-react';

import { Button, ButtonLink, Card, PageHeader } from '@/components/ui';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { ClientForm } from '@/features/owner-ops/staff';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Client } from '@/types/api';

const FrontDeskClientFormPage = () => {
  usePageTitle('Novo cliente');
  const ctx = useActiveContext('frontdesk');
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Client | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <WorkspaceGate ctx={ctx} requireBranch={false}>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          back={
            <Link to="/atendimento/clientes" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Clientes
            </Link>
          }
          title="Cadastro de Cliente"
          description="Cadastre quem chegou no balcão em poucos segundos."
        />
        {saved ? (
          <Card className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success-600" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-ink">{saved.name} cadastrado!</h2>
            <p className="mt-1 text-sm text-ink-variant">Quer agendar um horário agora?</p>
            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <ButtonLink to={`/atendimento/agendamentos/novo?cliente=${saved.id}`} icon={<CalendarPlus className="h-4 w-4" aria-hidden="true" />}>
                Agendar para {saved.name.split(' ')[0]}
              </ButtonLink>
              <Button
                variant="secondary"
                icon={<UserPlus className="h-4 w-4" aria-hidden="true" />}
                onClick={() => {
                  setSaved(null);
                  setFormKey((k) => k + 1);
                }}
              >
                Cadastrar outro
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            {ctx.barbershop ? <ClientForm key={formKey} barbershopId={ctx.barbershop.id} onCancel={() => navigate('/atendimento/clientes')} onSaved={setSaved} /> : null}
          </Card>
        )}
      </div>
    </WorkspaceGate>
  );
};

export default FrontDeskClientFormPage;
