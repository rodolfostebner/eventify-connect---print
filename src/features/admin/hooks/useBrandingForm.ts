import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { updateEvent, uploadEventSummary } from '../../../services/eventService';
import { uploadImage } from '../../../services/storageService';
import type { EventData, ExhibitorSponsor } from '../../../types';

export type BrandingFormState = {
  name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  bg_type: 'color' | 'gradient' | 'pattern';
  bg_value: string;
  bg_gradient_from: string;
  bg_gradient_to: string;
  bg_pattern_bg: string;
  bg_pattern_fg: string;
  tv_bg_type: 'color' | 'gradient' | 'pattern';
  tv_bg_value: string;
  tv_bg_gradient_from: string;
  tv_bg_gradient_to: string;
  tv_bg_pattern_bg: string;
  tv_bg_pattern_fg: string;
  tv_primary_color: string;
  tv_secondary_color: string;
  comment_moderation_enabled: boolean;
  owner_text: string;
  owner_photo: string;
  post_event_message: string;
  summary_file_url: string;
  has_official_photos: boolean;
  exhibitors: ExhibitorSponsor[];
  sponsors: ExhibitorSponsor[];
  services: ExhibitorSponsor[];
  date: string;
  custom_comments: string[];
  upload_source: 'camera' | 'gallery' | 'both';
  app_description: string;
  app_whatsapp: string;
  app_instagram: string;
  app_website: string;
  app_logo: string;
  admin_emails_input: string;
};

const defaultBrandingForm: BrandingFormState = {
  name: '',
  logo_url: '',
  primary_color: '#000000',
  secondary_color: '#ffffff',
  bg_type: 'color',
  bg_value: '#f5f5f5',
  bg_gradient_from: '#f5f7fa',
  bg_gradient_to: '#c3cfe2',
  bg_pattern_bg: '#f5f5f5',
  bg_pattern_fg: '#e5e5e5',
  tv_bg_type: 'color',
  tv_bg_value: '#0a0a0a',
  tv_bg_gradient_from: '#0a0a0a',
  tv_bg_gradient_to: '#1a1a1a',
  tv_bg_pattern_bg: '#0a0a0a',
  tv_bg_pattern_fg: '#1a1a1a',
  tv_primary_color: '#ffffff',
  tv_secondary_color: '#000000',
  comment_moderation_enabled: true,
  owner_text: '',
  owner_photo: '',
  post_event_message: '',
  summary_file_url: '',
  has_official_photos: false,
  exhibitors: [],
  sponsors: [],
  services: [],
  date: '',
  custom_comments: [],
  upload_source: 'both',
  app_description: '',
  app_whatsapp: '',
  app_instagram: '',
  app_website: '',
  app_logo: '',
  admin_emails_input: '',
};

export function useBrandingForm(
  setEvents: React.Dispatch<React.SetStateAction<EventData[]>>
) {
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [brandingForm, setBrandingForm] = useState<BrandingFormState>(defaultBrandingForm);
  const [loading, setLoading] = useState(false);
  const [isUploadingSummary, setIsUploadingSummary] = useState(false);
  const summaryFileInputRef = useRef<HTMLInputElement>(null);

  const openBrandingModal = (event: EventData) => {
    setEditingEvent(event);
    setBrandingForm({
      name: event.name || '',
      logo_url: event.logo_url || '',
      primary_color: event.primary_color || '#000000',
      secondary_color: event.secondary_color || '#ffffff',
      bg_type: event.bg_type || 'color',
      bg_value: event.bg_value || '#f5f5f5',
      bg_gradient_from: event.bg_gradient_from || '#f5f7fa',
      bg_gradient_to: event.bg_gradient_to || '#c3cfe2',
      bg_pattern_bg: event.bg_pattern_bg || '#f5f5f5',
      bg_pattern_fg: event.bg_pattern_fg || '#e5e5e5',
      tv_bg_type: event.tv_bg_type || 'color',
      tv_bg_value: event.tv_bg_value || '#0a0a0a',
      tv_bg_gradient_from: event.tv_bg_gradient_from || '#0a0a0a',
      tv_bg_gradient_to: event.tv_bg_gradient_to || '#1a1a1a',
      tv_bg_pattern_bg: event.tv_bg_pattern_bg || '#0a0a0a',
      tv_bg_pattern_fg: event.tv_bg_pattern_fg || '#1a1a1a',
      tv_primary_color: event.tv_primary_color || '#ffffff',
      tv_secondary_color: event.tv_secondary_color || '#000000',
      comment_moderation_enabled: event.comment_moderation_enabled !== undefined ? event.comment_moderation_enabled : true,
      owner_text: event.owner_text || '',
      owner_photo: event.owner_photo || '',
      post_event_message: event.post_event_message || '',
      summary_file_url: event.summary_file_url || '',
      has_official_photos: event.has_official_photos || false,
      exhibitors: event.exhibitors || [],
      sponsors: event.sponsors || [],
      services: event.services || [],
      date: event.date || '',
      custom_comments: event.custom_comments || [],
      upload_source: event.upload_source || 'both',
      app_description: event.app_description || '',
      app_whatsapp: event.app_whatsapp || '',
      app_instagram: event.app_instagram || '',
      app_website: event.app_website || '',
      app_logo: event.app_logo || '',
      admin_emails_input: Array.isArray(event.admin_emails) ? event.admin_emails.join(', ') : '',
    });
  };

  const saveBranding = async () => {
    if (!editingEvent) return;
    setLoading(true);
    
    // Tratamento para não enviar string vazia para campos de data/timestamp
    const { admin_emails_input, ...rest } = brandingForm;
    const payload = { 
      ...rest,
      admin_emails: admin_emails_input.split(',').map(s => s.trim()).filter(Boolean)
    };
    if ((payload as any).date === '') {
      (payload as any).date = null;
    }

    setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...payload } : e));
    try {
      await updateEvent(editingEvent.id, payload);
      setEditingEvent(null);
      toast.success('Personalização salva com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar personalização.');
    }
    setLoading(false);
  };

  const handleSummaryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEvent) return;
    setIsUploadingSummary(true);
    try {
      const url = await uploadEventSummary(editingEvent.id, file);
      setBrandingForm(prev => ({ ...prev, summary_file_url: url }));
      toast.success('Arquivo enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao fazer upload do arquivo.');
    } finally {
      setIsUploadingSummary(false);
    }
  };

  const handleItemFileUpload = async (type: 'exhibitors' | 'sponsors' | 'services', index: number, field: 'logo' | 'photo', file: File) => {
    setLoading(true);
    try {
      const url = await uploadImage(file);
      const newList = [...brandingForm[type]];
      (newList[index] as any)[field] = url;
      setBrandingForm(prev => ({ ...prev, [type]: newList }));
      toast.success('Imagem enviada!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar imagem.');
    } finally {
      setLoading(false);
    }
  };

  return {
    editingEvent,
    setEditingEvent,
    brandingForm,
    setBrandingForm,
    loading,
    isUploadingSummary,
    summaryFileInputRef,
    openBrandingModal,
    saveBranding,
    handleSummaryFileUpload,
    handleItemFileUpload,
  };
}
