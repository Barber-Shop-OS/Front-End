const footerLinks = [
  { label: "Sobre", href: "/sobre" },
  { label: "Termos de uso", href: "/termos" },
  { label: "Privacidade", href: "/privacidade" },
  { label: "Suporte", href: "/suporte" },
];

const LandingFooter = (): JSX.Element => {
  return (
    <footer className="w-full border-t border-slate-100 px-6 py-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-xs text-slate-400">
        <nav className="flex flex-wrap justify-center gap-6 uppercase tracking-wide">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-600"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p>© 2024 Barber OS. Sistema de gestão para barbearias.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;