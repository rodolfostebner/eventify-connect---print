import { landingConfig } from '../landingConfig';

interface LandingFooterProps {
  isDark: boolean;
}

export function LandingFooter({ isDark }: LandingFooterProps) {
  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';
  const { links } = landingConfig;

  return (
    <footer className="py-6 border-t border-[#E5A899]/20 dark:border-[#E5A899]/10 text-center text-xs text-gray-500 bg-[#FAF6F0] dark:bg-[#0F0E0D] transition-colors duration-300 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-1 mb-4">
        <p className="italic text-gray-600 dark:text-gray-400 text-sm max-w-2xl font-medium">
          "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens"
        </p>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
          Colossenses 3:23
        </span>
      </div>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#E5A899]/10 dark:border-[#E5A899]/5 pt-4">
        {/* Left Block */}
        <div className="flex items-center gap-3 md:w-1/3 justify-center md:justify-start">
          <img src={logoSrc} alt="Koala Footer" className="h-10 w-auto object-contain" />
          <span className="font-outfit font-semibold text-gray-700 dark:text-gray-300">
            Eventify-MemoriesHub
          </span>
        </div>
        {/* Center Block */}
        <div className="text-center md:w-1/3">
          <p className="m-0 text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Eventify-MemoriesHub. Todos os direitos reservados. Design em tempo real.
          </p>
        </div>
        {/* Right Block */}
        <div className="flex items-center justify-center md:justify-end md:w-1/3 gap-4 text-xs text-gray-500">
          <a
            href={links.privacidade}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F0A795] transition-colors font-semibold"
          >
            Privacidade
          </a>
          <a
            href={links.termoDeUso}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F0A795] transition-colors font-semibold"
          >
            Termo de uso
          </a>
        </div>
      </div>
    </footer>
  );
}
