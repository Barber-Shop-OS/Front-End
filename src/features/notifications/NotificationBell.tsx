// Sino da topbar (presente em quase todas as telas do Figma). Popover com as últimas notificações (BE-51),
// contador de não lidas e "marcar todas como lidas". Atualiza a cada 60 s enquanto a aba está aberta.
import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks';
import { cn } from '@/utils/cn';
import { relativeFromNow } from '@/utils/date';

import { useListNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, type AppNotification } from './api';

export const NotificationBell = ({ className }: { className?: string }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useListNotificationsQuery(undefined, { skip: !isAuthenticated, pollingInterval: 60_000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!isAuthenticated) return null;
  const unread = data?.unread_count ?? 0;

  const openItem = (item: AppNotification) => {
    if (!item.read_at) void markRead(item.id);
    setOpen(false);
    if (item.link) navigate(item.link);
  };

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl p-2 text-ink-variant transition hover:bg-surface-low hover:text-ink"
        aria-label={unread ? `Notificações (${unread} não lidas)` : 'Notificações'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-danger-600 px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden rounded-xl bg-white shadow-elevated" role="dialog" aria-label="Notificações">
          <div className="flex items-center justify-between border-b border-surface-low px-4 py-3">
            <p className="text-sm font-bold text-ink">Notificações</p>
            {unread > 0 ? (
              <button type="button" onClick={() => void markAll()} disabled={markingAll} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline disabled:opacity-60">
                <CheckCheck className="h-4 w-4" aria-hidden="true" /> Marcar todas como lidas
              </button>
            ) : null}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8 text-primary-600">
                <Spinner />
              </div>
            ) : isError ? (
              <div className="px-4 py-6 text-center text-sm text-ink-variant">
                Não foi possível carregar.{' '}
                <button type="button" className="font-semibold text-primary-600 hover:underline" onClick={() => void refetch()}>
                  Tentar novamente
                </button>
              </div>
            ) : !data?.items.length ? (
              <p className="px-4 py-8 text-center text-sm text-ink-variant">Nenhuma notificação por aqui.</p>
            ) : (
              <ul>
                {data.items.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => openItem(item)} className={cn('flex w-full gap-3 px-4 py-3 text-left transition hover:bg-surface-low', !item.read_at && 'bg-primary-50/60')}>
                      <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.read_at ? 'bg-transparent' : 'bg-primary-600')} aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-ink">{item.title}</span>
                        {item.body ? <span className="mt-0.5 block text-xs text-ink-variant">{item.body}</span> : null}
                        <span className="mt-1 block text-[11px] text-ink-subtle">{relativeFromNow(item.created_at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
