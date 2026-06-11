import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginWithMagicLink } from '../services/authService';
import { useAuth, BETA_MODE } from '../hooks/useAuth';
import type { AppUser, Announcement } from '../types';
import { Loader2, X, LogOut, User as UserIcon, Menu, Instagram, Globe, Phone, Check, Bell, BellOff, Star, Users, Mail, CheckCircle2, Store, Settings2, LayoutDashboard, ClipboardList, ChevronRight, Megaphone, AlertTriangle, Info, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import type { EventData } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { createPrintOrder } from '../services/printService';
import { getExhibitors } from '../services/exhibitorService';
import { getPartners } from '../services/partnerService';
import { trackVisit } from '../services/visitService';
import { startHeartbeat } from '../services/presenceService';
import { formatWebsite } from '../utils/formatters';
import { cn, rotateByTime, SPONSOR_ROTATION_MS } from '../lib/utils';
import type { Exhibitor, Partner } from '../types';
import { supabase } from '../lib/supabase/client';
import { landingConfig } from '../features/landing/landingConfig';


// Modular Components
import { LiveEventView } from '../features/event/components/LiveEventView';
import { PreEventView } from '../features/event/components/PreEventView';
import { PostEventView } from '../features/event/components/PostEventView';
import { EventWelcomeModal } from '../features/event/components/EventWelcomeModal';
import { PartnerSection } from '../features/event/components/PartnerSection';
import type { SocialLinkType } from '../features/event/components/SocialLinks';

function LoginModal({ onClose }: { onClose: () => void }) {
  const { verifyOtp, loginBeta } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

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
      await loginWithMagicLink(email.trim(), window.location.href);
      setSent(true);
    } catch {
      toast.error('Erro ao enviar código. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length < 6) return;
    setVerifying(true);
    try {
      await verifyOtp(email.trim(), token);
      onClose();
    } catch {
      toast.error('Código inválido ou expirado. Confira ou peça um novo.');
    } finally {
      setVerifying(false);
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
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div className="text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-neutral-900 mx-auto" />
              <p className="font-bold text-neutral-900 text-sm">Código enviado!</p>
              <p className="text-xs text-neutral-500">Digite o código de 6 dígitos enviado para <strong>{email}</strong></p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              autoFocus
              disabled={verifying}
              placeholder="••••••"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-center text-2xl font-black tracking-[0.4em] focus:ring-2 focus:ring-neutral-900 outline-none"
            />
            <button
              type="submit"
              disabled={verifying || code.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-xl font-black text-sm hover:bg-neutral-800 disabled:opacity-50 transition-colors"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {verifying ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="flex items-center justify-between text-xs">
              <button type="button" onClick={() => { setSent(false); setCode(''); }} className="text-neutral-500 hover:text-neutral-700 underline">Voltar</button>
              <button
                type="button"
                disabled={sending}
                onClick={() => handleMagicLink({ preventDefault: () => {} } as FormEvent)}
                className="text-neutral-900 font-bold hover:underline disabled:opacity-50"
              >
                {sending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
          </form>
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
                {sending ? 'Enviando...' : 'Receber código por e-mail'}
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

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  const copySidebarPixKey = async () => {
    try {
      await navigator.clipboard.writeText(landingConfig.links.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao copiar chave Pix.');
    }
  };

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

  const [showWelcome, setShowWelcome] = useState(false);

  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    let active = true;

    if (!event?.active_announcement_id) {
      setActiveAnnouncement(null);
      return;
    }

    const dismissedStr = localStorage.getItem('dismissed_announcements') || '[]';
    try {
      const dismissedIds: string[] = JSON.parse(dismissedStr);
      // Premium UX: check both ID and Trigger Time to allow re-triggering the same announcement
      const dismissKey = `${event.active_announcement_id}_${event.announcement_trigger_at || ''}`;
      if (dismissedIds.includes(dismissKey)) {
        setActiveAnnouncement(null);
        return;
      }
    } catch (e) {
      console.error('Error parsing dismissed_announcements:', e);
    }

    import('../lib/supabase/client').then(({ supabase }) => {
      if (!supabase) return;
      supabase
        .from('announcements')
        .select('*')
        .eq('id', event.active_announcement_id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching active announcement:', error);
            return;
          }
          if (active && data) {
            const ann = data as Announcement;
            if (ann.target_app_popup) {
              setActiveAnnouncement(ann);

              const duration = (ann.show_duration_sec || 15) * 1000;
              timerId = setTimeout(() => {
                setActiveAnnouncement(null);
              }, duration);
            } else {
              setActiveAnnouncement(null);
            }
          }
        });
    });

    return () => {
      active = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [event?.active_announcement_id, event?.announcement_trigger_at]);

  const handleDismissAnnouncement = (annId: string) => {
    const dismissedStr = localStorage.getItem('dismissed_announcements') || '[]';
    try {
      const dismissedIds: string[] = JSON.parse(dismissedStr);
      // Dismiss for this specific trigger timestamp
      const dismissKey = `${annId}_${event?.announcement_trigger_at || ''}`;
      if (!dismissedIds.includes(dismissKey)) {
        dismissedIds.push(dismissKey);
        localStorage.setItem('dismissed_announcements', JSON.stringify(dismissedIds));
      }
    } catch (e) {
      console.error('Error updating dismissed_announcements:', e);
    }
    setActiveAnnouncement(null);
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
        userName: user.display_name || user.email || 'Anônimo',
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

  // Heartbeat de presença: marca esta sessão (logada ou anônima) como ativa.
  // Alimenta o contador de pessoas online (telão/painel) e o relatório pós-feira.
  useEffect(() => {
    if (!event?.id) return;
    return startHeartbeat(event.id, user?.id ?? null);
  }, [event?.id, user?.id]);

  useEffect(() => {
    if (!slug) return;

    // 1. Subscribe to Realtime Postgres Changes
    const unsubscribe = subscribeToEvent(
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

    // 2. Hybrid Polling Fallback (Resilient B2B design: guarantees popup works even if WebSockets are blocked by browser/network)
    const intervalId = setInterval(() => {
      import('../services/eventService').then(({ getEventBySlug }) => {
        getEventBySlug(slug)
          .then((ev) => {
            if (ev) {
              setEvent(current => {
                // Only trigger react state update if vital real-time fields have changed
                if (
                  current?.active_announcement_id !== ev.active_announcement_id ||
                  current?.announcement_trigger_at !== ev.announcement_trigger_at ||
                  current?.status !== ev.status ||
                  current?.interactions_paused !== ev.interactions_paused ||
                  current?.tv_show_ranking !== ev.tv_show_ranking
                ) {
                  return ev;
                }
                return current;
              });
            }
          })
          .catch(console.error);
      });
    }, 5000); // Poll every 5 seconds

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [slug]);

  useEffect(() => {
    if (!event?.id) return;
    getExhibitors(event.id).then(setDbExhibitors).catch(() => {});
    getPartners(event.id).then(setDbSponsors).catch(() => {});
  }, [event?.id]);

  // Exibe modal de boas-vindas uma vez por sessão se o evento tiver foto ou texto
  useEffect(() => {
    if (!event?.id) return;
    if (!event.owner_photo && !event.owner_text) return;
    const key = `welcome_shown_${event.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      setShowWelcome(true);
    }
  }, [event?.id]);

  // Link logged-in participant to this event so they are formally registered to receive push notifications
  useEffect(() => {
    if (!user || !event?.id) return;
    if (user.event_id === event.id) return;

    import('../services/userService').then(({ updateUserRole }) => {
      updateUserRole(user.id, user.role, event.id, user.exhibitor_id)
        .then(() => {
          console.log('[EventPage] Linked user to event in DB:', event.id);
        })
        .catch(console.error);
    });
  }, [user, event?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user || !supabase) return;
    try {
      // 1. Fetch latest 50 notifications for the history drawer list
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data) {
        setNotifications(data);
      }

      // 2. Fetch the exact count of all unread notifications in the entire database
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (countError) {
        console.error('Error counting unread notifications:', countError);
        return;
      }

      if (count !== null) {
        setUnreadCount(count);
      }
    } catch (err) {
      console.error('Error in fetchNotifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !supabase) return;

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:user_id=eq.${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas!');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Erro ao marcar todas como lidas');
    }
  };


  // Rodízio justo dos patrocinadores no menu lateral — mesma regra do feed
  // (rotateByTime): gira a ordem a cada 5 min para dar visibilidade igual a todos.
  const sponsorItems = useMemo(() => rotateByTime(dbSponsors, SPONSOR_ROTATION_MS).map(s => ({
    id: s.id,
    logo: s.logo_url ?? undefined,
    name: s.name,
    bio: s.description ?? '',
    photos: s.photos,
    socials: {
      instagram: s.instagram_url ?? undefined,
      tiktok: s.tiktok_url ?? undefined,
      youtube: s.youtube_url ?? undefined,
      whatsapp: s.whatsapp ?? undefined,
      website: s.website_url ?? undefined,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
    },
  })), [dbSponsors]);

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
      {/* Real-time In-App Popup Alert Overlay */}
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] w-[calc(100%-2rem)] max-w-lg shadow-2xl rounded-2xl overflow-hidden border border-white/20 backdrop-blur-xl"
            style={{
              backgroundColor: `${activeAnnouncement.bg_color || '#ef4444'}EE`,
              color: activeAnnouncement.text_color || '#ffffff'
            }}
          >
            <div className="p-4 pr-12 flex items-start gap-3.5 relative">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/15 shadow-inner mt-0.5">
                {activeAnnouncement.icon === 'bell' && <Bell className="w-5 h-5 text-white" />}
                {activeAnnouncement.icon === 'alert-triangle' && <AlertTriangle className="w-5 h-5 text-white" />}
                {activeAnnouncement.icon === 'info' && <Info className="w-5 h-5 text-white" />}
                {activeAnnouncement.icon === 'party-popper' && <PartyPopper className="w-5 h-5 text-white" />}
                {activeAnnouncement.icon === 'megaphone' && <Megaphone className="w-5 h-5 -rotate-12 text-white" />}
                {!activeAnnouncement.icon && <Megaphone className="w-5 h-5 -rotate-12 text-white" />}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-sm uppercase tracking-tight filter drop-shadow-sm leading-tight">
                  {activeAnnouncement.title}
                </h4>
                <p className="text-xs font-semibold leading-relaxed text-white/90 filter drop-shadow-sm line-clamp-3">
                  {activeAnnouncement.message}
                </p>
              </div>
              <button
                onClick={() => handleDismissAnnouncement(activeAnnouncement.id)}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center border border-transparent hover:border-white/10"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Ambient indicator bar showing duration countdown visually */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: activeAnnouncement.show_duration_sec || 15, ease: 'linear' }}
              className="h-1 bg-white/30 origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>

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
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-850 rounded-full transition-all duration-300 active:scale-95 border border-neutral-200/40"
                aria-label="Abrir notificações"
              >
                <Bell className="w-5 h-5 text-neutral-850" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
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

                <section className="bg-neutral-50 rounded-2xl p-5 md:p-6 border border-neutral-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-[72px] h-[72px] rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform duration-200 bg-white p-1.5 shrink-0"
                      title="Visitar Landing Page"
                    >
                      <img src="/landing/Logo0.png" className="w-full h-full object-contain" alt="Eventify Logo" />
                    </a>
                    <div className="flex flex-col gap-1 pt-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-outfit font-black text-xl text-gray-800 tracking-tight leading-tight">Memories Hub</span>
                        <span className="text-[9px] bg-[#F0A795]/15 px-2 py-0.5 rounded-full text-[#F0A795] font-bold tracking-wider uppercase leading-none">Eventify</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-tight font-semibold italic">
                        "Onde cada memória do seu evento<br />
                        se conecta em tempo real."
                      </p>
                    </div>
                  </div>
                  {event.app_website && (
                    <div className="flex gap-3 pt-1">
                       <a href={formatWebsite(event.app_website)} target="_blank" rel="noopener noreferrer" className="p-2 bg-white rounded-full border border-neutral-100 shadow-sm" title="Website"><Globe className="w-4 h-4" /></a>
                    </div>
                  )}

                  {/* Pix Coffee Card (Sugestão Compacta) */}
                  <div className="w-full max-w-[280px] mx-auto p-4 rounded-2xl border border-neutral-200/60 bg-white shadow-sm flex flex-col items-center gap-2.5 text-center transition-all duration-300 hover:shadow-md mt-2">
                    <div className="font-outfit font-bold text-xs text-neutral-800 text-center leading-normal px-1">
                      <span className="inline-block mr-1 align-middle text-sm">☕</span>
                      Gostou do app? Nos pague um chocolate quente!
                    </div>
                    <p className="text-[10px] text-neutral-500 max-w-[200px] leading-normal">
                      Sua ajuda mantém o projeto ativo. Copie a chave Pix:
                    </p>
                    <div className="flex flex-col gap-2 w-full mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={landingConfig.links.pixKey}
                        className="bg-neutral-50 border border-neutral-200/60 text-xs font-mono px-3 py-2 rounded-lg focus:outline-none w-full text-center text-neutral-600 select-all"
                      />
                      <button
                        onClick={copySidebarPixKey}
                        className="w-full bg-[#F0A795]/15 hover:bg-[#F0A795]/25 text-[#F0A795] font-extrabold text-xs py-2 rounded-lg border border-[#F0A795]/20 transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        {copiedPix ? 'Copiado! 🙏🏻🫶🐨' : 'Copiar Chave'}
                      </button>
                    </div>
                  </div>
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

                {/* Quadro do Dono do Evento (Organização) */}
                {(event.owner_photo || event.owner_text) && (
                  <section className="bg-neutral-50 rounded-2xl p-6 md:p-8 border border-neutral-100 space-y-6">
                    <div className="flex items-center gap-4">
                      {event.owner_photo ? (
                        <img src={event.owner_photo} className="w-12 h-12 rounded-2xl object-cover shadow-xl" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white shadow-xl text-2xl">🏢</div>
                      )}
                      <div>
                        <h2 className="text-lg font-black tracking-tight">Organização</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Dono do Evento</p>
                      </div>
                    </div>
                    {event.owner_text && (
                      <p className="text-xs text-neutral-500 leading-relaxed font-medium whitespace-pre-line">{event.owner_text}</p>
                    )}
                  </section>
                )}

                {/* Partners in Sidebar */}
                <section className="space-y-6 px-2">
                  <PartnerSection
                    title="Patrocinadores"
                    items={sponsorItems}
                    icon={<Star className="w-4 h-4" />}
                    columns={1}
                  />
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <EventWelcomeModal
        event={event}
        visible={showWelcome}
        onClose={() => setShowWelcome(false)}
      />

      <main className="max-w-6xl mx-auto pb-24 md:pb-32">
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

      {/* Notifications Drawer */}
      <AnimatePresence>
        {isNotificationsOpen && user && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[90%] md:w-[450px] max-w-lg z-[130] bg-neutral-50 shadow-2xl flex flex-col rounded-l-3xl overflow-hidden border-l border-neutral-100"
            >
              {/* Header */}
              <div className="p-6 bg-white border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-neutral-50 rounded-xl">
                    <Bell className="w-5 h-5 text-neutral-900" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-neutral-900">Avisos do Evento</h2>
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">Histórico de Mensagens</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNotificationsOpen(false)} 
                  className="p-2 hover:bg-neutral-50 rounded-full transition-colors border border-transparent hover:border-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Push Toggle Banner */}
              <div className="p-4 bg-white border-b border-neutral-100">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/80 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-neutral-800">Notificações no Celular</h4>
                    <p className="text-[10px] text-neutral-500 font-semibold leading-tight">
                      Receba avisos na tela mesmo fora do aplicativo.
                    </p>
                  </div>
                  <button
                    onClick={togglePushNotifications}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                      pushEnabled
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "bg-neutral-250 hover:bg-neutral-300 text-neutral-700"
                    )}
                  >
                    {pushEnabled ? "Ativo" : "Ativar"}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="px-6 py-3 bg-white border-b border-neutral-100 flex justify-end">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black uppercase tracking-wider text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Marcar todas como lidas
                  </button>
                </div>
              )}

              {/* Notification List Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner animate-bounce">
                      🐨
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-neutral-800">Tudo limpo por aqui!</h3>
                      <p className="text-xs text-neutral-400 font-semibold max-w-xs leading-relaxed">
                        Nenhum aviso enviado até o momento. Quando a organização enviar alertas, eles aparecerão aqui!
                      </p>
                    </div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 rounded-2xl transition-all duration-300 border relative flex flex-col gap-3 group",
                        notif.read
                          ? "bg-white/60 border-neutral-100 text-neutral-800 shadow-sm"
                          : "bg-white border-neutral-200/80 text-neutral-900 shadow-md ring-1 ring-neutral-900/5"
                      )}
                    >
                      {/* Unread indicator red badge */}
                      {!notif.read && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      )}

                      <div className="space-y-1 pr-4">
                        <h4 className="text-xs font-black tracking-tight leading-tight flex items-center gap-1.5">
                          {notif.title}
                          {!notif.read && (
                            <span className="bg-red-50 text-[8px] font-extrabold text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-red-100">
                              Novo
                            </span>
                          )}
                        </h4>
                        <p className="text-xs font-medium text-neutral-500 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100/80 pt-3">
                        <span className="text-[9px] font-semibold text-neutral-400">
                          {formatRelativeTime(notif.created_at)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-1.5 hover:bg-neutral-50 text-neutral-400 hover:text-emerald-600 rounded-lg transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {notif.link && (
                            <button
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                const cleanLink = notif.link.replace('#silent', '');
                                navigate(cleanLink);
                                setIsNotificationsOpen(false);
                              }}
                              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                              Ver
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  
  if (isNaN(diffMs) || diffMs < 0) return 'agora';
  
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'agora mesmo';
  
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `há ${diffMins} min`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `há ${diffHours}h`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

