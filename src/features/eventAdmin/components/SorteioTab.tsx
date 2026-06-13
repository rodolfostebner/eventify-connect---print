import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Trophy, Plus, Trash2, Edit3, Tv, Gift, Users, Play, X, CheckCircle2,
  Loader2, ImagePlus, Store, ChevronRight, ArrowLeft, Package, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import type { EventData, RafflePrize, Exhibitor, Product } from '../../../types';
import {
  getPrizes, createPrize, updatePrize, deletePrize,
  drawPrize, setTvRaffleState, getTicketCount, subscribeToPrizes,
} from '../../../services/raffleService';
import { uploadImage } from '../../../services/storageService';
import { createNotification } from '../../../services/notificationService';
import { getExhibitors } from '../../../services/exhibitorService';
import { getProducts } from '../../../services/productService';

interface Props {
  event: EventData;
  onEventUpdate: (ev: EventData) => void;
}

type PrizeForm = {
  name: string;
  description: string;
  image_url: string;
  order_index: number;
};

type FormMode = 'livre' | 'expositor';
type PickerStep = 'exhibitor' | 'product';

const EMPTY_FORM: PrizeForm = { name: '', description: '', image_url: '', order_index: 0 };

export function SorteioTab({ event, onEventUpdate }: Props) {
  const [prizes, setPrizes] = useState<RafflePrize[]>([]);
  const [ticketCount, setTicketCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PrizeForm>(EMPTY_FORM);
  const [formMode, setFormMode] = useState<FormMode>('livre');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Picker de expositor/produto
  const [pickerStep, setPickerStep] = useState<PickerStep>('exhibitor');
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loadingExhibitors, setLoadingExhibitors] = useState(false);
  const [selectedExhibitor, setSelectedExhibitor] = useState<Exhibitor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const tvState = event.tv_raffle_state ?? 'idle';
  const tvPrizeId = event.tv_raffle_prize_id ?? null;

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    try {
      const [p, count] = await Promise.all([
        getPrizes(event.id),
        getTicketCount(event.id),
      ]);
      setPrizes(p);
      setTicketCount(count);
    } catch {
      toast.error('Erro ao carregar prêmios');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => {
    load();
    return subscribeToPrizes(event.id, load);
  }, [load]);

  // ─── Form helpers ─────────────────────────────────────────────────────────

  function openNew() {
    setForm({ ...EMPTY_FORM, order_index: prizes.length + 1 });
    setEditingId(null);
    setFormMode('livre');
    resetPicker();
    setShowForm(true);
  }

  function openEdit(prize: RafflePrize) {
    setForm({
      name: prize.name,
      description: prize.description ?? '',
      image_url: prize.image_url ?? '',
      order_index: prize.order_index,
    });
    setEditingId(prize.id);
    setFormMode('livre');
    resetPicker();
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    resetPicker();
  }

  function resetPicker() {
    setPickerOpen(false);
    setPickerStep('exhibitor');
    setSelectedExhibitor(null);
    setExhibitors([]);
    setProducts([]);
  }

  // ─── Modo expositor — carregar expositores ─────────────────────────────────

  async function handleSelectModeExpositor() {
    setFormMode('expositor');
    setPickerOpen(true);
    setPickerStep('exhibitor');
    setSelectedExhibitor(null);
    setProducts([]);
    setLoadingExhibitors(true);
    try {
      const list = await getExhibitors(event.id);
      setExhibitors(list);
    } catch {
      toast.error('Erro ao carregar expositores');
    } finally {
      setLoadingExhibitors(false);
    }
  }

  // ─── Picker — seleciona expositor ─────────────────────────────────────────

  async function handlePickExhibitor(exhibitor: Exhibitor) {
    setSelectedExhibitor(exhibitor);
    setPickerStep('product');
    setLoadingProducts(true);
    try {
      const list = await getProducts(exhibitor.id);
      setProducts(list);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingProducts(false);
    }
  }

  // ─── Picker — seleciona produto e preenche o form ─────────────────────────

  function handlePickProduct(product: Product) {
    setForm((f) => ({
      ...f,
      name: `${product.name} (${selectedExhibitor!.name})`,
      description: product.description ?? '',
      image_url: product.photos?.[0] ?? '',
    }));
    setFormMode('livre');
    setPickerOpen(false);
    setPickerStep('exhibitor');
  }

  // ─── Upload de imagem ─────────────────────────────────────────────────────

  async function handleUploadImage(file: File) {
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  // ─── Salvar prêmio ────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nome do prêmio é obrigatório'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await updatePrize(editingId, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          image_url: form.image_url || null,
          order_index: form.order_index,
        });
        toast.success('Prêmio atualizado');
      } else {
        await createPrize({
          event_id: event.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          image_url: form.image_url || null,
          order_index: form.order_index,
        });
        toast.success('Prêmio criado');
      }
      closeForm();
      load();
    } catch {
      toast.error('Erro ao salvar prêmio');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(prize: RafflePrize) {
    if (!confirm(`Excluir o prêmio "${prize.name}"?`)) return;
    try {
      if (tvPrizeId === prize.id) {
        await setTvRaffleState(event.id, 'idle', null);
        onEventUpdate({ ...event, tv_raffle_state: 'idle', tv_raffle_prize_id: null });
      }
      await deletePrize(prize.id);
      toast.success('Prêmio excluído');
      load();
    } catch {
      toast.error('Erro ao excluir prêmio');
    }
  }

  // ─── Controles do telão ───────────────────────────────────────────────────

  async function handleShowPrize(prize: RafflePrize) {
    try {
      await setTvRaffleState(event.id, 'showing_prize', prize.id);
      onEventUpdate({ ...event, tv_raffle_state: 'showing_prize', tv_raffle_prize_id: prize.id });
      toast.success(`"${prize.name}" exibido no telão`);
    } catch {
      toast.error('Erro ao atualizar telão');
    }
  }

  // Esconde o overlay do telão mas mantém o prêmio "armado" (prize_id continua),
  // para o sorteio seguir a um clique depois da contagem regressiva nos avisos.
  async function handleHide(prize: RafflePrize) {
    try {
      await setTvRaffleState(event.id, 'idle', prize.id);
      onEventUpdate({ ...event, tv_raffle_state: 'idle', tv_raffle_prize_id: prize.id });
      toast.success('Telão ocultado — prêmio segue preparado para sortear');
    } catch {
      toast.error('Erro ao ocultar o telão');
    }
  }

  async function handleDraw(prize: RafflePrize) {
    if (prize.winner_ticket_id) { toast.error('Este prêmio já foi sorteado'); return; }
    if (ticketCount === 0) { toast.error('Nenhum participante cadastrado para sortear'); return; }
    if (!confirm(`Sortear "${prize.name}" agora? Esta ação não pode ser desfeita.`)) return;
    setDrawing(prize.id);
    try {
      const winner = await drawPrize(prize.id, event.id);
      if (winner) {
        const name = winner.user?.display_name || winner.user?.email || 'Participante';
        toast.success(`Ganhador(a): ${name}`);
        onEventUpdate({ ...event, tv_raffle_state: 'showing_winner', tv_raffle_prize_id: prize.id });
        // Avisa o ganhador no app (in-app realtime: sino + toast/push se aberto).
        if (winner.user_id) {
          createNotification({
            userId: winner.user_id,
            title: '🎉 Você foi sorteado(a)!',
            body: `Parabéns! Você ganhou "${prize.name}". Procure a organização para retirar seu prêmio.`,
            link: event.slug ? `/event/${event.slug}` : undefined,
          }).catch((e) => console.error('[Sorteio] Falha ao notificar ganhador:', e));
        }
        load();
      } else {
        toast.error('Erro ao realizar sorteio');
      }
    } catch {
      toast.error('Erro ao realizar sorteio');
    } finally {
      setDrawing(null);
    }
  }

  async function handleClose() {
    try {
      await setTvRaffleState(event.id, 'idle', null);
      onEventUpdate({ ...event, tv_raffle_state: 'idle', tv_raffle_prize_id: null });
      toast.success('Sorteio encerrado no telão');
    } catch {
      toast.error('Erro ao encerrar sorteio no telão');
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const activePrize = prizes.find((p) => p.id === tvPrizeId);
  // Prêmio preparado mas com o telão oculto (escondido entre o "Mostrar" e o "Sortear").
  const hiddenArmed = tvState === 'idle' && !!tvPrizeId;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Status do telão */}
      <div className={cn(
        'rounded-2xl border p-4 flex items-center gap-4',
        tvState === 'showing_winner' ? 'bg-green-50 border-green-200' :
        (tvState === 'showing_prize' || hiddenArmed) ? 'bg-blue-50 border-blue-200' :
        'bg-neutral-50 border-neutral-200',
      )}>
        <Tv className={cn('w-5 h-5 shrink-0',
          tvState === 'showing_winner' ? 'text-green-600' :
          (tvState === 'showing_prize' || hiddenArmed) ? 'text-blue-500' : 'text-neutral-400',
        )} />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Estado do Telão</p>
          <p className="text-sm font-bold text-neutral-800">
            {tvState === 'idle' && !tvPrizeId && 'Sorteio inativo'}
            {hiddenArmed && `Prêmio preparado (telão oculto): ${activePrize?.name ?? '—'}`}
            {tvState === 'showing_prize' && `Exibindo prêmio: ${activePrize?.name ?? '—'}`}
            {tvState === 'showing_winner' && `Ganhador revelado: ${activePrize?.name ?? '—'}`}
          </p>
        </div>
        {(tvState !== 'idle' || tvPrizeId) && (
          <button
            onClick={handleClose}
            className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Encerrar
          </button>
        )}
      </div>

      {/* Participantes */}
      <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 rounded-2xl border border-neutral-200">
        <Users className="w-4 h-4 text-neutral-500" />
        <p className="text-sm text-neutral-700">
          <span className="font-black">{ticketCount}</span> participante{ticketCount !== 1 ? 's' : ''} concorrendo
        </p>
      </div>

      {/* Lista de prêmios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-neutral-800 flex items-center gap-2">
            <Gift className="w-4 h-4" /> Prêmios
          </h3>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Prêmio
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        ) : prizes.length === 0 ? (
          <div className="text-center py-10 text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">Nenhum prêmio cadastrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize) => {
              const isOnTv = tvPrizeId === prize.id;        // prêmio armado (mostrando ou oculto)
              const onScreen = isOnTv && tvState === 'showing_prize'; // visível no telão agora
              const drawn = !!prize.winner_ticket_id;
              const winnerName = prize.winner?.display_name || prize.winner?.email || null;

              return (
                <div
                  key={prize.id}
                  className={cn(
                    'rounded-2xl border p-4 flex gap-4 items-start transition-all',
                    isOnTv ? 'border-blue-300 bg-blue-50' : 'border-neutral-200 bg-white',
                    !prize.active && 'opacity-50',
                  )}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                    {prize.image_url ? (
                      <img src={prize.image_url} alt={prize.name} className="w-full h-full object-cover" />
                    ) : (
                      <Gift className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-neutral-900">{prize.name}</p>
                      <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
                        #{prize.order_index}
                      </span>
                      {drawn && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Sorteado
                        </span>
                      )}
                    </div>
                    {prize.description && (
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{prize.description}</p>
                    )}
                    {drawn && winnerName && (
                      <p className="text-xs font-bold text-green-700 mt-1">🏆 Ganhador(a): {winnerName}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    {!drawn && (
                      <>
                        {onScreen ? (
                          <button
                            onClick={() => handleHide(prize)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-neutral-700 text-white hover:bg-neutral-800 transition-colors"
                          >
                            <EyeOff className="w-3 h-3" /> Esconder
                          </button>
                        ) : (
                          <button
                            onClick={() => handleShowPrize(prize)}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <Tv className="w-3 h-3" /> {isOnTv ? 'Reexibir' : 'Mostrar'}
                          </button>
                        )}
                        {isOnTv && (
                          <button
                            onClick={() => handleDraw(prize)}
                            disabled={drawing === prize.id}
                            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {drawing === prize.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Play className="w-3 h-3" />}
                            Sortear!
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => openEdit(prize)}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                    {!drawn && (
                      <button
                        onClick={() => handleDelete(prize)}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Excluir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

            {/* Header do modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
              {pickerOpen && pickerStep === 'product' ? (
                <button
                  onClick={() => { setPickerStep('exhibitor'); setSelectedExhibitor(null); setProducts([]); }}
                  className="flex items-center gap-1.5 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Expositores
                </button>
              ) : (
                <h3 className="text-base font-black text-neutral-900">
                  {editingId ? 'Editar Prêmio' : 'Novo Prêmio'}
                </h3>
              )}
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-neutral-100">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Seletor de modo (só em criação) */}
            {!editingId && !pickerOpen && (
              <div className="px-6 pt-4 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Origem do Prêmio</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormMode('livre')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold border transition-all',
                      formMode === 'livre'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
                    )}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edição livre
                  </button>
                  <button
                    onClick={handleSelectModeExpositor}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold border transition-all',
                      formMode === 'expositor'
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400',
                    )}
                  >
                    <Store className="w-3.5 h-3.5" /> De um expositor
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo do modal */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Picker: lista de expositores ── */}
              {pickerOpen && pickerStep === 'exhibitor' && (
                <div className="p-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                    Selecione o expositor
                  </p>
                  {loadingExhibitors ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                    </div>
                  ) : exhibitors.length === 0 ? (
                    <p className="text-sm text-neutral-400 text-center py-8">Nenhum expositor ativo neste evento</p>
                  ) : (
                    exhibitors.map((ex) => (
                      <button
                        key={ex.id}
                        onClick={() => handlePickExhibitor(ex)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                          {ex.logo_url ? (
                            <img src={ex.logo_url} alt={ex.name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {ex.number ? `${ex.number}. ` : ''}{ex.name}
                          </p>
                          {ex.category && (
                            <p className="text-[11px] text-neutral-400 truncate">{ex.category}</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* ── Picker: lista de produtos do expositor ── */}
              {pickerOpen && pickerStep === 'product' && (
                <div className="p-6 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
                    Produtos de {selectedExhibitor?.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Selecione o produto que será o prêmio
                  </p>
                  {loadingProducts ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-bold">Nenhum produto ativo</p>
                      <p className="text-xs mt-1">Este expositor não tem produtos cadastrados</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handlePickProduct(product)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all text-left"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 flex items-center justify-center">
                          {product.photos?.[0] ? (
                            <img src={product.photos[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-neutral-900 truncate">{product.name}</p>
                          {product.description && (
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{product.description}</p>
                          )}
                          {product.price != null && (
                            <p className="text-[11px] font-bold text-neutral-600 mt-1">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* ── Formulário de edição livre ── */}
              {!pickerOpen && (
                <div className="p-6 space-y-4">

                  {/* Banner de origem (quando veio de produto) */}
                  {!editingId && form.name && form.image_url && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                      <Store className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <p className="text-[11px] font-bold text-blue-700">
                        Campos preenchidos a partir do produto. Edite à vontade.
                      </p>
                    </div>
                  )}

                  {/* Foto */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Foto do Prêmio</p>
                    <div className="flex gap-3 items-center">
                      <div className="w-20 h-20 rounded-xl border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center shrink-0">
                        {form.image_url ? (
                          <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Gift className="w-8 h-8 text-neutral-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 transition-colors"
                        >
                          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                          {uploading ? 'Enviando...' : 'Escolher imagem'}
                        </button>
                        {form.image_url && (
                          <button
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                            className="text-[11px] font-bold text-red-500 hover:underline text-left"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(file);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Nome do Prêmio *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ex: Notebook Dell, Voucher R$500..."
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Detalhes do prêmio..."
                      rows={2}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>

                  {/* Ordem */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Ordem do Sorteio
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.order_index}
                      onChange={(e) => setForm((f) => ({ ...f, order_index: Number(e.target.value) }))}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer com ações (só no form livre) */}
            {!pickerOpen && (
              <div className="flex gap-2 px-6 py-4 border-t border-neutral-100 shrink-0">
                <button
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || uploading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Salvar' : 'Criar Prêmio'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
