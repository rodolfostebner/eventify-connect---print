import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Package } from 'lucide-react';
import { toast } from 'sonner';
import { loginExhibitor } from '../../services/exhibitorAuthService';
import { useExhibitorAuth } from '../../hooks/useExhibitorAuth';

export default function ExhibitorLogin() {
  const navigate = useNavigate();
  const { exhibitorUser, loading } = useExhibitorAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && exhibitorUser) {
      navigate('/expositor', { replace: true });
    }
  }, [exhibitorUser, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setSubmitting(true);
    try {
      await loginExhibitor(username.trim(), password.trim());
      navigate('/expositor', { replace: true });
    } catch (err: any) {
      if (err.message?.includes('Invalid login')) {
        toast.error('Usuário ou senha incorretos');
      } else {
        toast.error('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
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
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center mx-auto">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900">Área do Expositor</h1>
            <p className="text-sm text-neutral-500">Entre com as credenciais fornecidas pelo organizador</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                Login
              </label>
              <input
                type="text"
                placeholder="exp1_evento_nome"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 bg-neutral-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !username.trim() || !password.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-neutral-400">
            Sem acesso? Entre em contato com a administração do evento.
          </p>
        </div>
      </div>
    </div>
  );
}
