// Detalhe do cliente (Base de Clientes, Figma 1:3360): contatos, indicadores, observações e histórico de
// atendimentos com pagamento. Requer o recurso clients_crm (planos Profissional/Rede).
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Ban, CalendarPlus, Mail, MessageCircle, Pencil, Phone, ShieldCheck } from 'lucide-react';

import { Alert, Avatar, Badge, ButtonLink, Button, Card, CardTitle, ConfirmDialog, EmptyState, ErrorState, ListSkeleton, Modal, PageHeader, StatusBadge, Textarea, useToast } from '@/components/ui';
import { useOwnerOpsClientQuery, useOwnerOpsUpdateClientMutation } from '@/features/owner-ops/api';
import { WorkspaceGate } from '@/features/owner-ops/components';
import { METHOD_LABEL, PAYMENT_STATUS_LABEL } from '@/features/owner-ops/metrics';
import { ClientForm } from '@/features/owner-ops/staff';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { formatDay, formatDateTime } from '@/utils/date';
import { formatBRL, formatPhone, whatsappLink } from '@/utils/format';

const Content = ({ barbershopId }: { barbershopId: number }) => {
  const clientId = Number(useParams().clientId);
  const { data: client, isLoading, error, refetch } = useOwnerOpsClientQuery({ barbershopId, clientId });
  const [editing, setEditing] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [reason, setReason] = useState('');
  const [updateClient, { isLoading: savingBlock }] = useOwnerOpsUpdateClientMutation();
  const toast = useToast();
  usePageTitle(client?.name ?? 'Cliente');

  const back = (
    <Link to="/dashboard/clientes" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Clientes
    </Link>
  );

  if (isLoading) return <ListSkeleton rows={5} />;
  if (errorCode(error) === 'FEATURE_NOT_IN_PLAN') {
    return (
      <div>
        <PageHeader back={back} title="Cliente" />
        <EmptyState title="Histórico de clientes no plano Profissional" description="Faça upgrade para ver visitas, faltas e o histórico completo." action={<ButtonLink to="/dashboard/assinatura">Ver planos</ButtonLink>} />
      </div>
    );
  }
  if (error || !client) {
    return (
      <div>
        <PageHeader back={back} title="Cliente" />
        <ErrorState error={error} onRetry={refetch} />
      </div>
    );
  }

  // SEC-21: bloqueio na barbearia — o cliente não agenda online; a equipe ainda agenda pelo balcão.
  const toggleBlock = async () => {
    const block = !client.blocked;
    try {
      await updateClient({ barbershopId, clientId: client.id, blocked: block, blocked_reason: block ? reason.trim() || null : null }).unwrap();
      toast.success(block ? 'Cliente bloqueado para agendamento online.' : 'Cliente desbloqueado.');
      setBlocking(false);
      setReason('');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const wa = whatsappLink(client.phone, `Olá, ${client.name.split(' ')[0]}!`);
  const stats = [
    { label: 'Visitas', value: client.visits ?? 0 },
    { label: 'Faltas', value: client.no_shows ?? 0 },
    { label: 'Última visita', value: client.last_visit ? formatDay(client.last_visit) : '—' },
    { label: 'Total gasto', value: formatBRL(client.total_spent) },
  ];

  return (
    <div>
      <PageHeader
        back={back}
        title={client.name}
        action={
          <>
            <Button variant="secondary" icon={<Pencil className="h-4 w-4" aria-hidden="true" />} onClick={() => setEditing(true)}>
              Editar
            </Button>
            <Button
              variant="secondary"
              icon={client.blocked ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <Ban className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setBlocking(true)}
            >
              {client.blocked ? 'Desbloquear' : 'Bloquear'}
            </Button>
            <ButtonLink to={`/dashboard/agendamentos/novo?cliente=${client.id}`} icon={<CalendarPlus className="h-4 w-4" aria-hidden="true" />}>
              Agendar
            </ButtonLink>
          </>
        }
      />
      {client.blocked ? (
        <Alert tone="error" className="mb-6">
          Cliente bloqueado{client.blocked_at ? ` desde ${formatDay(client.blocked_at)}` : ''}: não consegue agendar online nesta barbearia. A equipe ainda pode agendar pelo balcão.
          {client.blocked_reason ? ` Motivo: ${client.blocked_reason}` : ''}
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Avatar name={client.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-ink">{client.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {client.has_account ? <Badge tone="blue">Tem conta no BarberOS</Badge> : <Badge>Cadastro do balcão</Badge>}
                  {client.blocked ? <Badge tone="red">Bloqueado</Badge> : null}
                </div>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm">
              {client.phone ? (
                <li className="flex items-center gap-2 text-ink">
                  <Phone className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
                  <a href={`tel:${client.phone}`} className="hover:text-primary-600">
                    {formatPhone(client.phone)}
                  </a>
                  {wa ? (
                    <a href={wa} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success-700">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                    </a>
                  ) : null}
                </li>
              ) : null}
              {client.email ? (
                <li className="flex items-center gap-2 text-ink">
                  <Mail className="h-4 w-4 text-ink-subtle" aria-hidden="true" />
                  <a href={`mailto:${client.email}`} className="truncate hover:text-primary-600">
                    {client.email}
                  </a>
                </li>
              ) : null}
            </ul>
            {client.notes ? (
              <div className="mt-5 rounded-lg bg-surface-low p-3 text-sm text-ink-variant">
                <p className="mb-1 text-xs font-semibold uppercase tracking-label">Observações</p>
                {client.notes}
              </div>
            ) : null}
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white px-4 py-3 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">{s.label}</p>
                <p className="mt-1 text-lg font-black text-ink">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardTitle>Histórico de atendimentos</CardTitle>
          {client.history.length === 0 ? (
            <p className="text-sm text-ink-variant">Nenhum atendimento registrado.</p>
          ) : (
            <ul className="divide-y divide-surface-low">
              {client.history.map((item) => (
                <li key={item.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{item.service_name}</p>
                    <p className="text-xs text-ink-variant">
                      {formatDateTime(item.start_at)} · {item.barber?.name ?? 'Barbeiro'}
                      {item.branch ? ` · ${item.branch.name}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.payment ? (
                      <Badge tone={item.payment.status === 'PAID' ? 'green' : 'yellow'}>
                        {PAYMENT_STATUS_LABEL[item.payment.status]} · {METHOD_LABEL[item.payment.method]}
                      </Badge>
                    ) : null}
                    <StatusBadge status={item.status} />
                    <span className="w-20 text-right text-sm font-semibold text-ink">{formatBRL(item.price)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar cliente">
        <ClientForm barbershopId={barbershopId} client={client} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
      </Modal>
      <ConfirmDialog
        open={blocking}
        title={client.blocked ? 'Desbloquear cliente?' : 'Bloquear cliente?'}
        description={
          client.blocked
            ? `${client.name} volta a poder agendar online nesta barbearia.`
            : `${client.name} não conseguirá agendar online nesta barbearia (por exemplo, após faltas repetidas). A equipe ainda pode agendar pelo balcão.`
        }
        confirmLabel={client.blocked ? 'Desbloquear' : 'Bloquear'}
        tone={client.blocked ? 'primary' : 'danger'}
        loading={savingBlock}
        onConfirm={toggleBlock}
        onCancel={() => setBlocking(false)}
      >
        {client.blocked ? null : (
          <Textarea label="Motivo (opcional, visível só para a equipe)" maxLength={255} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        )}
      </ConfirmDialog>
    </div>
  );
};

const ClientDetailPage = () => {
  const ctx = useActiveContext();
  return <WorkspaceGate ctx={ctx} requireBranch={false}>{ctx.barbershop ? <Content barbershopId={ctx.barbershop.id} /> : null}</WorkspaceGate>;
};

export default ClientDetailPage;
