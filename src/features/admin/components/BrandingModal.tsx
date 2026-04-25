import { useRef, useState } from 'react';
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
  summaryFileInputRef: React.RefObject<HTMLInputElement>;
  onSummaryUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onItemFileUpload: (type: 'exhibitors' | 'sponsors' | 'services', index: number, field: 'logo' | 'photo', file: File) => Promise<void>;
}

function ColorPicker({ label, sublabel, value, onChange }: { label: string; sublabel?: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <div className="flex flex-col mb-1">
        <label className="text-[10px] font-bold uppercase text-neutral-500">{label}</label>
        {sublabel && <span className="text-[8px] text-neutral-400 font-medium">{sublabel}</span>}
      </div>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono" />
      </div>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-10 h-5 rounded-full transition-all relative",
        value ? "bg-green-500" : "bg-neutral-200"
      )}
    >
      <div className={cn(
        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
        value ? "right-1" : "left-1"
      )} />
    </button>
  );
}

function ItemFileUpload({ 
  label, 
  value, 
  onUpload 
}: { 
  label: string; 
  value?: string; 
  onUpload: (file: File) => void 
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex-1">
      <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">{label}</label>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={value || ''} 
          readOnly 
          placeholder="URL ou Upload..." 
          className="flex-1 bg-white border border-neutral-200 rounded-lg px-2 py-1.5 text-[10px] truncate" 
        />
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        <button 
          onClick={() => inputRef.current?.click()} 
          disabled={isUploading}
          className="p-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        </button>
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
  onItemFileUpload,
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
            className="relative bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Personalizar Evento</h3>
              <button onClick={onClose}><CloseIcon className="w-6 h-6 text-neutral-400" /></button>
            </div>

            <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">

              {/* Informações Básicas e Cores do App */}
              <section className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Identidade Visual do Evento</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Nome do Evento</label>
                    <input type="text" value={form.name} onChange={e => set({ name: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Data do Evento</label>
                    <input 
                      type="datetime-local" 
                      value={(() => {
                        if (!form.date) return '';
                        try {
                          const d = new Date(form.date);
                          return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                        } catch {
                          return '';
                        }
                      })()} 
                      onChange={e => set({ date: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Logo Principal (URL)</label>
                    <input type="text" value={form.logo_url} onChange={e => set({ logo_url: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" placeholder="URL da imagem..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">E-mails de Administradores</label>
                    <input type="text" value={form.admin_emails_input} onChange={e => set({ admin_emails_input: e.target.value })} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" placeholder="email1@exemplo.com, email2@exemplo.com" />
                    <p className="text-[9px] text-neutral-400 mt-1 uppercase font-bold tracking-tighter">Separe por vírgula para múltiplos admins.</p>
                  </div>
                </div>

                <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-100 space-y-4">
                  <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2">Cores do Aplicativo (Versão Mobile)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker 
                      label="Cor de Destaque" 
                      sublabel="Botões, Ícones ativos e Links"
                      value={form.primary_color} 
                      onChange={v => set({ primary_color: v })} 
                    />
                    <ColorPicker 
                      label="Cor de Texto" 
                      sublabel="Títulos e Corpo do texto"
                      value={form.secondary_color} 
                      onChange={v => set({ secondary_color: v })} 
                    />
                  </div>
                </div>
              </section>

              {/* App Background */}
              <section className="space-y-4 p-5 bg-neutral-50 rounded-3xl border border-neutral-100">
                <label className="block text-[10px] font-black uppercase text-neutral-400 tracking-widest">Plano de Fundo (App)</label>
                <div className="flex gap-2">
                  {(['color', 'gradient', 'pattern'] as const).map(t => (
                    <button key={t} onClick={() => set({ bg_type: t })} className={cn('flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all', form.bg_type === t ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500 border border-neutral-200')}>
                      {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                    </button>
                  ))}
                </div>
                {form.bg_type === 'color' && (
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                    <input type="text" value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="flex-1 bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono" />
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Início</label><input type="color" value={form.bg_gradient_from} onChange={e => set({ bg_gradient_from: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                        <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Fim</label><input type="color" value={form.bg_gradient_to} onChange={e => set({ bg_gradient_to: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                      </div>
                    )}
                  </div>
                )}
                {form.bg_type === 'pattern' && (
                  <div className="space-y-3">
                    <select value={form.bg_value} onChange={e => set({ bg_value: e.target.value })} className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm">
                      <option value="dots">Pontos</option><option value="grid">Grade</option><option value="diagonal">Diagonal</option><option value="waves">Ondas</option><option value="circuit">Circuito</option><option value="hexagons">Hexágonos</option>
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Cor Fundo</label><input type="color" value={form.bg_pattern_bg} onChange={e => set({ bg_pattern_bg: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                      <div className="space-y-1"><label className="text-[8px] uppercase font-bold text-neutral-400">Cor Padrão</label><input type="color" value={form.bg_pattern_fg} onChange={e => set({ bg_pattern_fg: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" /></div>
                    </div>
                  </div>
                )}
              </section>

              {/* TV Customization */}
              <section className="space-y-4 p-5 bg-neutral-900 rounded-3xl border border-white/10 text-white shadow-xl shadow-blue-900/10">
                <div className="flex items-center gap-2 mb-2"><Palette className="w-4 h-4 text-blue-400" /><h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Painel TV (Realtime)</h4></div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker 
                    label="Cor de Destaque TV" 
                    sublabel="Bordas de Fotos e Ranking"
                    value={form.tv_primary_color} 
                    onChange={v => set({ tv_primary_color: v })} 
                  />
                  <ColorPicker 
                    label="Cor de Texto TV" 
                    sublabel="Nomes e Pontuações no Telão"
                    value={form.tv_secondary_color} 
                    onChange={v => set({ tv_secondary_color: v })} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[8px] font-bold uppercase text-neutral-500">Fundo da TV</label>
                  <div className="flex gap-2">
                    {(['color', 'gradient', 'pattern'] as const).map(t => (
                      <button key={t} onClick={() => set({ tv_bg_type: t })} className={cn('flex-1 py-2 rounded-xl text-[8px] font-bold uppercase transition-all', form.tv_bg_type === t ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400 border border-white/5')}>
                        {t === 'color' ? 'Cor' : t === 'gradient' ? 'Degradê' : 'Padrão'}
                      </button>
                    ))}
                  </div>
                  {form.tv_bg_type === 'color' && <input type="color" value={form.tv_bg_value} onChange={e => set({ tv_bg_value: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" />}
                  {form.tv_bg_type === 'gradient' && (
                    <div className="grid grid-cols-2 gap-4">
                      <input type="color" value={form.tv_bg_gradient_from} onChange={e => set({ tv_bg_gradient_from: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                      <input type="color" value={form.tv_bg_gradient_to} onChange={e => set({ tv_bg_gradient_to: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                    </div>
                  )}
                  {form.tv_bg_type === 'pattern' && (
                    <div className="space-y-3">
                      <select value={form.tv_bg_value} onChange={e => set({ tv_bg_value: e.target.value })} className="w-full bg-neutral-800 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white outline-none">
                        <option value="dots">Pontos</option><option value="grid">Grade</option><option value="diagonal">Diagonal</option><option value="waves">Ondas</option><option value="circuit">Circuito</option><option value="hexagons">Hexágonos</option>
                      </select>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="color" value={form.tv_bg_pattern_bg} onChange={e => set({ tv_bg_pattern_bg: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                        <input type="color" value={form.tv_bg_pattern_fg} onChange={e => set({ tv_bg_pattern_fg: e.target.value })} className="w-full h-10 rounded-lg overflow-hidden border-none cursor-pointer" />
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Funcionalidades */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Configurações de Fluxo</h4>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-2">Comentários Padrão Sugeridos</label>
                  <textarea 
                    defaultValue={Array.isArray(form.custom_comments) ? form.custom_comments.join(', ') : ''} 
                    onBlur={e => set({ custom_comments: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                    placeholder="Lindo!, Adorei, Que momento!" 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" 
                    rows={2}
                  />
                  <p className="text-[9px] text-neutral-400 mt-1 italic">Separe as opções por vírgula.</p>
                </div>
              </section>

              {/* Branding Adicional */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Branding & Contato</h4>
                <div className="space-y-3">
                  <input type="text" value={form.app_description} onChange={e => set({ app_description: e.target.value })} placeholder="Breve Descrição (Sempre visível)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  <input type="text" value={form.app_logo} onChange={e => set({ app_logo: e.target.value })} placeholder="Logo Redonda do App (URL)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" value={form.app_whatsapp} onChange={e => set({ app_whatsapp: e.target.value })} placeholder="WhatsApp" className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                    <input type="text" value={form.app_instagram} onChange={e => set({ app_instagram: e.target.value })} placeholder="Instagram" className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                    <input type="text" value={form.app_website} onChange={e => set({ app_website: e.target.value })} placeholder="Website" className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                  </div>
                  <textarea value={form.owner_text} onChange={e => set({ owner_text: e.target.value })} placeholder="Texto de Boas-vindas / Sobre o Evento..." rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
                  <input type="text" value={form.owner_photo} onChange={e => set({ owner_photo: e.target.value })} placeholder="Foto de Capa do Evento (URL)" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
                  <textarea value={form.post_event_message} onChange={e => set({ post_event_message: e.target.value })} placeholder="Mensagem de Agradecimento (Pós-Evento)..." rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm resize-none" />
                </div>
              </section>

              {/* Summary File */}
              <section className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Download de Resumo</h4>
                <input type="file" accept=".pdf,application/pdf" ref={summaryFileInputRef} onChange={onSummaryUpload} className="hidden" />
                <div className="flex items-center gap-3">
                  <button onClick={() => summaryFileInputRef.current?.click()} disabled={isUploadingSummary} className="flex-1 py-4 bg-white border-2 border-neutral-100 rounded-2xl text-xs font-black flex items-center justify-center gap-3 hover:bg-neutral-50 transition-all disabled:opacity-50 active:scale-95 shadow-sm">
                    {isUploadingSummary ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-neutral-400" />}
                    {form.summary_file_url ? 'Substituir PDF' : 'Upload de Resumo (PDF)'}
                  </button>
                  {form.summary_file_url && (
                    <button onClick={() => set({ summary_file_url: '' })} className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors border-2 border-transparent">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </section>

              {/* Exhibitors / Sponsors / Services */}
              {(['exhibitors', 'sponsors', 'services'] as const).map((type) => (
                <section key={type} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {type === 'exhibitors' ? 'Expositores' : type === 'sponsors' ? 'Patrocinadores' : 'Serviços'}
                    </h4>
                    <button
                      onClick={() => {
                        const newItem: ExhibitorSponsor = { id: Math.random().toString(36).substr(2, 9), name: '', bio: '', socials: { instagram: '', whatsapp: '', website: '' } };
                        set({ [type]: [...(form[type] as ExhibitorSponsor[]), newItem] });
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all text-[10px] font-bold"
                    >
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(form[type] as ExhibitorSponsor[]).map((item, index) => (
                      <div key={item.id} className="p-5 bg-neutral-50 rounded-[32px] border border-neutral-100 space-y-4 relative shadow-sm">
                        <button
                          onClick={() => {
                            const newList = [...(form[type] as ExhibitorSponsor[])];
                            newList.splice(index, 1);
                            set({ [type]: newList });
                          }}
                          className="absolute top-4 right-4 p-2 text-neutral-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 gap-3 pt-4">
                          <div>
                            <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Nome</label>
                            <input type="text" value={item.name} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; newList[index].name = e.target.value; set({ [type]: newList }); }} placeholder="Nome do parceiro" className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs" />
                          </div>
                          
                          <div className="flex gap-3">
                            <ItemFileUpload 
                              label="Logo (Quadrada)" 
                              value={item.logo} 
                              onUpload={(file) => onItemFileUpload(type, index, 'logo', file)} 
                            />
                            <ItemFileUpload 
                              label="Foto (Destaque)" 
                              value={item.photo} 
                              onUpload={(file) => onItemFileUpload(type, index, 'photo', file)} 
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Breve Descrição</label>
                            <textarea value={item.bio} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; newList[index].bio = e.target.value; set({ [type]: newList }); }} placeholder="O que este parceiro faz?" rows={2} className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs resize-none" />
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Mensagem Pós-Evento (Agradecimento)</label>
                            <textarea value={item.message || item.final_message} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; newList[index].message = e.target.value; set({ [type]: newList }); }} placeholder="Mensagem de encerramento..." rows={2} className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs resize-none" />
                          </div>

                          <div>
                            <label className="block text-[8px] font-bold uppercase text-neutral-400 mb-1">Redes Sociais</label>
                            <div className="grid grid-cols-3 gap-2">
                              {['instagram', 'whatsapp', 'website'].map(social => (
                                <input key={social} type="text" value={item.socials?.[social as keyof typeof item.socials] || ''} onChange={e => { const newList = [...(form[type] as ExhibitorSponsor[])]; newList[index].socials = { ...newList[index].socials, [social]: e.target.value }; set({ [type]: newList }); }} placeholder={social.charAt(0).toUpperCase() + social.slice(1)} className="bg-white border border-neutral-200 rounded-xl px-2 py-1.5 text-[10px]" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <button onClick={onSave} disabled={loading} className="w-full py-5 bg-neutral-900 text-white rounded-2xl font-black text-sm hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-xl shadow-neutral-900/20 active:scale-95">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Todas as Alterações'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

