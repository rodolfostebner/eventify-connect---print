import { useRef, useEffect } from 'react';
import { landingConfig } from '../landingConfig';

interface MarqueeFeedProps {
  isDark: boolean;
}

export function MarqueeFeed({ isDark }: MarqueeFeedProps) {
  const { feedPhotosCount, comments } = landingConfig;
  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';

  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);
  const scrollPosRef = useRef(0);
  const isHovered = useRef(false);

  // Gerar cards de fotos do feed
  const cards = Array.from({ length: feedPhotosCount }, (_, i) => {
    const num = i + 1;
    const fileName = `foto${num}.jpg`;
    const comment = comments[fileName] || fileName;
    return { num, src: `/landing/feed/${fileName}`, comment };
  });

  // Duplicar e garantir quantidade mínima para loop contínuo e suave
  let baseCards = [...cards];
  while (baseCards.length < 8) {
    baseCards = [...baseCards, ...cards];
  }
  const allCards = [...baseCards, ...baseCards];

  // Auto-scroll loop (Direção: Direita para a Esquerda)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationId: number;
    const speed = 0.8; // pixels por frame

    const animate = () => {
      if (!isDown.current && !isHovered.current) {
        scrollPosRef.current += speed;
        // Se passar da metade do scrollWidth (o primeiro set de cards), reseta para 0
        if (scrollPosRef.current >= container.scrollWidth / 2) {
          scrollPosRef.current = 0;
        }
        container.scrollLeft = scrollPosRef.current;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [allCards.length]);

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
    const walk = (x - startX.current) * 1.5; // multiplicador de sensibilidade
    
    let newScrollLeft = scrollLeftVal.current - walk;
    const halfWidth = container.scrollWidth / 2;

    // Tratar limites infinitos durante o arrasto
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
    <section id="feed" className="py-8 border-y-2 border-[#E5A899]/25 dark:border-[#E5A899]/10 bg-gradient-to-r from-[#FAF6F0] via-[#FCEFEA] to-[#FAF6F0] dark:from-[#12110F] dark:via-[#1E1916] dark:to-[#12110F] relative shadow-lg shadow-[#E5A899]/5 transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 mb-4 text-center">
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
          <img src={logoSrc} alt="" className="max-h-full w-auto object-contain py-2" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F0A795]/15 border border-[#F0A795]/30 text-[#F0A795] text-xs font-bold uppercase tracking-widest mb-4">
          ✨ A Alma do Evento
        </span>
        <h2 className="font-outfit font-black text-4xl md:text-5xl mb-6 text-gray-900 dark:text-white relative z-10 tracking-tight">
          Feed de fotos: o coração vibrante do Memories Hub.
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg max-w-4xl mx-auto relative z-10 leading-relaxed font-medium">
          O Memories Hub nasceu de um propósito simples: registrar sorrisos e momentos espontâneos em uma rede social exclusiva e fechada de eventos. Hoje, esse feed ao vivo de fotos é o coração pulsante da nossa plataforma, integrando stands virtuais, avaliações reais e sorteios na TV Wall de forma instantânea e integrada.
        </p>
      </div>

      {/* Carrossel Interativo com Arrasto e Fades Laterais Responsivos */}
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
          {allCards.map((card, idx) => (
            <div key={`${card.num}-${idx}`} className="glass-card w-96 p-[18px] rounded-[28px] border-2 border-[#E5A899]/30 flex-shrink-0">
              <img
                src={card.src}
                alt={`Foto ${card.num}`}
                className="w-full h-60 object-cover rounded-2xl mb-4 pointer-events-none hover:scale-[1.02] transition-transform duration-300"
              />
              <p className="text-sm text-gray-800 dark:text-white font-semibold px-4 text-center select-none pointer-events-none">
                &ldquo;{card.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
