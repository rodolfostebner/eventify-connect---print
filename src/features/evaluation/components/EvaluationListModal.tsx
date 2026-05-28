import React, { useState } from 'react';
import { Star, X, Trash2, Edit2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Evaluation, EventData, AppUser } from '../../../types';
import { deleteEvaluation } from '../../../services/evaluationService';

interface Props {
  exhibitorName: string;
  evaluations: Evaluation[];
  event: EventData;
  user: AppUser | null;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: () => void;
}

export function EvaluationListModal({
  exhibitorName,
  evaluations,
  event,
  user,
  onClose,
  onRefresh,
  onEdit,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const primaryColor = event.primary_color || '#3FA790';

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    setDeletingId(id);
    try {
      await deleteEvaluation(id);
      onRefresh();
    } catch (err) {
      console.error('Erro ao excluir avaliação:', err);
      alert('Não foi possível excluir a avaliação.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (starsCount: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < starsCount ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-none'
        }`}
      />
    ));
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
          className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#ECECF1] pb-3 mb-4 shrink-0">
            <div>
              <h2 className="text-lg font-black text-[#2D2D3F]">Avaliações e Comentários</h2>
              <p className="text-xs text-[#5A5A6E] mt-0.5">{exhibitorName}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 text-[#5A5A6E]" />
            </button>
          </div>

          {/* List of Comments */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {evaluations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-[#5A5A6E] gap-2">
                <span className="text-4xl">💬</span>
                <p className="text-xs font-semibold">Nenhuma avaliação deixada ainda.</p>
                <p className="text-[11px] text-[#94949E]">Seja o primeiro a avaliar este expositor!</p>
              </div>
            ) : (
              evaluations.map((evalItem) => {
                const isOwner = user && user.id === evalItem.user_id;
                const isAdmin = user && (user.role === 'admin' || user.role === 'event_admin');
                const showActions = isOwner || isAdmin;
                const displayName = evalItem.user?.display_name || 'Participante';

                return (
                  <div key={evalItem.id} className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#ECECF1] space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        {evalItem.user?.photo_url ? (
                          <img
                            src={evalItem.user.photo_url}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover border border-white"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-xs font-bold text-[#2D2D3F]">{displayName}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex items-center gap-0.5">{renderStars(evalItem.stars)}</div>
                            <span className="text-[10px] text-[#94949E]">
                              {new Date(evalItem.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {showActions && (
                        <div className="flex items-center gap-1">
                          {isOwner && (
                            <button
                              onClick={onEdit}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-amber-500 hover:bg-white transition-colors"
                              title="Editar avaliação"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(evalItem.id)}
                            disabled={deletingId === evalItem.id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-white transition-colors disabled:opacity-50"
                            title="Excluir avaliação"
                          >
                            {deletingId === evalItem.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {evalItem.comment && (
                      <p className="text-xs text-[#2D2D3F] leading-relaxed pl-1">
                        {evalItem.comment}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
