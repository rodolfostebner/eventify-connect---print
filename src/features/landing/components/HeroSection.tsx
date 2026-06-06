import { landingConfig } from '../landingConfig';

interface HeroSectionProps {
  isDark: boolean;
}

export function HeroSection({ isDark }: HeroSectionProps) {
  const { mockupScreensCount } = landingConfig;
  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';

  // Gerar as telas do mockup (cross-fade animation via CSS classes)
  const screens = Array.from({ length: mockupScreensCount }, (_, i) => i + 1);

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center px-6 py-10 overflow-hidden bg-gradient-to-b from-[#FAF6F0] to-[#F5ECE2] dark:from-[#12110F] dark:to-[#1A1816]">
      {/* Background Soft Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F0A795]/10 dark:bg-[#F0A795]/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#E5A899]/10 dark:bg-[#E5A899]/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-500" />

      {/* Bamboo Background Decor */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img src="/landing/telas/BAMBUZAL2.png" alt="" className="w-full h-full object-cover opacity-15 mix-blend-multiply bamboo-bg-anim" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Text Column */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0A795]/10 border border-[#F0A795]/20 text-[#F0A795] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0A795] animate-pulse" />
            Revolução Phygital
          </div>
          <h1 className="font-outfit font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
            Onde cada memória do seu evento se conecta{' '}
            <span className="bg-gradient-to-r from-[#E5A899] to-[#F0A795] bg-clip-text text-transparent italic font-light">em tempo real</span>.
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
            O feed social de fotos ao vivo que interliga stands digitais, avaliação ponderada de jurados e sorteios automáticos.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#contato" className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-xl dark:shadow-none hover:shadow-gray-900/15 dark:hover:shadow-none hover:-translate-y-0.5">
              Contrate para seu evento
            </a>
            <a href="#participantes" className="text-[#F0A795] hover:text-[#E5A899] font-semibold flex items-center gap-2 group transition-colors">
              Saiba como interagir
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative w-72 h-[580px] rounded-[48px] border-[6px] border-gray-800 bg-slate-900 p-3 shadow-2xl shadow-[#E5A899]/15 floating-phone">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mr-2" />
              <span className="w-8 h-1 bg-slate-950 rounded-full" />
            </div>

            {/* Screen Content — cross-fade slides */}
            <div className="w-full h-full rounded-[38px] overflow-hidden relative bg-[#FAF6F0]">
              {screens.map((num) => (
                <img
                  key={num}
                  src={`/landing/telas/Tela${num}.jpeg`}
                  alt={`Tela ${num} do Eventify`}
                  className={`absolute inset-0 w-full h-full object-cover screen-slide-${num}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
