import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { User } from '../services/authService';
import { login, logout, loginWithGoogle } from '../services/authService';
import { Loader2, Camera, Heart, MessageCircle, Clock, Users, Trophy, Send, X, Image as ImageIcon, LogOut, User as UserIcon, Flame, Star, Menu, Instagram, Globe, Phone, Trash2, Check, Briefcase, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData, PhotoData, ExhibitorSponsor, PhotoComment } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { createPrintOrder } from '../services/printService';
import { fetchPosts, createPost, subscribeToPosts, likePost, reactToPost, commentOnPost, updatePostStatus } from '../services/posts';
import { createNotification } from '../services/notificationService';
import { cn } from '../lib/utils';

// Types are imported from src/types/index.ts

// Local component prop interfaces
interface LiveEventViewProps {
  event: EventData;
  user: User | null;
  onLogin: () => void;
  isSelectingForPrint: boolean;
  selectedPrintPhotos: string[];
  togglePhotoSelection: (id: string) => void;
}

interface PhotoCardProps {
  photo: PhotoData;
  user: User | null;
  event: EventData;
  onLogin: () => void;
  onDelete?: () => void;
}


const QUICK_COMMENTS = ['🔥 Sensacional!', '🚀 Top demais!', '📸 Click perfeito!', '🎉 Valeu a pena!', '❤️ Amei!', '✨ Incrível!'];

