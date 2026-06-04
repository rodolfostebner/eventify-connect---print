import { useState, useEffect, useCallback } from 'react';
import { landingConfig } from '../landingConfig';

export function PixCard() {
  const [copied, setCopied] = useState(false);
  const [showHomeBtn, setShowHomeBtn] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const pixKey = landingConfig.links.pixKey;

  // Custom slow smooth scroll to target Y
  const runCustomScroll = useCallback((targetY: number, onComplete?: () => void) => {
    // Temporarily disable CSS smooth scroll
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';

    const startPosition = window.pageYOffset;
    const distance = targetY - startPosition;
    const isMobile = window.innerWidth < 1024;
    const duration = isMobile ? 3800 : 2800; // 3.8s on mobile, 2.8s on desktop
    let start: number | null = null;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const time = Math.min(progress / duration, 1);

      // cubic easeInOut
      const ease = time < 0.5 ? 4 * time * time * time : 1 - Math.pow(-2 * time + 2, 3) / 2;

      window.scrollTo(0, startPosition + distance * ease);

      if (progress < duration) {
        window.requestAnimationFrame(step);
      } else {
        document.documentElement.style.scrollBehavior = originalScrollBehavior;
        if (onComplete) onComplete();
      }
    }

    window.requestAnimationFrame(step);
  }, []);

  const scrollToPix = useCallback(() => {
    const target = document.getElementById('pix-card');
    if (!target) return;

    let targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 120; // offset
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (targetPosition > maxScroll) {
      targetPosition = maxScroll;
    }

    runCustomScroll(targetPosition, () => {
      // Trigger visual attention bounce on scroll complete
      setBouncing(true);
      setTimeout(() => setBouncing(false), 1200);

      // Fade in the Home button
      setShowHomeBtn(true);
    });
  }, [runCustomScroll]);

  const scrollToTop = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    runCustomScroll(0, () => {
      // Hide home button when back at top
      setShowHomeBtn(false);
    });
  }, [runCustomScroll]);

  // Bind scrollToPix and scrollToTop to window for header access
  useEffect(() => {
    (window as any).scrollToPix = (e?: any) => {
      if (e) e.preventDefault();
      scrollToPix();
    };
    (window as any).scrollToTop = (e?: any) => {
      if (e) e.preventDefault();
      scrollToTop();
    };

    return () => {
      delete (window as any).scrollToPix;
      delete (window as any).scrollToTop;
    };
  }, [scrollToPix, scrollToTop]);

  // Auto-hide the home button if scrolled manually back to top
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset < 150) {
        setShowHomeBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Periodic attention bounce
  useEffect(() => {
    const interval = setInterval(() => {
      setBouncing(true);
      setTimeout(() => setBouncing(false), 1200);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const copyPixKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [pixKey]);

  return (
    <div className="flex flex-row items-center justify-center lg:flex-col-reverse lg:items-start gap-3 w-full lg:w-auto mt-8 lg:mt-0 lg:absolute lg:bottom-12 lg:left-12 z-20">
      {/* Card Pix */}
      <div
        id="pix-card"
        className={`w-64 p-5 rounded-2xl border border-[#E5A899]/25 dark:border-[#E5A899]/15 bg-white/40 dark:bg-[#1A1816]/40 backdrop-blur-sm flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-black/50 ${
          bouncing ? 'attention-bounce' : ''
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base">☕</span>
          <span className="font-outfit font-semibold text-gray-700 dark:text-gray-300 text-sm">
            Gostou do app? Nos pague um chocolate quente!
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px] leading-normal text-center">
          Sua ajuda mantém o projeto ativo. Copie a chave Pix:
        </p>
        <div className="flex flex-col items-center gap-1.5 mt-1 w-full">
          <input
            type="text"
            readOnly
            value={pixKey}
            className="bg-gray-100/80 dark:bg-[#201C1A]/85 border border-[#E5A899]/20 dark:border-[#E5A899]/10 text-xs text-gray-700 dark:text-gray-300 font-mono px-3 py-2 rounded-lg focus:outline-none w-full text-center"
          />
          <button
            onClick={copyPixKey}
            className="w-full bg-[#F0A795]/15 hover:bg-[#F0A795]/25 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#F0A795] font-bold text-xs py-2 rounded-lg border border-[#F0A795]/25 dark:border-gray-700 transition-all flex items-center justify-center gap-1"
          >
            {copied ? 'Copiado! 🙏🏻🫶🐨' : 'Copiar Chave'}
          </button>
        </div>
      </div>

      {/* Home Button (Back to Top) */}
      <button
        onClick={scrollToTop}
        className={`w-12 h-12 flex-shrink-0 rounded-2xl border border-[#E5A899]/25 dark:border-[#E5A899]/15 bg-white/40 dark:bg-[#1A1816]/40 backdrop-blur-sm flex items-center justify-center text-gray-700 dark:text-gray-400 hover:text-[#F0A795] dark:hover:text-[#F0A795] hover:border-[#F0A795]/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-lg shadow-[#E5A899]/5 ${
          showHomeBtn ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        title="Voltar ao Topo"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>
    </div>
  );
}

