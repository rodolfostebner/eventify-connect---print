import { User } from '../services/authService';
import { logout } from '../services/authService';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorPanel({ user }: { user: User | null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Painel do Operador</h1>
          <p className="text-neutral-500">Aguardando pedidos de impressão...</p>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`} 
              className="w-10 h-10 rounded-full border border-neutral-200"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`;
              }}
            />
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Sair">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        )}
      </header>
    </div>
  );
}
