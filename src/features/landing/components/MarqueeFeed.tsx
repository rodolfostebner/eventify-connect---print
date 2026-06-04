import { landingConfig } from '../landingConfig';

interface MarqueeFeedProps {
  isDark: boolean;
}

export function MarqueeFeed({ isDark }: MarqueeFeedProps) {
  const { feedPhotosCount, comments } = landingConfig;
  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';

  // Gerar cards de fotos do feed
  const cards = Array.from({ length: feedPhotosCount }, (_, i) => {
    const num = i + 1;
    const fileName = `foto${num}.jpg`;
    const comment = comments[fileName] || fileName;
    return { num, src: `/landing/feed/${fileName}`, comment };
  });

  // Duplicar para loop contínuo (seamless marquee)
  const allCards = [...cards, ...cards];

  return (
    <section id="feed" className="py-14 border-y-2 border-[#E5A899]/25 dark:border-[#E5A899]/10 bg-gradient-to-r from-[#FAF6F0] via-[#FCEFEA] to-[#FAF6F0] dark:from-[#12110F] dark:via-[#1E1916] dark:to-[#12110F] relative shadow-lg shadow-[#E5A899]/5 transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <img src={logoSrc} alt="" className="w-[550px] h-[550px]" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F0A795]/15 border border-[#F0A795]/30 text-[#F0A795] text-xs font-bold uppercase tracking-widest mb-4">
          ✨ A Alma do Evento
        </span>
        <h2 className="font-outfit font-black text-4xl md:text-5xl mb-6 text-gray-900 dark:text-white relative z-10 tracking-tight">
          Feed de fotos: o coração vibrante do Eventify.
        </h2>
        <p className="text-gray-700 dark:text-gray-200 text-lg max-w-4xl mx-auto relative z-10 leading-relaxed font-medium">
          O Eventify nasceu de um propósito simples: registrar sorrisos e momentos espontâneos em uma rede social exclusiva e fechada de eventos. Hoje, esse feed ao vivo de fotos é o coração pulsante da nossa plataforma, integrando stands virtuais, avaliações reais e sorteios na TV Wall de forma instantânea e integrada.
        </p>
      </div>

      {/* Continuous Marquee Loop */}
      <div className="w-full overflow-hidden py-6 flex relative before:absolute before:left-0 before:top-0 before:h-full before:w-48 before:bg-gradient-to-r before:from-[#FAF6F0] dark:before:from-[#12110F] before:to-transparent before:z-10 after:absolute after:right-0 after:top-0 after:h-full after:w-48 after:bg-gradient-to-l after:from-[#FAF6F0] dark:after:from-[#12110F] after:to-transparent after:z-10">
        <div className="marquee-container gap-8">
          {allCards.map((card, idx) => (
            <div key={`${card.num}-${idx}`} className="glass-card w-96 p-[18px] rounded-[28px] border-2 border-[#E5A899]/30 flex-shrink-0">
              <img
                src={card.src}
                alt={`Foto ${card.num}`}
                className="w-full h-60 object-cover rounded-2xl mb-4 hover:scale-[1.02] transition-transform duration-300"
              />
              <p className="text-sm text-gray-800 dark:text-white font-semibold px-4 text-center">
                &ldquo;{card.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
