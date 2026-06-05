import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, BETA_MODE } from '../../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

const ROLE_REDIRECT: Record<string, string> = {
  admin: '/',
  event_admin: '/eventadmin',
  avaliador: '/avaliador',
  expositor: '/expositor',
  participant: '/',
};

export function LoginModal({ isOpen, onClose, isDark }: LoginModalProps) {
  const navigate = useNavigate();
  const { user, login, loginMagic, verifyOtp, loginBeta } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // If user is already authenticated, redirect them
  useEffect(() => {
    if (user && isOpen) {
      onClose();
      navigate(ROLE_REDIRECT[user.role] || '/');
    }
  }, [user, isOpen, navigate, onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    try {
      await login();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao conectar com Google. Tente novamente.');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await loginMagic(email.trim());
      setSent(true);
      toast.success('Código enviado por e-mail!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar código. Verifique o e-mail e tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length < 6) return;
    setVerifying(true);
    try {
      await verifyOtp(email.trim(), token);
      // Sucesso: o useEffect que observa `user` fecha o modal e redireciona.
    } catch (err) {
      console.error(err);
      toast.error('Código inválido ou expirado. Confira ou peça um novo.');
    } finally {
      setVerifying(false);
    }
  };

  const handleBetaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const appUser = await loginBeta(email.trim());
      if (appUser) {
        toast.success('Login efetuado com sucesso!');
        onClose();
        navigate(ROLE_REDIRECT[appUser.role] || '/');
      } else {
        toast.error('Erro ao autenticar. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao autenticar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const logoSrc = isDark ? '/landing/Logo5.png' : '/landing/Logo0.png';

  return (
    <div
      id="login-modal"
      className="fixed inset-0 z-[100] w-full h-full flex items-center justify-center px-4 sm:px-6 transition-all duration-300"
      style={{
        backgroundImage: `url(${
          isDark
            ? window.innerWidth >= 768
              ? '/landing/telas/login-bg-desktop-dark.jpg'
              : '/landing/telas/login-bg-mobile-dark.jpg'
            : window.innerWidth >= 768
            ? '/landing/telas/login-bg-desktop.jpg'
            : '/landing/telas/login-bg-mobile.jpg'
        })`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay escuro semi-transparente suave */}
      <div className="absolute inset-0 bg-[#FAF6F0]/25 dark:bg-[#12110F]/25 pointer-events-none"></div>

      {/* Card de Login Glassmorphic */}
      <div className="login-card glass-card relative w-full max-w-sm p-8 sm:p-10 rounded-[32px] z-10 text-center bg-white/75 dark:bg-[#1A1816]/75">
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white transition-colors p-1"
          aria-label="Fechar Login"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Cabeçalho do Card */}
        <div className="flex flex-col items-center mb-6">
          <img
            id="login-logo"
            src={logoSrc}
            alt="Eventify Koala Logo"
            className="h-20 w-auto object-contain mb-3 transition-transform duration-350 hover:scale-105 cursor-pointer"
          />
          <h3 className="font-outfit font-bold text-2xl text-gray-900 dark:text-white">Eventify</h3>
          {BETA_MODE ? (
            <div className="inline-flex items-center gap-1.5 mt-2 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">
                Modo Beta
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[280px]">
              Entre com Google ou receba um código no seu e-mail
            </p>
          )}
        </div>

        {/* Formulário de Login */}
        <div className="space-y-4 text-left">
          {BETA_MODE ? (
            <form onSubmit={handleBetaLogin} className="space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Acesso beta — informe seu e-mail para entrar. Nenhuma senha ou verificação necessária.
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 pl-1">
                  E-mail
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  disabled={sending}
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8FAFC]/90 dark:bg-[#1A1816]/90 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F0A795] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50"
              >
                {sending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : sent ? (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-3xl">✉️</span>
                <p className="font-bold text-gray-900 dark:text-white">Código enviado!</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Digite o código de 6 dígitos enviado para <strong>{email}</strong>.
                </p>
              </div>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                autoFocus
                disabled={verifying}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                className="w-full bg-[#F8FAFC]/90 dark:bg-[#1A1816]/90 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.3em] focus:outline-none focus:border-[#F0A795] transition-colors"
              />
              <button
                type="submit"
                disabled={verifying || code.length < 6}
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white font-semibold py-3.5 rounded-2xl transition-all text-sm shadow-sm disabled:opacity-50"
              >
                {verifying ? 'Entrando...' : 'Entrar'}
              </button>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => { setSent(false); setCode(''); }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 underline"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => handleMagicLink({ preventDefault: () => {} } as React.FormEvent)}
                  className="text-[#F0A795] hover:text-[#E5A899] font-semibold disabled:opacity-50"
                >
                  {sending ? 'Reenviando...' : 'Reenviar código'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Botão Google */}
              <button
                onClick={handleGoogle}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-100 font-bold py-3 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Entrar com Google
              </button>

              {/* Separador */}
              <div className="flex items-center py-1">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="px-3 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
                  ou
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>

              {/* Email Input & Login Button */}
              <form className="space-y-4" onSubmit={handleMagicLink}>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 pl-1">
                    E-mail
                  </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    disabled={sending}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC]/90 dark:bg-[#1A1816]/90 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F0A795] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  {sending ? 'Enviando...' : 'Receber código por e-mail'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
