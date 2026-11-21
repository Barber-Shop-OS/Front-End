// Configurações da barbearia (sem frame no Figma; segue o padrão de formulário do painel): identidade
// (logo e capa), dados públicos (nome, endereço da página, descrição, contatos) e link da página pública.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { skipToken } from '@reduxjs/toolkit/query';
import { Camera, Copy, ExternalLink, ImageIcon, Save } from 'lucide-react';

import { Button, Card, CardTitle, ErrorState, Input, ListSkeleton, PageHeader, Textarea, useToast, EmptyState } from '@/components/ui';
import { ImageUploadButton, OwnerOnlyNotice } from '@/features/owner-admin/components';
import { barbershopProfileSchema, type BarbershopProfileValues } from '@/features/owner-admin/schemas';
import { useGetBarbershopQuery, useUpdateBarbershopMutation } from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';
import { formatPhone } from '@/utils/format';

const SettingsPage = () => {
  usePageTitle('Configurações');
  const toast = useToast();
  const { barbershop: active, isOwner } = useActiveContext();
  const { data: shop, isLoading, error, refetch } = useGetBarbershopQuery(active && isOwner ? active.id : skipToken);
  const [update, { isLoading: saving }] = useUpdateBarbershopMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<BarbershopProfileValues>({ resolver: zodResolver(barbershopProfileSchema) });

  useEffect(() => {
    if (shop)
      reset({
        name: shop.name,
        slug: shop.slug,
        description: shop.description ?? '',
        phone: formatPhone(shop.phone) || '',
        whatsapp: formatPhone(shop.whatsapp) || '',
        instagram: shop.instagram ?? '',
      });
  }, [shop, reset]);

  if (!active) return <EmptyState title="Nenhuma barbearia selecionada" />;
  if (!isOwner) return <OwnerOnlyNotice />;
  if (isLoading) return <ListSkeleton rows={4} />;
  if (error || !shop) return <ErrorState error={error} onRetry={refetch} />;

  const publicUrl = `${window.location.origin}/b/${watch('slug') || shop.slug}`;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update({
        id: shop.id,
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        phone: values.phone || null,
        whatsapp: values.whatsapp || null,
        instagram: values.instagram ? values.instagram.replace(/^@/, '') : null,
      }).unwrap();
      toast.success('Configurações salvas.');
    } catch (err) {
      const fields = fieldErrors(err);
      Object.entries(fields).forEach(([name, message]) => setError(name as keyof BarbershopProfileValues, { message }));
      toast.error(apiErrorMessage(err));
    }
  });

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Identidade e informações exibidas na página pública da sua barbearia."
        action={
          <a href={`/b/${shop.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg bg-surface-container px-5 text-sm font-semibold text-primary-600 hover:bg-surface-high">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Ver página pública
          </a>
        }
      />

      <Card className="mb-6 overflow-hidden" padded={false}>
        <div className="relative h-40 bg-gradient-to-br from-primary-600 to-primary-900 sm:h-52">
          {shop.cover_url ? <img src={shop.cover_url} alt="" className="h-full w-full object-cover" /> : null}
          <ImageUploadButton
            kind="cover"
            barbershopId={shop.id}
            label="Trocar capa"
            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-ink shadow-elevated hover:bg-white"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" /> Trocar capa
          </ImageUploadButton>
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-surface-highest shadow-card">
            {shop.logo_url ? (
              <img src={shop.logo_url} alt={`Logo de ${shop.name}`} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black text-primary-600">{shop.name.slice(0, 2).toUpperCase()}</span>
            )}
            <ImageUploadButton kind="logo" barbershopId={shop.id} label="Trocar logo" className="absolute inset-0 flex items-center justify-center bg-ink/0 text-transparent transition hover:bg-ink/40 hover:text-white focus:bg-ink/40 focus:text-white">
              <Camera className="h-6 w-6" aria-hidden="true" />
            </ImageUploadButton>
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-ink">{shop.name}</h2>
            <p className="text-xs text-ink-variant">JPEG, PNG ou WebP até 2 MB. Clique no logo ou na capa para trocar.</p>
          </div>
        </div>
      </Card>

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Dados da barbearia</CardTitle>
          <div className="space-y-4">
            <Input label="Nome" required error={errors.name?.message} {...register('name')} />
            <Input label="Endereço da página" required error={errors.slug?.message} hint={publicUrl} {...register('slug')} />
            <Textarea label="Descrição" rows={5} maxLength={1000} placeholder="Conte o que torna sua barbearia especial" error={errors.description?.message} {...register('description')} />
          </div>
        </Card>
        <Card>
          <CardTitle>Contato</CardTitle>
          <div className="space-y-4">
            <Input label="Telefone" inputMode="tel" placeholder="(11) 3333-4444" error={errors.phone?.message} {...register('phone')} />
            <Input label="WhatsApp" inputMode="tel" placeholder="(11) 99999-9999" error={errors.whatsapp?.message} {...register('whatsapp')} />
            <Input label="Instagram" placeholder="@suabarbearia" error={errors.instagram?.message} {...register('instagram')} />
            <div className="rounded-lg bg-surface-low p-4">
              <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Link para divulgar</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate text-sm text-ink">{`${window.location.origin}/b/${shop.slug}`}</code>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Copy className="h-4 w-4" aria-hidden="true" />}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`${window.location.origin}/b/${shop.slug}`);
                      toast.success('Link copiado.');
                    } catch {
                      toast.error('Não foi possível copiar.');
                    }
                  }}
                >
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <div className="flex justify-end lg:col-span-2">
          <Button type="submit" size="lg" loading={saving} disabled={!isDirty} icon={<Save className="h-4 w-4" aria-hidden="true" />}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
