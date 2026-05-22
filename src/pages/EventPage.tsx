import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginWithMagicLink } from '../services/authService';
import { useAuth, BETA_MODE } from '../hooks/useAuth';
import type { AppUser } from '../types';
import { Loader2, X, LogOut, User as UserIcon, Menu, Instagram, Globe, Phone, Check, Bell, BellOff, Star, Users, Briefcase, Mail, CheckCircle2, Store, Settings2, LayoutDashboard, ClipboardList, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { createPrintOrder } from '../services/printService';
import { getExhibitors } from '../services/exhibitorService';
import { getPartners } from '../services/partnerService';
import { trackVisit } from '../services/visitService';
import { cn } from '../lib/utils';
import type { Exhibitor, Partner } from '../types';

// Modular Components
import { LiveEventView } from '../features/event/components/LiveEventView';
import { PreEventView } from '../features/event/components/PreEventView';
import { PostEventView } from '../features/event/components/PostEventView';
import { PartnerSection } from '../features/event/components/PartnerSection';
import type { SocialLinkType } from '../features/event/components/SocialLinks';

function LoginModal({ onClose }: { onClose: () => void }) {
  const { loginBeta } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleBetaLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      const u = await loginBeta(email.trim());
      if (u) onClose();
      else toast.error('Erro ao autenticar. Tente novamente.');
    } catch {
      toast.error('Erro ao autenticar. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await loginWithMagicLink(email.trim());
      setSent(true);
    } catch {
      toast.error('Erro ao enviar link. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative p-8 md:p-10"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-neutral-50 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl text-3xl">🐨</div>
        <h2 className="text-2xl font-black tracking-tighter mb-2 text-center">Bem-vindo!</h2>
        <p className="text-neutral-400 text-sm font-medium mb-8 leading-relaxed text-center">
          Entre para participar, enviar fotos e interagir em tempo real.
        </p>

        {BETA_MODE ? (
          <form onSubmit={handleBetaLogin} className="space-y-3">
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none"
            />
            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl font-black text-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {sending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        ) : sent ? (
          <div className="bg-green-50 rounded-2xl p-5 text-center space-y-2 border border-green-100">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
            <p className="font-bold text-green-900 text-sm">Link enviado!</p>
            <p className="text-xs text-green-700">Verifique <strong>{email}</strong></p>
            <button onClick={() => setSent(false)} className="text-xs text-green-600 hover:text-green-700 underline">Voltar</button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={async () => {
                try { await loginWithGoogle(); } catch { toast.error('Erro ao conectar.'); }
              }}
              className="w-full py-3.5 bg-white border-2 border-neutral-100 text-neutral-900 rounded-xl font-black shadow-sm hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm"
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
            <form onSubmit={handleMagicLink} className="space-y-2">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 outline-none"
              />
              <button
                type="submit"
                disabled={sending || !email.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl font-black text-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {sending ? 'Enviando...' : 'Receber link por e-mail'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}

const ROLE_PORTAL: Record<string, { label: string; path: string; icon: React.ElementType }> = {
  expositor:   { label: 'Editar meu Stand',           path: '/expositor',  icon: Store },
  event_admin: { label: 'Administrar Evento',          path: '/eventadmin', icon: Settings2 },
  admin:       { label: 'Administração Geral',         path: '/',           icon: LayoutDashboard },
  avaliador:   { label: 'Avaliação de Expositores',    path: '/avaliador',  icon: ClipboardList },
};

export default function EventPage({ user }: { user: AppUser | null }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginViewOpen, setIsLoginViewOpen] = useState(false);

  // Photo Selection for Printing
  const [isSelectingForPrint, setIsSelectingForPrint] = useState(false);
  const [selectedPrintPhotos, setSelectedPrintPhotos] = useState<string[]>([]);
  const [printOption, setPrintOption] = useState<'photos_only' | 'photos_album' | 'photos_album_stickers'>('photos_only');
  const [isSubmittingPrint, setIsSubmittingPrint] = useState(false);

  const [dbExhibitors, setDbExhibitors] = useState<Exhibitor[]>([]);
  const [dbSponsors, setDbSponsors] = useState<Partner[]>([]);

  const [pushEnabled, setPushEnabled] = useState(() => {
    return localStorage.getItem('push_notifications_enabled') === 'true';
  });

  const togglePushNotifications = () => {
    const newValue = !pushEnabled;
    setPushEnabled(newValue);
    localStorage.setItem('push_notifications_enabled', String(newValue));
    if (newValue) {
      toast.success('Notificações ativadas!');
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    } else {
      toast.info('Notificações desativadas.');
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPrintPhotos(prev => {
      if (prev.includes(photoId)) return prev.filter(id => id !== photoId);
      if (prev.length >= 10) {
        toast.error('Você já selecionou 10 fotos!');
        return prev;
      }
      return [...prev, photoId];
    });
  };

  const handleSubmitPrintOrder = async () => {
    if (!user) {
      setIsLoginViewOpen(true);
      return;
    }
    if (selectedPrintPhotos.length !== 10) {
      toast.error('Selecione exatamente 10 fotos!');
      return;
    }
    setIsSubmittingPrint(true);
    try {
      await createPrintOrder({
        eventId: event?.id ?? '',
        userId: user.id,
        userName: user.display_name || 'Anônimo',
        userEmail: user.email ?? undefined,
        photoIds: selectedPrintPhotos,
        option: printOption,
      });
      toast.success('Pedido de impressão enviado com sucesso!');
      setIsSelectingForPrint(false);
      setSelectedPrintPhotos([]);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar pedido.');
    } finally {
      setIsSubmittingPrint(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(
      slug,
      (ev) => {
        if (ev) {
          setEvent(ev);
          setError(null);
          localStorage.setItem('last_event_slug', ev.slug);
        } else {
          setError('Evento não encontrado');
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError('Erro ao carregar evento');
        setLoading(false);
      },
    );
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    getExhibitors(event.id).then(setDbExhibitors).catch(() => {});
    getPartners(event.id).then(setDbSponsors).catch(() => {});
  }, [event?.id]);

  const exhibitorItems = dbExhibitors.map(ex => ({
    id: ex.id,
    name: ex.name,
    logo: ex.logo_url ?? undefined,
    photo: ex.photo_url ?? undefined,
    bio: ex.description ?? '',
    message: ex.message ?? undefined,
    final_message: ex.final_message ?? undefined,
    socials: {
      instagram: ex.instagram_url ?? undefined,
      whatsapp: ex.whatsapp ?? undefined,
      website: ex.website_url ?? undefined,
    },
  }));

  const sponsorItems = dbSponsors.map(s => ({
    id: s.id,
    name: s.name,
    bio: s.description ?? '',
    photos: s.photos,
    socials: {
      instagram: s.instagram_url ?? undefined,
      whatsapp: s.whatsapp ?? undefined,
      website: s.website_url ?? undefined,
    },
  }));

  const handleLogin = () => setIsLoginViewOpen(true);

  const handleSidebarExhibitorSocialClick = useCallback(
    (item: { id?: string }, type: SocialLinkType) => {
      if (!item.id || !event) return;
      void trackVisit({
        eventId: event.id,
        exhibitorId: item.id,
        userId: user?.id,
        action: `click_${type}` as const,
        eventStatus: event.status,
      });
    },
    [event?.id, event?.status, user?.id],
  );

  const getBackgroundStyle = () => {
    if (!event) return {};
    const type = event.bg_type || 'color';
    const value = event.bg_value || '#f5f5f5';

    if (type === 'color') return { backgroundColor: value };
    if (type === 'gradient') {
      if (value === 'custom') {
        const from = event.bg_gradient_from || '#f5f7fa';
        const to = event.bg_gradient_to || '#c3cfe2';
        return { background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` };
      }
      return { background: value };
    }
    return { backgroundColor: '#f5f5f5' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
      <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
      <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Carregando evento...</p>
    </div>
  );

  if (error || !event) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
      <h1 className="text-2xl font-black text-neutral-900 mb-2">Ops!</h1>
      <p className="text-neutral-600 font-medium">{error || 'Evento não encontrado'}</p>
    </div>
  );

  return (
    <div className="min-h-screen transition-all duration-700 font-sans text-neutral-900" style={getBackgroundStyle()}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            {event.logo_url && (
              <img src={event.logo_url} alt="Logo" className="max-h-8 w-auto object-contain mb-1" referrerPolicy="no-referrer" />
            )}
            <h1 className="font-black text-sm tracking-tight line-clamp-1">{event.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePushNotifications}
                className={cn(
                  "p-2 rounded-full transition-all duration-300",
                  pushEnabled ? "bg-neutral-900 text-white shadow-lg" : "bg-neutral-50 text-neutral-300 hover:text-neutral-500"
                )}
              >
                {pushEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <img
                src={user.photo_url || `https://ui-avatars.com/api/?name=${user.display_name || 'P'}&background=random`}
                className="w-9 h-9 rounded-full border-2 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={async () => {
                  const tid = toast.loading('Saindo...');
                  await logout();
                  toast.success('Até logo!', { id: tid });
                }} 
                className="p-2 text-neutral-300 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-neutral-900 text-white rounded-full shadow-lg active:scale-95 transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] md:w-[400px] max-w-lg z-[70] bg-white shadow-2xl overflow-y-auto no-scrollbar rounded-r-2xl"
            >
              <div className="p-8 space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tighter">Menu</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <section className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-100 space-y-6">
                   <div className="flex items-center gap-4">
                    {event.app_logo ? (
                      <img src={event.app_logo} className="w-12 h-12 rounded-2xl object-cover shadow-xl" />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl text-2xl">🐨</div>
                    )}
                    <div>
                      <h2 className="text-lg font-black tracking-tight">Memories Hub</h2>
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">By Koala's</p>
                    </div>
                  </div>
                  {event.app_description && (
                    <p className="text-xs text-neutral-500 leading-relaxed font-medium">{event.app_description}</p>
                  )}
                  {event.app_instagram || event.app_whatsapp || event.app_website ? (
                    <div className="flex gap-3 pt-2">
                       {event.app_instagram && <a href={`https://instagram.com/${event.app_instagram.replace('@','')}`} target="_blank" className="p-2 bg-white rounded-full border border-neutral-100 shadow-sm"><Instagram className="w-4 h-4" /></a>}
                       {event.app_whatsapp && <a href={`https://wa.me/${event.app_whatsapp}`} target="_blank" className="p-2 bg-white rounded-full border border-neutral-100 shadow-sm"><Phone className="w-4 h-4" /></a>}
                       {event.app_website && <a href={event.app_website} target="_blank" className="p-2 bg-white rounded-full border border-neutral-100 shadow-sm"><Globe className="w-4 h-4" /></a>}
                    </div>
                  ) : null}
                </section>

                {/* Acesso rápido por role */}
                {user && ROLE_PORTAL[user.role] && (() => {
                  const { label, path, icon: Icon } = ROLE_PORTAL[user.role];
                  return (
                    <button
                      onClick={() => { navigate(path); setIsSidebarOpen(false); }}
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-neutral-900 text-white rounded-2xl font-black text-sm shadow-lg active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 shrink-0" />
                        {label}
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                    </button>
                  );
                })()}

                {/* Printing Options - MOVED UP */}
                {event.status === 'live' && (
                  <section className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-100 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      </div>
                      <h2 className="text-lg font-black tracking-tight">Monte seu Álbum</h2>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: 'photos_only', label: 'Apenas fotos (10 adesivos)', icon: '📸' },
                        { id: 'photos_album', label: 'Fotos + Álbum físico', icon: '📖' },
                        { id: 'photos_album_stickers', label: 'Fotos + Álbum + Stickers', icon: '✨' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPrintOption(opt.id as any)}
                          className={cn(
                            "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                            printOption === opt.id ? "border-neutral-900 bg-white" : "border-transparent bg-white hover:border-neutral-200"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{opt.icon}</span>
                            <span className="text-xs font-black">{opt.label}</span>
                          </div>
                          {printOption === opt.id && <Check className="w-4 h-4 text-neutral-900" />}
                        </button>
                      ))}
                    </div>

                    {!isSelectingForPrint ? (
                      <button
                        onClick={() => {
                          setIsSelectingForPrint(true);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full py-4 bg-neutral-900 text-white rounded-xl font-black text-xs shadow-xl active:scale-95 transition-all"
                      >
                        Começar Seleção (0/10)
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitPrintOrder}
                        disabled={selectedPrintPhotos.length !== 10 || isSubmittingPrint}
                        className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmittingPrint ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Pedido'}
                      </button>
                    )}
                  </section>
                )}

                {/* Partners in Sidebar */}
                <section className="space-y-6 px-2">
                  <PartnerSection
                    title="Expositores"
                    items={exhibitorItems}
                    icon={<Users className="w-4 h-4" />}
                    columns={1}
                    onItemSocialClick={handleSidebarExhibitorSocialClick}
                  />
                  <PartnerSection
                    title="Patrocinadores"
                    items={sponsorItems}
                    icon={<Star className="w-4 h-4" />}
                    columns={1}
                  />
                  <PartnerSection
                    title="Serviços"
                    items={event.services || []}
                    icon={<Briefcase className="w-4 h-4" />}
                    columns={1}
                  />
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto pb-24 md:pb-32">
        {/* Owner Section */}
        {(event.owner_text || event.owner_photo) && (
          <div className="px-8 py-12 text-center space-y-8">
            {event.owner_photo && (
              <div className="inline-block rounded-2xl overflow-hidden shadow-xl border-4 md:border-8 border-white max-w-[85%]">
                <img src={event.owner_photo} className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            {event.owner_text && (
              <p className="text-sm text-neutral-500 leading-relaxed font-bold italic max-w-xs mx-auto">
                "{event.owner_text}"
              </p>
            )}
          </div>
        )}

        {event.status === 'pre' && <PreEventView event={event} user={user} />}
        {event.status === 'live' && (
          <LiveEventView
            event={event}
            user={user}
            onLogin={handleLogin}
            isSelectingForPrint={isSelectingForPrint}
            selectedPrintPhotos={selectedPrintPhotos}
            togglePhotoSelection={togglePhotoSelection}
          />
        )}
        {event.status === 'post' && <PostEventView event={event} user={user} onLogin={handleLogin} />}
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginViewOpen && !user && (
          <LoginModal onClose={() => setIsLoginViewOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
