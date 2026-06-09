import { motion } from 'motion/react';
import type { PhotoData } from '../../../../types';
import type { TvTheme } from '../theme';
import { personalityFor, totalReactions } from '../theme';

/** MOD-01 · Rank de Fotos — top 5 fotos mais reagidas do evento. */
export default function Mod01Rank({ photos, theme }: { photos: PhotoData[]; theme: TvTheme }) {
  const top = [...photos]
    .filter((p) => !p.is_official)
    .sort((a, b) => totalReactions(b.reaction_counts) - totalReactions(a.reaction_counts))
    .slice(0, 5);

  if (top.length === 0) {
    return <EmptyState theme={theme} />;
  }

  const [first, ...rest] = top;
  const firstP = personalityFor(first.reaction_counts);

  return (
    <div className="w-full h-full flex flex-col px-16 py-10">
      {/* Cabeçalho */}
      <header className="shrink-0 mb-6 flex items-end gap-4">
        <h1 style={{ fontFamily: theme.fontDisplay, color: theme.accent }} className="text-6xl leading-none">
          Mural dos Queridinhos
        </h1>
        <span style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-4xl mb-1">
          as fotos mais amadas de hoje ✦
        </span>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-10 min-h-0">
        {/* Destaque #1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="col-span-7 flex items-center justify-center min-h-0"
        >
          <Polaroid theme={theme} big>
            <div className="relative w-full h-full">
              <img src={first.image_url} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute -top-7 -left-7 w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg"
                style={{ background: theme.accent, color: theme.frame, fontFamily: theme.fontDisplay }}
              >
                1º
              </div>
            </div>
            <Caption theme={theme} emoji={firstP.emoji} label={firstP.label} name={first.user_name} count={firstP.total} />
          </Polaroid>
        </motion.div>

        {/* Restante 2..5 */}
        <div className="col-span-5 grid grid-cols-2 gap-6 content-center min-h-0">
          {rest.map((p, i) => {
            const per = personalityFor(p.reaction_counts);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                <Polaroid theme={theme} rotate={i % 2 === 0 ? 2 : -3}>
                  <div className="relative w-full aspect-square">
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                    <div
                      className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-lg shadow"
                      style={{ background: theme.ink, color: theme.frame, fontFamily: theme.fontDisplay }}
                    >
                      {i + 2}º
                    </div>
                  </div>
                  <Caption theme={theme} emoji={per.emoji} label={per.label} name={p.user_name} count={per.total} small />
                </Polaroid>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Polaroid({ theme, children, big, rotate = 0 }: {
  theme: TvTheme; children: React.ReactNode; big?: boolean; rotate?: number;
}) {
  return (
    <div
      className="shadow-2xl"
      style={{
        background: theme.frame,
        padding: big ? '18px 18px 0' : '12px 12px 0',
        borderRadius: 6,
        transform: `rotate(${rotate}deg)`,
        maxHeight: '100%',
      }}
    >
      {children}
    </div>
  );
}

function Caption({ theme, emoji, label, name, count, small }: {
  theme: TvTheme; emoji: string; label: string; name?: string; count: number; small?: boolean;
}) {
  return (
    <div className={small ? 'px-1 py-2' : 'px-2 py-4'}>
      <div className="flex items-center gap-2">
        <span className={small ? 'text-2xl' : 'text-4xl'}>{emoji}</span>
        <span
          style={{ fontFamily: theme.fontHand, color: theme.accent }}
          className={small ? 'text-2xl leading-none' : 'text-4xl leading-none'}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span style={{ fontFamily: theme.fontBody, color: theme.inkSoft }} className={small ? 'text-sm' : 'text-xl'}>
          {name || 'Visitante'}
        </span>
        <span style={{ fontFamily: theme.fontBody, color: theme.ink }} className={small ? 'text-sm font-semibold' : 'text-xl font-semibold'}>
          {emoji} {count}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ theme }: { theme: TvTheme }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <span className="text-7xl">📸</span>
      <p style={{ fontFamily: theme.fontDisplay, color: theme.ink }} className="text-4xl">
        As primeiras fotos estão chegando…
      </p>
      <p style={{ fontFamily: theme.fontHand, color: theme.inkSoft }} className="text-3xl">
        poste a sua e apareça no telão!
      </p>
    </div>
  );
}
