import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LAST_EVENT_KEY = 'last_event_slug';

interface AppHeaderProps {
  title?: string;
  actions?: ReactNode;
}

export function AppHeader({ title, actions }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const lastSlug = localStorage.getItem(LAST_EVENT_KEY);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {lastSlug ? (
          <button
            onClick={() => navigate(`/event/${lastSlug}`)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-600 hover:text-neutral-900"
            title="Voltar ao evento"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center text-white text-lg select-none">
            🐨
          </div>
        )}

        {title && (
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-tight leading-tight">{title}</span>
            {lastSlug && (
              <span
                onClick={() => navigate(`/event/${lastSlug}`)}
                className="text-[10px] text-neutral-400 font-medium cursor-pointer hover:text-neutral-600 transition-colors"
              >
                ← Voltar ao evento
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}

        {user && (
          <>
            <img
              src={user.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.email)}&background=random`}
              className="w-9 h-9 rounded-full border-2 border-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="hidden sm:block text-sm font-bold text-neutral-900 max-w-[140px] truncate">
              {user.display_name ?? user.email}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
