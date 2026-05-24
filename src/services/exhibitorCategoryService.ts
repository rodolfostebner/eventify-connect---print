import { supabase } from '../lib/supabase/client';
import type { ExhibitorCategory } from '../types';

export async function getExhibitorCategories(eventId: string): Promise<ExhibitorCategory[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('exhibitor_categories')
    .select('*')
    .eq('event_id', eventId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data as ExhibitorCategory[];
}

export async function createExhibitorCategory(data: {
  event_id: string;
  name: string;
  icon: string;
  color: string;
  order_index: number;
}): Promise<ExhibitorCategory> {
  if (!supabase) throw new Error('Supabase não configurado');
  const { data: created, error } = await supabase
    .from('exhibitor_categories')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return created as ExhibitorCategory;
}

export async function updateExhibitorCategory(
  id: string,
  data: Partial<Pick<ExhibitorCategory, 'name' | 'icon' | 'color' | 'order_index'>>,
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('exhibitor_categories')
    .update(data)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteExhibitorCategory(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('exhibitor_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Catálogo de ícones preset para facilitar o cadastro
export const ICON_CATALOG: { icon: string; label: string; color: string }[] = [
  { icon: '🍔', label: 'Gastronomia',  color: '#E87A5C' },
  { icon: '🍕', label: 'Pizzaria',     color: '#C0392B' },
  { icon: '🍰', label: 'Confeitaria',  color: '#8B4513' },
  { icon: '🥤', label: 'Bebidas',      color: '#3FA075' },
  { icon: '🌭', label: 'Lanches',      color: '#E74C3C' },
  { icon: '👗', label: 'Moda',         color: '#C77DBA' },
  { icon: '👟', label: 'Calçados',     color: '#5B8FE8' },
  { icon: '👜', label: 'Acessórios',   color: '#E8B85B' },
  { icon: '💻', label: 'Tecnologia',   color: '#5B8FE8' },
  { icon: '📱', label: 'Apps',         color: '#0A1F44' },
  { icon: '🤖', label: 'Robótica',     color: '#1F2B5B' },
  { icon: '🎮', label: 'Games',        color: '#5B21B6' },
  { icon: '🎨', label: 'Arte',         color: '#E8B85B' },
  { icon: '🧶', label: 'Artesanato',   color: '#D2691E' },
  { icon: '🕯️', label: 'Velas',       color: '#C58A1E' },
  { icon: '🛠️', label: 'Serviços',    color: '#7B7BE8' },
  { icon: '🔧', label: 'Manutenção',   color: '#4A4A4A' },
  { icon: '💅', label: 'Beleza',       color: '#E85B8A' },
  { icon: '💇', label: 'Cabelo',       color: '#7A1F4A' },
  { icon: '✨', label: 'Estética',     color: '#B86585' },
  { icon: '🌿', label: 'Bem-estar',    color: '#5BC0A8' },
  { icon: '🧘', label: 'Yoga',         color: '#3FA790' },
  { icon: '📚', label: 'Educação',     color: '#3B82F6' },
  { icon: '⚽', label: 'Esportes',     color: '#3FA790' },
  { icon: '🎵', label: 'Música',       color: '#7C3AED' },
  { icon: '🐶', label: 'Pets',         color: '#8D6E63' },
  { icon: '🌺', label: 'Flores',       color: '#E85B8A' },
  { icon: '🏠', label: 'Decoração',    color: '#6B4423' },
  { icon: '🧼', label: 'Higiene',      color: '#A8C77F' },
  { icon: '💊', label: 'Saúde',        color: '#3FBFA0' },
  { icon: '📷', label: 'Fotografia',   color: '#2A2A2A' },
  { icon: '🌱', label: 'Sustentável',  color: '#3FA075' },
  { icon: '🏷️', label: 'Outros',      color: '#94949E' },
];
