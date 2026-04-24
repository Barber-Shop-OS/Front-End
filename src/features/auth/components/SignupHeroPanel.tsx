const SignupHeroPanel = (): JSX.Element => {
  return (
    <aside
      className="relative hidden overflow-hidden bg-slate-800 p-12 lg:flex lg:min-h-screen lg:items-center lg:justify-center"
      aria-label="Mensagem institucional de cadastro"
    >
      <div className="absolute inset-0 bg-white/60 mix-blend-saturation" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 to-slate-800/90 mix-blend-multiply" />

      <header className="relative z-10 flex w-full max-w-[512px] flex-col gap-6">
        <h1 className="text-6xl font-extrabold leading-[72px] text-white">
          <span className="block">A Arte da</span>
          <span className="block">Precisão Digital.</span>
        </h1>

        <p className="text-xl font-medium leading-8 text-indigo-50/90">
          Gestão rigorosa para profissionais que não aceitam menos que a
          excelência.
        </p>
      </header>
    </aside>
  );
};

export default SignupHeroPanel;
