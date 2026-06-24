import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Download, FileDown, ImageOff, Loader2, Store } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { getExhibitorsReport, type ExhibitorReportRow } from '../../services/reportService';
import { fetchAllPosts } from '../../services/posts';
import { downloadImage } from '../../utils/downloadImage';
import { downloadImagesAsZip, type ZipProgress } from '../../utils/downloadZip';
import type { PostData } from '../../types';

// ─── Sub-abas de Relatórios ───────────────────────────────────────────────────

const REPORT_TABS = [
  { id: 'expositores', label: 'Expositores' },
  { id: 'fotos', label: 'Fotos' },
] as const;

type ReportTabId = typeof REPORT_TABS[number]['id'];

export function ReportsTab({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [tab, setTab] = useState<ReportTabId>('expositores');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {REPORT_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-all',
              tab === id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'expositores' && <ExhibitorsReport eventId={eventId} eventName={eventName} />}
      {tab === 'fotos' && <PhotosReport eventId={eventId} eventName={eventName} />}
    </div>
  );
}

// ─── Relatório: Expositores ───────────────────────────────────────────────────

type SortKey = 'nome' | 'logofoto' | 'frase' | 'desc' | 'produtos' | 'logou' | 'visitas';
type SortDir = 'asc' | 'desc';

// Valor comparável de cada coluna (booleans viram 0/1; Logo/Foto vira 0–2)
const SORT_VALUE: Record<SortKey, (r: ExhibitorReportRow) => string | number> = {
  nome: r => r.exhibitor.name,
  logofoto: r => (r.exhibitor.logo_url ? 1 : 0) + (r.exhibitor.photo_url ? 1 : 0),
  frase: r => (r.exhibitor.tagline?.trim() ? 1 : 0),
  desc: r => (r.exhibitor.description?.trim() ? 1 : 0),
  produtos: r => r.productCount,
  logou: r => (r.hasLoggedUser ? 1 : 0),
  visitas: r => r.visitorCount,
};

