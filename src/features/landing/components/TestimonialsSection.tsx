import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Rafael Souza",
    role: "Dono, Old School Barber Co.",
    quote:
      "Reduzi os cancelamentos de última hora e não perco mais tempo organizando agenda no papel.",
    avatar: "https://i.pravatar.cc/72?img=32",
  },
  {
    name: "Marina Alves",
    role: "Gerente, Corte & Estilo Premium",
    quote:
      "Consigo ver o faturamento do mês em segundos. Antes isso levava uma tarde inteira de planilha.",
    avatar: "https://i.pravatar.cc/72?img=45",
  },
  {
    name: "Diego Martins",
    role: "Dono, Blade Master Studio",
    quote:
      "Meus clientes adoraram poder agendar pelo celular. A taxa de retorno deles aumentou bastante.",
    avatar: "https://i.pravatar.cc/72?img=51",
  },
];

const TestimonialsSection = (): JSX.Element => {
  return (
    <section className="w-full bg-slate-50 px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Depoimentos
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Barbearias que já modernizaram a gestão
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <p className="text-sm text-slate-600">“{testimonial.quote}”</p>

              <div className="mt-2 flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;