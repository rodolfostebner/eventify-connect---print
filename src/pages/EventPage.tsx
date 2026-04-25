import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../services/authService';
import { login, logout, loginWithGoogle } from '../services/authService';
import { Loader2, X, LogOut, User as UserIcon, Menu, Instagram, Globe, Phone, Check, Bell, BellOff, Star, Users, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { createPrintOrder } from '../services/printService';
import { cn } from '../lib/utils';

// Modular Components
import { LiveEventView } from '../features/event/components/LiveEventView';
import { PreEventView } from '../features/event/components/PreEventView';
import { PostEventView } from '../features/event/components/PostEventView';
import { PartnerSection } from '../features/event/components/PartnerSection';

export default function EventPage({ user }: { user: User | null }) {
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
        userId: user.uid,
        userName: user.displayName || 'Anônimo',
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

  const handleLogin = () => setIsLoginViewOpen(true);

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
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'P'}&background=random`}
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
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-[70] bg-white shadow-2xl overflow-y-auto no-scrollbar"
            >
              <div className="p-8 space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tighter">Menu</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <section className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 space-y-6">
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

                {/* Printing Options - MOVED UP */}
                {event.status === 'live' && (
                  <section className="bg-neutral-50 rounded-[32px] p-8 border border-neutral-100 space-y-8">
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
                            "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
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
                        className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all"
                      >
                        Começar Seleção (0/10)
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitPrintOrder}
                        disabled={selectedPrintPhotos.length !== 10 || isSubmittingPrint}
                        className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
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
                    items={event.exhibitors || []} 
                    icon={<Users className="w-4 h-4" />} 
                  />
                  <PartnerSection 
                    title="Patrocinadores" 
                    items={event.sponsors || []} 
                    icon={<Star className="w-4 h-4" />} 
                  />
                  <PartnerSection 
                    title="Serviços" 
                    items={event.services || []} 
                    icon={<Briefcase className="w-4 h-4" />} 
                  />
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-md mx-auto pb-24">
        {/* Owner Section */}
        {(event.owner_text || event.owner_photo) && (
          <div className="px-8 py-12 text-center space-y-8">
            {event.owner_photo && (
              <div className="inline-block rounded-[40px] overflow-hidden shadow-2xl border-[10px] border-white max-w-[85%] rotate-2">
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

        {event.status === 'pre' && <PreEventView event={event} />}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl relative p-10 text-center"
            >
              <button onClick={() => setIsLoginViewOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-neutral-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 bg-neutral-900 rounded-[32px] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl text-4xl">🐨</div>
              <h2 className="text-3xl font-black tracking-tighter mb-4">Bem-vindo!</h2>
              <p className="text-neutral-400 text-sm font-medium mb-10 leading-relaxed">
                Entre com sua conta Google para participar, enviar fotos e interagir em tempo real.
              </p>

              <button
                onClick={async () => {
                  const tid = toast.loading('Conectando ao Google...');
                  try {
                    await loginWithGoogle();
                  } catch (err) {
                    toast.error('Erro ao conectar.', { id: tid });
                  }
                }}
                className="w-full py-5 bg-white border-2 border-neutral-100 text-neutral-900 rounded-2xl font-black shadow-lg hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Entrar com Google
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
