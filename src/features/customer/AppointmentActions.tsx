// Cancelar (ConfirmDialog com motivo opcional) e reagendar (modal com SlotPicker sobre /availability).
// A API decide o que o cliente pode fazer (`allowed_actions`, janela de 24 h — BE-15); aqui só exibimos.
import { useState } from 'react';

import { Button, Checkbox, ConfirmDialog, Modal, Textarea, useToast } from '@/components/ui';
import { SlotPicker } from '@/features/appointments/SlotPicker';
import { useCancelAppointmentMutation, useRescheduleAppointmentMutation } from '@/features/appointments/api';
import type { Slot } from '@/types/api';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { formatDateTime, formatTime, todayIn } from '@/utils/date';

import { barberName, serviceName, timezoneOf } from './helpers';
import type { CustomerAppointment } from './types';

interface DialogProps {
  appointment: CustomerAppointment | null;
  onClose: () => void;
  onDone?: () => void;
}

export const CancelAppointmentDialog = ({ appointment, onClose, onDone }: DialogProps) => {
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [cancel, { isLoading }] = useCancelAppointmentMutation();

  const close = () => {
    setReason('');
    onClose();
  };

  const confirm = async () => {
    if (!appointment) return;
    try {
      await cancel({ id: appointment.id, reason: reason.trim() || undefined }).unwrap();
      toast.success('Agendamento cancelado.');
      close();
      onDone?.();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  const timezone = appointment ? timezoneOf(appointment) : undefined;
  return (
    <ConfirmDialog
      open={!!appointment}
      title="Cancelar agendamento?"
      tone="danger"
      confirmLabel="Cancelar agendamento"
      cancelLabel="Manter"
      loading={isLoading}
      onCancel={close}
      onConfirm={confirm}
      description={
        appointment ? (
          <p>
            <strong className="text-ink">{serviceName(appointment)}</strong> em {formatDateTime(appointment.start_at, timezone)}
            {barberName(appointment) ? ` com ${barberName(appointment)}` : ''}. Esta ação não pode ser desfeita.
          </p>
        ) : null
      }
    >
      <Textarea
        containerClassName="mt-4"
        label="Motivo (opcional)"
        maxLength={500}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Conte para a barbearia, se quiser."
      />
    </ConfirmDialog>
  );
};

/** Corpo do reagendamento — montado só com o modal aberto (estado zera a cada abertura). */
const RescheduleBody = ({ appointment, onClose, onDone }: { appointment: CustomerAppointment; onClose: () => void; onDone?: () => void }) => {
  const toast = useToast();
  const timezone = timezoneOf(appointment);
  const [date, setDate] = useState(() => todayIn(timezone));
  const [slot, setSlot] = useState<Slot | null>(null);
  const [anyBarber, setAnyBarber] = useState(false);
  const [reschedule, { isLoading }] = useRescheduleAppointmentMutation();
  const currentBarber = barberName(appointment);

  const submit = async () => {
    if (!slot) return;
    const barberId = anyBarber ? (slot.barber_ids.includes(appointment.barber_id) ? appointment.barber_id : slot.barber_ids[0]) : appointment.barber_id;
    try {
      await reschedule({ id: appointment.id, start_at: slot.start_at, barber_id: barberId }).unwrap();
      toast.success(`Agendamento remarcado para ${formatDateTime(slot.start_at, timezone)}.`);
      onClose();
      onDone?.();
    } catch (error) {
      const code = errorCode(error);
      if (code === 'SLOT_TAKEN' || code === 'SLOT_UNAVAILABLE') setSlot(null);
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-ink-variant">
          <strong className="text-ink">{serviceName(appointment)}</strong> — hoje marcado para {formatDateTime(appointment.start_at, timezone)}. Escolha o novo dia e horário.
        </p>
        <Checkbox
          label={currentBarber ? `Aceito outro barbeiro disponível (atual: ${currentBarber})` : 'Aceito outro barbeiro disponível'}
          checked={anyBarber}
          onChange={(event) => {
            setAnyBarber(event.target.checked);
            setSlot(null);
          }}
        />
        <SlotPicker
          branchId={appointment.branch_id}
          serviceId={appointment.service_id}
          barberId={anyBarber ? undefined : appointment.barber_id}
          timezone={timezone}
          date={date}
          onDateChange={(next) => {
            setDate(next);
            setSlot(null);
          }}
          value={slot}
          onChange={setSlot}
        />
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 border-t border-surface-low pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Voltar
        </Button>
        <Button onClick={submit} disabled={!slot} loading={isLoading}>
          {slot ? `Confirmar ${formatTime(slot.start_at, timezone)}` : 'Escolha um horário'}
        </Button>
      </div>
    </>
  );
};

export const RescheduleModal = ({ appointment, onClose, onDone }: DialogProps) => (
  <Modal open={!!appointment} onClose={onClose} title="Reagendar" size="lg">
    {appointment ? <RescheduleBody key={appointment.id} appointment={appointment} onClose={onClose} onDone={onDone} /> : null}
  </Modal>
);
