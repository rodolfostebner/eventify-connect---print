import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AppHeader } from '../../components/AppHeader';

export default function AvaliadorPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'avaliador')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppHeader title="Área do Avaliador" />

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-8 text-center space-y-2">
          <p className="text-sm font-bold text-neutral-900">Painel de avaliação em construção</p>
          <p className="text-xs text-neutral-400">As métricas e formulários de avaliação serão implementados aqui.</p>
        </div>
      </main>
    </div>
  );
}