function SortableTh({
  label, sortKey, sort, onSort, align = 'center',
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: SortDir } | null;
  onSort: (key: SortKey) => void;
  align?: 'left' | 'center';
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort!.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={cn('px-4 py-3', align === 'center' && 'text-center')}>
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

function ExhibitorsReport({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [rows, setRows] = useState<ExhibitorReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  // null = ordem padrão (número do stand)
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);

  const handleSort = (key: SortKey) => {
    setSort(prev => {
      if (prev?.key !== key) return { key, dir: key === 'nome' ? 'asc' : 'desc' };
      if (prev.dir === (key === 'nome' ? 'asc' : 'desc')) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return null; // terceiro clique volta à ordem padrão
    });
  };

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const { key, dir } = sort;
    const mult = dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = SORT_VALUE[key](a);
      const vb = SORT_VALUE[key](b);
      const cmp = typeof va === 'string'
        ? va.localeCompare(vb as string, 'pt-BR', { sensitivity: 'base' })
        : (va as number) - (vb as number);
      // Empate mantém a ordem por número do stand
      return cmp !== 0 ? cmp * mult : a.exhibitor.number - b.exhibitor.number;
    });
  }, [rows, sort]);

  useEffect(() => {
    setLoading(true);
    getExhibitorsReport(eventId)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Exporta a tabela (na ordenação atual) em PDF, com data de geração no cabeçalho
  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);
      const doc = new jsPDF();
      const now = new Date();
      const generatedAt = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

      doc.setFontSize(14);
      doc.setTextColor(23, 23, 23);
      doc.text(`Relatório de Expositores — ${eventName}`, 14, 16);
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Gerado em ${generatedAt} · ${rows.length} expositores`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Nº', 'Nome', 'Logo/Foto', 'Frase', 'Desc', 'Produtos', 'Logou', 'Visitas']],
        body: sortedRows.map(({ exhibitor: ex, productCount, hasLoggedUser, visitorCount }) => [
          ex.number,
          ex.name,
          `${ex.logo_url ? 'L' : '-'}/${ex.photo_url ? 'F' : '-'}`,
          ex.tagline?.trim() ? 'Sim' : '-',
          ex.description?.trim() ? 'Sim' : '-',
          productCount,
          hasLoggedUser ? 'Sim' : '-',
          visitorCount,
        ]),
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [23, 23, 23], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
          7: { halign: 'center' },
        },
        didDrawPage: () => {
          const { pageSize } = doc.internal;
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Página ${doc.getNumberOfPages()}`,
            pageSize.getWidth() - 14,
            pageSize.getHeight() - 8,
            { align: 'right' },
          );
        },
      });

      doc.save(`relatorio-expositores-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`);
    } catch (err) {
      console.error('[ReportsTab] Erro ao exportar PDF:', err);
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
        <Store className="w-10 h-10 mb-3" />
        <p className="text-sm font-bold text-neutral-400">Nenhum expositor cadastrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
          Exportar PDF
        </button>
      </div>

      <div className="overflow-x-auto border border-neutral-100 rounded-2xl">
      <table className="w-full text-left text-xs">
        <thead className="bg-neutral-50 text-[10px]">
          <tr>
            <SortableTh label="Nome" sortKey="nome" sort={sort} onSort={handleSort} align="left" />
            <SortableTh label="Logo/Foto" sortKey="logofoto" sort={sort} onSort={handleSort} />
            <SortableTh label="Frase" sortKey="frase" sort={sort} onSort={handleSort} />
            <SortableTh label="Desc" sortKey="desc" sort={sort} onSort={handleSort} />
            <SortableTh label="Produtos" sortKey="produtos" sort={sort} onSort={handleSort} />
            <SortableTh label="Logou" sortKey="logou" sort={sort} onSort={handleSort} />
            <SortableTh label="Visitas" sortKey="visitas" sort={sort} onSort={handleSort} />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {sortedRows.map(({ exhibitor: ex, productCount, hasLoggedUser, visitorCount }) => (
            <tr key={ex.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3 text-neutral-700 font-medium">
                <span className="text-neutral-400 mr-2">{ex.number}</span>
                {ex.name}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600 font-mono">
                {ex.logo_url ? 'L' : '-'}/{ex.photo_url ? 'F' : '-'}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600">
                {ex.tagline?.trim() ? 'Sim' : '-'}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600">
                {ex.description?.trim() ? 'Sim' : '-'}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600">{productCount}</td>
              <td className="px-4 py-3 text-center text-neutral-600">
                {hasLoggedUser ? 'Sim' : '-'}
              </td>
              <td className="px-4 py-3 text-center text-neutral-600">{visitorCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ─── Relatório: Fotos ─────────────────────────────────────────────────────────

type PhotoFilter = 'todas' | 'approved' | 'official' | 'pending' | 'rejected';

const STATUS_LABEL: Record<PostData['status'], string> = {
  approved: 'aprovada',
  pending: 'pendente',
  rejected: 'rejeitada',
};

const FILTERS: { id: PhotoFilter; label: string; match: (p: PostData) => boolean }[] = [
  { id: 'todas', label: 'Todas', match: () => true },
  { id: 'approved', label: 'Aprovadas', match: p => p.status === 'approved' && !p.is_official },
  { id: 'official', label: 'Oficiais', match: p => p.is_official },
  { id: 'pending', label: 'Pendentes', match: p => p.status === 'pending' },
  { id: 'rejected', label: 'Rejeitadas', match: p => p.status === 'rejected' },
];

function PhotosReport({ eventId, eventName }: { eventId: string; eventName: string }) {
  const [photos, setPhotos] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PhotoFilter>('todas');
  const [progress, setProgress] = useState<ZipProgress | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllPosts(eventId)
      .then(setPhotos)
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  const filtered = useMemo(
    () => photos.filter(FILTERS.find(f => f.id === filter)!.match),
    [photos, filter],
  );

  const downloading = progress !== null;

  // Nome base de cada foto dentro do ZIP: posição + status + data.
  const baseNameFor = (p: PostData, i: number) => {
    const status = p.is_official ? 'oficial' : STATUS_LABEL[p.status];
    const stamp = p.created_at ? format(new Date(p.created_at), 'yyyyMMdd-HHmm') : '';
    return `${String(i + 1).padStart(3, '0')}-${status}${stamp ? `-${stamp}` : ''}`;
  };

  const slug = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();

  const handleDownloadAll = async () => {
    if (filtered.length === 0) return;
    setProgress({ done: 0, total: filtered.length, phase: 'fetching' });
    try {
      const items = filtered.map((p, i) => ({ url: p.image_url, name: baseNameFor(p, i) }));
      const zipName = `fotos-${slug(eventName) || 'evento'}-${format(new Date(), 'yyyy-MM-dd-HHmm')}`;
      const { added, failed } = await downloadImagesAsZip(items, zipName, setProgress);
      if (failed > 0) toast.warning(`ZIP gerado com ${added} foto(s). ${failed} falharam ao baixar.`);
      else toast.success(`ZIP gerado com ${added} foto(s).`);
    } catch (err) {
      console.error('[ReportsTab] Erro ao gerar ZIP:', err);
      toast.error('Erro ao gerar o ZIP das fotos.');
    } finally {
      setProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtros + ação de download */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map(({ id, label, match }) => {
            const count = id === 'todas' ? photos.length : photos.filter(match).length;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold rounded-full transition-all',
                  filter === id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
                )}
              >
                {label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDownloadAll}
          disabled={downloading || filtered.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-bold rounded-xl bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {downloading
            ? progress!.phase === 'zipping'
              ? 'Compactando…'
              : `Baixando ${progress!.done}/${progress!.total}…`
            : `Baixar todas (${filtered.length})`}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-300">
          <ImageOff className="w-10 h-10 mb-3" />
          <p className="text-sm font-bold text-neutral-400">Nenhuma foto nesta seleção</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100"
            >
              <img src={p.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />

              {/* Selo de status */}
              <span
                className={cn(
                  'absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded-md text-white',
                  p.is_official ? 'bg-amber-500' : p.status === 'approved' ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-neutral-500' : 'bg-rose-500',
                )}
              >
                {p.is_official ? 'oficial' : STATUS_LABEL[p.status]}
              </span>

              {/* Download individual ao passar o mouse */}
              <button
                onClick={() => downloadImage(p.image_url, baseNameFor(p, i))}
                title="Baixar esta foto"
                className="absolute bottom-1 right-1 p-1.5 rounded-lg bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
