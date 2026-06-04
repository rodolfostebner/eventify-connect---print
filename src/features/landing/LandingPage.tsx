import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LandingHeader } from './components/LandingHeader';
import { HeroSection } from './components/HeroSection';
import { MarqueeFeed } from './components/MarqueeFeed';
import { DualPathSection } from './components/DualPathSection';
import { ContactForm } from './components/ContactForm';
import { LandingFooter } from './components/LandingFooter';
import { LoginModal } from './components/LoginModal';

interface LandingPageProps {
  openLogin?: boolean;
}

export default function LandingPage({ openLogin = false }: LandingPageProps) {
  const [searchParams] = useSearchParams();
  const [isDark, setIsDark] = useState(() => {
    // Default to false (light mode)
    return false;
  });
  const [isLoginOpen, setIsLoginOpen] = useState(openLogin);

  // Sync state if openLogin prop changes, or if searchParams/hash has '#login'
  useEffect(() => {
    if (openLogin || window.location.hash === '#login' || searchParams.get('login') === 'true') {
      setIsLoginOpen(true);
    }
  }, [openLogin, searchParams]);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className={`landing-page font-jakarta w-full min-h-screen selection:bg-pink-200 selection:text-gray-900 transition-colors duration-300 ${isDark ? 'dark bg-[#12110F] text-[#FAF6F0]' : 'bg-[#FAF6F0] text-[#1E293B]'}`}>
      <LandingHeader
        isDark={isDark}
        onToggleDark={toggleDark}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main className="pt-16 sm:pt-20">
        <HeroSection isDark={isDark} />
        <MarqueeFeed isDark={isDark} />
        <DualPathSection />
        <ContactForm isDark={isDark} />
      </main>

      <LandingFooter isDark={isDark} />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          // Clean up hash/params if we opened it via URL
          if (window.location.hash === '#login') {
            window.history.pushState(null, '', ' ');
          }
        }}
        isDark={isDark}
      />
    </div>
  );
}
