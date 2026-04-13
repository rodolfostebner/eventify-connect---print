import { useState, useEffect, useRef } from 'react';


import { LayoutDashboard, Plus, LogOut, Calendar, Settings, Eye, Trash2, CheckCircle2, Play, Pause, ShieldCheck, Palette, X as CloseIcon, Share2, Copy, Check, Upload, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import type { EventData, ExhibitorSponsor } from '../../types';
import { subscribeToEvents, createEvent, updateEvent, deleteEvent, uploadEventSummary } from '../../services/eventService';
import { User, logout, login, loginWithPassword, updatePassword } from '../../services/authService';

// Types imported from src/types/index.ts

export default function AdminDashboard({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'magic' | 'password'>('password');
  const [linkSent, setLinkSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [sharingEvent, setSharingEvent] = useState<EventData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isUploadingSummary, setIsUploadingSummary] = useState(false);
  const summaryFileInputRef = useRef<HTMLInputElement>(null);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [brandingForm, setBrandingForm] = useState({
    name: '',
    logo_url: '',
    primary_color: '#000000',
    secondary_color: '#ffffff',
    bg_type: 'color' as 'color' | 'gradient' | 'pattern',
    bg_value: '#f5f5f5',
    bg_gradient_from: '#f5f7fa',
    bg_gradient_to: '#c3cfe2',
    bg_pattern_bg: '#f5f5f5',
    bg_pattern_fg: '#e5e5e5',
    tv_bg_type: 'color' as 'color' | 'gradient' | 'pattern',
    tv_bg_value: '#0a0a0a',
    tv_bg_gradient_from: '#0a0a0a',
    tv_bg_gradient_to: '#1a1a1a',
    tv_bg_pattern_bg: '#0a0a0a',
    tv_bg_pattern_fg: '#1a1a1a',
    tv_primary_color: '#ffffff',
    tv_secondary_color: '#000000',
    comment_moderation_enabled: true,
    owner_text: '',
    owner_photo: '',
    post_event_message: '',
    summary_file_url: '',
    has_official_photos: false,
    exhibitors: [] as ExhibitorSponsor[],
    sponsors: [] as ExhibitorSponsor[],
    services: [] as ExhibitorSponsor[],
    date: '',
    custom_comments: [] as string[],
    upload_source: 'both' as 'camera' | 'gallery' | 'both',
    app_description: '',
    app_whatsapp: '',
    app_instagram: '',
    app_website: '',
    app_logo: '',
  });

  useEffect(() => {
    if (!user) return;
    return subscribeToEvents(
      (eventList) => setEvents(eventList),
      (error) => console.error('Error fetching events:', error),
    );
  }, [user]);

  const updateStatus = async (eventId: string, status: 'pre' | 'live' | 'post') => {
    try {
      await updateEvent(eventId, { status });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar status do evento.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      toast.success('Evento excluído com sucesso.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir evento.');
    }
  };

  const openBrandingModal = (event: EventData) => {
    setEditingEvent(event);
    setBrandingForm({
      name: event.name || '',
      logo_url: event.logo_url || '',
      primary_color: event.primary_color || '#000000',
      secondary_color: event.secondary_color || '#ffffff',
      bg_type: event.bg_type || 'color',
      bg_value: event.bg_value || '#f5f5f5',
      bg_gradient_from: event.bg_gradient_from || '#f5f7fa',
      bg_gradient_to: event.bg_gradient_to || '#c3cfe2',
      bg_pattern_bg: event.bg_pattern_bg || '#f5f5f5',
      bg_pattern_fg: event.bg_pattern_fg || '#e5e5e5',
      tv_bg_type: event.tv_bg_type || 'color',
      tv_bg_value: event.tv_bg_value || '#0a0a0a',
      tv_bg_gradient_from: event.tv_bg_gradient_from || '#0a0a0a',
      tv_bg_gradient_to: event.tv_bg_gradient_to || '#1a1a1a',
      tv_bg_pattern_bg: event.tv_bg_pattern_bg || '#0a0a0a',
      tv_bg_pattern_fg: event.tv_bg_pattern_fg || '#1a1a1a',
      tv_primary_color: event.tv_primary_color || '#ffffff',
      tv_secondary_color: event.tv_secondary_color || '#000000',
      comment_moderation_enabled: event.comment_moderation_enabled !== undefined ? event.comment_moderation_enabled : true,
      owner_text: event.owner_text || '',
      owner_photo: event.owner_photo || '',
      post_event_message: event.post_event_message || '',
      summary_file_url: event.summary_file_url || '',
      has_official_photos: event.has_official_photos || false,
      exhibitors: event.exhibitors || [],
      sponsors: event.sponsors || [],
      services: event.services || [],
      date: event.date || '',
      custom_comments: event.custom_comments || [],
      upload_source: event.upload_source || 'both',
      app_description: event.app_description || '',
      app_whatsapp: event.app_whatsapp || '',
      app_instagram: event.app_instagram || '',
      app_website: event.app_website || '',
      app_logo: event.app_logo || ''
    });
  };

  const saveBranding = async () => {
    if (!editingEvent) return;
    setLoading(true);
    try {
      await updateEvent(editingEvent.id, brandingForm);
      setEditingEvent(null);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar personalização.');
    }
    setLoading(false);
  };

  const createDemoEvent = async () => {
    if (!user) return;
    if (!newEventName || !newEventSlug) {
      toast.error('Preencha o nome e o slug do evento.');
      return;
    }
    setLoading(true);
    try {
      await createEvent({
        name: newEventName,
        slug: newEventSlug,
        date: new Date().toISOString(),
        countdown_active: true,
        status: 'pre',
        exhibitors: [
          { id: 'exh_demo_1', name: 'Expositor Alpha', bio: 'Inovação em tecnologia', photo: 'https://picsum.photos/seed/alpha/200' },
          { id: 'exh_demo_2', name: 'Beta Solutions', bio: 'Design e criatividade', photo: 'https://picsum.photos/seed/beta/200' },
        ],
        sponsors: [],
        services: [],
      });
      toast.success(`Evento criado! Acesse /evento/${newEventSlug}`);
      setNewEventName('');
      setNewEventSlug('');
    } catch (e: any) {
      if (e?.message === 'SLUG_TAKEN') {
        toast.error('Este slug já está em uso. Escolha outro.');
      } else {
        console.error(e);
        toast.error('Erro ao criar evento. Verifique as regras de segurança.');
      }
    }
    setLoading(false);
  };

  const handleSummaryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;

    setIsUploadingSummary(true);
    try {
      const url = await uploadEventSummary(editingEvent.id, file);
      setBrandingForm({ ...brandingForm, summary_file_url: url });
      toast.success('Arquivo enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fazer upload do arquivo.');
    } finally {
      setIsUploadingSummary(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-xl shadow-neutral-200 text-center">
          <LayoutDashboard className="w-12 h-12 mx-auto text-neutral-900 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Painel Admin</h1>
          
          {linkSent ? (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-600 mb-4" />
              <h2 className="text-lg font-bold text-green-900 mb-2">Verifique seu e-mail</h2>
              <p className="text-sm text-green-700">Enviamos um link de acesso para <br/><strong>{loginEmail}</strong></p>
              <button 
                onClick={() => setLinkSent(false)} 
                className="mt-6 text-sm font-bold text-green-600 hover:text-green-700 underline"
              >
                Voltar
              </button>
            </div>
          ) : (
            <>
              <div className="flex bg-neutral-100 p-1 rounded-xl mb-8">
                <button 
                  onClick={() => setAuthMode('password')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    authMode === 'password' ? "bg-white shadow-sm" : "text-neutral-500"
                  )}
                >
                  Senha
                </button>
                <button 
                  onClick={() => setAuthMode('magic')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                    authMode === 'magic' ? "bg-white shadow-sm" : "text-neutral-500"
                  )}
                >
                  Link Mágico
                </button>
              </div>

              <p className="text-neutral-500 mb-8 text-sm">
                {authMode === 'password' 
                  ? 'Entre com suas credenciais de administrador.' 
                  : 'Receba um link de acesso no seu e-mail.'}
              </p>

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
                <div className="space-y-4">
                  <input 
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 transition-all outline-none"
                  />
                  {authMode === 'password' && (
                    <input 
                      type="password"
                      placeholder="Sua senha"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm focus:ring-2 focus:ring-neutral-900 transition-all outline-none"
                    />
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-200"
                >
                  {authMode === 'password' ? 'Entrar' : 'Receber Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

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
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`;
            }}
          />
          <button onClick={logout} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Sair">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <Plus className="w-6 h-6 text-neutral-900" />
          </div>
          <h2 className="text-xl font-bold mb-2">Novo Evento</h2>
          <p className="text-neutral-500 text-sm mb-6">Crie um novo evento e comece a engajar seu público.</p>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Nome do Evento</label>
              <input 
                type="text" 
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Ex: Casamento João e Maria"
                className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Slug (URL)</label>
              <input 
                type="text" 
                value={newEventSlug}
                onChange={(e) => setNewEventSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="Ex: casamento-joao-maria"
                className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>
          <button 
            onClick={createDemoEvent}
            disabled={loading || !newEventName || !newEventSlug}
            className="w-full px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="w-6 h-6 text-neutral-900" />
          </div>
          <h2 className="text-xl font-bold mb-6">Meus Eventos</h2>
          
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Nenhum evento encontrado</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4 rounded-2xl border border-neutral-100 bg-neutral-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm">{event.name}</h3>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tighter">/{event.slug}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      event.status === 'pre' ? 'bg-blue-100 text-blue-600' :
                      event.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                      'bg-neutral-200 text-neutral-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(event.id, 'pre')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'pre' ? 'bg-blue-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
                    >
                      <Pause className="w-3 h-3" /> PRE
                    </button>
                    <button 
                      onClick={() => updateStatus(event.id, 'live')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'live' ? 'bg-red-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
                    >
                      <Play className="w-3 h-3" /> LIVE
                    </button>
                    <button 
                      onClick={() => updateStatus(event.id, 'post')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors ${event.status === 'post' ? 'bg-neutral-600 text-white' : 'bg-white text-neutral-600 border border-neutral-200'}`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> POST
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-neutral-200">
                    <button 
                      onClick={() => window.open(`/evento/${event.slug}`, '_blank')}
                      className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> VER APP
                    </button>
                    <button 
                      onClick={() => window.open(`/evento/${event.slug}/tv`, '_blank')}
                      className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1"
                    >
                      <LayoutDashboard className="w-3 h-3" /> TV
                    </button>
                    <button 
                      onClick={() => window.open(`/evento/${event.slug}/moderation`, '_blank')}
                      className="flex-1 py-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-bold text-blue-600 flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" /> CURADORIA
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSharingEvent(event)}
                      className="flex-1 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1 hover:bg-neutral-50"
                    >
                      <Share2 className="w-3 h-3" /> COMPARTILHAR
                    </button>
                    <button 
                      onClick={() => openBrandingModal(event)}
                      className="flex-1 py-2 bg-neutral-100 rounded-lg text-[10px] font-bold text-neutral-600 flex items-center justify-center gap-1 hover:bg-neutral-200"
                    >
                      <Settings className="w-3 h-3" /> CONFIGURAÇÕES
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" /> EXCLUIR
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security / Password section */}
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
            <input 
              type="password"
              placeholder="Nova senha permanente"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
            <button 
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold disabled:opacity-50 whitespace-nowrap"
            >
              {isUpdatingPassword ? 'Salvando...' : 'Salvar Senha'}
            </button>
          </form>
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {sharingEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSharingEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Acesso do Participante</h3>
                <button onClick={() => setSharingEvent(null)}><CloseIcon className="w-6 h-6 text-neutral-400" /></button>
              </div>

              <div className="space-y-6">
                <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 flex flex-col items-center">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/evento/${sharingEvent.slug}`)}`}
                    alt="QR Code"
                    className="w-48 h-48 rounded-2xl shadow-sm mb-4"
                  />
                  <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Aponte a câmera para acessar</p>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Link de Acesso</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly
                      value={`${window.location.origin}/evento/${sharingEvent.slug}`}
                      className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-mono"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/evento/${sharingEvent.slug}`);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <strong>Dica:</strong> Imprima este QR Code e coloque em locais visíveis do evento para que os participantes possam postar fotos e interagir.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Branding Modal */}
      <AnimatePresence>
        {editingEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Personalizar Evento</h3>
                <button onClick={() => setEditingEvent(null)}><CloseIcon className="w-6 h-6 text-neutral-400" /></button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Nome do Evento</label>
                  <input 
                    type="text" 
                    value={brandingForm.name}
                    onChange={(e) => setBrandingForm({...brandingForm, name: e.target.value})}
                    placeholder="Nome do Evento"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Data do Evento</label>
                  <input 
                    type="datetime-local" 
                    value={typeof brandingForm.date === 'string' ? brandingForm.date.slice(0, 16) : ''}
                    onChange={(e) => setBrandingForm({...brandingForm, date: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">URL da Logo</label>
                  <input 
                    type="text" 
                    value={brandingForm.logo_url}
                    onChange={(e) => setBrandingForm({...brandingForm, logo_url: e.target.value})}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Cor Primária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={brandingForm.primary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, primary_color: e.target.value})}
                        className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={brandingForm.primary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, primary_color: e.target.value})}
                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={brandingForm.secondary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, secondary_color: e.target.value})}
                        className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={brandingForm.secondary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, secondary_color: e.target.value})}
                        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <label className="block text-[10px] font-bold uppercase text-neutral-400">Plano de Fundo</label>
                  <div className="flex gap-2">
                    {['color', 'gradient', 'pattern'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setBrandingForm({...brandingForm, bg_type: t as any})}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all",
                          brandingForm.bg_type === t ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 border border-neutral-200"
                        )}
                      >
                        {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                      </button>
                    ))}
                  </div>

                  {brandingForm.bg_type === 'color' && (
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={brandingForm.bg_value}
                        onChange={(e) => setBrandingForm({...brandingForm, bg_value: e.target.value})}
                        className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={brandingForm.bg_value}
                        onChange={(e) => setBrandingForm({...brandingForm, bg_value: e.target.value})}
                        className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  )}

                  {brandingForm.bg_type === 'gradient' && (
                    <div className="space-y-3">
                      <select 
                        value={brandingForm.bg_value}
                        onChange={(e) => setBrandingForm({...brandingForm, bg_value: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                      >
                        <option value="custom">Personalizado</option>
                        <option value="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)">Suave</option>
                        <option value="linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)">Pôr do Sol</option>
                        <option value="linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)">Lavanda</option>
                        <option value="linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)">Oceano</option>
                        <option value="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)">Céu Azul</option>
                      </select>
                      
                      {brandingForm.bg_value === 'custom' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-bold text-neutral-400">De</label>
                            <input 
                              type="color" 
                              value={brandingForm.bg_gradient_from}
                              onChange={(e) => setBrandingForm({...brandingForm, bg_gradient_from: e.target.value})}
                              className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-bold text-neutral-400">Para</label>
                            <input 
                              type="color" 
                              value={brandingForm.bg_gradient_to}
                              onChange={(e) => setBrandingForm({...brandingForm, bg_gradient_to: e.target.value})}
                              className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {brandingForm.bg_type === 'pattern' && (
                    <div className="space-y-3">
                      <select 
                        value={brandingForm.bg_value}
                        onChange={(e) => setBrandingForm({...brandingForm, bg_value: e.target.value})}
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                      >
                        <option value="dots">Pontos</option>
                        <option value="grid">Grade</option>
                        <option value="diagonal">Diagonal</option>
                        <option value="waves">Ondas</option>
                        <option value="circuit">Circuito</option>
                        <option value="hexagons">Hexágonos</option>
                      </select>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-neutral-400">Cor Fundo</label>
                          <input 
                            type="color" 
                            value={brandingForm.bg_pattern_bg}
                            onChange={(e) => setBrandingForm({...brandingForm, bg_pattern_bg: e.target.value})}
                            className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] uppercase font-bold text-neutral-400">Cor Padrão</label>
                          <input 
                            type="color" 
                            value={brandingForm.bg_pattern_fg}
                            onChange={(e) => setBrandingForm({...brandingForm, bg_pattern_fg: e.target.value})}
                            className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 bg-neutral-900 rounded-2xl border border-white/10 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-blue-400" />
                    <label className="block text-[10px] font-bold uppercase text-blue-400">Personalização da TV</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Primária TV</label>
                      <input 
                        type="color" 
                        value={brandingForm.tv_primary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, tv_primary_color: e.target.value})}
                        className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Secundária TV</label>
                      <input 
                        type="color" 
                        value={brandingForm.tv_secondary_color}
                        onChange={(e) => setBrandingForm({...brandingForm, tv_secondary_color: e.target.value})}
                        className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[8px] font-bold uppercase text-neutral-500">Fundo da TV</label>
                    <div className="flex gap-2">
                      {['color', 'gradient', 'pattern'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setBrandingForm({...brandingForm, tv_bg_type: t as any})}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all",
                            brandingForm.tv_bg_type === t ? "bg-blue-500 text-white" : "bg-neutral-800 text-neutral-400 border border-white/5"
                          )}
                        >
                          {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                        </button>
                      ))}
                    </div>

                    {brandingForm.tv_bg_type === 'color' && (
                      <input 
                        type="color" 
                        value={brandingForm.tv_bg_value}
                        onChange={(e) => setBrandingForm({...brandingForm, tv_bg_value: e.target.value})}
                        className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                      />
                    )}

                    {brandingForm.tv_bg_type === 'gradient' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="color" 
                          value={brandingForm.tv_bg_gradient_from}
                          onChange={(e) => setBrandingForm({...brandingForm, tv_bg_gradient_from: e.target.value})}
                          className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                        />
                        <input 
                          type="color" 
                          value={brandingForm.tv_bg_gradient_to}
                          onChange={(e) => setBrandingForm({...brandingForm, tv_bg_gradient_to: e.target.value})}
                          className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                        />
                      </div>
                    )}

                    {brandingForm.tv_bg_type === 'pattern' && (
                      <div className="space-y-2">
                        <select 
                          value={brandingForm.tv_bg_value}
                          onChange={(e) => setBrandingForm({...brandingForm, tv_bg_value: e.target.value})}
                          className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="dots">Pontos</option>
                          <option value="grid">Grade</option>
                          <option value="diagonal">Diagonal</option>
                          <option value="waves">Ondas</option>
                          <option value="circuit">Circuito</option>
                          <option value="hexagons">Hexágonos</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="color" 
                            value={brandingForm.tv_bg_pattern_bg}
                            onChange={(e) => setBrandingForm({...brandingForm, tv_bg_pattern_bg: e.target.value})}
                            className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                          />
                          <input 
                            type="color" 
                            value={brandingForm.tv_bg_pattern_fg}
                            onChange={(e) => setBrandingForm({...brandingForm, tv_bg_pattern_fg: e.target.value})}
                            className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold">Moderação de Comentários</p>
                    <p className="text-[10px] text-neutral-400">Exigir aprovação manual</p>
                  </div>
                  <button 
                    onClick={() => setBrandingForm({...brandingForm, comment_moderation_enabled: !brandingForm.comment_moderation_enabled})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      brandingForm.comment_moderation_enabled ? "bg-green-500" : "bg-neutral-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      brandingForm.comment_moderation_enabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Comentários Padrão (Separados por vírgula)</label>
                  <input 
                    type="text" 
                    value={Array.isArray(brandingForm.custom_comments) ? brandingForm.custom_comments.join(', ') : ''}
                    onChange={(e) => setBrandingForm({...brandingForm, custom_comments: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                    placeholder="Lindo!, Adorei, Que momento!"
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Origem de Upload (Live)</label>
                  <select
                    value={brandingForm.upload_source || 'both'}
                    onChange={(e) => setBrandingForm({...brandingForm, upload_source: e.target.value as any})}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="both">Câmera e Galeria</option>
                    <option value="camera">Apenas Câmera</option>
                    <option value="gallery">Apenas Galeria</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div>
                    <p className="text-xs font-bold">Fotos Oficiais</p>
                    <p className="text-[10px] text-neutral-400">Habilitar seção de fotos da equipe</p>
                  </div>
                  <button 
                    onClick={() => setBrandingForm({...brandingForm, has_official_photos: !brandingForm.has_official_photos})}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      brandingForm.has_official_photos ? "bg-green-500" : "bg-neutral-300"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      brandingForm.has_official_photos ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Nome do App (Menu Lateral)</label>
                    <input 
                      type="text" 
                      value={brandingForm.app_description}
                      onChange={(e) => setBrandingForm({...brandingForm, app_description: e.target.value})}
                      placeholder="Ex: Koala's Memories Hub - Compartilhe seus momentos!"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Logo do App (URL)</label>
                    <input 
                      type="text" 
                      value={brandingForm.app_logo}
                      onChange={(e) => setBrandingForm({...brandingForm, app_logo: e.target.value})}
                      placeholder="https://exemplo.com/app-logo.png"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      value={brandingForm.app_whatsapp}
                      onChange={(e) => setBrandingForm({...brandingForm, app_whatsapp: e.target.value})}
                      placeholder="WhatsApp App"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <input 
                      type="text" 
                      value={brandingForm.app_instagram}
                      onChange={(e) => setBrandingForm({...brandingForm, app_instagram: e.target.value})}
                      placeholder="Instagram App"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                    />
                    <input 
                      type="text" 
                      value={brandingForm.app_website}
                      onChange={(e) => setBrandingForm({...brandingForm, app_website: e.target.value})}
                      placeholder="Site App"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Sobre o Dono/Evento</label>
                    <textarea 
                      value={brandingForm.owner_text}
                      onChange={(e) => setBrandingForm({...brandingForm, owner_text: e.target.value})}
                      placeholder="Conte um pouco sobre você ou sobre o evento..."
                      rows={4}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Foto/Logo do Dono (URL)</label>
                    <input 
                      type="text" 
                      value={brandingForm.owner_photo}
                      onChange={(e) => setBrandingForm({...brandingForm, owner_photo: e.target.value})}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Mensagem Pós-Evento</label>
                    <textarea 
                      value={brandingForm.post_event_message}
                      onChange={(e) => setBrandingForm({...brandingForm, post_event_message: e.target.value})}
                      placeholder="Mensagem de agradecimento para a página de encerramento..."
                      rows={3}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Arquivo de Resumo do Evento (PDF)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file"
                        accept=".pdf,application/pdf"
                        ref={summaryFileInputRef}
                        onChange={handleSummaryFileUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => summaryFileInputRef.current?.click()}
                        disabled={isUploadingSummary}
                        className="flex-1 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                      >
                        {isUploadingSummary ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {brandingForm.summary_file_url ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                      </button>
                      
                      {brandingForm.summary_file_url && (
                        <button
                          onClick={() => setBrandingForm({ ...brandingForm, summary_file_url: '' })}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {brandingForm.summary_file_url && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-[10px] text-green-700 font-medium truncate flex-1">
                          Arquivo pronto para download
                        </span>
                        <a 
                          href={brandingForm.summary_file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-green-700 underline"
                        >
                          Ver
                        </a>
                      </div>
                    )}
                    <p className="text-[10px] text-neutral-400 mt-2">Este arquivo será disponibilizado como lembrança ao final do evento.</p>
                  </div>
                </div>

                {/* Exhibitors, Sponsors & Services Management */}
                {['exhibitors', 'sponsors', 'services'].map((type) => (
                  <div key={type} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase text-neutral-400">
                        {type === 'exhibitors' ? 'Expositores' : type === 'sponsors' ? 'Patrocinadores' : 'Serviços'}
                      </label>
                      <button 
                        onClick={() => {
                          const newItem: ExhibitorSponsor = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: '',
                            bio: '',
                            socials: { instagram: '', whatsapp: '', website: '' }
                          };
                          setBrandingForm({
                            ...brandingForm,
                            [type]: [...(brandingForm as any)[type], newItem]
                          });
                        }}
                        className="p-1 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.isArray((brandingForm as any)[type]) && (brandingForm as any)[type].map((item: ExhibitorSponsor, index: number) => (
                        <div key={item.id} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3 relative">
                          <button 
                            onClick={() => {
                              const newList = [...(brandingForm as any)[type]];
                              newList.splice(index, 1);
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <input 
                            type="text" 
                            value={item.name}
                            onChange={(e) => {
                              const newList = [...(brandingForm as any)[type]];
                              newList[index].name = e.target.value;
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            placeholder="Nome"
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                          />
                          
                          <input 
                            type="text" 
                            value={item.logo || ''}
                            onChange={(e) => {
                              const newList = [...(brandingForm as any)[type]];
                              newList[index].logo = e.target.value;
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            placeholder="URL da Logo"
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                          />

                          <input 
                            type="text" 
                            value={item.photo || ''}
                            onChange={(e) => {
                              const newList = [...(brandingForm as any)[type]];
                              newList[index].photo = e.target.value;
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            placeholder="URL da Foto de Destaque"
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                          />
                          
                          <textarea 
                            value={item.bio}
                            onChange={(e) => {
                              const newList = [...(brandingForm as any)[type]];
                              newList[index].bio = e.target.value;
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            placeholder="Breve descrição..."
                            rows={2}
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs resize-none"
                          />

                          <textarea 
                            value={item.message || ''}
                            onChange={(e) => {
                              const newList = [...(brandingForm as any)[type]];
                              newList[index].message = e.target.value;
                              setBrandingForm({ ...brandingForm, [type]: newList });
                            }}
                            placeholder="Mensagem específica para os participantes..."
                            rows={2}
                            className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs resize-none"
                          />

                          <div className="grid grid-cols-3 gap-2">
                            <input 
                              type="text" 
                              value={item.socials?.instagram || ''}
                              onChange={(e) => {
                                const newList = [...(brandingForm as any)[type]];
                                newList[index].socials = { ...newList[index].socials, instagram: e.target.value };
                                setBrandingForm({ ...brandingForm, [type]: newList });
                              }}
                              placeholder="Instagram"
                              className="bg-white border border-neutral-200 rounded-xl px-2 py-1.5 text-[10px]"
                            />
                            <input 
                              type="text" 
                              value={item.socials?.whatsapp || ''}
                              onChange={(e) => {
                                const newList = [...(brandingForm as any)[type]];
                                newList[index].socials = { ...newList[index].socials, whatsapp: e.target.value };
                                setBrandingForm({ ...brandingForm, [type]: newList });
                              }}
                              placeholder="WhatsApp"
                              className="bg-white border border-neutral-200 rounded-xl px-2 py-1.5 text-[10px]"
                            />
                            <input 
                              type="text" 
                              value={item.socials?.website || ''}
                              onChange={(e) => {
                                const newList = [...(brandingForm as any)[type]];
                                newList[index].socials = { ...newList[index].socials, website: e.target.value };
                                setBrandingForm({ ...brandingForm, [type]: newList });
                              }}
                              placeholder="Website"
                              className="bg-white border border-neutral-200 rounded-xl px-2 py-1.5 text-[10px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-3">Preview</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: brandingForm.primary_color }}>
                      <Eye className="w-5 h-5" style={{ color: brandingForm.secondary_color }} />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                      <div className="h-full" style={{ width: '60%', backgroundColor: brandingForm.primary_color }} />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={saveBranding}
                  disabled={loading}
                  className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
