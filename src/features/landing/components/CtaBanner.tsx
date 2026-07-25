const CtaBanner = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-16 text-center text-white">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Pronto para modernizar sua barbearia?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-blue-100">
          Junte-se a mais de 1.200 barbearias que já simplificaram sua gestão
          com o BarberOS.
        </p>

        <button
          type="button"
          className="mt-8 rounded-xl bg-white px-8 py-3 text-sm font-bold text-blue-600 shadow-lg transition-transform hover:scale-105"
        >
          Teste grátis por 14 dias
        </button>
      </div>
    </section>
  );
};

export default CtaBanner;