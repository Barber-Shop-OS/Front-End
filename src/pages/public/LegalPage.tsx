// /termos e /privacidade — rascunho de Termos de Uso e Política de Privacidade (LGPD). Sem frame no Figma:
// tipografia do design system (título de página 36/40, seções 18/28, corpo 14–16). MINUTA sujeita a revisão jurídica.
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { TERMS_VERSION } from '@/config/env';
import { usePageTitle } from '@/hooks/usePageTitle';

const SUPPORT_EMAIL: string = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) || 'suporte@barberos.app';

interface LegalSection {
  title: string;
  body: ReactNode;
}

const Mail = () => (
  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-primary-600 hover:underline">
    {SUPPORT_EMAIL}
  </a>
);

const TERMS: LegalSection[] = [
  {
    title: '1. Sobre o BarberOS',
    body: (
      <p>
        O BarberOS é uma plataforma on-line que conecta clientes a barbearias, permitindo buscar unidades, consultar serviços e
        agendar horários, e oferece às barbearias ferramentas de agenda, equipe, clientes e financeiro. Ao criar uma conta ou usar a
        plataforma, você concorda com estes Termos e com a <Link to="/privacidade" className="font-semibold text-primary-600 hover:underline">Política de Privacidade</Link>.
      </p>
    ),
  },
  {
    title: '2. Contas e acesso',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Você deve fornecer informações verdadeiras e manter seus dados de acesso em sigilo.</li>
        <li>Cada pessoa é responsável pelas ações realizadas com a sua conta.</li>
        <li>Podemos suspender contas usadas de forma fraudulenta, abusiva ou em desacordo com estes Termos.</li>
      </ul>
    ),
  },
  {
    title: '3. Agendamentos',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>O serviço é prestado pela barbearia escolhida; o BarberOS intermedeia apenas o agendamento.</li>
        <li>Preços, duração, políticas de cancelamento e atrasos são definidos por cada barbearia.</li>
        <li>Cancelamentos e remarcações seguem as regras exibidas no momento do agendamento.</li>
      </ul>
    ),
  },
  {
    title: '4. Barbearias e assinaturas',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Barbearias contratam um plano mensal após o período de teste grátis; os limites de cada plano são exibidos na página de planos.</li>
        <li>A falta de pagamento pode limitar o acesso ao painel e ocultar a página pública após o período de carência.</li>
        <li>A barbearia é responsável pelos dados dos seus clientes e equipe inseridos na plataforma e pelo serviço prestado.</li>
      </ul>
    ),
  },
  {
    title: '5. Uso adequado',
    body: <p>É proibido usar a plataforma para fins ilícitos, tentar acessar dados de terceiros, sobrecarregar o sistema ou publicar conteúdo ofensivo ou que viole direitos de terceiros.</p>,
  },
  {
    title: '6. Responsabilidades e disponibilidade',
    body: <p>Empregamos esforços razoáveis para manter a plataforma disponível e segura, mas podem ocorrer interrupções para manutenção ou por fatores externos. O BarberOS não se responsabiliza pela qualidade do serviço prestado pelas barbearias.</p>,
  },
  {
    title: '7. Alterações e contato',
    body: (
      <p>
        Estes Termos podem ser atualizados; mudanças relevantes serão comunicadas e poderá ser solicitado novo aceite. Dúvidas: <Mail />.
      </p>
    ),
  },
];

