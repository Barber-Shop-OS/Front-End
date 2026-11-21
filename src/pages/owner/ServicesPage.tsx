// Figma 1:3209 "Gestão de Serviços" — catálogo da barbearia (preço, duração, status) com criar/editar,
// ativar/desativar e excluir (soft delete: o histórico continua apontando para o serviço).
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, ClipboardList, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { Badge, Button, Card, Checkbox, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, Tabs, Textarea, useToast } from '@/components/ui';
import { useOwnerCreateServiceMutation, useOwnerDeleteServiceMutation, useOwnerListServicesQuery, useOwnerUpdateServiceMutation } from '@/features/owner-admin/api';
import { serviceSchema, type ServiceFormValues } from '@/features/owner-admin/schemas';
import { parsePrice, priceToInput } from '@/features/owner-admin/utils';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Service } from '@/types/api';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';
import { formatBRL, formatDuration } from '@/utils/format';

const blank: ServiceFormValues = { name: '', description: '', price: '', duration: 30, active: true };

const ServiceFormModal = ({ open, onClose, service, barbershopId }: { open: boolean; onClose: () => void; service: Service | null; barbershopId: number }) => {
  const toast = useToast();
  const [create, { isLoading: creating }] = useOwnerCreateServiceMutation();
  const [update, { isLoading: updating }] = useOwnerUpdateServiceMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema), defaultValues: blank });

  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? { name: service.name, description: service.description ?? '', price: priceToInput(service.price), duration: service.duration, active: service.active }
        : blank
    );
  }, [open, service, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const body = {
      name: values.name.trim(),
      description: values.description.trim(),
      price: parsePrice(values.price),
      duration: Number(values.duration),
      active: values.active,
    };
    try {
      if (service) await update({ id: service.id, ...body }).unwrap();
      else await create({ ...body, barbershop_id: barbershopId }).unwrap();
      toast.success(service ? 'Serviço atualizado.' : 'Serviço criado.');
      onClose();
    } catch (error) {
      const fields = fieldErrors(error);
      Object.entries(fields).forEach(([name, message]) => setError(name as keyof ServiceFormValues, { message }));
      toast.error(apiErrorMessage(error));
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={service ? 'Editar serviço' : 'Novo serviço'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void onSubmit()} loading={creating || updating}>
            {service ? 'Salvar alterações' : 'Criar serviço'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Nome" required placeholder="Ex.: Corte degradê" error={errors.name?.message} {...register('name')} />
        <Textarea label="Descrição" required placeholder="O que está incluso no serviço" error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Preço (R$)" required inputMode="decimal" placeholder="45,00" error={errors.price?.message} {...register('price')} />
          <Input label="Duração (min)" required type="number" min={5} max={480} step={5} error={errors.duration?.message} {...register('duration')} />
        </div>
        <Checkbox label="Disponível para agendamento" {...register('active')} />
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </Modal>
  );
};

type Filter = 'all' | 'active' | 'inactive';

const ServicesPage = () => {
  usePageTitle('Gestão de Serviços');
  const toast = useToast();
  const { barbershop, isOwner } = useActiveContext();
  const { data = [], isLoading, error, refetch } = useOwnerListServicesQuery(barbershop?.id ?? 0, { skip: !barbershop });
  const [update] = useOwnerUpdateServiceMutation();
  const [remove, { isLoading: removing }] = useOwnerDeleteServiceMutation();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Service | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Service | null>(null);

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" />;

  const term = search.trim().toLowerCase();
  const list = data.filter((s) => (filter === 'all' || (filter === 'active' ? s.active : !s.active)) && (!term || s.name.toLowerCase().includes(term)));
  const active = data.filter((s) => s.active);
  const avgPrice = active.length ? active.reduce((sum, s) => sum + Number(s.price), 0) / active.length : 0;
  const avgDuration = active.length ? Math.round(active.reduce((sum, s) => sum + s.duration, 0) / active.length) : 0;

  const toggle = async (service: Service) => {
    try {
      await update({ id: service.id, active: !service.active }).unwrap();
      toast.success(service.active ? 'Serviço desativado.' : 'Serviço ativado.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestão de Serviços"
        description="Defina o catálogo, preços e durações oferecidos em todas as filiais."
        action={
          isOwner ? (
            <Button
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Novo Serviço
            </Button>
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Serviços ativos</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{active.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Preço médio</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{formatBRL(avgPrice)}</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Duração média</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.05em] text-ink">{avgDuration ? formatDuration(avgDuration) : '—'}</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: `Todos (${data.length})` },
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
          ]}
        />
        <label className="relative sm:w-72">
          <span className="sr-only">Buscar serviço</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar serviço…" className="h-10 w-full rounded-lg bg-white pl-10 pr-4 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-primary-100" />
        </label>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" aria-hidden="true" />}
          title={data.length ? 'Nenhum serviço neste filtro' : 'Nenhum serviço cadastrado'}
          description={data.length ? undefined : 'Cadastre os serviços para que os clientes possam agendar.'}
          action={
            !data.length && isOwner ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Cadastrar serviço
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((service) => (
            <Card key={service.id} className={service.active ? '' : 'opacity-75'}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold tracking-[-0.025em] text-ink">{service.name}</h2>
                <Badge tone={service.active ? 'green' : 'gray'}>{service.active ? 'Ativo' : 'Inativo'}</Badge>
              </div>
              {service.description ? <p className="mt-2 line-clamp-2 text-sm text-ink-variant">{service.description}</p> : null}
              <div className="mt-4 flex items-end justify-between">
                <p className="text-2xl font-black tracking-[-0.05em] text-primary-600">{formatBRL(service.price)}</p>
                <p className="inline-flex items-center gap-1 text-sm text-ink-variant">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {formatDuration(service.duration)}
                </p>
              </div>
              {isOwner ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-surface-low pt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Pencil className="h-4 w-4" aria-hidden="true" />}
                    onClick={() => {
                      setEditing(service);
                      setFormOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void toggle(service)}>
                    {service.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <button type="button" className="ml-auto rounded-lg p-2 text-ink-subtle hover:bg-danger-50 hover:text-danger-600" aria-label={`Excluir ${service.name}`} onClick={() => setToDelete(service)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <ServiceFormModal open={formOpen} onClose={() => setFormOpen(false)} service={editing} barbershopId={barbershop.id} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir serviço?"
        description={`"${toDelete?.name ?? ''}" sai do catálogo e dos barbeiros. Agendamentos já feitos continuam no histórico.`}
        tone="danger"
        confirmLabel="Excluir"
        loading={removing}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await remove(toDelete.id).unwrap();
            toast.success('Serviço excluído.');
            setToDelete(null);
          } catch (err) {
            toast.error(apiErrorMessage(err));
          }
        }}
      />
    </div>
  );
};

export default ServicesPage;
