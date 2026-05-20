import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, CheckCircle2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { loginWithGoogle, loginWithMagicLink } from '../../services/authService';
import { useAuth, BETA_MODE } from '../../hooks/useAuth';

const ROLE_REDIRECT: Record<string, string> = {
  admin:       '/',
  event_admin: '/eventadmin',
  avaliador:   '/avaliador',
  expositor:   '/expositor',
  participant: '/',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, loginBeta } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!loading && user) {
      navigate(ROLE_REDIRECT[user.role] ?? redirectTo, { replace: true });
    }
  }, [user, loading, navigate, redirectTo]);

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch {
      toast.error('Erro ao conectar com Google. Tente novamente.');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await loginWithMagicLink(email.trim());
      setSent(true);
    } catch {
      toast.error('Erro ao enviar link. Verifique o e-mail e tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleBetaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const appUser = await loginBeta(email.trim());
      if (!appUser) toast.error('Erro ao autenticar. Tente novamente.');
    } catch {
      toast.error('Erro ao autenticar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
              🐨
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Eventify</h1>
            {BETA_MODE ? (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Modo Beta</span>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Entre com Google ou receba um link no seu e-mail</p>
            )}
          </div>

          {BETA_MODE ? (
            /* ── Beta: apenas email, sem verificação ── */
            <form onSubmit={handleBetaLogin} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700 leading-relaxed">
                Acesso beta — informe seu e-mail para entrar. Nenhuma senha ou verificação necessária.
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 bg-neutral-50"
                />
              </div>
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : sent ? (
            /* ── Magic link enviado ── */
            <div className="bg-green-50 rounded-2xl p-6 text-center space-y-2 border border-green-100">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <p className="font-bold text-green-900">Link enviado!</p>
              <p className="text-xs text-green-700">Verifique <strong>{email}</strong> e clique no link para entrar.</p>
              <button onClick={() => setSent(false)} className="text-xs text-green-600 hover:text-green-700 underline mt-2">
                Voltar
              </button>
            </div>
          ) : (
            /* ── Login normal: Google + Magic Link ── */
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-neutral-100 bg-white text-neutral-900 text-sm font-bold hover:bg-neutral-50 hover:border-neutral-200 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-neutral-100" />
                <span className="text-xs text-neutral-400 font-medium">ou</span>
                <div className="flex-1 h-px bg-neutral-100" />
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 bg-neutral-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {sending ? 'Enviando...' : 'Receber link por e-mail'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
