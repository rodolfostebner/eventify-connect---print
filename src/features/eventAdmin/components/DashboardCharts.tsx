import type { ChartDatum } from '../../../services/dashboardService';

const PIE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d'];

function EmptyState({ label }: { label: string }) {
  return <p className="text-[11px] text-neutral-400 py-6 text-center">{label}</p>;
}

// ─── Gráfico de barras horizontais ─────────────────────────────────────────────

export function HBarChart({ data, color = '#404040' }: { data: ChartDatum[]; color?: string }) {
  if (data.length === 0) return <EmptyState label="Sem dados" />;
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={`${d.label}-${i}`} className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-[11px] text-neutral-600 truncate" title={d.label}>{d.label}</span>
          <div className="flex-1 bg-neutral-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: color, minWidth: d.value > 0 ? '6px' : '0' }}
            />
          </div>
          <span className="w-8 shrink-0 text-[11px] font-bold text-neutral-700 text-right tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Gráfico de pizza (SVG via conic-gradient) ─────────────────────────────────

export function PieChart({ data }: { data: ChartDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <EmptyState label="Sem dados" />;

  let acc = 0;
  const stops = data.map((d, i) => {
    const start = (acc / total) * 360;
    acc += d.value;
    const end = (acc / total) * 360;
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${start}deg ${end}deg`;
  }).join(', ');

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div
        className="w-32 h-32 rounded-full shrink-0"
        style={{ background: `conic-gradient(${stops})` }}
      />
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={`${d.label}-${i}`} className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-neutral-600">{d.label}</span>
            <span className="font-bold text-neutral-800 tabular-nums">{d.value}</span>
            <span className="text-neutral-400">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
