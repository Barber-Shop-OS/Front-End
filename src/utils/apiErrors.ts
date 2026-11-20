// FE-06: mensagens amigáveis por código de erro da API (BE-37). Sem código conhecido, usa a
// mensagem do servidor (já em pt-BR).
import type { ApiError } from '@/services/http';

const MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.',
  RATE_LIMITED: 'Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  EMAIL_IN_USE: 'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.',
  SLOT_TAKEN: 'Esse horário acabou de ser reservado. Escolha outro.',
  SLOT_UNAVAILABLE: 'Esse horário não está mais disponível. Escolha outro.',
  TOO_MANY_ACTIVE_APPOINTMENTS: 'Você já tem 3 agendamentos futuros nesta barbearia.',
  CANCELLATION_WINDOW_CLOSED: 'Fora do prazo de cancelamento online (24 h). Fale com a barbearia.',
  PLAN_LIMIT_REACHED: 'Você atingiu o limite do seu plano. Faça upgrade para continuar.',
  PLAN_LIMIT_EXCEEDED: 'O uso atual é maior que o limite do plano escolhido.',
  SUBSCRIPTION_INACTIVE: 'Assinatura inativa: o painel está em modo leitura. Regularize a assinatura.',
  FEATURE_NOT_IN_PLAN: 'Recurso disponível em um plano superior.',
  BARBERSHOP_UNAVAILABLE: 'Esta barbearia não está recebendo agendamentos online no momento.',
  TOKEN_INVALID_OR_EXPIRED: 'Link inválido, expirado ou já utilizado.',
  BILLING_UNAVAILABLE: 'Pagamentos indisponíveis no momento. Tente mais tarde.',
  PAYMENT_PROVIDER_ERROR: 'Falha ao falar com o provedor de pagamento. Tente novamente.',
  INVALID_TAX_ID: 'CPF ou CNPJ inválido.',
  INVALID_CURRENT_PASSWORD: 'Senha atual incorreta.',
  SLUG_TAKEN: 'Este endereço já está em uso por outra barbearia.',
  CLIENT_ALREADY_EXISTS: 'Já existe um cliente com este telefone ou e-mail.',
  BARBER_HAS_FUTURE_APPOINTMENTS: 'Este barbeiro tem agendamentos futuros.',
  UPLOADS_UNAVAILABLE: 'Envio de imagens indisponível no momento.',
  INVALID_FILE: 'Arquivo inválido. Use JPEG, PNG ou WebP de até 2 MB.',
  ACTIVE_SUBSCRIPTION: 'Cancele a assinatura da barbearia antes de excluir a conta.',
  GOOGLE_TOKEN_INVALID: 'Não foi possível entrar com o Google. Tente novamente.',
};

export const apiErrorMessage = (error: unknown, fallback = 'Algo deu errado. Tente novamente.'): string => {
  if (!error || typeof error !== 'object') return fallback;
  const apiError = error as Partial<ApiError>;
  if (apiError.code && MESSAGES[apiError.code]) return MESSAGES[apiError.code];
  return typeof apiError.message === 'string' && apiError.message ? apiError.message : fallback;
};

/** Erros de validação por campo (details: [{ field, message }]). */
export const fieldErrors = (error: unknown): Record<string, string> => {
  const details = (error as { details?: unknown } | null)?.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(
    details
      .filter((item): item is { field: string; message: string } => typeof item?.field === 'string')
      .map((item) => [item.field, item.message])
  );
};

export const errorCode = (error: unknown): string | undefined => (error as Partial<ApiError> | null)?.code;
