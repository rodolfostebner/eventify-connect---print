import { supabase } from '../lib/supabase/client';
import type { EventData, Exhibitor, Product } from '../types';
import { getExhibitors } from './exhibitorService';
import { getProductsByExhibitorIds } from './productService';

export interface ChartDatum {
  label: string;
  value: number;
}

export interface PhaseVisits {
  unique: number;
  total: number;
}

export interface DashboardData {
  // Métricas gerais
  previstos: number;
  cadastrados: number;
  avgProductsPerExhibitor: number;
  avgProductValue: number;
  completos: number;
  incompletos: number;
  visitsPre: PhaseVisits;
  visitsLive: PhaseVisits;
  visitsPost: PhaseVisits;
  // Gráficos de visitas
  topExhibitors: ChartDatum[];
  bottomExhibitors: ChartDatum[];
  topProducts: ChartDatum[];
  bottomProducts: ChartDatum[];
  uniqueByCategory: ChartDatum[];
}

type VisitRow = {
  exhibitor_id: string | null;
  product_id: string | null;
  user_id: string | null;
  session_id: string | null;
  event_status: 'pre' | 'live' | 'post' | null;
};

// Expositor "completo": nome + logo + foto + >=3 produtos, todos com imagem e preço
function isComplete(ex: Exhibitor, products: Product[]): boolean {
  if (!ex.name?.trim() || !ex.logo_url || !ex.photo_url) return false;
  if (products.length < 3) return false;
  return products.every(p => (p.photos?.length ?? 0) > 0 && p.price != null);
}

// Chave de visitante único: usuário logado ou sessão anônima
function visitorKey(v: VisitRow): string | null {
  return v.user_id ?? v.session_id ?? null;
}

function phaseVisits(visits: VisitRow[], phase: 'pre' | 'live' | 'post'): PhaseVisits {
  const rows = visits.filter(v => v.event_status === phase);
  const keys = new Set<string>();
  for (const v of rows) {
    const k = visitorKey(v);
    if (k) keys.add(k);
  }
  return { total: rows.length, unique: keys.size };
}

export async function getEventDashboard(event: EventData): Promise<DashboardData> {
  const exhibitors = await getExhibitors(event.id);
  const exhibitorIds = exhibitors.map(e => e.id);
  const products = await getProductsByExhibitorIds(exhibitorIds);

  let visits: VisitRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from('visits')
      .select('exhibitor_id, product_id, user_id, session_id, event_status')
      .eq('event_id', event.id);
    visits = (data || []) as VisitRow[];
  }

  // Produtos agrupados por expositor
  const productsByExhibitor = new Map<string, Product[]>();
  for (const p of products) {
    const list = productsByExhibitor.get(p.exhibitor_id) ?? [];
    list.push(p);
    productsByExhibitor.set(p.exhibitor_id, list);
  }

  // Completos / incompletos
  let completos = 0;
  for (const ex of exhibitors) {
    if (isComplete(ex, productsByExhibitor.get(ex.id) ?? [])) completos++;
  }
  const cadastrados = exhibitors.length;

  // Médias
  const avgProductsPerExhibitor = cadastrados ? products.length / cadastrados : 0;
  const priced = products.filter(p => p.price != null) as (Product & { price: number })[];
  const avgProductValue = priced.length
    ? priced.reduce((s, p) => s + p.price, 0) / priced.length
    : 0;

  // Contagem de visitas por expositor (inclui zero)
  const exhibitorVisitCount = new Map<string, number>(exhibitorIds.map(id => [id, 0]));
  const productVisitCount = new Map<string, number>(products.map(p => [p.id, 0]));
  for (const v of visits) {
    if (v.exhibitor_id && exhibitorVisitCount.has(v.exhibitor_id)) {
      exhibitorVisitCount.set(v.exhibitor_id, exhibitorVisitCount.get(v.exhibitor_id)! + 1);
    }
    if (v.product_id && productVisitCount.has(v.product_id)) {
      productVisitCount.set(v.product_id, productVisitCount.get(v.product_id)! + 1);
    }
  }

  const exhibitorName = new Map(exhibitors.map(e => [e.id, e.name]));
  const productName = new Map(products.map(p => [p.id, p.name]));

  const exhibitorData: ChartDatum[] = [...exhibitorVisitCount.entries()]
    .map(([id, value]) => ({ label: exhibitorName.get(id) ?? '—', value }));
  const productData: ChartDatum[] = [...productVisitCount.entries()]
    .map(([id, value]) => ({ label: productName.get(id) ?? '—', value }));

  const topExhibitors = [...exhibitorData].sort((a, b) => b.value - a.value).slice(0, 10);
  const bottomExhibitors = [...exhibitorData].sort((a, b) => a.value - b.value).slice(0, 10);
  const topProducts = [...productData].sort((a, b) => b.value - a.value).slice(0, 10);
  const bottomProducts = [...productData].sort((a, b) => a.value - b.value).slice(0, 10);

  // Visitantes únicos por categoria de expositor
  const categoryByExhibitor = new Map(exhibitors.map(e => [e.id, e.category || 'Outros']));
  const keysByCategory = new Map<string, Set<string>>();
  for (const v of visits) {
    if (!v.exhibitor_id) continue;
    const cat = categoryByExhibitor.get(v.exhibitor_id);
    if (!cat) continue;
    const key = visitorKey(v);
    if (!key) continue;
    const set = keysByCategory.get(cat) ?? new Set<string>();
    set.add(key);
    keysByCategory.set(cat, set);
  }
  const uniqueByCategory: ChartDatum[] = [...keysByCategory.entries()]
    .map(([label, set]) => ({ label, value: set.size }))
    .sort((a, b) => b.value - a.value);

  return {
    previstos: event.exhibitors_estimation ?? 0,
    cadastrados,
    avgProductsPerExhibitor,
    avgProductValue,
    completos,
    incompletos: cadastrados - completos,
    visitsPre: phaseVisits(visits, 'pre'),
    visitsLive: phaseVisits(visits, 'live'),
    visitsPost: phaseVisits(visits, 'post'),
    topExhibitors,
    bottomExhibitors,
    topProducts,
    bottomProducts,
    uniqueByCategory,
  };
}
