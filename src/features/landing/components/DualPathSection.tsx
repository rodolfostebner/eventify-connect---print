export function DualPathSection() {
  return (
    <section className="py-14 px-6 relative bg-gradient-to-b from-[#FAF6F0] to-[#F7EFE5] dark:from-[#12110F] dark:to-[#181614] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-outfit font-bold text-4xl mb-4 text-gray-900 dark:text-white">Escolha a sua jornada.</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Um ecossistema completo desenhado tanto para quem curte o evento quanto para quem faz ele acontecer.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* B2C Card — Participantes */}
          <div id="participantes" className="glass-card p-10 rounded-[32px] border border-[#E5A899]/30 relative overflow-hidden group bg-white/70 dark:bg-[#1A1816]/75 transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F0A795]/10 dark:hidden rounded-full blur-xl pointer-events-none transition-colors duration-500" />
            {/* Camera Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#F0A795]/10 border border-[#F0A795]/30 flex items-center justify-center mb-8 shadow-inner shadow-[#F0A795]/5">
              <svg className="w-8 h-8 text-[#F0A795]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </div>
            <h3 className="font-outfit font-bold text-2xl md:text-3xl mb-4 text-gray-900 dark:text-white">Para quem vive a experiência</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Participe das interações, interaja de forma intuitiva, dê voz às suas preferências e concorra a prêmios incríveis projetados na TV Wall.
            </p>

            <ul className="space-y-6 text-gray-800 dark:text-gray-200">
              {[
                { num: '1', title: 'Compartilhe seus Momentos', desc: 'Escaneie o QR Code no evento e suba suas fotos direto no feed interativo, sem downloads de apps.' },
                { num: '2', title: 'Deixe sua Avaliação', desc: 'Dê de 1 a 5 estrelas para os stands dos expositores e equipes de sua preferência.' },
                { num: '3', title: 'Concorra a Prêmios', desc: 'As interações no app geram tickets que são sorteados na TV Wall durante o evento.' },
              ].map(item => (
                <li key={item.num} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F0A795]/10 border border-[#F0A795]/30 flex items-center justify-center text-xs text-[#F0A795] font-bold">{item.num}</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* B2B Card — Organizadores & Expositores */}
          <div id="negocios" className="glass-card p-10 rounded-[32px] border border-[#E5A899]/30 relative overflow-hidden group bg-white/70 dark:bg-[#1A1816]/75 transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E5A899]/10 dark:hidden rounded-full blur-xl pointer-events-none transition-colors duration-500" />
            {/* Storefront Icon */}
            <div className="w-16 h-16 rounded-2xl bg-[#E5A899]/10 border border-[#E5A899]/30 flex items-center justify-center mb-8 shadow-inner shadow-[#E5A899]/5">
              <svg className="w-8 h-8 text-[#E5A899]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615 3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-15 0h15M6.25 5.25h11.5M6.25 5.25v-1.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 .75.75v1.5M6.25 5.25h11.5" />
              </svg>
            </div>
            <h3 className="font-outfit font-bold text-2xl md:text-3xl mb-4 text-gray-900 dark:text-white">Para quem faz acontecer</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Potencialize marcas, capture contatos de negócios de alta qualidade e garanta um ecossistema seguro de competição e avaliações técnicas.
            </p>

            <ul className="space-y-6 text-gray-800 dark:text-gray-200">
              {[
                { title: 'Stands Virtuais Completos', desc: 'Expositores expõem catálogos detalhados de produtos em stands interativos elegantes.' },
                { title: 'Captura Ativa de Leads', desc: 'Geração de interesse em produtos e controle simples e integrado de pré-vendas.' },
                { title: 'Avaliação Ponderada', desc: 'Votação de jurados técnicos com pesos matemáticos configuráveis.' },
                { title: 'Show na TV Wall em Tempo Real', desc: 'Transmita o ranking técnico, execute sorteios, emita avisos importantes por áudio e exiba fotos e comentários dos participantes em tempo real após curadoria e moderação da equipe.' },
                { title: 'Customização Exclusiva de Branding', desc: 'Personalize a identidade visual completa da plataforma do seu evento, aplicando a sua própria logomarca, paleta de cores institucional e elementos de design para uma experiência phygital 100% autêntica e alinhada à sua marca.' },
              ].map(item => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E5A899]/15 border border-[#E5A899]/30 flex items-center justify-center text-xs text-[#E5A899] font-bold">✓</span>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
