import { useState } from 'react';
import { LayoutDashboard, Plus, LogOut, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import { login, loginWithPassword, loginWithGoogle, updatePassword, logout } from '../services/authService';
import type { User } from '../services/authService';

// Feature Hooks
import { useAdminEvents } from '../features/admin/hooks/useAdminEvents';
import { useBrandingForm } from '../features/admin/hooks/useBrandingForm';

// Feature Components
import { EventCard } from '../features/admin/components/EventCard';
import { ShareModal } from '../features/admin/components/ShareModal';
import { BrandingModal } from '../features/admin/components/BrandingModal';
import type { EventData } from '../types';

export default function AdminDashboard({ user }: { user: User | null }) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('password');
  const [linkSent, setLinkSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [sharingEvent, setSharingEvent] = useState<EventData | null>(null);

  const {
    events, setEvents, loading,
    newEventName, setNewEventName,
    newEventSlug, setNewEventSlug,
    updateStatus, handleDeleteEvent, createNewEvent,
  } = useAdminEvents(user?.uid);

  const {
    editingEvent, setEditingEvent,
    brandingForm, setBrandingForm,
    loading: brandingLoading,
    isUploadingSummary,
    summaryFileInputRef,
    openBrandingModal,
    saveBranding,
    handleSummaryFileUpload,
    handleItemFileUpload,
  } = useBrandingForm(setEvents);

  // ─── Login Screen ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200 text-center">
          <LayoutDashboard className="w-12 h-12 mx-auto text-neutral-900 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Painel Admin</h1>

          {linkSent ? (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <p className="text-sm text-green-700">Link enviado para <strong>{loginEmail}</strong></p>
              <button onClick={() => setLinkSent(false)} className="mt-4 text-sm font-bold text-green-600 underline">Voltar</button>
            </div>
          ) : (
            <>
              <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
                <button onClick={() => setAuthMode('password')} className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all', authMode === 'password' ? 'bg-white shadow-sm' : 'text-neutral-500')}>Senha</button>
                <button onClick={() => setAuthMode('magic')} className={cn('flex-1 py-2 text-xs font-bold rounded-lg transition-all', authMode === 'magic' ? 'bg-white shadow-sm' : 'text-neutral-500')}>Link Mágico</button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!loginEmail) return;
                  const tid = toast.loading(authMode === 'password' ? 'Autenticando...' : 'Enviando link...');
                  try {
                    if (authMode === 'password') {
                      await loginWithPassword(loginEmail, loginPassword);
                      toast.success('Bem-vindo!', { id: tid });
                    } else {
                      await login(loginEmail);
                      setLinkSent(true);
                      toast.success('Link enviado!', { id: tid });
                    }
                  } catch (err: any) {
                    toast.error(err.message || 'Erro na autenticação.', { id: tid });
                  }
                }}
                className="space-y-4"
              >
                <input type="email" placeholder="seu@email.com" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none" />
                {authMode === 'password' && (
                  <input type="password" placeholder="Sua senha" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none" />
                )}
                <button type="submit" className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-colors shadow-lg">
                  {authMode === 'password' ? 'Entrar' : 'Receber Link'}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-neutral-300 bg-white px-4">Ou continue com</div>
              </div>

              <button
                onClick={async () => {
                  const tid = toast.loading('Conectando ao Google...');
                  try {
                    await loginWithGoogle();
                    toast.success('Bem-vindo!', { id: tid });
                  } catch (err) {
                    toast.error('Erro ao conectar.', { id: tid });
                  }
                }}
                className="w-full py-4 bg-white border border-neutral-100 text-neutral-900 rounded-2xl font-bold shadow-sm hover:bg-neutral-50 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                Google
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 text-sm">Bem-vindo, {user.displayName}</p>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`}
            className="w-10 h-10 rounded-full border border-neutral-200"
            referrerPolicy="no-referrer"
            onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`; }}
          />
          <button 
            onClick={async () => {
              const tid = toast.loading('Saindo...');
              await logout();
              toast.success('Até logo!', { id: tid });
            }} 
            className="p-2 text-neutral-400 hover:text-red-500 transition-colors" 
            title="Sair"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {/* Create Event */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <Plus className="w-6 h-6 text-neutral-900" />
          </div>
          <h2 className="text-xl font-bold mb-2">Novo Evento</h2>
          <p className="text-neutral-500 text-sm mb-6">Crie um novo evento e comece a engajar seu público.</p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Nome do Evento</label>
              <input type="text" value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="Ex: Casamento João e Maria" className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Slug (URL)</label>
              <input type="text" value={newEventSlug} onChange={e => setNewEventSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="Ex: casamento-joao-maria" className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            </div>
          </div>
          <button onClick={createNewEvent} disabled={loading || !newEventName || !newEventSlug} className="w-full px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold disabled:opacity-50">
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6 text-neutral-900" />
          </div>
          <h2 className="text-xl font-bold mb-6">Meus Eventos</h2>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Nenhum evento encontrado</div>
            ) : (
              events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onUpdateStatus={updateStatus}
                  onShare={setSharingEvent}
                  onEdit={openBrandingModal}
                  onDelete={handleDeleteEvent}
                />
              ))
            )}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-neutral-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Segurança da Conta</h2>
              <p className="text-neutral-500 text-sm">Defina uma senha para acessar o painel sem depender de e-mail.</p>
            </div>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newPassword) return;
              setIsUpdatingPassword(true);
              const tid = toast.loading('Atualizando senha...');
              try {
                await updatePassword(newPassword);
                setNewPassword('');
                toast.success('Senha atualizada com sucesso!', { id: tid });
              } catch (err: any) {
                toast.error(err.message || 'Erro ao atualizar senha.', { id: tid });
              } finally {
                setIsUpdatingPassword(false);
              }
            }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <input type="password" placeholder="Nova senha permanente" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="flex-1 p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900" />
            <button type="submit" disabled={isUpdatingPassword || !newPassword} className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold disabled:opacity-50 whitespace-nowrap">
              {isUpdatingPassword ? 'Salvando...' : 'Salvar Senha'}
            </button>
          </form>
        </div>
      </main>

      {/* Modals */}
      <ShareModal event={sharingEvent} onClose={() => setSharingEvent(null)} />
      <BrandingModal
        event={editingEvent}
        form={brandingForm}
        onChange={setBrandingForm}
        onSave={saveBranding}
        onClose={() => setEditingEvent(null)}
        loading={brandingLoading}
        isUploadingSummary={isUploadingSummary}
        summaryFileInputRef={summaryFileInputRef}
        onSummaryUpload={handleSummaryFileUpload}
        onItemFileUpload={handleItemFileUpload}
      />
    </div>
  );
}
