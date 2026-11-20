// 404 (sem frame no Figma): número grande em surface-high como os passos da landing, título e atalhos.
import { Home, Search } from 'lucide-react';

import { ButtonLink } from '@/components/ui';
import { usePageTitle } from '@/hooks/usePageTitle';

const NotFoundPage = () => {
  usePageTitle('Página não encontrada');
  return (
    <section className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center sm:py-28">
      <p className="select-none text-[120px] font-black leading-none tracking-[-0.05em] text-surface-high sm:text-[160px]" aria-hidden="true">
        404
      </p>
      <h1 className="-mt-6 text-[28px] font-bold leading-9 tracking-[-0.02em] text-ink sm:text-4xl sm:leading-10">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-base text-ink-variant">O endereço pode estar incorreto ou a página foi removida. Que tal procurar uma barbearia?</p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <ButtonLink to="/filiais" size="lg" icon={<Search className="h-4 w-4" aria-hidden="true" />}>
          Encontrar barbearia
        </ButtonLink>
        <ButtonLink to="/" variant="secondary" size="lg" icon={<Home className="h-4 w-4" aria-hidden="true" />}>
          Voltar ao início
        </ButtonLink>
      </div>
    </section>
  );
};

export default NotFoundPage;
