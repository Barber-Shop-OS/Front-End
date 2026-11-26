import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { buttonClass } from '@/components/ui';

/** Busca da landing: leva para /filiais com o termo digitado. */
const HeroSearch = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/filiais?q=${encodeURIComponent(q)}` : '/filiais');
  };
  return (
    <form onSubmit={onSubmit} role="search" className="flex w-full max-w-xl flex-col gap-2 rounded-lg bg-white p-2 shadow-hero sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center">
        <Search className="ml-3 h-[18px] w-[18px] shrink-0 text-ink-subtle" aria-hidden="true" />
        <span className="sr-only">Buscar por barbearia ou localização</span>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por barbearia ou localização..."
          className="h-11 w-full min-w-0 bg-transparent px-3 text-base text-ink placeholder:text-ink-subtle focus:outline-none"
          maxLength={100}
        />
      </label>
      <button type="submit" className={buttonClass('primary', 'lg', 'shrink-0')}>
        Agendar agora
      </button>
    </form>
  );
};

export default HeroSearch;
