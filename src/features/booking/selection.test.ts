import { describe, expect, it } from 'vitest';

import type { PublicBarbershop } from '@/types/api';

import {
  EMPTY_SELECTION,
  buildCalendarMonth,
  canBookWithContact,
  firstIncompleteStep,
  isContactRequiredError,
  isSlotConflictError,
  loadBookingDraft,
  normalizePhone,
  resolveStep,
  sanitizeSelection,
  saveBookingDraft,
  selectionFromParams,
  selectionToParams,
  shiftMonth,
} from './selection';

const shop = {
  id: 1,
  name: 'Navalha',
  slug: 'navalha',
  branches: [{ id: 7, name: 'Centro', timezone: 'America/Sao_Paulo', opening_hours: [], open_now: true, address: null, phone: null, whatsapp: null }],
  services: [{ id: 3, name: 'Corte', description: null, price: '50.00', duration: 30 }],
  barbers: [{ id: 9, display_name: 'Zé', bio: null, photo_url: null, branch_id: 7, services: [{ id: 3, name: 'Corte' }] }],
} as unknown as PublicBarbershop;

const memoryStorage = (): Storage => {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
    clear: () => data.clear(),
    key: () => null,
    length: 0,
  };
};

describe('booking selection', () => {
  it('lê e escreve a seleção na URL (aceita ?filial legado)', () => {
    const sel = selectionFromParams(new URLSearchParams('filial=7&servico=3&barbeiro=qualquer&data=2026-11-21'));
    expect(sel).toEqual({ branchId: 7, serviceId: 3, barber: 'qualquer', date: '2026-11-21', startAt: null });
    const params = selectionToParams(sel, new URLSearchParams('filial=7&etapa=horario'));
    expect(params.get('branch')).toBe('7');
    expect(params.has('filial')).toBe(false);
    expect(params.get('etapa')).toBe('horario');
  });

  it('não deixa pular etapas pela URL', () => {
    const sel = { ...EMPTY_SELECTION, branchId: 7 };
    expect(firstIncompleteStep(sel)).toBe('servico');
    expect(resolveStep('pagamento', sel)).toBe('servico');
    expect(resolveStep('filial', sel)).toBe('filial');
  });

  it('remove escolhas inválidas e assume a filial única', () => {
    const fixed = sanitizeSelection({ branchId: null, serviceId: 99, barber: 9, date: null, startAt: null }, shop);
    expect(fixed.branchId).toBe(7);
    expect(fixed.serviceId).toBeNull();
    expect(fixed.barber).toBeNull();
  });

  it('guarda o rascunho para o login e expira', () => {
    const storage = memoryStorage();
    saveBookingDraft('navalha', { ...EMPTY_SELECTION, branchId: 7 }, 'obs', storage);
    expect(loadBookingDraft('navalha', storage)?.notes).toBe('obs');
    expect(loadBookingDraft('outra', storage)).toBeNull();
    expect(loadBookingDraft('navalha', storage, Date.now() + 3 * 60 * 60 * 1000)).toBeNull();
  });

  it('calendário desabilita passado, fora da janela e dias fechados', () => {
    const days = buildCalendarMonth('2026-11', '2026-11-21', '2026-11-28', [1, 2, 3, 4, 5, 6]);
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
    expect(byDate['2026-11-20'].disabled).toBe(true);
    expect(byDate['2026-11-21'].disabled).toBe(false);
    expect(byDate['2026-11-22'].disabled).toBe(true); // domingo
    expect(byDate['2026-11-30'].disabled).toBe(true);
    expect(days.length % 7).toBe(0);
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('regras de contato (SEC-21) e erros', () => {
    expect(canBookWithContact({ email_verified_at: null, phone: null })).toBe(false);
    expect(canBookWithContact({ email_verified_at: null, phone: '11999990000' })).toBe(true);
    expect(normalizePhone('+55 (11) 99999-0000')).toBe('11999990000');
    expect(normalizePhone('123')).toBeNull();
    expect(isContactRequiredError({ code: 'EMAIL_NOT_VERIFIED' })).toBe(true);
    expect(isSlotConflictError({ code: 'SLOT_TAKEN', status: 409 })).toBe(true);
    expect(isSlotConflictError({ code: 'IDEMPOTENCY_KEY_REUSED', status: 409 })).toBe(false);
  });
});
