import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../../services/authService';
import { login, logout, loginWithGoogle } from '../../services/authService';
import { Loader2, Camera, Heart, MessageCircle, Clock, Users, Trophy, Send, X, Image as ImageIcon, LogOut, User as UserIcon, Flame, Star, Menu, Instagram, Globe, Phone, Trash2, Check, Briefcase, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData, ExhibitorSponsor, PhotoComment } from '../../types';
import { subscribeToEvent } from '../../services/eventService';
import { createPrintOrder } from '../../services/printService';
import { createNotification } from '../../services/notificationService';
import { cn } from '../../lib/utils';
import { PreEventView } from './PreEventView';
import { LiveEventView } from './LiveEventView';
import { PostEventView } from './PostEventView';
import { PartnerSection } from './components/PartnerSection';
import { SocialLinks } from './components/SocialLinks';

// Types are imported from src/types/index.ts

// Local component prop interfaces removed

export default function EventPage({ user }: { user: User | null }) {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
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
    window.dispatchEvent(new Event('push_notifications_toggled'));

    if (newValue) {
      toast.success('Notificações ativadas!');
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    } else {
      toast.info('Notificações desativadas.');
    }
  };

  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPrintPhotos(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      }
      if (prev.length >= 10) {
        toast.error('Você já selecionou 10 fotos!');
        return prev;
      }
      return [...prev, photoId];
    });
  }, []);

  const handleSubmitPrintOrder = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    if (selectedPrintPhotos.length !== 10) {
      toast.error('Selecione exatamente 10 fotos para o seu álbum!');
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
    console.log('EventPage User State:', user ? `Logado como ${user.displayName}` : 'Não logado');
  }, [user]);

  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(
      slug,
      (ev) => {
        if (ev) {
          setEvent((prev) => {
            if (prev && prev.status !== ev.status) {
              toast.info(`Status do evento alterado para: ${ev.status.toUpperCase()}`);
            }
            return ev;
          });
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

  const handleLogin = useCallback(() => {
    setIsLoginViewOpen(true);
    setLinkSent(false);
  }, []);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    const toastId = toast.loading('Enviando link...');
    try {
      await login(loginEmail);
      setLinkSent(true);
      toast.success('Link enviado! Verifique seu e-mail.', { id: toastId });
    } catch (err: any) {
      console.error('Erro no login:', err);
      toast.error('Erro ao enviar link. Tente novamente.', { id: toastId });
    }
  };

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

    if (type === 'pattern') {
      const bg = event.bg_pattern_bg || '#f5f5f5';
      const fg = event.bg_pattern_fg || '#0000001a';

      let patternStyle = '';
      switch (value) {
        case 'dots':
          patternStyle = `radial-gradient(${fg} 1px, transparent 1px)`;
          return { backgroundColor: bg, backgroundImage: patternStyle, backgroundSize: '20px 20px' };
        case 'grid':
          patternStyle = `linear-gradient(${fg} 1px, transparent 1px), linear-gradient(90deg, ${fg} 1px, transparent 1px)`;
          return { backgroundColor: bg, backgroundImage: patternStyle, backgroundSize: '40px 40px' };
        case 'diagonal':
          patternStyle = `linear-gradient(45deg, ${fg} 25%, transparent 25%, transparent 50%, ${fg} 50%, ${fg} 75%, transparent 75%, transparent)`;
          return { backgroundColor: bg, backgroundImage: patternStyle, backgroundSize: '20px 20px' };
        case 'waves':
          patternStyle = `radial-gradient(circle at 100% 50%, transparent 20%, ${fg} 21%, ${fg} 34%, transparent 35%, transparent), radial-gradient(circle at 0% 50%, transparent 20%, ${fg} 21%, ${fg} 34%, transparent 35%, transparent)`;
          return { backgroundColor: bg, backgroundImage: patternStyle, backgroundSize: '40px 40px' };
        case 'circuit':
          patternStyle = `linear-gradient(90deg, ${fg} 1px, transparent 1px), linear-gradient(${fg} 1px, transparent 1px)`;
          return { backgroundColor: bg, backgroundImage: patternStyle, backgroundSize: '100px 100px', opacity: 0.1 };
        case 'hexagons':
          return { backgroundColor: bg, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath fill='${encodeURIComponent(fg)}' fill-opacity='0.4' d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9l11-6.35 11 6.35v12.7l-11 6.35L3 30.6V17.9z'/%3E%3C/svg%3E")` };
        default:
          return { backgroundColor: bg };
      }
    }
    return { backgroundColor: '#f5f5f5' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mb-4" />
        <p className="text-neutral-500 font-medium">Carregando evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ops!</h1>
        <p className="text-neutral-600">{error || 'Evento não encontrado'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-all duration-500 font-sans text-neutral-900" style={getBackgroundStyle()}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200 px-4 py-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors mt-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-start gap-1">
            {event.logo_url && (
              <img src={event.logo_url} alt="Logo" className="max-h-24 w-auto object-contain" referrerPolicy="no-referrer" />
            )}
            <h1 className="font-bold text-sm sm:text-base tracking-tight line-clamp-2 max-w-[180px] sm:max-w-xs">{event.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold uppercase text-neutral-400 leading-none">Logado como</p>
                <p className="text-xs font-bold text-neutral-900">{user.displayName || 'Participante'}</p>
              </div>
              <button
                onClick={togglePushNotifications}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  pushEnabled ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                )}
                title={pushEnabled ? "Desativar notificações" : "Ativar notificações"}
              >
                {pushEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'P'}&background=random`}
                className="w-8 h-8 rounded-full border border-neutral-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'P'}&background=random`;
                }}
              />
              <button onClick={logout} className="p-1 text-neutral-400 hover:text-red-500 transition-colors" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-neutral-400 hidden sm:block">Visitante</span>
              <button
                onClick={handleLogin}
                className="text-[10px] font-bold uppercase px-3 py-1 bg-neutral-900 text-white rounded-full"
              >
                Entrar
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar (Exhibitors & Sponsors) */}
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
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm z-[70] bg-white shadow-2xl overflow-y-auto custom-scrollbar"
            >
              <div className="p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Menu</h2>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* App Info Section */}
                <section className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <span className="text-xl">🐨</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-black">Koala's Memories Hub</h2>
                      <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Plataforma de Eventos</p>
                    </div>
                  </div>
                  {event.app_description && (
                    <p className="text-xs text-neutral-600 leading-relaxed">{event.app_description}</p>
                  )}
                  {(event.app_whatsapp || event.app_instagram || event.app_website) && (
                    <SocialLinks 
                      whatsapp={event.app_whatsapp}
                      instagram={event.app_instagram}
                      website={event.app_website}
                      buttonClassName="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 transition-colors"
                    />
                  )}
                </section>

                {/* Album Selection Info Section */}
                {event.status === 'live' && (
                  <section className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black">Monte seu Álbum</h2>
                        <p className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Recordação do Evento</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      Selecione as suas <strong>10 fotos favoritas</strong> da galeria para imprimir em uma folha A4 de adesivos, perfeita para montar seu álbum físico de recordações!
                    </p>

                    <p className="text-xs text-neutral-500 italic bg-white p-3 rounded-xl border border-neutral-100">
                      O valor de cada opção pode ser consultado no estande da plataforma no evento.
                    </p>

                    <div className="space-y-2">
                      {[
                        { id: 'photos_only', label: 'Apenas fotos (10 adesivos)', icon: '📸' },
                        { id: 'photos_album', label: 'Fotos + Álbum físico', icon: '📖' },
                        { id: 'photos_album_stickers', label: 'Fotos + Álbum + Stickers', icon: '✨' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setPrintOption(opt.id as any)}
                          className={cn(
                            "w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between text-left",
                            printOption === opt.id ? "border-neutral-900 bg-white" : "border-transparent bg-white hover:border-neutral-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{opt.icon}</span>
                            <span className="text-xs font-bold">{opt.label}</span>
                          </div>
                          {printOption === opt.id && <div className="w-4 h-4 bg-neutral-900 rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white" /></div>}
                        </button>
                      ))}
                    </div>

                    {!isSelectingForPrint ? (
                      <button
                        onClick={() => {
                          setIsSelectingForPrint(true);
                          setIsSidebarOpen(false);
                        }}
                        className="w-full py-3 bg-neutral-900 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all"
                      >
                        Começar Seleção (0/10)
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-100">
                          <span className="text-xs font-bold">Selecionadas: {selectedPrintPhotos.length}/10</span>
                          <button
                            onClick={() => {
                              setIsSelectingForPrint(false);
                              setSelectedPrintPhotos([]);
                            }}
                            className="text-[10px] font-bold text-red-500"
                          >
                            Cancelar
                          </button>
                        </div>
                        <button
                          onClick={handleSubmitPrintOrder}
                          disabled={selectedPrintPhotos.length !== 10 || isSubmittingPrint}
                          className="w-full py-3 bg-green-600 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isSubmittingPrint ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Pedido'}
                        </button>
                      </div>
                    )}
                  </section>
                )}

                <div className="pt-4 border-t border-neutral-100">
                  <h2 className="text-xl font-black mb-6">Parceiros</h2>
                  <div className="space-y-12">
                     <PartnerSection title="Expositores" items={event.exhibitors || []} icon={<Users className="w-4 h-4" />} />
                     <PartnerSection title="Patrocinadores" items={event.sponsors || []} icon={<Star className="w-4 h-4" />} />
                     <PartnerSection title="Serviços" items={event.services || []} icon={<Briefcase className="w-4 h-4" />} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-md mx-auto pb-24">
        {/* Owner Text Area */}
        {(event.owner_text || event.owner_photo) && (
          <div className="px-6 py-8 text-center space-y-6">
            {event.owner_photo ? (
              <div className="inline-block mx-auto rounded-[32px] overflow-hidden shadow-xl border-4 border-white max-w-[80%]">
                <img src={event.owner_photo} className="w-full h-auto object-contain" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="inline-block p-2 bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                <UserIcon className="w-6 h-6 text-neutral-400" />
              </div>
            )}
            {event.owner_text && (
              <p className="text-sm text-neutral-600 leading-relaxed font-medium italic max-w-xs mx-auto">
                "{event.owner_text}"
              </p>
            )}
            <div className="w-12 h-1 bg-neutral-200 mx-auto rounded-full" />
          </div>
        )}
        {event.status === 'pre' && <PreEventView event={event} />}
        {event.status === 'live' && <LiveEventView
          event={event}
          user={user}
          onLogin={handleLogin}
          isSelectingForPrint={isSelectingForPrint}
          selectedPrintPhotos={selectedPrintPhotos}
          togglePhotoSelection={togglePhotoSelection}
        />}
        {event.status === 'post' && <PostEventView event={event} user={user} onLogin={handleLogin} />}
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginViewOpen && !user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <button
                onClick={() => setIsLoginViewOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
                  <span className="text-3xl">🐨</span>
                </div>
                <h2 className="text-2xl font-black mb-2">Bem-vindo!</h2>

                {linkSent ? (
                  <div className="space-y-6 py-4">
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                      <p className="text-sm text-green-700 font-medium">
                        Link enviado para:<br />
                        <strong className="text-green-900">{loginEmail}</strong>
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Clique no link que enviamos para o seu e-mail para entrar automaticamente.
                    </p>
                    <button
                      onClick={() => setLinkSent(false)}
                      className="text-xs font-bold text-neutral-400 hover:text-neutral-900 underline"
                    >
                      Usar outro e-mail
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-neutral-500 text-sm mb-8">
                      Para participar, enviar fotos e comentar, entre com sua conta Google.
                    </p>
                    <button
                      onClick={async () => {
                        const tid = toast.loading('Redirecionando para o Google...');
                        try {
                          await loginWithGoogle();
                        } catch (err) {
                          toast.error('Erro ao conectar com Google.', { id: tid });
                        }
                      }}
                      className="w-full py-4 bg-white border border-neutral-200 text-neutral-900 rounded-2xl font-bold shadow-sm hover:bg-neutral-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                      Entrar com Google
                    </button>
                    <p className="text-[10px] text-neutral-400 mt-6 uppercase tracking-widest font-bold">
                      Identificação Nominal Automática
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}