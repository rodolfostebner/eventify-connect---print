import React, { useState, useEffect } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Evaluation, EventData, AppUser } from '../../../types';
import { submitEvaluation, updateEvaluation, getUserEvaluation } from '../../../services/evaluationService';
import { ensureRaffleTicket } from '../../../services/raffleService';

interface Props {
  exhibitorId: string;
  exhibitorName: string;
  event: EventData;
  user: AppUser;
  onClose: () => void;
  onSuccess: () => void;
}

export function EvaluationModal({
  exhibitorId,
  exhibitorName,
  event,
  user,
  onClose,
  onSuccess,
}: Props) {
  const [stars, setStars] = useState<number>(0);
  const [hoveredStars, setHoveredStars] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [existingEvaluation, setExistingEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRaffleNotice, setShowRaffleNotice] = useState<boolean>(false);

  const primaryColor = event.primary_color || '#3FA790';

  // Carrega avaliação anterior se houver
  useEffect(() => {
    getUserEvaluation(exhibitorId, user.id)
      .then((evalData) => {
        if (evalData) {
          setExistingEvaluation(evalData);
          setStars(evalData.stars);
          setComment(evalData.comment || '');
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar avaliação prévia:', err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [exhibitorId, user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      setErrorMsg('Por favor, selecione pelo menos 1 estrela.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (existingEvaluation) {
        // Atualiza avaliação existente
        await updateEvaluation(existingEvaluation.id, stars, comment.trim() || null);
      } else {
        // Cria nova avaliação
        await submitEvaluation({
          event_id: event.id,
          exhibitor_id: exhibitorId,
          user_id: user.id,
          stars,
          comment: comment.trim() || null,
        });

        // Tenta gerar o cupom de sorteio ao avaliar pela primeira vez
        try {
          const ticket = await ensureRaffleTicket(event.id, user.id);
          if (ticket) {
            setShowRaffleNotice(true);
            // Mostra o aviso e espera um momento ou fecha após confirmação
          }
        } catch (ticketErr) {
          console.error('Erro ao criar cupom de sorteio:', ticketErr);
        }
      }

      if (!showRaffleNotice) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar sua avaliação.');
    } finally {
      if (!showRaffleNotice) {
        setLoading(false);
      }
    }
  };

  const handleFinishRaffleNotice = () => {
    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#ECECF1] pb-3 mb-4">
            <h2 className="text-lg font-black text-[#2D2D3F]">
              {existingEvaluation ? 'Editar Avaliação' : 'Deixe sua Avaliação'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 text-[#5A5A6E]" />
            </button>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
              <p className="text-xs text-[#5A5A6E] font-medium">Carregando detalhes...</p>
            </div>
          ) : showRaffleNotice ? (
            <div className="flex flex-col items-center text-center py-6 gap-4">
              <span className="text-5xl animate-bounce">🎟️</span>
              <h3 className="text-lg font-bold text-[#2D2D3F]">Cupom Gerado com Sucesso!</h3>
              <p className="text-xs text-[#5A5A6E] leading-relaxed max-w-xs">
                Você avaliou **{exhibitorName}**! Por isso, seu cupom de sorteio já foi garantido e você está concorrendo aos prêmios deste evento. Boa sorte!
              </p>
              <button
                onClick={handleFinishRaffleNotice}
                className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Excelente!
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-[#5A5A6E] mb-2">
                  Como foi sua experiência no estande de **{exhibitorName}**?
                </p>
                
                {/* Estrelas interativas */}
                <div className="flex items-center justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isActive = starVal <= (hoveredStars || stars);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setStars(starVal)}
                        onMouseEnter={() => setHoveredStars(starVal)}
                        onMouseLeave={() => setHoveredStars(0)}
                        className="p-1 focus:outline-none transition-transform active:scale-125"
                      >
                        <Star
                          className={`w-9 h-9 cursor-pointer transition-colors duration-150 ${
                            isActive
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200 fill-none'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comentário */}
              <div className="space-y-1.5">
                <label htmlFor="comment" className="text-[11px] font-black uppercase tracking-wider text-[#94949E]">
                  Comentário (opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte para nós o que você achou das soluções, do atendimento ou das apresentações deste estande..."
                  rows={4}
                  className="w-full text-xs p-3.5 bg-[#F5F5F7] border border-[#ECECF1] rounded-2xl focus:outline-none focus:ring-2 transition-all resize-none text-[#2D2D3F]"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity cursor-pointer shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : existingEvaluation ? (
                  'Salvar Alterações'
                ) : (
                  'Enviar Avaliação'
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </>
  );
}
