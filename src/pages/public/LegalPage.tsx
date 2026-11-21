// /termos e /privacidade — Termos de Uso e Política de Privacidade (LGPD). Sem frame no Figma:
// tipografia do design system (título de página 36/40, seções 18/28, corpo 14–16).
// FE-42: seção de cookies com GA4 (consentimento, Google como operador, transferência internacional).
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { COOKIE_POLICY_VERSION, TERMS_VERSION } from '@/config/env';
import { openCookiePreferences } from '@/features/consent/consentStore';
import { usePageTitle } from '@/hooks/usePageTitle';

const SUPPORT_EMAIL: string = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined) || 'suporte@barberos.app';

interface LegalSection {
  title: string;
  body: ReactNode;
  /** Âncora (ex.: /privacidade#cookies). */
  id?: string;
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
        <li><strong>Estatísticas de navegação (só com o seu consentimento):</strong> páginas visitadas, tempo de visita, origem do acesso, tipo de dispositivo e região aproximada, coletados pelo Google Analytics.</li>
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
        <li>Medir o uso do site com o Google Analytics, somente se você aceitar os cookies de estatísticas (consentimento).</li>
      </ul>
    ),
  },
  {
    title: '4. Compartilhamento',
    body: (
      <p>
        Seus dados de agendamento são compartilhados com a barbearia escolhida. Também utilizamos fornecedores para hospedagem, envio de
        e-mails, processamento de pagamentos de assinaturas e, se você consentir, estatísticas de uso (Google Analytics, do Google LLC), que
        tratam os dados apenas para prestar esses serviços. Alguns desses fornecedores ficam fora do Brasil (por exemplo, nos Estados Unidos);
        nesses casos a transferência internacional segue o art. 33 da LGPD, com cláusulas contratuais de proteção de dados. Não vendemos dados
        pessoais.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies',
    body: (
      <>
        <p>
          Cookies são pequenos arquivos guardados no seu navegador. Usamos dois tipos, e os opcionais só são ativados se você permitir no aviso
          de cookies:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs uppercase tracking-label text-ink-subtle">
              <tr>
                <th className="py-2 pr-4 font-semibold">Tipo</th>
                <th className="py-2 pr-4 font-semibold">Nome</th>
                <th className="py-2 pr-4 font-semibold">Para que serve</th>
                <th className="py-2 font-semibold">Duração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-low align-top">
              <tr>
                <td className="py-2 pr-4 font-semibold text-ink">Essencial</td>
                <td className="py-2 pr-4">Cookie de sessão (httpOnly)</td>
                <td className="py-2 pr-4">Mantém você conectado com segurança.</td>
                <td className="py-2">Até 30 dias ou até sair</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-ink">Essencial</td>
                <td className="py-2 pr-4">barberos:cookie-consent (armazenamento local)</td>
                <td className="py-2 pr-4">Guarda a sua escolha sobre cookies.</td>
                <td className="py-2">12 meses</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-ink">Essencial</td>
                <td className="py-2 pr-4">Preferências (armazenamento local/da sessão)</td>
                <td className="py-2 pr-4">Lembra escolhas da interface, como a etapa do agendamento.</td>
                <td className="py-2">Até limpar o navegador</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-semibold text-ink">Estatísticas (opcional)</td>
                <td className="py-2 pr-4">_ga, _ga_&lt;ID&gt; (Google Analytics)</td>
                <td className="py-2 pr-4">Contam visitas e páginas mais usadas, de forma agregada. Sem publicidade e sem Google Signals.</td>
                <td className="py-2">13 meses</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Não usamos cookies de publicidade. Antes do seu consentimento, nenhum script do Google Analytics é carregado. Ao recusar ou revogar,
          os cookies de estatísticas são apagados. O endereço das páginas enviado ao Google não inclui códigos de convite, links de confirmação
          nem identificadores de clientes, e não enviamos seu nome, e-mail ou telefone. Registramos cada escolha (data, versão desta política e
          uma versão cifrada do IP) para comprovar o consentimento, conforme o art. 8º da LGPD.
        </p>
        <p className="mt-4">Você pode mudar sua escolha a qualquer momento (versão da política de cookies: {COOKIE_POLICY_VERSION}).</p>
        <Button variant="secondary" className="mt-3" onClick={openCookiePreferences}>
          Preferências de cookies
        </Button>
      </>
    ),
  },
  {
    title: '6. Seus direitos',
    body: (
      <>
        <p>
          Você pode, a qualquer momento, solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização ou exclusão dos seus
          dados e revogar consentimentos — o de cookies, direto em “Cookies” no rodapé do site.
        </p>
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
          <section key={section.title} id={section.id} className="scroll-mt-24">
            <h2 className="text-lg font-bold leading-7 tracking-[-0.025em] text-ink">{section.title}</h2>
            <div className="mt-3 text-base leading-7 text-ink-variant">{section.body}</div>
          </section>
        ))}
      </div>
    </article>
  );
};

export default LegalPage;
