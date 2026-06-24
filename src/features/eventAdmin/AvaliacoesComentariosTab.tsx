import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, FileDown, Loader2, MessageSquareOff, Search, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import {
  getEvaluationsReport, getJurorEvaluationsReport,
  type EvaluationReportRow, type JurorEvaluationReportRow,
} from '../../services/evaluationService';

// ─── Rótulos / estilos de role ────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin Geral',
  event_admin: 'Admin do Evento',
  avaliador: 'Avaliador',
  expositor: 'Expositor',
  participant: 'Participante',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-50 text-purple-700',
  event_admin: 'bg-blue-50 text-blue-700',
  avaliador: 'bg-amber-50 text-amber-700',
  expositor: 'bg-emerald-50 text-emerald-700',
  participant: 'bg-neutral-100 text-neutral-500',
};

const roleLabel = (role: string | null) => (role ? ROLE_LABELS[role] ?? role : 'Sem cadastro');
const roleBadge = (role: string | null) => (role ? ROLE_BADGE[role] ?? 'bg-neutral-100 text-neutral-500' : 'bg-neutral-100 text-neutral-400');

const COMMENT_STATUS: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Aprovado', cls: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pendente', cls: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Rejeitado', cls: 'bg-rose-50 text-rose-700' },
};

const fmtDate = (iso: string) => {
  try {
    return format(new Date(iso), "dd/MM/yy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
};

const exhibitorCol = (number: number | null, name: string) =>
  number != null ? `#${number} ${name}` : name;

// ─── Ordenação por cabeçalho ──────────────────────────────────────────────────

type SortDir = 'asc' | 'desc';
interface SortState { key: string; dir: SortDir; }

function SortableTh({
  label, sortKey, sort, onSort, align = 'left', className,
}: {
  label: string;
  sortKey: string;
  sort: SortState | null;
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort!.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={cn('px-4 py-3', align === 'center' && 'text-center', align === 'right' && 'text-right', className)}>
      <button
        onClick={() => onSort(sortKey)}
        className={cn(
          'inline-flex items-center gap-1 uppercase tracking-wider font-bold transition-colors',
          active ? 'text-neutral-700' : 'text-neutral-400 hover:text-neutral-600',
        )}
      >
        {label}
        <Icon className={cn('w-3 h-3', !active && 'opacity-50')} />
      </button>
    </th>
  );
}

// Tri-estado: 1º clique aplica direção padrão da coluna, 2º inverte, 3º volta ao default da tabela.
function makeHandleSort(
  setSort: React.Dispatch<React.SetStateAction<SortState | null>>,
  defaultDirFor: (key: string) => SortDir,
) {
  return (key: string) =>
    setSort(prev => {
      const def = defaultDirFor(key);
      if (prev?.key !== key) return { key, dir: def };
      if (prev.dir === def) return { key, dir: def === 'asc' ? 'desc' : 'asc' };
      return null;
    });
}

// Comparador genérico: números por valor, texto por localeCompare; empate por data desc.
function sortRows<T>(
  rows: T[],
  sort: SortState | null,
  valueOf: (r: T, key: string) => string | number,
  tiebreak: (a: T, b: T) => number,
): T[] {
  if (!sort) return rows;
  const { key, dir } = sort;
  const mult = dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = valueOf(a, key);
    const vb = valueOf(b, key);
    const cmp = typeof va === 'number' && typeof vb === 'number'
      ? va - vb
      : String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' });
    return cmp !== 0 ? cmp * mult : tiebreak(a, b);
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────

const SUB_TABS = [
  { id: 'publico', label: 'Público (estrelas + comentário)' },
  { id: 'resumo', label: 'Resumo por expositor' },
  { id: 'jurados', label: 'Jurados (por categoria)' },
] as const;

type SubTabId = typeof SUB_TABS[number]['id'];

export function AvaliacoesComentariosTab({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [tab, setTab] = useState<SubTabId>('publico');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all',
              tab === id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'publico' && <PublicReport eventId={eventId} eventName={eventName} />}
      {tab === 'resumo' && <SummaryReport eventId={eventId} eventName={eventName} />}
      {tab === 'jurados' && <JurorReport eventId={eventId} eventName={eventName} />}
    </div>
  );
}

// ─── Sub-aba: Avaliações do Público ───────────────────────────────────────────

const ROLE_FILTERS = ['todos', 'participant', 'avaliador', 'expositor', 'event_admin', 'admin'] as const;
type RoleFilter = typeof ROLE_FILTERS[number];

const PUB_SORT: Record<string, (r: EvaluationReportRow) => string | number> = {
  avaliador: r => (r.user_name || r.user_email || '').toLowerCase(),
  perfil: r => roleLabel(r.user_role),
  expositor: r => r.exhibitor_number ?? 0,
  estrelas: r => r.stars,
  comentario: r => (r.comment?.trim() ? 1 : 0),
  status: r => (r.comment?.trim() ? r.comment_status : ''),
  data: r => r.created_at,
};
const pubDefaultDir = (key: string): SortDir => (['estrelas', 'comentario', 'data'].includes(key) ? 'desc' : 'asc');

function PublicReport({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [rows, setRows] = useState<EvaluationReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos');
  const [onlyComments, setOnlyComments] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const handleSort = makeHandleSort(setSort, pubDefaultDir);

  useEffect(() => {
    setLoading(true);
    getEvaluationsReport(eventId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      if (roleFilter !== 'todos' && r.user_role !== roleFilter) return false;
      if (onlyComments && !r.comment?.trim()) return false;
      if (q) {
        const hay = `${r.user_name ?? ''} ${r.user_email ?? ''} ${r.exhibitor_name} ${r.comment ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, roleFilter, onlyComments, search]);

  const sorted = useMemo(
    () => sortRows(filtered, sort, (r, k) => PUB_SORT[k](r), (a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [filtered, sort],
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      const now = new Date();
      doc.setFontSize(14);
      doc.setTextColor(23, 23, 23);
      doc.text(`Avaliações do Público — ${eventName}`, 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · ${sorted.length} avaliações`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Avaliador', 'Perfil', 'Expositor', '★', 'Comentário', 'Status', 'Data']],
        body: sorted.map(r => [
          r.user_name || r.user_email || '—',
          roleLabel(r.user_role),
          exhibitorCol(r.exhibitor_number, r.exhibitor_name),
          String(r.stars),
          r.comment?.trim() || '—',
          r.comment?.trim() ? (COMMENT_STATUS[r.comment_status]?.label ?? r.comment_status) : '—',
          fmtDate(r.created_at),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [23, 23, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 3: { halign: 'center', cellWidth: 8 }, 4: { cellWidth: 50 } },
      });
      doc.save(`avaliacoes-publico-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`);
    } catch (err) {
      console.error('[AvaliacoesComentariosTab] Erro ao exportar PDF:', err);
      toast.error('Erro ao gerar o PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
        <Star className="w-10 h-10 mb-3" />
        <p className="text-sm font-bold text-neutral-400">Nenhuma avaliação do público registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTERS.map(rf => {
            const count = rf === 'todos' ? rows.length : rows.filter(r => r.user_role === rf).length;
            return (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-full transition-all',
                  roleFilter === rf ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
                )}
              >
                {rf === 'todos' ? 'Todos' : roleLabel(rf)} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
          <button
            onClick={() => setOnlyComments(v => !v)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-bold rounded-full transition-all',
              onlyComments ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
            )}
          >
            Só com comentário
          </button>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={exporting || sorted.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Exportar PDF
        </button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por avaliador, expositor ou texto do comentário…"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>

      <p className="text-[10px] text-neutral-400">
        {sorted.length} de {rows.length} avaliações · a coluna “Perfil” mostra a role atual do usuário · clique nos títulos para ordenar.
      </p>

      <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-[10px]">
            <tr>
              <SortableTh label="Avaliador" sortKey="avaliador" sort={sort} onSort={handleSort} />
              <SortableTh label="Perfil" sortKey="perfil" sort={sort} onSort={handleSort} />
              <SortableTh label="Expositor" sortKey="expositor" sort={sort} onSort={handleSort} />
              <SortableTh label="★" sortKey="estrelas" sort={sort} onSort={handleSort} align="center" />
              <SortableTh label="Comentário" sortKey="comentario" sort={sort} onSort={handleSort} />
              <SortableTh label="Status" sortKey="status" sort={sort} onSort={handleSort} align="center" />
              <SortableTh label="Data" sortKey="data" sort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map(r => (
              <tr key={r.id} className="hover:bg-neutral-50 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-900">{r.user_name || '—'}</p>
                  {r.user_email && <p className="text-neutral-400">{r.user_email}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', roleBadge(r.user_role))}>
                    {roleLabel(r.user_role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{exhibitorCol(r.exhibitor_number, r.exhibitor_name)}</td>
                <td className="px-4 py-3 text-center font-bold text-amber-600 whitespace-nowrap">{r.stars}★</td>
                <td className="px-4 py-3 text-neutral-600 max-w-[280px]">
                  {r.comment?.trim() ? r.comment : <span className="text-neutral-300">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {r.comment?.trim() ? (
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', COMMENT_STATUS[r.comment_status]?.cls ?? 'bg-neutral-100 text-neutral-500')}>
                      {COMMENT_STATUS[r.comment_status]?.label ?? r.comment_status}
                    </span>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-aba: Resumo por expositor (soma + média de estrelas) ─────────────────

interface SummaryRow {
  exhibitor_id: string;
  exhibitor_number: number | null;
  exhibitor_name: string;
  count: number;
  sum: number;
  avg: number;
}

const SUM_SORT: Record<string, (r: SummaryRow) => string | number> = {
  expositor: r => r.exhibitor_number ?? 0,
  avaliacoes: r => r.count,
  soma: r => r.sum,
  media: r => r.avg,
};
const sumDefaultDir = (key: string): SortDir => (key === 'expositor' ? 'asc' : 'desc');

function SummaryReport({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [rows, setRows] = useState<EvaluationReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sort, setSort] = useState<SortState | null>(null);
  const handleSort = makeHandleSort(setSort, sumDefaultDir);

  useEffect(() => {
    setLoading(true);
    getEvaluationsReport(eventId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const summary = useMemo<SummaryRow[]>(() => {
    const map = new Map<string, SummaryRow>();
    for (const r of rows) {
      const cur = map.get(r.exhibitor_id) ?? {
        exhibitor_id: r.exhibitor_id,
        exhibitor_number: r.exhibitor_number,
        exhibitor_name: r.exhibitor_name,
        count: 0,
        sum: 0,
        avg: 0,
      };
      cur.count += 1;
      cur.sum += r.stars;
      map.set(r.exhibitor_id, cur);
    }
    const list = [...map.values()].map(s => ({ ...s, avg: s.count > 0 ? s.sum / s.count : 0 }));
    // Default (sort == null): média desc — mesma ordem da parte pública do ranking.
    return sort
      ? sortRows(list, sort, (r, k) => SUM_SORT[k](r), (a, b) => b.avg - a.avg || b.count - a.count)
      : [...list].sort((a, b) => b.avg - a.avg || b.count - a.count);
  }, [rows, sort]);

  const maxSum = useMemo(() => Math.max(1, ...summary.map(s => s.sum)), [summary]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      const now = new Date();
      doc.setFontSize(14);
      doc.setTextColor(23, 23, 23);
      doc.text(`Resumo de Estrelas por Expositor — ${eventName}`, 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · ${summary.length} expositores`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['#', 'Expositor', 'Avaliações', 'Soma ★', 'Média ★']],
        body: summary.map((s, i) => [
          String(i + 1),
          exhibitorCol(s.exhibitor_number, s.exhibitor_name),
          String(s.count),
          String(s.sum),
          s.avg.toFixed(2),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [23, 23, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
        },
      });
      doc.save(`resumo-estrelas-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`);
    } catch (err) {
      console.error('[AvaliacoesComentariosTab] Erro ao exportar PDF:', err);
      toast.error('Erro ao gerar o PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (summary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
        <Star className="w-10 h-10 mb-3" />
        <p className="text-sm font-bold text-neutral-400">Nenhuma avaliação do público registrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-neutral-500 leading-relaxed max-w-2xl">
          Soma e média das estrelas do público por expositor. <strong>Ordenado por média decrescente</strong> (padrão) —
          essa média é exatamente a base da nota pública no ranking do pós-evento (<code>public_score</code>).
          A soma serve para enxergar o volume; o ranking final ainda pondera os jurados.
        </p>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 shrink-0"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Exportar PDF
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-[10px]">
            <tr>
              <th className="px-4 py-3 w-8 text-center text-[10px] uppercase tracking-wider font-bold text-neutral-400">#</th>
              <SortableTh label="Expositor" sortKey="expositor" sort={sort} onSort={handleSort} />
              <SortableTh label="Avaliações" sortKey="avaliacoes" sort={sort} onSort={handleSort} align="center" />
              <SortableTh label="Soma ★" sortKey="soma" sort={sort} onSort={handleSort} />
              <SortableTh label="Média ★" sortKey="media" sort={sort} onSort={handleSort} align="center" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {summary.map((s, i) => (
              <tr key={s.exhibitor_id} className="hover:bg-neutral-50">
                <td className="px-4 py-3 text-center tabular-nums text-neutral-400">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td className="px-4 py-3 text-neutral-800 font-medium">{exhibitorCol(s.exhibitor_number, s.exhibitor_name)}</td>
                <td className="px-4 py-3 text-center text-neutral-600 tabular-nums">{s.count}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden min-w-[60px]">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(s.sum / maxSum) * 100}%` }} />
                    </div>
                    <span className="tabular-nums font-bold text-neutral-700 w-8 text-right">{s.sum}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center font-bold text-amber-600 tabular-nums whitespace-nowrap">{s.avg.toFixed(2)}★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sub-aba: Avaliações dos Jurados ──────────────────────────────────────────

const JUR_SORT: Record<string, (r: JurorEvaluationReportRow) => string | number> = {
  jurado: r => (r.user_name || r.user_email || '').toLowerCase(),
  perfil: r => roleLabel(r.user_role),
  expositor: r => r.exhibitor_number ?? 0,
  categoria: r => (r.category_name || '').toLowerCase(),
  nota: r => r.score,
  data: r => r.created_at,
};
const jurDefaultDir = (key: string): SortDir => (['nota', 'data'].includes(key) ? 'desc' : 'asc');

function JurorReport({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [rows, setRows] = useState<JurorEvaluationReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState | null>(null);
  const handleSort = makeHandleSort(setSort, jurDefaultDir);

  useEffect(() => {
    setLoading(true);
    getJurorEvaluationsReport(eventId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      `${r.user_name ?? ''} ${r.user_email ?? ''} ${r.exhibitor_name} ${r.category_name ?? ''}`.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const sorted = useMemo(
    () => sortRows(filtered, sort, (r, k) => JUR_SORT[k](r), (a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [filtered, sort],
  );

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      const now = new Date();
      doc.setFontSize(14);
      doc.setTextColor(23, 23, 23);
      doc.text(`Avaliações dos Jurados — ${eventName}`, 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} · ${sorted.length} notas`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Jurado', 'Perfil', 'Expositor', 'Categoria', 'Nota', 'Data']],
        body: sorted.map(r => [
          r.user_name || r.user_email || '—',
          roleLabel(r.user_role),
          exhibitorCol(r.exhibitor_number, r.exhibitor_name),
          r.category_name || '—',
          r.score.toFixed(2),
          fmtDate(r.created_at),
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [23, 23, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 4: { halign: 'center', cellWidth: 14 } },
      });
      doc.save(`avaliacoes-jurados-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`);
    } catch (err) {
      console.error('[AvaliacoesComentariosTab] Erro ao exportar PDF:', err);
      toast.error('Erro ao gerar o PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
        <MessageSquareOff className="w-10 h-10 mb-3" />
        <p className="text-sm font-bold text-neutral-400">Nenhuma nota de jurado registrada</p>
        <p className="text-xs mt-1 text-neutral-400">Jurados pontuam por categoria — sem comentário.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por jurado, expositor ou categoria…"
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting || sorted.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Exportar PDF
        </button>
      </div>

      <p className="text-[10px] text-neutral-400">{sorted.length} de {rows.length} notas · clique nos títulos para ordenar.</p>

      <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-[10px]">
            <tr>
              <SortableTh label="Jurado" sortKey="jurado" sort={sort} onSort={handleSort} />
              <SortableTh label="Perfil" sortKey="perfil" sort={sort} onSort={handleSort} />
              <SortableTh label="Expositor" sortKey="expositor" sort={sort} onSort={handleSort} />
              <SortableTh label="Categoria" sortKey="categoria" sort={sort} onSort={handleSort} />
              <SortableTh label="Nota" sortKey="nota" sort={sort} onSort={handleSort} align="center" />
              <SortableTh label="Data" sortKey="data" sort={sort} onSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map(r => (
              <tr key={r.id} className="hover:bg-neutral-50 align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-900">{r.user_name || '—'}</p>
                  {r.user_email && <p className="text-neutral-400">{r.user_email}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap', roleBadge(r.user_role))}>
                    {roleLabel(r.user_role)}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-700">{exhibitorCol(r.exhibitor_number, r.exhibitor_name)}</td>
                <td className="px-4 py-3 text-neutral-600">{r.category_name || '—'}</td>
                <td className="px-4 py-3 text-center font-bold text-neutral-900 tabular-nums">{r.score.toFixed(2)}</td>
                <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{fmtDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
