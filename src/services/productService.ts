import { supabase } from '../lib/supabase/client';
import type { Product } from '../types';

export async function getProducts(exhibitorId: string): Promise<Product[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('exhibitor_id', exhibitorId)
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as Product[];
}

export async function createProduct(
  data: Omit<Product, 'id' | 'created_at' | 'updated_at'>,
): Promise<Product> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: result, error } = await supabase
    .from('products')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result as Product;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deactivateProduct(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('products')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
