// Upload de imagem em 3 passos: /uploads/presign → PUT direto no storage → /uploads/confirm (grava a URL).
import { useCallback, useState } from 'react';

import { useOwnerConfirmUploadMutation, useOwnerPresignUploadMutation } from './api';
import type { UploadKind } from './types';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Erro de validação local do arquivo (antes de falar com a API) ou null. */
export const validateImageFile = (file: { type: string; size: number }): string | null => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Use uma imagem JPEG, PNG ou WebP.';
  if (file.size > MAX_IMAGE_BYTES) return 'A imagem deve ter no máximo 2 MB.';
  return null;
};

interface Target {
  kind: UploadKind;
  barbershopId?: number;
  barberId?: number;
}

export const useImageUpload = () => {
  const [presign] = useOwnerPresignUploadMutation();
  const [confirm] = useOwnerConfirmUploadMutation();
  const [uploading, setUploading] = useState(false);

  const upload = useCallback(
    async (file: File, target: Target): Promise<string> => {
      const invalid = validateImageFile(file);
      if (invalid) throw { code: 'INVALID_FILE', message: invalid };
      setUploading(true);
      try {
        const signed = await presign({
          kind: target.kind,
          content_type: file.type,
          size: file.size,
          barbershop_id: target.barbershopId,
          barber_id: target.barberId,
        }).unwrap();
        const response = await fetch(signed.upload_url, {
          method: signed.method || 'PUT',
          headers: { 'Content-Type': file.type, ...(signed.headers ?? {}) },
          body: file,
        });
        if (!response.ok) throw { code: 'UPLOAD_FAILED', message: 'Falha ao enviar a imagem. Tente novamente.' };
        const targetId = target.kind === 'barber_photo' ? target.barberId ?? 0 : target.barbershopId ?? 0;
        const confirmed = await confirm({ upload_id: signed.upload_id, kind: target.kind, target_id: targetId }).unwrap();
        return confirmed.url;
      } finally {
        setUploading(false);
      }
    },
    [presign, confirm]
  );

  return { upload, uploading };
};
