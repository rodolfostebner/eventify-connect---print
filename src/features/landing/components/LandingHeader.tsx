import { useState, useEffect, useRef } from 'react';
import { landingConfig } from '../landingConfig';

interface LandingHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onOpenLogin: () => void;
}

export function LandingHeader({ isDark, onToggleDark, onOpenLogin }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const [mobileTutorialsOpen, setMobileTutorialsOpen] = useState(false);
  const [coffeeBouncing, setCoffeeBouncing] = useState(false);
  const tutorialsRef = useRef<HTMLDivElement>(null);

  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';
  const { tutoriais } = landingConfig.links;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    if (!tutorialsOpen) return;
    const handler = (e: MouseEvent) => {
      if (tutorialsRef.current && !tutorialsRef.current.contains(e.target as Node)) {
        setTutorialsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [tutorialsOpen]);

  // Periodic coffee cup shake to draw attention
  useEffect(() => {
    const interval = setInterval(() => {
      setCoffeeBouncing(true);
      setTimeout(() => setCoffeeBouncing(false), 1200);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const scrollToPix = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof (window as any).scrollToPix === 'function') {
      (window as any).scrollToPix(e);
    } else {
      document.getElementById('pix-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#FAF6F0]/95 dark:bg-[#12110F]/95 backdrop-blur-md border-b border-[#E5A899]/20 dark:border-[#E5A899]/10 py-2 sm:py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Brand Logo — clicar alterna dark mode */}
        <div className="flex items-center gap-1 sm:gap-1.5 h-12 sm:h-16">
          <img
            src={logoSrc}
            alt="Eventify Koala Logo"
            className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-all duration-350 hover:scale-105 cursor-pointer"
            title="Clique para alternar o modo Escuro/Claro"
            onClick={onToggleDark}
          />
          <div className="hidden sm:block h-6 sm:h-8 w-px bg-[#E5A899]/30 dark:bg-[#E5A899]/20 mx-1 sm:mx-2" />
          <span className="font-outfit font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 tracking-tight">Eventify</span>
          <span className="hidden md:inline-block text-[10px] bg-[#F0A795]/15 px-2.5 py-0.5 rounded-full text-[#F0A795] font-bold tracking-wider uppercase">MemoriesHub</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-300 font-semibold">
          <a href="#feed" className="hover:text-[#F0A795] transition-colors">Feed Gallery</a>
          <a href="#participantes" className="hover:text-[#F0A795] transition-colors">Para Participantes</a>
          <a href="#negocios" className="hover:text-[#F0A795] transition-colors">Para Escolas / Empresas</a>

          {/* Tutoriais Dropdown */}
          <div className="relative" ref={tutorialsRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setTutorialsOpen(!tutorialsOpen); }}
              className="hover:text-[#F0A795] transition-colors flex items-center gap-1 focus:outline-none py-2 font-semibold"
            >
              <span>Tutoriais</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${tutorialsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {tutorialsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-2xl bg-[#FAF6F0]/95 dark:bg-[#12110F]/95 backdrop-blur-md border border-[#E5A899]/20 dark:border-[#E5A899]/10 py-2 shadow-xl z-50 text-left font-semibold">
                <a href={tutoriais.expositor} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#F0A795]/10 hover:text-[#F0A795] transition-colors">Expositor</a>
                <a href={tutoriais.administrador} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#F0A795]/10 hover:text-[#F0A795] transition-colors">Administrador</a>
                <a href={tutoriais.geral} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#F0A795]/10 hover:text-[#F0A795] transition-colors">Geral</a>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center">
          {/* Coffee Icon */}
          <a
            href="#pix-card"
            onClick={scrollToPix}
            className={`text-gray-600 dark:text-gray-400 hover:text-[#F0A795] dark:hover:text-[#F0A795] transition-all duration-350 p-1.5 hover:scale-110 flex items-center justify-center ${
              coffeeBouncing ? 'attention-bounce' : ''
            }`}
            title="Nos pague um chocolate quente! ☕"
          >
            <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </a>

          {/* Login */}
          <button onClick={onOpenLogin} className="text-gray-700 dark:text-gray-300 hover:text-[#F0A795] font-semibold text-xs sm:text-sm transition-colors px-2 sm:px-3 py-2">
            Login
          </button>

          {/* CTA */}
          <a href="#contato" className="bg-gradient-to-r from-[#E5A899] to-[#F0A795] hover:from-[#F0A795] hover:to-[#E5A899] dark:from-gray-800 dark:to-gray-900 dark:hover:from-gray-700 dark:hover:to-gray-800 text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-6 sm:py-3 rounded-full transition-all duration-300 shadow-md shadow-[#E5A899]/15 dark:shadow-none hover:shadow-[#E5A899]/35 dark:hover:shadow-none dark:border dark:border-gray-700 hover:-translate-y-0.5">
            Falar com Especialista
          </a>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-700 dark:text-gray-300 hover:text-[#F0A795] p-1.5 focus:outline-none ml-1"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5A899]/10 dark:border-[#E5A899]/5 bg-[#FAF6F0]/95 dark:bg-[#12110F]/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-300 font-semibold shadow-inner">
            <a href="#feed" onClick={closeMobileMenu} className="hover:text-[#F0A795] py-2 border-b border-[#E5A899]/5 dark:border-[#E5A899]/10 transition-colors">Feed Gallery</a>
            <a href="#participantes" onClick={closeMobileMenu} className="hover:text-[#F0A795] py-2 border-b border-[#E5A899]/5 dark:border-[#E5A899]/10 transition-colors">Para Participantes</a>
            <a href="#negocios" onClick={closeMobileMenu} className="hover:text-[#F0A795] py-2 border-b border-[#E5A899]/5 dark:border-[#E5A899]/10 transition-colors">Para Escolas / Empresas</a>

            {/* Mobile Tutoriais */}
            <div className="border-b border-[#E5A899]/5 dark:border-[#E5A899]/10">
              <button
                onClick={() => setMobileTutorialsOpen(!mobileTutorialsOpen)}
                className="w-full text-left hover:text-[#F0A795] py-2 flex justify-between items-center transition-colors font-semibold"
              >
                <span>Tutoriais</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${mobileTutorialsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {mobileTutorialsOpen && (
                <div className="pl-4 pb-2 flex flex-col gap-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  <a href={tutoriais.expositor} target="_blank" rel="noopener noreferrer" className="hover:text-[#F0A795] py-1 transition-colors">Expositor</a>
                  <a href={tutoriais.administrador} target="_blank" rel="noopener noreferrer" className="hover:text-[#F0A795] py-1 transition-colors">Administrador</a>
                  <a href={tutoriais.geral} target="_blank" rel="noopener noreferrer" className="hover:text-[#F0A795] py-1 transition-colors">Geral</a>
                </div>
              )}
            </div>

            <button onClick={() => { closeMobileMenu(); onOpenLogin(); }} className="hover:text-[#F0A795] py-2 transition-colors text-left">Login</button>
          </div>
        </div>
      )}
    </header>
  );
}
