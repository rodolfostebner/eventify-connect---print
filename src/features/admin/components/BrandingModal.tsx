import { Plus, CheckCircle2, Upload, Trash2, Loader2, Eye, X as CloseIcon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../lib/utils';
import type { ExhibitorSponsor, EventData } from '../../../types';
import type { BrandingFormState } from '../hooks/useBrandingForm';

interface BrandingModalProps {
  event: EventData | null;
  form: BrandingFormState;
  onChange: React.Dispatch<React.SetStateAction<BrandingFormState>>;
  onSave: () => void;
  onClose: () => void;
  loading: boolean;
  isUploadingSummary: boolean;
  summaryFileInputRef: React.RefObject<HTMLInputElement | null>;
  onSummaryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('w-12 h-6 rounded-full transition-all relative', value ? 'bg-green-500' : 'bg-neutral-300')}
    >
      <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all', value ? 'right-1' : 'left-1')} />
    </button>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">{label}</label>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
      </div>
    </div>
  );
}

export function BrandingModal({
  event,
  form,
  onChange,
  onSave,
  onClose,
  loading,
  isUploadingSummary,
  summaryFileInputRef,
  onSummaryUpload,
}: BrandingModalProps) {
  const set = (partial: Partial<BrandingFormState>) => onChange(prev => ({ ...prev, ...partial }));

  return (
    <AnimatePresence>
      {event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Personalizar Evento</h3>
              <button onClick={onClose}><CloseIcon className="w-6 h-6 text-neutral-400" /></button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Nome do Evento</label>
                  <input type="text" value={form.name} onChange={e => set({ name: e.target.value })} placeholder="Nome do Evento" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Data do Evento</label>
                  <input type="datetime-local" value={typeof form.date === 'string' ? form.date.slice(0, 16) : ''} onChange={e => set({ date: e.target.value ? new Date(e.target.value).toISOString() : '' })} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">URL da Logo</label>
                  <input type="text" value={form.logo_url} onChange={e => set({ logo_url: e.target.value })} placeholder="https://exemplo.com/logo.png" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker label="Cor Primária" value={form.primary_color} onChange={v => set({ primary_color: v })} />
                <ColorPicker label="Cor Secundária" value={form.secondary_color} onChange={v => set({ secondary_color: v })} />
              </div>

              {/* App Background */}
              <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <label className="block text-[10px] font-bold uppercase text-neutral-400">Plano de Fundo</label>
                <div className="flex gap-2">
                  {(['color', 'gradient', 'pattern'] as const).map(t => (
                    <button key={t} onClick={() => set({ bg_type: t })} className={cn('flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all', form.bg_type === t ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200')}>
                      {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                    </button>
                  ))}
                </div>
                {form.bg_type === 'color' && (
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                    <input type="text" value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                  </div>
                )}
                {form.bg_type === 'gradient' && (
                  <div className="space-y-3">
                    <select value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm">
                      <option value="custom">Personalizado</option>
                      <option value="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)">Suave</option>
                      <option value="linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)">Pôr do Sol</option>
                      <option value="linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)">Lavanda</option>
                      <option value="linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)">Oceano</option>
                      <option value="linear-gradient(to right, #4facfe 0%, #00f2fe 100%)">Céu Azul</option>
                    </select>
                    {form.bg_value === 'custom' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">De</label><input type="color" value={form.bg_gradient_from} onChange={e => set({ bg_gradient_from: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Para</label><input type="color" value={form.bg_gradient_to} onChange={e => set({ bg_gradient_to: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                      </div>
                    )}
                  </div>
                )}
                {form.bg_type === 'pattern' && (
                  <div className="space-y-3">
                    <select value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm">
                      <option value="dots">Pontos</option><option value="grid">Grade</option><option value="diagonal">Diagonal</option><option value="waves">Ondas</option><option value="circuit">Circuito</option><option value="hexagons">Hexágonos</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Cor Fundo</label><input type="color" value={form.bg_pattern_bg} onChange={e => set({ bg_pattern_bg: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                      <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Cor Padrão</label><input type="color" value={form.bg_pattern_fg} onChange={e => set({ bg_pattern_fg: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                    </div>
                  </div>
                )}
              </div>

              {/* TV Customization */}
              <div className="space-y-4 p-4 bg-neutral-900 rounded-2xl border border-white/10 text-white">
                <div className="flex items-center gap-2"><Palette className="w-4 h-4 text-blue-400" /><label className="block text-[10px] font-bold uppercase text-blue-400">Personalização da TV</label></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Primária TV</label><input type="color" value={form.tv_primary_color} onChange={e => set({ tv_primary_color: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                  <div><label className="block text-[8px] font-bold uppercase text-neutral-500 mb-1">Cor Secundária TV</label><input type="color" value={form.tv_secondary_color} onChange={e => set({ tv_secondary_color: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[8px] font-bold uppercase text-neutral-500">Fundo da TV</label>
                  <div className="flex gap-2">
                    {(['color', 'gradient', 'pattern'] as const).map(t => (
                      <button key={t} onClick={() => set({ tv_bg_type: t })} className={cn('flex-1 py-1.5 rounded-lg text-[8px] font-bold uppercase transition-all', form.tv_bg_type === t ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400 border border-white/5')}>
                        {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                      </button>
                    ))}
                  </div>
                  {form.tv_bg_type === 'color' && <input type="color" value={form.tv_bg_value} onChange={e => set({ tv_bg_value: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />}
                  {form.tv_bg_type === 'gradient' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="color" value={form.tv_bg_gradient_from} onChange={e => set({ tv_bg_gradient_from: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                      <input type="color" value={form.tv_bg_gradient_to} onChange={e => set({ tv_bg_gradient_to: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                    </div>
                  )}
                  {form.tv_bg_type === 'pattern' && (
                    <div className="space-y-2">
                      <select value={form.tv_bg_value} onChange={e => set({ tv_bg_value: e.target.value })} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white">
                        <option value="dots">Pontos</option><option value="grid">Grade</option><option value="diagonal">Diagonal</option><option value="waves">Ondas</option><option value="circuit">Circuito</option><option value="hexagons">Hexágonos</option>
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="color" value={form.tv_bg_pattern_bg} onChange={e => set({ tv_bg_pattern_bg: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                        <input type="color" value={form.tv_bg_pattern_fg} onChange={e => set({ tv_bg_pattern_fg: e.target.value })} className="w-full h-8 rounded-lg overflow-hidden border-none cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div><p className="text-xs font-bold">Moderação de Comentários</p><p className="text-[10px] text-neutral-400">Exigir aprovação manual</p></div>
                  <ToggleSwitch value={form.comment_moderation_enabled} onChange={() => set({ comment_moderation_enabled: !form.comment_moderation_enabled })} />
                </div>
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div><p className="text-xs font-bold">Fotos Oficiais</p><p className="text-[10px] text-neutral-400">Habilitar seção de fotos da equipe</p></div>
                  <ToggleSwitch value={form.has_official_photos} onChange={() => set({ has_official_photos: !form.has_official_photos })} />
                </div>
              </div>

              {/* Content Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Comentários Padrão (Separados por vírgula)</label>
                  <input type="text" value={Array.isArray(form.custom_comments) ? form.custom_comments.join(', ') : ''} onChange={e => set({ custom_comments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Lindo!, Adorei, Que momento!" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Origem de Upload (Live)</label>
                  <select value={form.upload_source || 'both'} onChange={e => set({ upload_source: e.target.value as any })} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm">
                    <option value="both">Câmera e Galeria</option><option value="camera">Apenas Câmera</option><option value="gallery">Apenas Galeria</option>
                  </select>
                </div>
              </div>

              {/* App Branding */}
              <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase text-neutral-400">App & Identidade</label>
                <input type="text" value={form.app_description} onChange={e => set({ app_description: e.target.value })} placeholder="Descrição do App (Menu Lateral)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                <input type="text" value={form.app_logo} onChange={e => set({ app_logo: e.target.value })} placeholder="Logo do App (URL)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={form.app_whatsapp} onChange={e => set({ app_whatsapp: e.target.value })} placeholder="WhatsApp" className="bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-xs" />
                  <input type="text" value={form.app_instagram} onChange={e => set({ app_instagram: e.target.value })} placeholder="Instagram" className="bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-xs" />
                  <input type="text" value={form.app_website} onChange={e => set({ app_website: e.target.value })} placeholder="Website" className="bg-neutral-50 border border-neutral-200 rounded-xl px-2 py-2 text-xs" />
                </div>
                <textarea value={form.owner_text} onChange={e => set({ owner_text: e.target.value })} placeholder="Sobre o Dono/Evento..." rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
                <input type="text" value={form.owner_photo} onChange={e => set({ owner_photo: e.target.value })} placeholder="Foto/Logo do Dono (URL)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                <textarea value={form.post_event_message} onChange={e => set({ post_event_message: e.target.value })} placeholder="Mensagem Pós-Evento..." rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
              </div>

              {/* Summary File Upload */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-2">Arquivo de Resumo do Evento (PDF)</label>
                <input type="file" accept=".pdf,application/pdf" ref={summaryFileInputRef} onChange={onSummaryUpload} className="hidden" />
                <div className="flex items-center gap-3">
                  <button onClick={() => summaryFileInputRef.current?.click()} disabled={isUploadingSummary} className="flex-1 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors disabled:opacity-50">
                    {isUploadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {form.summary_file_url ? 'Alterar Arquivo' : 'Selecionar Arquivo'}
                  </button>
                  {form.summary_file_url && (
                    <button onClick={() => set({ summary_file_url: '' })} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {form.summary_file_url && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-[10px] text-green-700 font-medium flex-1">Arquivo pronto para download</span>
                    <a href={form.summary_file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-green-700 underline">Ver</a>
                  </div>
                )}
              </div>

              {/* Exhibitors / Sponsors / Services */}
              {(['exhibitors', 'sponsors', 'services'] as const).map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase text-neutral-400">
                      {type === 'exhibitors' ? 'Expositores' : type === 'sponsors' ? 'Patrocinadores' : 'Serviços'}
                    </label>
                    <button
                      onClick={() => {
                        const newItem: ExhibitorSponsor = { id: Math.random().toString(36).substr(2, 9), name: '', bio: '', socials: { instagram: '', whatsapp: '', website: '' } };
                        set({ [type]: [...(form[type] as ExhibitorSponsor[]), newItem] });
                      }}
                      className="p-1 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(form[type] as ExhibitorSponsor[]).map((item, index) => (
                      <div key={item.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 relative">
                        <button
                          onClick={() => {
                            const newList = [...(form[type] as ExhibitorSponsor[])];
                            newList.splice(index, 1);
                            set({ [type]: newList });
                          }}
                          className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {['name', 'logo', 'photo', 'bio', 'message'].map(field => (
                          field === 'bio' || field === 'message' ? (
                            <textarea key={field} value={(item as any)[field] || ''} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; (newList[index] as any)[field] = e.target.value; set({ [type]: newList }); }} placeholder={field === 'bio' ? 'Breve descrição...' : 'Mensagem específica...'} rows={2} className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs resize-none" />
                          ) : (
                            <input key={field} type="text" value={(item as any)[field] || ''} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; (newList[index] as any)[field] = e.target.value; set({ [type]: newList }); }} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                          )
                        ))}
                        <div className="grid grid-cols-3 gap-2">
                          {['instagram', 'whatsapp', 'website'].map(social => (
                            <input key={social} type="text" value={item.socials?.[social as keyof typeof item.socials] || ''} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; newList[index].socials = { ...newList[index].socials, [social]: e.target.value }; set({ [type]: newList }); }} placeholder={social.charAt(0).toUpperCase() + social.slice(1)} className="bg-white border border-neutral-200 rounded-xl px-2 py-1.5 text-[10px]" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Preview & Save */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-[10px] font-bold uppercase text-neutral-400 mb-3">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: form.primary_color }}>
                    <Eye className="w-5 h-5" style={{ color: form.secondary_color }} />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
                    <div className="h-full" style={{ width: '60%', backgroundColor: form.primary_color }} />
                  </div>
                </div>
              </div>

              <button onClick={onSave} disabled={loading} className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
