import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Check, X, ArrowLeft, Loader2, MessageCircle, ShieldCheck, Trash2, Printer, Eye, Upload, Pause, Play, Trophy, LogOut } from 'lucide-react';
import type { EventData, PhotoData, PrintOrder } from '../types';
import { subscribeToEvent } from '../services/eventService';
import { subscribeToPhotos, updatePhotoStatus, moderateComment, addOfficialPhoto } from '../services/photoService';
import { subscribeToPrintOrders, completePrintOrder, deletePrintOrder } from '../services/printService';
import { createNotification } from '../services/notificationService';
import { updateEvent } from '../services/eventService';

export default function ModerationPanel({ user }: { user: import('../lib/firebase').User | null }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [printOrders, setPrintOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [filter, setFilter] = useState<'photos' | 'comments' | 'prints' | 'controls'>('photos');
  const [selectedOrder, setSelectedOrder] = useState<PrintOrder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Subscribe to event
  useEffect(() => {
    if (!slug) return;
    return subscribeToEvent(
      slug,
      (ev) => { if (ev) setEvent(ev); },
      (error) => console.error('Error fetching event in ModerationPanel:', error),
    );
  }, [slug]);

  // Subscribe to photos once event is loaded
  useEffect(() => {
    if (!event?.id) return;
    return subscribeToPhotos(
      event.id,
      (data) => {
        setPhotos(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      },
    );
  }, [event?.id]);

  // Subscribe to print orders
  useEffect(() => {
    if (!event?.id) return;
    return subscribeToPrintOrders(
      event.id,
      (orders) => setPrintOrders(orders),
      (err) => console.error(err),
    );
  }, [event?.id]);

  const handleApprovePhoto = async (photo: PhotoData) => {
    try {
      await updatePhotoStatus(photo.id, 'approved');
      if (photo.user_id) {
        await createNotification({
          userId: photo.user_id,
          title: 'Foto Aprovada!',
          body: 'Sua foto foi aprovada e já está na galeria do evento.',
          link: `/${event?.slug}`,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'photos');
    }
  };

  const handleRejectPhoto = async (id: string) => {
    try {
      await updatePhotoStatus(id, 'rejected');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'photos');
    }
  };

  const handleOfficialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !event?.id) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await addOfficialPhoto(event.id, files[i]);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao fazer upload das fotos oficiais.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleToggleInteractions = async () => {
    if (!event) return;
    try {
      await updateEvent(event.id, { interactions_paused: !event.interactions_paused });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTVRanking = async () => {
    if (!event) return;
    try {
      await updateEvent(event.id, { tv_show_ranking: !event.tv_show_ranking });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateComment = async (
    photoId: string,
    currentComments: PhotoData['comments'],
    commentIndex: number,
    action: 'approved' | 'rejected',
  ) => {
    try {
      await moderateComment(photoId, currentComments, commentIndex, action);
      if (action === 'approved') {
        const photo = photos.find((p) => p.id === photoId);
        if (photo?.user_id) {
          const approved = currentComments[commentIndex];
          await createNotification({
            userId: photo.user_id,
            title: 'Novo Comentário!',
            body: `${approved.user} comentou na sua foto.`,
            link: `/${event?.slug}`,
          });
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'photos');
    }
  };

  const handleCompletePrintOrder = async (orderId: string) => {
    try {
      await completePrintOrder(orderId);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'print_orders');
    }
  };

  const handleDeletePrintOrder = async (orderId: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await deletePrintOrder(orderId);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'print_orders');
    }
  };

  const rankingData = useMemo(() => {
    const approvedPhotos = photos.filter((p) => p.status === 'approved' && !p.is_official);

    const categories = [
      { id: 'likes', title: 'Mais Curtida', emoji: '❤️' },
      { id: '😂', title: 'Mais Divertida', emoji: '😂' },
      { id: '✨', title: 'Momento Especial', emoji: '✨' },
      { id: '💬', title: 'Mais Comentada', emoji: '💬' },
      { id: '🎸', title: 'Rock Star', emoji: '🎸' },
      { id: '⭐', title: 'Queridinha', emoji: '⭐' },
    ];

    const ranking = categories.map((cat) => {
      let sortedPhotos = [...approvedPhotos];
      if (cat.id === 'likes') {
        sortedPhotos.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (cat.id === '💬') {
        sortedPhotos.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
      } else {
        sortedPhotos.sort((a, b) => (b.reactions?.[cat.id] || 0) - (a.reactions?.[cat.id] || 0));
      }

      const topPhoto = sortedPhotos[0];
      let score = 0;
      if (topPhoto) {
        if (cat.id === 'likes') score = topPhoto.likes || 0;
        else if (cat.id === '💬') score = topPhoto.comments?.length || 0;
        else score = topPhoto.reactions?.[cat.id] || 0;
      }

      return { title: cat.title, emoji: cat.emoji, photo: topPhoto, score };
    }).filter((r) => r.photo && r.score > 0);

    if (event?.has_official_photos) {
      const officialPhotos = photos
        .filter((p) => p.status === 'approved' && p.is_official)
        .sort((a, b) => (b.likes || 0) - (a.likes || 0));
      if (officialPhotos.length > 0 && (officialPhotos[0].likes || 0) > 0) {
        ranking.push({ title: 'Melhor Foto Oficial', emoji: '📸', photo: officialPhotos[0], score: officialPhotos[0].likes || 0 });
      }
    }

    return ranking;
  }, [photos, event?.has_official_photos]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const pendingPhotos = photos.filter((p) => p.status === 'pending');
  const pendingComments = photos.flatMap((p) =>
    (p.comments || [])
      .map((c, i) => ({ ...c, photoId: p.id, photoUrl: p.url, index: i }))
      .filter((c) => c.status === 'pending'),
  );

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <header className="max-w-5xl mx-auto flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-neutral-200 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Curadoria
              </h1>
              <p className="text-neutral-500 text-sm">Aprovação de conteúdo para o evento /{slug}</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`}
                className="w-10 h-10 rounded-full border border-neutral-200"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=random`; }}
              />
              <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-red-500 transition-colors" title="Sair">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-2 bg-neutral-200 p-1 rounded-2xl w-fit">
          {(['photos', 'comments', 'prints', 'controls'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-6 py-2 rounded-xl text-sm font-bold transition-all',
                filter === tab ? 'bg-white shadow-sm' : 'text-neutral-500',
              )}
            >
              {tab === 'photos' && `Fotos (${pendingPhotos.length})`}
              {tab === 'comments' && `Comentários (${pendingComments.length})`}
              {tab === 'prints' && `Pedidos (${printOrders.filter((o) => o.status !== 'completed').length})`}
              {tab === 'controls' && 'Controles & Ranking'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {filter === 'controls' ? (
          <div className="space-y-8">
            <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Controles do Evento
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-sm">Upload Oficial</h3>
                    <p className="text-[10px] text-neutral-500">Enviar fotos como equipe</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleOfficialUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Enviando...' : 'Selecionar Fotos'}
                  </button>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-sm">Pausar Interações</h3>
                    <p className="text-[10px] text-neutral-500">Bloquear envios e curtidas</p>
                  </div>
                  <button
                    onClick={handleToggleInteractions}
                    className={cn(
                      'w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors',
                      event?.interactions_paused
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100',
                    )}
                  >
                    {event?.interactions_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {event?.interactions_paused ? 'Retomar Interações' : 'Pausar Interações'}
                  </button>
                </div>

                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-sm">Ranking na TV</h3>
                    <p className="text-[10px] text-neutral-500">Mostrar destaques no telão</p>
                  </div>
                  <button
                    onClick={handleToggleTVRanking}
                    className={cn(
                      'w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors',
                      event?.tv_show_ranking
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100',
                    )}
                  >
                    <Trophy className="w-4 h-4" />
                    {event?.tv_show_ranking ? 'Ocultar Ranking' : 'Mostrar Ranking'}
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Ranking de Destaques
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rankingData.map((item, idx) => (
                  <div key={idx} className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex flex-col items-center text-center gap-3">
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight">{item.title}</h3>
                      <p className="text-[10px] font-bold text-neutral-400">Score: {item.score}</p>
                    </div>
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative">
                      <img src={item.photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white font-bold text-xs truncate">{item.photo.user_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {rankingData.length === 0 && (
                  <div className="col-span-full py-12 text-center text-neutral-400 font-medium">
                    Nenhuma foto com interações suficientes ainda.
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : filter === 'photos' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingPhotos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm flex flex-col">
                <div className="aspect-square relative">
                  <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold">
                    {photo.user_name}
                  </div>
                </div>
                <div className="p-4 flex gap-2 mt-auto">
                  <button
                    onClick={() => handleRejectPhoto(photo.id)}
                    className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Rejeitar
                  </button>
                  <button
                    onClick={() => handleApprovePhoto(photo)}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Aprovar
                  </button>
                </div>
              </div>
            ))}
            {pendingPhotos.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-neutral-200">
                <ShieldCheck className="w-16 h-16 mx-auto text-neutral-200 mb-4" />
                <p className="text-neutral-400 font-medium">Nenhuma foto aguardando aprovação.</p>
              </div>
            )}
          </div>
        ) : filter === 'comments' ? (
          <div className="grid gap-4">
            {pendingComments.map((comment, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                  <img src={comment.photoUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-400 mb-1">{comment.user}</p>
                  <p className="text-sm text-neutral-700 truncate">{comment.text}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const photo = photos.find((p) => p.id === comment.photoId);
                      if (photo) handleModerateComment(comment.photoId, photo.comments, comment.index, 'rejected');
                    }}
                    className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const photo = photos.find((p) => p.id === comment.photoId);
                      if (photo) handleModerateComment(comment.photoId, photo.comments, comment.index, 'approved');
                    }}
                    className="p-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {pendingComments.length === 0 && (
              <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-200">
                <MessageCircle className="w-16 h-16 mx-auto text-neutral-200 mb-4" />
                <p className="text-neutral-400 font-medium">Nenhum comentário aguardando aprovação.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              {printOrders.filter((o) => o.status !== 'completed').map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Printer className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">{order.userName}</h3>
                      <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">{order.option}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        {order.photoIds.length} fotos selecionadas •{' '}
                        {(order.createdAt as any)?.toDate
                          ? (order.createdAt as any).toDate().toLocaleString()
                          : new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-neutral-100 text-neutral-600 rounded-2xl hover:bg-neutral-200 transition-colors"
                      title="Ver fotos"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePrintOrder(order.id)}
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                      title="Excluir pedido"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleCompletePrintOrder(order.id)}
                      className="p-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors"
                      title="Concluir pedido"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {printOrders.filter((o) => o.status !== 'completed').length === 0 && (
                <div className="py-20 text-center bg-white rounded-[40px] border border-neutral-200">
                  <Printer className="w-16 h-16 mx-auto text-neutral-200 mb-4" />
                  <p className="text-neutral-400 font-medium">Nenhum pedido de impressão pendente.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Fotos do Pedido</h2>
                <p className="text-sm text-neutral-500">{selectedOrder.userName} - {selectedOrder.option}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-neutral-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {selectedOrder.photoIds.map((photoId) => {
                  const photo = photos.find((p) => p.id === photoId);
                  return (
                    <div key={photoId} className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                      {photo ? (
                        <img src={photo.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 p-2 text-center">
                          Foto não encontrada ou removida
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-3 rounded-2xl font-bold text-neutral-600 hover:bg-neutral-200 transition-colors">
                Fechar
              </button>
              <button
                onClick={() => { handleCompletePrintOrder(selectedOrder.id); setSelectedOrder(null); }}
                className="px-8 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" /> Concluir Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