const PRIVACY: LegalSection[] = [
  {
    title: '1. Quem somos',
    body: (
      <p>
        Esta Política explica como o BarberOS trata dados pessoais conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        Para os dados da plataforma (contas, assinaturas), o BarberOS atua como controlador; para os dados de clientes que cada barbearia
        registra e gerencia, a barbearia é a controladora e o BarberOS atua como operador.
      </p>
    ),
  },
  {
    title: '2. Dados que coletamos',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li><strong>Cadastro:</strong> nome, e-mail, telefone e senha (armazenada de forma criptografada) ou identificação do login com Google.</li>
        <li><strong>Agendamentos:</strong> barbearia, filial, serviço, barbeiro, data e horário, observações e histórico de atendimentos.</li>
        <li><strong>Barbearias:</strong> dados da empresa, endereço das filiais, equipe, serviços, preços e registros financeiros.</li>
        <li><strong>Uso técnico:</strong> endereço IP, navegador/dispositivo e sessões ativas, para segurança e prevenção de fraudes.</li>
        <li><strong>Localização:</strong> apenas quando você usa “Perto de mim”, e somente para ordenar os resultados; não armazenamos sua posição.</li>
      </ul>
    ),
  },
  {
    title: '3. Para que usamos',
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Criar e manter sua conta e realizar agendamentos (execução de contrato).</li>
        <li>Enviar confirmações, lembretes e avisos sobre seus agendamentos e sua conta.</li>
        <li>Garantir a segurança, prevenir fraudes e cumprir obrigações legais.</li>
        <li>Melhorar a plataforma com dados agregados (legítimo interesse).</li>
      </ul>
    ),
  },
  {
    title: '4. Compartilhamento',
    body: (
      <p>
        Seus dados de agendamento são compartilhados com a barbearia escolhida. Também utilizamos fornecedores para hospedagem, envio de
        e-mails e processamento de pagamentos de assinaturas, que tratam os dados apenas para prestar esses serviços. Não vendemos dados pessoais.
      </p>
    ),
  },
  {
    title: '5. Cookies',
    body: <p>Usamos apenas cookies e armazenamento local necessários para manter sua sessão conectada e suas preferências. Não usamos cookies de publicidade.</p>,
  },
  {
    title: '6. Seus direitos',
    body: (
      <>
        <p>Você pode, a qualquer momento, solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização ou exclusão dos seus dados e revogar consentimentos.</p>
        <p className="mt-3">
          Em <Link to="/conta" className="font-semibold text-primary-600 hover:underline">Minha conta</Link> você pode exportar seus dados e excluir sua conta. Ao excluir, seus dados
          pessoais são anonimizados; registros de agendamentos e pagamentos permanecem sem identificação, para cumprimento de obrigações das barbearias.
        </p>
      </>
    ),
  },
  {
    title: '7. Retenção e segurança',
    body: <p>Mantemos os dados enquanto a conta estiver ativa ou pelo prazo exigido em lei. Adotamos medidas técnicas como criptografia em trânsito, senhas com hash, controle de acesso por perfil e registro de auditoria.</p>,
  },
  {
    title: '8. Contato do encarregado (DPO)',
    body: (
      <p>
        Para exercer seus direitos ou tirar dúvidas sobre privacidade, escreva para <Mail />. Você também pode apresentar reclamação à
        Autoridade Nacional de Proteção de Dados (ANPD).
      </p>
    ),
  },
];

const CONTENT = {
  terms: { title: 'Termos de Uso', description: 'Termos de uso da plataforma BarberOS.', sections: TERMS },
  privacy: { title: 'Política de Privacidade', description: 'Como o BarberOS trata seus dados pessoais (LGPD).', sections: PRIVACY },
};

const LegalPage = ({ kind }: { kind: 'terms' | 'privacy' }) => {
  const content = CONTENT[kind];
  usePageTitle(content.title, content.description);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-bold uppercase tracking-label text-primary-600">{kind === 'terms' ? 'Termos' : 'Privacidade'}</p>
      <h1 className="mt-2 text-[28px] font-bold leading-9 tracking-[-0.02em] text-ink sm:text-4xl sm:leading-10">{content.title}</h1>
      <p className="mt-2 text-sm text-ink-variant">Versão {TERMS_VERSION}</p>

      <div className="mt-6 flex gap-3 rounded-xl bg-tertiary-fixed px-4 py-3 text-sm text-tertiary" role="note">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          <strong>Minuta sujeita a revisão jurídica.</strong> Este texto é um rascunho e pode mudar antes da versão definitiva.
        </p>
      </div>

      <nav className="mt-8 flex gap-1 rounded-lg bg-surface-low p-1 text-sm font-semibold" aria-label="Documentos legais">
        <Link to="/termos" aria-current={kind === 'terms' ? 'page' : undefined} className={`flex-1 rounded-lg px-3 py-2 text-center ${kind === 'terms' ? 'bg-white text-primary-600 shadow-card' : 'text-ink-variant hover:text-ink'}`}>
          Termos de Uso
        </Link>
        <Link to="/privacidade" aria-current={kind === 'privacy' ? 'page' : undefined} className={`flex-1 rounded-lg px-3 py-2 text-center ${kind === 'privacy' ? 'bg-white text-primary-600 shadow-card' : 'text-ink-variant hover:text-ink'}`}>
          Privacidade
        </Link>
      </nav>

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold leading-7 tracking-[-0.025em] text-ink">{section.title}</h2>
            <div className="mt-3 text-base leading-7 text-ink-variant">{section.body}</div>
          </section>
        ))}
      </div>
    </article>
  );
};

export default LegalPage;
