import { useRef, useEffect } from 'react';
import { landingConfig } from '../landingConfig';

interface SponsorMarqueeProps {
  isDark: boolean;
}

export function SponsorMarquee({ isDark }: SponsorMarqueeProps) {
  const { sponsors = [] } = landingConfig;
  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';

  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const scrollPosRef = useRef(0);
  const isHovered = useRef(false);

  // Se não houver patrocinadores cadastrados, não exibe o bloco
  if (sponsors.length === 0) return null;

  // Duplicar logos para garantir carrossel infinito sem gaps em telas muito largas
  let baseSponsors = [...sponsors];
  while (baseSponsors.length < 8) {
    baseSponsors = [...baseSponsors, ...sponsors];
  }
  const allSponsors = [...baseSponsors, ...baseSponsors];

  // Definir ponto de partida na metade do scrollWidth (necessário para LTR auto-scroll)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Pequeno delay para garantir que o scrollWidth já foi calculado
    const initScroll = () => {
      scrollPosRef.current = container.scrollWidth / 2;
      container.scrollLeft = scrollPosRef.current;
    };
    initScroll();
    
    // Adicionar listener de resize para re-ajustar se necessário
    window.addEventListener('resize', initScroll);
    return () => window.removeEventListener('resize', initScroll);
  }, [allSponsors.length]);

  // Auto-scroll loop (Direção: Esquerda para a Direita)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    const speed = 0.8; // pixels por frame

    const animate = () => {
      if (!isDown.current && !isHovered.current) {
        scrollPosRef.current -= speed;
        // Se chegar em 0, reseta para a metade do scrollWidth
        if (scrollPosRef.current <= 0) {
          scrollPosRef.current = container.scrollWidth / 2;
        }
        container.scrollLeft = scrollPosRef.current;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [allSponsors.length]);

  // Handlers para arrastar com Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isDown.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeftVal.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !isDown.current) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    
    let newScrollLeft = scrollLeftVal.current - walk;
    const halfWidth = container.scrollWidth / 2;

    if (newScrollLeft >= halfWidth) {
      newScrollLeft -= halfWidth;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeftVal.current = newScrollLeft;
    } else if (newScrollLeft < 0) {
      newScrollLeft += halfWidth;
      startX.current = e.pageX - container.offsetLeft;
      scrollLeftVal.current = newScrollLeft;
    }

    container.scrollLeft = newScrollLeft;
    scrollPosRef.current = newScrollLeft;
  };

  const handleMouseUpOrLeave = () => {
    isDown.current = false;
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollLeft;
    }
  };

  // Handlers para arrastar com Touch (Mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isDown.current = true;
    startX.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftVal.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || !isDown.current) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    
    let newScrollLeft = scrollLeftVal.current - walk;
    const halfWidth = container.scrollWidth / 2;

    if (newScrollLeft >= halfWidth) {
      newScrollLeft -= halfWidth;
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftVal.current = newScrollLeft;
    } else if (newScrollLeft < 0) {
      newScrollLeft += halfWidth;
      startX.current = e.touches[0].pageX - container.offsetLeft;
      scrollLeftVal.current = newScrollLeft;
    }

    container.scrollLeft = newScrollLeft;
    scrollPosRef.current = newScrollLeft;
  };

  return (
    <section id="patrocinadores" className="py-8 border-y-2 border-[#E5A899]/25 dark:border-[#E5A899]/10 bg-gradient-to-r from-[#FAF6F0] via-[#FCEFEA] to-[#FAF6F0] dark:from-[#12110F] dark:via-[#1E1916] dark:to-[#12110F] relative shadow-lg shadow-[#E5A899]/5 transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        {/* Watermark Logo de Fundo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
          <img src={logoSrc} alt="" className="max-h-full w-auto object-contain py-2" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F0A795]/15 border border-[#F0A795]/30 text-[#F0A795] text-xs font-bold uppercase tracking-widest mb-3">
          🤝 Apoio & Suporte
        </span>
        
        <h2 className="font-outfit font-black text-3xl md:text-4xl mb-4 text-gray-900 dark:text-white relative z-10 tracking-tight">
          Patrocinadores
        </h2>
        
        <p className="text-gray-700 dark:text-gray-200 text-base md:text-lg max-w-4xl mx-auto relative z-10 leading-relaxed font-medium">
          Nosso carinho e gratidão aos parceiros patrocinadores e a todos que tem nos apoiado a seguir em frente dando nosso melhor! MUITO OBRIGADO!
        </p>
      </div>

      {/* Carrossel Interativo LTR com Fades Laterais Responsivos e py-3 */}
      <div className="w-full relative before:absolute before:left-0 before:top-0 before:h-full before:w-10 sm:before:w-20 md:before:w-32 lg:before:w-48 before:bg-gradient-to-r before:from-[#FAF6F0] dark:before:from-[#12110F] before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:h-full after:w-10 sm:after:w-20 md:after:w-32 lg:after:w-48 after:bg-gradient-to-l after:from-[#FAF6F0] dark:after:from-[#12110F] after:to-transparent after:z-10">
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          onMouseEnter={() => { isHovered.current = true; }}
          onMouseLeave={() => { isHovered.current = false; handleMouseUpOrLeave(); }}
          className="w-full overflow-x-auto no-scrollbar py-3 flex gap-8 select-none cursor-grab active:cursor-grabbing"
        >
          {allSponsors.map((sponsor, idx) => (
            <div 
              key={`${sponsor}-${idx}`} 
              className="w-60 h-28 flex items-center justify-center p-5 rounded-2xl border-2 border-[#E5A899]/30 flex-shrink-0 bg-[#F5ECE2] dark:bg-[#8d6459] shadow-md hover:scale-105 transition-transform duration-300"
            >
              <img
                src={`/landing/telas/${sponsor}`}
                alt="Logo Patrocinador"
                className="max-w-full max-h-full object-contain pointer-events-none filter dark:brightness-110 drop-shadow-[0_1.5px_2.5px_rgba(0,0,0,0.35)]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