const REACTION_TYPES = [
  { emoji: '😂', label: 'Mais Divertida 😂' },
  { emoji: '✨', label: 'Momento Especial ✨' },
  { emoji: '🎸', label: 'Rock Star 🎸' },
  { emoji: '⭐', label: 'Queridinha ⭐' }
];

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

  const togglePhotoSelection = (photoId: string) => {
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
  };

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

  const handleLogin = () => {
    setIsLoginViewOpen(true);
    setLinkSent(false);
  };

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
                    <div className="flex gap-2 pt-2">
                      {event.app_whatsapp && (
                        <a href={event.app_whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-green-600 transition-colors">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {event.app_instagram && (
                        <a href={event.app_instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-pink-600 transition-colors">
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {event.app_website && (
                        <a href={event.app_website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-blue-600 transition-colors">
                          <Globe className="w-4 h-4" />
                        </a>
                      )}
                    </div>
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


                {/* Exhibitors */}
                {event.exhibitors && event.exhibitors.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Expositores</h3>
                    <div className="space-y-4">
                      {event.exhibitors.map((item) => (
                        <div key={item.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                          <div className="flex items-center gap-3">
                            {item.logo && <img src={item.logo} className="w-10 h-10 rounded-lg object-contain bg-white p-1" referrerPolicy="no-referrer" />}
                            <h4 className="font-bold text-sm">{item.name}</h4>
                          </div>
                          {item.photo && (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <p className="text-xs text-neutral-600 leading-relaxed">{item.bio}</p>
                          {item.message && (
                            <div className="p-3 bg-white rounded-xl border border-neutral-100 italic text-[11px] text-neutral-500">
                              "{item.message}"
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            {item.socials?.instagram && (
                              <a href={`https://instagram.com/${item.socials.instagram.replace('@', '')}`} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-pink-600 transition-colors">
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {item.socials?.whatsapp && (
                              <a href={`https://wa.me/${item.socials.whatsapp.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-green-600 transition-colors">
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            {item.socials?.website && (
                              <a href={item.socials.website} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-blue-600 transition-colors">
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sponsors */}
                {event.sponsors && event.sponsors.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Patrocinadores</h3>
                    <div className="space-y-4">
                      {event.sponsors.map((item) => (
                        <div key={item.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                          <div className="flex items-center gap-3">
                            {item.logo && <img src={item.logo} className="w-10 h-10 rounded-lg object-contain bg-white p-1" referrerPolicy="no-referrer" />}
                            <h4 className="font-bold text-sm">{item.name}</h4>
                          </div>
                          {item.photo && (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <p className="text-xs text-neutral-600 leading-relaxed">{item.bio}</p>
                          {item.message && (
                            <div className="p-3 bg-white rounded-xl border border-neutral-100 italic text-[11px] text-neutral-500">
                              "{item.message}"
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            {item.socials?.instagram && (
                              <a href={`https://instagram.com/${item.socials.instagram.replace('@', '')}`} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-pink-600 transition-colors">
                                <Instagram className="w-4 h-4" />
                              </a>
                            )}
                            {item.socials?.whatsapp && (
                              <a href={`https://wa.me/${item.socials.whatsapp.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-green-600 transition-colors">
                                <Phone className="w-4 h-4" />
                              </a>
                            )}
                            {item.socials?.website && (
                              <a href={item.socials.website} target="_blank" className="p-2 bg-white rounded-lg shadow-sm hover:text-blue-600 transition-colors">
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                {/* Services */}
                {event.services && event.services.length > 0 && (
                  <div className="space-y-6 mt-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Serviços</h3>
                    <div className="space-y-4">
                      {event.services.map((item) => (
                        <div key={item.id} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-3">
                          <div className="flex items-center gap-3">
                            {item.logo && <img src={item.logo} className="w-10 h-10 rounded-lg object-contain bg-white p-1" referrerPolicy="no-referrer" />}
                            <h4 className="font-bold text-sm">{item.name}</h4>
                          </div>
                          {item.photo && (
                            <div className="aspect-video rounded-xl overflow-hidden">
                              <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <p className="text-xs text-neutral-600 leading-relaxed">{item.bio}</p>
                          {item.message && (
                            <div className="bg-white p-3 rounded-xl border border-neutral-100">
                              <p className="text-xs italic text-neutral-500">"{item.message}"</p>
                            </div>
                          )}
                          {item.socials && (
                            <div className="flex gap-2 pt-2">
                              {item.socials.instagram && (
                                <a href={item.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-pink-600 transition-colors">
                                  <Instagram className="w-4 h-4" />
                                </a>
                              )}
                              {item.socials.whatsapp && (
                                <a href={item.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-green-600 transition-colors">
                                  <Phone className="w-4 h-4" />
                                </a>
                              )}
                              {item.socials.website && (
                                <a href={item.socials.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-200 text-neutral-600 hover:text-blue-600 transition-colors">
                                  <Globe className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                        Link enviado para:<br/>
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

function PreEventView({ event }: { event: EventData }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!event.date) return;

    const calculateTimeLeft = () => {
      const difference = new Date(event.date!).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [event.date]);

  const renderPartnerSection = (title: string, items: any[], icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          {icon} {title}
        </h2>
        <div className="grid gap-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                {item.logo ? (
                  <img src={item.logo} className="w-16 h-16 rounded-xl object-contain bg-neutral-50 p-2" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-sm text-neutral-500 line-clamp-2">{item.bio}</p>
                </div>
              </div>
              {item.photo && (
                <div className="aspect-video rounded-xl overflow-hidden">
                  <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              {item.socials && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  {item.socials.instagram && (
                    <a href={item.socials.instagram.startsWith('http') ? item.socials.instagram : `https://instagram.com/${item.socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-pink-600 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {item.socials.whatsapp && (
                    <a href={item.socials.whatsapp.startsWith('http') ? item.socials.whatsapp : `https://wa.me/${item.socials.whatsapp.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-green-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  {item.socials.website && (
                    <a href={item.socials.website.startsWith('http') ? item.socials.website : `https://${item.socials.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-blue-600 transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="p-6 space-y-8">
      {/* Countdown placeholder */}
      <div 
        className="text-white rounded-3xl p-8 text-center shadow-xl shadow-neutral-200"
        style={{ backgroundColor: event.primary_color || '#171717' }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-60 mb-4" style={{ color: event.secondary_color || '#ffffff' }}>O evento começa em</p>
        <div className="flex justify-center gap-4" style={{ color: event.secondary_color || '#ffffff' }}>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Dias</span>
          </div>
          <span className="text-4xl font-light opacity-30">:</span>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Horas</span>
          </div>
          <span className="text-4xl font-light opacity-30">:</span>
          <div className="flex flex-col">
            <span className="text-4xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className="text-[10px] uppercase opacity-50">Min</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {renderPartnerSection('Expositores', event.exhibitors || [], <Users className="w-4 h-4" />)}
        {renderPartnerSection('Patrocinadores', event.sponsors || [], <Star className="w-4 h-4" />)}
        {renderPartnerSection('Serviços', event.services || [], <Briefcase className="w-4 h-4" />)}
      </div>

      <div className="text-center py-12">
        <p className="text-neutral-400 italic font-serif">"O feed interativo abrirá em breve!"</p>
      </div>
    </div>
  );
}

function LiveEventView({ event, user, onLogin, isSelectingForPrint, selectedPrintPhotos, togglePhotoSelection }: LiveEventViewProps) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Initial Fetch
    const loadInitialPosts = async () => {
      try {
        const initialPhotos = await fetchPosts(event.id);
        setPhotos(initialPhotos);
      } catch (err) {
        console.error('Initial fetch error:', err);
      }
    };
    loadInitialPosts();

    // 2. Real-time Subscription
    return subscribeToPosts(event.id, (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      setPhotos((prev) => {
        if (eventType === 'INSERT') {
          // Only show approved photos or if user is owner (simplified: just matching fetch logic)
          if (newRecord.status === 'approved') {
            return [newRecord, ...prev];
          }
          return prev;
        }
        
        if (eventType === 'UPDATE') {
          return prev.map(p => p.id === newRecord.id ? { ...p, ...newRecord } : p);
        }
        
        if (eventType === 'DELETE') {
          return prev.filter(p => p.id === oldRecord.id);
        }
        
        return prev;
      });
    });
  }, [event.id, user?.uid]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Agora faz o upload direto sem passar pelo seletor de molduras
    handleDirectUpload(file);
  };

  const handleDirectUpload = async (file: File) => {
    if (event.interactions_paused) return;
    const toastId = toast.loading('Processando sua foto...');
    setUploading(true);
    
    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('O arquivo selecionado não é uma imagem.');
      }

      // 1. Comprimir e converter para Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1000; 
            const MAX_HEIGHT = 1000;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 2. Salvar no Supabase via novo serviço
      await createPost({
        eventId: event.id,
        url: base64,
        user_name: user.displayName || 'Anônimo',
        user_id: user.uid,
        status: 'pending'
      });

      toast.success('Foto enviada para aprovação!', { id: toastId });
    } catch (err: any) {
      console.error('Erro no upload:', err);
      toast.error(err.message || 'Erro ao enviar foto.', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const categoryGroups = useMemo(() => {
    const approved = photos.filter(p => p.status === 'approved' && !p.is_official);
    const official = photos.filter(p => p.status === 'approved' && p.is_official);
    if (approved.length === 0 && official.length === 0) return [];

    const categories: { title: string; photos: PhotoData[] }[] = [];

    // Top 5 Mais Curtidas
    const mostLiked = [...approved]
      .filter(p => (p.likes || 0) > 0)
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
    if (mostLiked.length > 0) {
      categories.push({ title: 'Mais Curtida ❤️', photos: mostLiked });
    }

    // Top 5 Mais Divertida
    const mostFunny = [...approved]
      .filter(p => (p.reactions?.['😂'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['😂'] || 0) - (a.reactions?.['😂'] || 0))
      .slice(0, 5);
    if (mostFunny.length > 0) {
      categories.push({ title: 'Mais Divertida 😂', photos: mostFunny });
    }

    // Top 5 Momento Especial
    const specialMoment = [...approved]
      .filter(p => (p.reactions?.['✨'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['✨'] || 0) - (a.reactions?.['✨'] || 0))
      .slice(0, 5);
    if (specialMoment.length > 0) {
      categories.push({ title: 'Momento Especial ✨', photos: specialMoment });
    }

    // Top 5 Mais Comentada
    const mostCommented = [...approved]
      .filter(p => (p.comments?.filter(c => c.status === 'approved').length || 0) > 0)
      .sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0))
      .slice(0, 5);
    if (mostCommented.length > 0) {
      categories.push({ title: 'Mais Comentada 💬', photos: mostCommented });
    }

    // Top 5 Rock Star
    const rockStar = [...approved]
      .filter(p => (p.reactions?.['🎸'] || 0) > 0)
      .sort((a, b) => (b.reactions?.['🎸'] || 0) - (a.reactions?.['🎸'] || 0))
      .slice(0, 5);
    if (rockStar.length > 0) {
      categories.push({ title: 'Rock Star 🎸', photos: rockStar });
    }

    // Top 5 Queridinha
    const favorite = [...approved]
      .filter(p => {
        const total = Object.values(p.reactions || {}).reduce((acc, val) => acc + val, 0);
        return total > 0;
      })
      .sort((a, b) => {
        const totalA = Object.values(a.reactions || {}).reduce((acc, val) => acc + val, 0);
        const totalB = Object.values(b.reactions || {}).reduce((acc, val) => acc + val, 0);
        return totalB - totalA;
      })
      .slice(0, 5);
    if (favorite.length > 0) {
      categories.push({ title: 'Queridinha ⭐', photos: favorite });
    }

    if (event.has_official_photos && official.length > 0) {
      const bestOfficial = [...official]
        .filter(p => (p.likes || 0) > 0)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 5);
      if (bestOfficial.length > 0) {
        categories.push({ title: 'Melhor Foto Oficial 📸', photos: bestOfficial });
      }
    }

    return categories;
  }, [photos, event.has_official_photos]);

  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (categoryGroups.length === 0) return;
    
    // Ensure indices are valid when categoryGroups changes
    if (currentGroupIndex >= categoryGroups.length) {
      setCurrentGroupIndex(0);
      setCurrentPhotoIndex(0);
      return;
    }
    const currentGroup = categoryGroups[currentGroupIndex];
    if (currentPhotoIndex >= currentGroup.photos.length) {
      setCurrentPhotoIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevPhoto) => {
        const group = categoryGroups[currentGroupIndex];
        if (!group || !group.photos) return 0;
        if (prevPhoto + 1 < group.photos.length) {
          return prevPhoto + 1;
        } else {
          setCurrentGroupIndex((prevGroup) => (prevGroup + 1) % categoryGroups.length);
          return 0;
        }
      });
    }, 6000);
    
    return () => clearInterval(interval);
  }, [categoryGroups, currentGroupIndex, currentPhotoIndex]);

  const approvedPhotos = photos.filter(p => p.status === 'approved' && !p.is_official);
  const officialPhotos = photos.filter(p => p.status === 'approved' && p.is_official);
  const galleryPhotos = photos.filter(p => !p.is_official);

  return (
    <div className="p-4 space-y-12">
      {/* Featured Photos Slideshow */}
      {categoryGroups.length > 0 && currentGroupIndex < categoryGroups.length && currentPhotoIndex < categoryGroups[currentGroupIndex].photos.length && (
        <section className="relative px-2">
          <div className="text-center mb-10">
            <h2 
              className="text-3xl md:text-5xl font-black inline-block relative tracking-tighter uppercase"
              style={{ 
                color: event.primary_color || '#171717',
                textShadow: `2px 2px 0px ${event.secondary_color || '#e5e5e5'}80`
              }}
            >
              Destaques do Momento
              <div 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-1.5 rounded-full opacity-80" 
                style={{ backgroundColor: event.secondary_color || '#e5e5e5' }}
              />
            </h2>
          </div>
          
          <div className="aspect-video bg-white rounded-[32px] overflow-hidden shadow-2xl border-[8px] border-white relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentGroupIndex}-${currentPhotoIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={categoryGroups[currentGroupIndex].photos[currentPhotoIndex].url} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest">
                      {categoryGroups[currentGroupIndex].title}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    {categoryGroups[currentGroupIndex].photos[currentPhotoIndex].user_name}
                  </h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {categoryGroups[currentGroupIndex].photos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPhotoIndex(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPhotoIndex === idx ? "w-6 bg-neutral-900" : "bg-neutral-300"
                )}
              />
            ))}
          </div>
        </section>
      )}

      {/* Official Photos Section */}
      {event.has_official_photos && officialPhotos.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Fotos Oficiais
            </h2>
            <span className="text-[10px] font-bold uppercase text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">Equipe</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x custom-scrollbar">
            {officialPhotos.map((photo) => (
              <div key={photo.id} className="min-w-[280px] snap-center">
                <PhotoCard 
                  photo={photo} 
                  user={user} 
                  event={event} 
                  onLogin={onLogin} 
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
          <Camera className="w-4 h-4" /> Feed do Evento
        </h2>
        <span className="text-xs text-neutral-400">{galleryPhotos.length} fotos</span>
      </div>
      
      {galleryPhotos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-neutral-200 rounded-3xl">
          <ImageIcon className="w-12 h-12 mx-auto text-neutral-200 mb-4" />
          <p className="text-neutral-400">Nenhuma foto ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <PhotoCard photo={photo} user={user} event={event} onLogin={onLogin} />
                {isSelectingForPrint && (
                  <button
                    onClick={() => togglePhotoSelection(photo.id)}
                    className={cn(
                      "absolute top-2 right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all",
                      selectedPrintPhotos.includes(photo.id) 
                        ? "bg-green-500 border-green-500 text-white scale-110" 
                        : "bg-white/80 backdrop-blur-sm border-neutral-300 text-transparent"
                    )}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Button */}
      <input 
        type="file" 
        accept="image/*" 
        capture={event.upload_source === 'camera' ? 'environment' : undefined}
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileSelect}
      />
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {!event.interactions_paused && (
          <button 
            onClick={() => user ? fileInputRef.current?.click() : onLogin()}
            disabled={uploading}
            className="w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: event.primary_color || '#171717' }}
          >
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Camera className="w-8 h-8" />}
          </button>
        )}
      </div>

      {!user && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-4 right-4 bg-white border border-neutral-200 p-4 rounded-2xl shadow-2xl text-center z-[60]"
        >
          <p className="text-sm font-bold text-neutral-900 mb-3">Quer postar fotos e interagir?</p>
          <button 
            onClick={onLogin}
            className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
            Entrar com Google
          </button>
          <p className="text-[10px] text-neutral-400 mt-2">Você pode continuar visualizando a galeria sem login.</p>
        </motion.div>
      )}
    </div>
  );
}

function PhotoCard({ photo, user, event, onLogin }: PhotoCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.email === 'rodolfostebner@gmail.com';

  const handleLike = async () => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user) {
      onLogin();
      return;
    }

    const likeKey = `${user.uid}_like`;
    const hasLiked = photo.reacted_users?.includes(likeKey);

    try {
      const isRemoving = hasLiked;
      await likePost(photo.id, likeKey, isRemoving ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao curtir foto.');
    }
  };

  const handleReaction = async (emoji: string) => {
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user) {
      onLogin();
      return;
    }

    const reactionKey = `${user.uid}_${emoji}`;
    const hasReacted = photo.reacted_users?.includes(reactionKey);

    // Count how many reactions the user has made to this photo
    const userReactions = (photo.reacted_users || []).filter(key => key.startsWith(`${user.uid}_`) && key !== `${user.uid}_like`);

    try {
      const isRemoving = hasReacted;
      if (!isRemoving && userReactions.length >= 2) {
        toast.error('Você só pode usar até 2 comentários sugeridos por foto.');
        return;
      }
      await reactToPost(photo.id, emoji, user.uid, isRemoving ? -1 : 1);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar reação.');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event.interactions_paused) {
      toast.error('Interações estão pausadas no momento.');
      return;
    }
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const comment = {
        id: Math.random().toString(36).substr(2, 9),
        user: user.displayName || 'Anônimo',
        uid: user.uid,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
        status: event.comment_moderation_enabled === false ? 'approved' : 'pending'
      };

      await commentOnPost(photo.id, [...(photo.comments || []), comment]);
      
      if (event.comment_moderation_enabled === false && photo.user_id && photo.user_id !== user.uid) {
        await createNotification({
          userId: photo.user_id,
          title: 'Novo Comentário!',
          body: `${user.displayName || 'Anônimo'} comentou na sua foto.`,
          read: false,
          link: `/${event.slug}`
        });
      }
      
      setNewComment('');
      if (event.comment_moderation_enabled === false) {
        toast.success('Comentário publicado!');
      } else {
        toast.success('Comentário enviado para moderação!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user || (photo.user_id !== user.uid && !isAdmin)) return;

    try {
      await updatePostStatus(photo.id, 'rejected');
      toast.success('Foto excluída!');
      setShowDetails(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const comment = photo.comments.find(c => c.id === commentId);
    if (!user || !comment || (comment.uid !== user.uid && !isAdmin)) return;

    try {
      const updatedComments = photo.comments.filter(c => c.id !== commentId);
      await commentOnPost(photo.id, updatedComments); 
      toast.success('Comentário excluído!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm"
      >
        <div className="aspect-square relative group cursor-pointer" onClick={() => setShowDetails(true)}>
          <img 
            src={photo.url} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
            loading="lazy"
          />
          {photo.status === 'pending' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                Em análise
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <p className="text-white text-[10px] font-medium truncate">{photo.user_name}</p>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex gap-3">
            <button 
              onClick={handleLike}
              className="flex items-center gap-1 text-neutral-600 hover:text-red-500 transition-colors"
            >
              <Heart className={cn("w-4 h-4", photo.reacted_users?.includes(`${user?.uid}_like`) && "fill-red-500 text-red-500")} />
              <span className="text-xs font-bold">{photo.likes || 0}</span>
            </button>
            <button 
              onClick={() => setShowDetails(true)}
              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-bold">{photo.comments?.filter(c => c.status === 'approved').length || 0}</span>
            </button>
          </div>
          <div className="flex -space-x-1">
            {Object.entries(photo.reactions || {}).filter(([e]) => e !== '❤️').slice(0, 3).map(([emoji]) => (
              <span key={emoji} className="text-xs">{emoji}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal de Detalhes da Foto */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-neutral-900 sm:rounded-[32px] overflow-hidden flex flex-col sm:flex-row shadow-2xl"
            >
              {/* Imagem Inteira */}
              <div className="flex-1 bg-black flex items-center justify-center relative min-h-[40vh]">
                <img 
                  src={photo.url} 
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setShowDetails(false)}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors z-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Painel Lateral de Interação */}
              <div className="w-full sm:w-[380px] bg-white flex flex-col h-[50vh] sm:h-auto">
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-neutral-400">
                      {photo.user_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{photo.user_name}</p>
                      <p className="text-[10px] text-neutral-400">Postado agora pouco</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDetails(false)} className="hidden sm:block p-2 hover:bg-neutral-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Reações Rápidas */}
                <div className="px-4 py-3 border-b border-neutral-50 flex justify-around">
                  {REACTION_TYPES.map(({ emoji }) => {
                    const reactionKey = `${user?.uid}_${emoji}`;
                    const isActive = photo.reacted_users?.includes(reactionKey);
                    return (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <span className={cn("text-2xl transition-all", isActive ? "scale-125" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100")}>
                          {emoji}
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400">{photo.reactions?.[emoji] || 0}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Lista de Comentários */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {(() => {
                    const approvedComments = (photo.comments || []).filter(c => c.status === 'approved');
                    return approvedComments.length > 0 ? (
                      approvedComments.map((comment, i) => (
                        <div key={i} className="flex gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {comment.user.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 relative">
                            <div className="bg-neutral-50 p-3 rounded-2xl rounded-tl-none">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold">{comment.user}</p>
                                {(user?.uid === comment.uid || isAdmin) && (
                                  <button 
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-all text-neutral-400 hover:text-red-500"
                                    title="Excluir comentário"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-neutral-700">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-8">
                        <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                        <p className="text-sm">Seja o primeiro a comentar!</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Input de Comentário */}
                <div className="p-4 border-t border-neutral-100 bg-white">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {QUICK_COMMENTS.map((text) => (
                          <button
                            key={text}
                            onClick={() => {
                              setNewComment(text);
                            }}
                            className="whitespace-nowrap px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[10px] font-bold transition-colors"
                          >
                            {text}
                          </button>
                        ))}
                      </div>

                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input 
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Adicione um comentário..."
                          className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 transition-all"
                          style={{ '--tw-ring-color': event.primary_color || '#171717' } as any}
                        />
                        <button 
                          type="submit"
                          disabled={!newComment.trim() || isSubmitting}
                          className="p-2 text-white rounded-xl disabled:opacity-50 active:scale-95 transition-all"
                          style={{ backgroundColor: event.primary_color || '#171717' }}
                        >
                          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                      </form>
                      <p className="text-[9px] text-center text-neutral-400">Seu comentário passará por moderação antes de aparecer.</p>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-neutral-400 mb-2">Faça login para comentar</p>
                      <button onClick={onLogin} className="text-xs font-bold underline">Entrar agora</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete Photo Button for Owner/Admin */}
              {(user?.uid === photo.user_id || isAdmin) && (
                <button 
                  onClick={handleDeletePhoto}
                  className="absolute top-4 left-4 p-1.5 bg-white/10 hover:bg-red-500 text-white/40 hover:text-white rounded-full backdrop-blur-sm transition-all z-50"
                  title="Excluir foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


function PostEventView({ event, user, onLogin }: { event: EventData, user: User | null, onLogin: () => void }) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);

  useEffect(() => {
    if (!event.id) return;
    // Initial fetch
    fetchPosts(event.id).then(setPhotos).catch(console.error);
    // Real-time updates
    return subscribeToPosts(event.id, () => {
      fetchPosts(event.id).then(setPhotos).catch(console.error);
    });
  }, [event.id]);

  const rankingData = useMemo(() => {
    const categories = [
      { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '✨', title: 'Momento Especial', emoji: '✨' },
      { id: '💬', title: 'Mais Comentada', emoji: '💬' },
      { id: '🎸', title: 'Rock Star', emoji: '🎸' },
      { id: '⭐', title: 'Queridinha', emoji: '⭐' }
    ];

    const ranking = categories.map(cat => {
      let sortedPhotos = photos.filter(p => !p.is_official);
      if (cat.id === 'likes') {
        sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '💬') {
        sortedPhotos.sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0));
      } else {
        sortedPhotos.sort((a, b) => (b.reactions?.[cat.id] || 0) - (a.reactions?.[cat.id] || 0));
      }
      
      const topPhoto = sortedPhotos[0];
      let score = 0;
      if (topPhoto) {
        if (cat.id === 'likes') score = topPhoto.likes || 0;
        else if (cat.id === '💬') score = topPhoto.comments?.filter(c => c.status === 'approved').length || 0;
        else score = topPhoto.reactions?.[cat.id] || 0;
      }

      return { title: cat.title, emoji: cat.emoji, photo: topPhoto, score };
    }).filter(r => r.photo && r.score > 0);

    if (event?.has_official_photos) {
      const officialPhotos = photos.filter(p => p.is_official).sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (officialPhotos.length > 0 && (officialPhotos[0].likes || 0) > 0) {
        ranking.push({ title: 'Melhor Foto Oficial', emoji: '📸', photo: officialPhotos[0], score: officialPhotos[0].likes || 0 });
      }
    }

    return ranking;
  }, [photos, event?.has_official_photos]);

  const renderPartnerSection = (title: string, items: any[], icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="space-y-4 text-left">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-2">
          {icon} {title}
        </h2>
        <div className="grid gap-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm flex flex-col gap-4">
              <div className="flex gap-4 items-center">
                {item.logo ? (
                  <img src={item.logo} className="w-16 h-16 rounded-2xl object-contain bg-neutral-50 p-2 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-neutral-900">{item.name}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{item.bio}</p>
                </div>
              </div>
              {item.photo && (
                <div className="aspect-video rounded-xl overflow-hidden">
                  <img src={item.photo} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              {item.final_message && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <p className="text-sm italic text-neutral-600">"{item.final_message}"</p>
                </div>
              )}
              {item.socials && (
                <div className="flex gap-2 pt-2 border-t border-neutral-100">
                  {item.socials.instagram && (
                    <a href={item.socials.instagram.startsWith('http') ? item.socials.instagram : `https://instagram.com/${item.socials.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-pink-600 transition-colors">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {item.socials.whatsapp && (
                    <a href={item.socials.whatsapp.startsWith('http') ? item.socials.whatsapp : `https://wa.me/${item.socials.whatsapp.replace(/\\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-green-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  {item.socials.website && (
                    <a href={item.socials.website.startsWith('http') ? item.socials.website : `https://${item.socials.website}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-neutral-50 rounded-full text-neutral-600 hover:text-blue-600 transition-colors">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="p-6 text-center space-y-12">
      <div className="py-12 rounded-[40px] border border-neutral-100 bg-white shadow-xl">
        <Trophy className="w-20 h-20 mx-auto mb-6" style={{ color: event.primary_color || '#EAB308' }} />
        <h2 className="text-3xl font-black">Evento Encerrado</h2>
        <p className="text-neutral-500 mt-3 max-w-xs mx-auto">
          {event.post_event_message || 'Obrigado por participar! O evento foi um sucesso e as fotos já estão disponíveis.'}
        </p>
      </div>

      <button 
        className="w-full py-5 text-white rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all"
        style={{ backgroundColor: event.primary_color || '#171717', color: event.secondary_color || '#ffffff' }}
      >
        Ver Álbum Digital Completo
      </button>

      {rankingData.length > 0 && (
        <section className="bg-white p-6 rounded-[40px] border border-neutral-100 shadow-xl text-left">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Ranking de Destaques
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {rankingData.map((item, idx) => (
              <div key={idx} className="min-w-[280px] snap-center bg-neutral-50 rounded-3xl p-4 border border-neutral-100 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-tight">{item.title}</h3>
                    <p className="text-[10px] font-bold text-neutral-400">Score: {item.score}</p>
                  </div>
                </div>
                <PhotoCard photo={item.photo} user={user} event={event} onLogin={onLogin} />
              </div>
            ))}
          </div>
        </section>
      )}

      {event.summary_file_url && (
        <a 
          href={event.summary_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-5 bg-white border-2 border-neutral-100 text-neutral-900 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all text-center"
        >
          Baixar Resumo do Evento 🎁
        </a>
      )}

      {/* Expositores e Patrocinadores */}
      <div className="space-y-12 text-left">
        {renderPartnerSection('Expositores', event.exhibitors || [], <Users className="w-4 h-4" />)}
        {renderPartnerSection('Patrocinadores', event.sponsors || [], <Star className="w-4 h-4" />)}
        {renderPartnerSection('Serviços', event.services || [], <Briefcase className="w-4 h-4" />)}
      </div>
    </div>
  );
}
