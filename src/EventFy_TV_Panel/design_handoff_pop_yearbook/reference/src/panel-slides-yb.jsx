// Panel — Pop Yearbook slide renderers (parameterized).
// Teen scrapbook / risograph zine. Cream paper, tilted polaroids with washi
// tape, doodles, sticker bursts. Built for 15–18 year olds.

const PYB = {
  paper: '#FBF5E8',
  paperDark: '#1F1E24',
  ink: '#1A1B2E',
  pink: '#FF4D8F',
  yellow: '#FFE600',
  cyan: '#00D4FF',
  green: '#2DCB7A',
  lavender: '#C0A6FF',
  red: '#FF3B5C',
  gold: '#F0AB00'
};
const YB_DISP = "'Mochiy Pop One', 'Fredoka', 'Recoleta', 'Archivo Black', 'Inter', system-ui, sans-serif";
const YB_BODY = "'Fraunces', 'Georgia', serif";
const YB_HAND = "'Caveat', 'Patrick Hand', 'Comic Sans MS', cursive";

// ─── Paper background (subtle dot grid) ─────
function PYBPaper({ children, bg = PYB.paper }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: bg, fontFamily: YB_BODY, color: PYB.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.45, mixBlendMode: 'multiply',
        backgroundImage: 'radial-gradient(circle, rgba(26,27,46,.08) 1.5px, transparent 1.5px)',
        backgroundSize: '36px 36px' }} />
      {children}
    </div>);

}

// ─── Decorations ─────
function PYBSquiggle({ color = PYB.ink, w = 140, h = 28, style }) {
  return (
    <svg viewBox="0 0 80 16" width={w} height={h} style={style}>
      <path d="M2 8 Q 12 0, 22 8 T 42 8 T 62 8 T 78 8" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>);

}
function PYBStar({ color = PYB.yellow, size = 56, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.4 7.4-6.4-4.7-6.4 4.7L8 14 2 9.4h7.6z" fill={color} stroke={PYB.ink} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>);

}
function PYBArrow({ color = PYB.pink, w = 160, h = 110, style }) {
  return (
    <svg viewBox="0 0 90 60" width={w} height={h} style={style}>
      <path d="M5 50 Q 30 8, 70 18" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M55 8 L 72 18 L 60 32" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}
function PYBBurst({ color = PYB.pink, label, size = 180, rot = -8, style }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `rotate(${rot}deg)`, ...style }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <polygon points="50,2 58,18 76,8 70,28 92,28 76,42 96,52 76,58 88,76 68,68 70,90 54,76 50,98 42,80 28,92 30,72 8,76 22,58 2,52 22,42 6,28 28,28 22,8 40,18"
        fill={color} stroke={PYB.ink} strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center',
        fontFamily: YB_DISP, color: PYB.ink, fontWeight: 900, fontSize: size * 0.18, lineHeight: 1, letterSpacing: 0.5,
        whiteSpace: 'pre-line' }}>
        {label}
      </div>
    </div>);

}
function PYBTape({ color = PYB.yellow, w = 160, h = 38, rot = -6, style }) {
  return (
    <div style={{ width: w, height: h, background: color, opacity: 0.88, transform: `rotate(${rot}deg)`,
      backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 10px, transparent 10px 24px)',
      boxShadow: '0 3px 10px rgba(0,0,0,.14)', ...style }} />);

}

// ─── Header strip ─────
function PYBHeader({ kicker = 'agora ao vivo' }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, padding: '0 44px',
      display: 'flex', alignItems: 'center', gap: 28, zIndex: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: PYB.yellow,
          border: `4px solid ${PYB.ink}`, display: 'grid', placeItems: 'center',
          fontFamily: YB_DISP, fontSize: 40, color: PYB.green, transform: 'rotate(-6deg)' }}>J</div>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: YB_HAND, fontSize: 26, color: PYB.ink }}>colégio</div>
          <div style={{ fontFamily: YB_DISP, fontSize: 40, color: PYB.green, marginTop: 2 }}>Journey</div>
        </div>
      </div>
      <PYBSquiggle color={PYB.pink} w={90} h={20} />
      <div style={{ fontFamily: YB_DISP, fontSize: 32, letterSpacing: 0.5 }}>
        Feira Empreendedorismo <span style={{ background: PYB.yellow, padding: '0 10px', borderRadius: 6 }}>2026</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span style={{ fontFamily: YB_HAND, fontSize: 28 }}>{kicker}</span>
        <div style={{ background: PYB.ink, color: PYB.paper, padding: '10px 20px', borderRadius: 999,
          fontFamily: YB_DISP, fontSize: 24, letterSpacing: 0.6 }}>📸 /fe2026</div>
      </div>
    </div>);

}

// ─── Footer ticker / alert strip ─────
function PYBFooter({ alertStrip = null, hidden = false }) {
  if (hidden) return null;
  if (alertStrip) {
    return (
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, background: PYB.red,
        color: PYB.paper, display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 5,
        borderTop: `5px dashed ${PYB.yellow}`, fontFamily: YB_DISP }}>
        <div style={{ background: PYB.ink, color: PYB.yellow, padding: '0 20px', height: '100%', display: 'grid', placeItems: 'center',
          fontSize: 24, letterSpacing: 4, transform: 'rotate(-1deg) translateY(-3px)' }}>
          ⚠ AVISO
        </div>
        <div style={{ flex: 1, fontFamily: YB_DISP, fontSize: 28, letterSpacing: 1, padding: '0 28px',
          whiteSpace: 'nowrap', animation: 'pybstrip 22s linear infinite' }}>
          {alertStrip} &nbsp;✶&nbsp; {alertStrip} &nbsp;✶&nbsp; {alertStrip}
        </div>
        <style>{`@keyframes pybstrip { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>);

  }
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, background: PYB.ink,
      color: PYB.paper, display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 5,
      borderTop: `5px dashed ${PYB.yellow}` }}>
      <div style={{ background: PYB.pink, color: PYB.ink, padding: '0 24px', height: '100%', display: 'grid', placeItems: 'center',
        fontFamily: YB_DISP, fontSize: 26, letterSpacing: 1.6, transform: 'rotate(-1deg) translateY(-3px)' }}>
        ✶ NEWS ✶
      </div>
      <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', padding: '0 28px',
        fontFamily: YB_BODY, fontSize: 24 }}>
        <div style={{ display: 'inline-block', animation: 'pybscroll 60s linear infinite', willChange: 'transform' }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((tt, i) =>
          <span key={i} style={{ marginRight: 52, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {tt}
              <span style={{ color: PYB.yellow }}>♥</span>
            </span>
          )}
        </div>
      </div>
      <style>{`@keyframes pybscroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>);

}

// ─── Polaroid ─────
function PYBPolaroid({ src, caption, sub, rot = -3, w = 500, taped = true, tapeColor = PYB.pink }) {
  return (
    <div style={{ position: 'relative', width: w, background: '#fff', padding: 20,
      paddingBottom: 96, transform: `rotate(${rot}deg)`,
      boxShadow: '0 20px 56px rgba(0,0,0,.18), 0 3px 6px rgba(0,0,0,.08)' }}>
      {taped && <PYBTape color={tapeColor} w={140} h={34} rot={-8} style={{ position: 'absolute', top: -14, left: '50%', marginLeft: -70 }} />}
      <div style={{ width: '100%', aspectRatio: '4 / 3', background: '#EAE5DA', overflow: 'hidden' }}>
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {caption &&
      <div style={{ marginTop: 16, fontFamily: YB_HAND, fontSize: 38, textAlign: 'center', color: PYB.ink, lineHeight: 1 }}>
          {caption}
          {sub && <div style={{ fontSize: 24, opacity: .75, marginTop: 4, lineHeight: 1.1 }}>{sub}</div>}
        </div>
      }
    </div>);

}

// ─── 1. Visitor ─────
function PYB_Visitor({ photo, showRanking = true, showTicker = true, alertStrip = null, accent }) {
  const p = photo;
  // Tweak `accent` overrides the burst sticker color; default per-photo varies
  const burstColor = accent || PYB.yellow;
  return (
    <PYBPaper>
      <PYBHeader kicker="manda foto sua em /fe2026" />
      <PYBStar color={PYB.yellow} size={50} style={{ position: 'absolute', top: 150, left: 120 }} />
      <PYBStar color={PYB.pink} size={38} style={{ position: 'absolute', bottom: 200, right: showRanking ? 700 : 200 }} />
      <PYBSquiggle color={PYB.cyan} w={130} h={26} style={{ position: 'absolute', top: 220, right: showRanking ? 520 : 300 }} />

      <div style={{ position: 'absolute', top: 156, left: 100, zIndex: 2 }}>
        <PYBPolaroid src={p.src} caption={p.name} sub={`${p.emoji} ${p.category}`} rot={-3} w={680} tapeColor={PYB.pink} />
      </div>

      <div style={{ position: 'absolute', top: 130, left: 680, zIndex: 4 }}>
        <PYBBurst color={burstColor} label={'VOTE!'} size={170} rot={12} />
      </div>

      <div style={{ position: 'absolute', left: 100, bottom: 110, width: 680,
        transform: 'rotate(-1.5deg)', background: PYB.ink, color: PYB.paper, padding: '20px 30px',
        borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,.2)', zIndex: 3,
        display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ fontFamily: YB_HAND, fontSize: 36, color: PYB.yellow, lineHeight: 1, flexShrink: 0 }}>reações ✶</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around' }}>
          {[['❤', p.reactions.heart], ['🎸', p.reactions.rock], ['🔥', p.reactions.fire], ['😂', p.reactions.laugh]].map(([e, n], i) =>
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 38 }}>{e}</span>
              <span style={{ fontFamily: YB_DISP, fontSize: 34, color: PYB.yellow }}>{n}</span>
            </div>
          )}
        </div>
      </div>

      {showRanking &&
      <div style={{ position: 'absolute', top: 144, right: 88, width: 500, background: '#FFFDF5', padding: 32,
        border: `4px solid ${PYB.ink}`, borderRadius: 6, transform: 'rotate(2deg)',
        boxShadow: '0 14px 40px rgba(0,0,0,.15)', zIndex: 2 }}>
          <PYBTape color={PYB.cyan} w={110} h={30} rot={-8} style={{ position: 'absolute', top: -18, left: 36 }} />
          <PYBTape color={PYB.pink} w={110} h={30} rot={6} style={{ position: 'absolute', top: -18, right: 36 }} />
          <div style={{ fontFamily: YB_DISP, fontSize: 40, color: PYB.pink, textAlign: 'center', letterSpacing: 1.5 }}>
            🏆 RANKING DO DIA
          </div>
          <PYBSquiggle color={PYB.green} w={200} h={24} style={{ display: 'block', margin: '8px auto 18px' }} />
          {RANKING.slice(0, 5).map((r, i) =>
        <div key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0',
          borderBottom: i < 4 ? '2px dashed rgba(26,27,46,.18)' : 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: i === 0 ? PYB.yellow : PYB.paper,
            border: `2.5px solid ${PYB.ink}`, display: 'grid', placeItems: 'center', fontFamily: YB_DISP, fontSize: 22 }}>
                {r.rank}
              </div>
              <img src={r.src} alt="" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover',
            border: `2.5px solid ${PYB.ink}` }} />
              <div style={{ flex: 1, fontFamily: YB_HAND, fontSize: 30, lineHeight: 1 }}>{r.name}</div>
              <div style={{ fontFamily: YB_DISP, fontSize: 24, color: PYB.pink }}>♥{r.votes}</div>
            </div>
        )}
        </div>
      }
      <PYBFooter alertStrip={alertStrip} hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 2. Exhibitor featured ─────
function PYB_ExhibitorFeatured({ exhibitor, showTicker = true, alertStrip = null }) {
  const e = exhibitor;
  return (
    <PYBPaper>
      <PYBHeader kicker="estande da hora ✶" />
      <div style={{ position: 'absolute', top: 110, right: 56, zIndex: 5 }}>
        <PYBBurst color={PYB.yellow} label={'DESTAQUE\nDO DIA'} size={230} rot={14} />
      </div>

      <div style={{ position: 'absolute', top: 170, left: 92, zIndex: 2 }}>
        <PYBPolaroid src={e.product} caption={e.name} sub={`feito por estudantes · ${e.stand}`} rot={-4} w={780} tapeColor={PYB.yellow} />
      </div>

      <div style={{ position: 'absolute', top: 192, left: 920, right: 280, bottom: 200,
        background: e.accent, color: '#fff', padding: '40px 44px', borderRadius: 10,
        border: `4px solid ${PYB.ink}`, transform: 'rotate(1.5deg)',
        boxShadow: '0 18px 50px rgba(0,0,0,.18)' }}>
        <div style={{ fontFamily: YB_HAND, fontSize: 36, opacity: .92, lineHeight: 1 }}>{e.emoji} {e.cat.toLowerCase()}</div>
        <div style={{ fontFamily: YB_DISP, fontSize: 96, lineHeight: 0.95, marginTop: 10, letterSpacing: -1 }}>
          {e.name}
        </div>
        <div style={{ fontFamily: YB_BODY, fontSize: 30, marginTop: 22, lineHeight: 1.3 }}>
          {e.tagline}
        </div>
        <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ background: PYB.ink, padding: '12px 22px', borderRadius: 999, fontFamily: YB_DISP, fontSize: 28 }}>
            {e.insta}
          </div>
          <PYBArrow color={PYB.yellow} w={86} h={60} />
          <div style={{ fontFamily: YB_HAND, fontSize: 38 }}>passa lá!</div>
        </div>
      </div>

      <div style={{ position: 'absolute', right: 110, bottom: 160, transform: 'rotate(-8deg)', zIndex: 4 }}>
        <div style={{ background: PYB.ink, color: PYB.yellow, padding: '22px 32px', borderRadius: 14,
          boxShadow: '0 10px 24px rgba(0,0,0,.2)' }}>
          <div style={{ fontFamily: YB_HAND, fontSize: 28, color: PYB.paper }}>estande</div>
          <div style={{ fontFamily: YB_DISP, fontSize: 96, color: PYB.yellow, lineHeight: 0.9 }}>{e.stand}</div>
        </div>
      </div>
      <PYBFooter alertStrip={alertStrip} hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 3. Exhibitor 3-up ─────
function PYB_ExhibitorBento({ exhibitors, showTicker = true, alertStrip = null }) {
  const trio = exhibitors;
  const rots = [-4, 2, -2];
  const tapes = [PYB.pink, PYB.yellow, PYB.cyan];
  return (
    <PYBPaper>
      <PYBHeader kicker="conheça os estandes" />
      <PYBStar color={PYB.pink} size={40} style={{ position: 'absolute', top: 140, left: 180 }} />
      <PYBStar color={PYB.cyan} size={36} style={{ position: 'absolute', top: 170, right: 260 }} />
      <PYBSquiggle color={PYB.green} w={130} h={26} style={{ position: 'absolute', bottom: 110, left: 500 }} />

      <div style={{ position: 'absolute', top: 150, left: 56, right: 56, bottom: 110,
        display: 'flex', gap: 0, alignItems: 'center', justifyContent: 'space-around' }}>
        {trio.map((e, i) =>
        <div key={e.id} style={{ width: 540, transform: `rotate(${rots[i]}deg)`, position: 'relative' }}>
            <PYBPolaroid src={e.product} caption={e.name} sub={`${e.stand} · ${e.cat.toLowerCase()}`} rot={0} w={540} tapeColor={tapes[i]} />
            {i === 1 &&
          <div style={{ position: 'absolute', top: -34, right: -24, zIndex: 3 }}>
                <PYBBurst color={PYB.pink} label="NEW!" size={130} rot={12} />
              </div>
          }
            <div style={{ position: 'absolute', bottom: 22, left: 24, right: 24,
            fontFamily: YB_BODY, fontSize: 22, fontStyle: 'italic', textAlign: 'center', color: PYB.ink, opacity: .82 }}>
              "{e.tagline}"
            </div>
          </div>
        )}
      </div>
      <PYBFooter alertStrip={alertStrip} hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 4. Partner ─────
function PYB_Partner({ partner, showTicker = true, alertStrip = null }) {
  const p = partner;
  return (
    <PYBPaper>
      <PYBHeader kicker="agradecimento especial 💛" />
      <div style={{ position: 'absolute', top: 170, left: 92, right: 92, bottom: showTicker ? 120 : 40,
        background: p.accent, color: p.textOn, borderRadius: 14, border: `4px solid ${PYB.ink}`,
        padding: '52px 64px', display: 'flex', flexDirection: 'column',
        boxShadow: '0 22px 50px rgba(0,0,0,.16)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -72, top: -72, width: 540, height: 540, borderRadius: '50%',
          background: 'rgba(255,255,255,.13)' }} />
        <div style={{ position: 'absolute', right: 56, bottom: 56, width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(255,255,255,.09)' }} />

        <div style={{ position: 'relative', fontFamily: YB_HAND, fontSize: 40, opacity: .95 }}>
          quem deu uma força ✶
        </div>
        <div style={{ position: 'relative', fontFamily: YB_DISP, fontSize: 200, lineHeight: 0.92, letterSpacing: -3, marginTop: 16 }}>
          {p.logoText}
        </div>
        <div style={{ position: 'relative', fontFamily: YB_BODY, fontSize: 40, fontStyle: 'italic', maxWidth: 980, marginTop: 28, lineHeight: 1.3 }}>
          "{p.tagline}"
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', display: 'flex', gap: 20 }}>
          <div style={{ background: PYB.paper, color: PYB.ink, padding: '14px 26px', borderRadius: 999,
            fontFamily: YB_DISP, fontSize: 28, border: `3px solid ${PYB.ink}`, transform: 'rotate(-2deg)' }}>
            ⭐ {p.role}
          </div>
          <div style={{ background: PYB.ink, color: PYB.yellow, padding: '14px 26px', borderRadius: 999,
            fontFamily: YB_HAND, fontSize: 32, transform: 'rotate(1.5deg)' }}>
            obrigado!! 💛
          </div>
        </div>
      </div>
      <PYBFooter alertStrip={alertStrip} hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 5. Raffle countdown (game-show style) ─────
function PYB_RaffleCountdown({ remainingMs, showTicker = true }) {
  const ms = Math.max(0, remainingMs);
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const names = ['Letícia V.', 'Bruno M.', 'Ana Paula', 'João P.', 'Camila R.'];
  return (
    <PYBPaper>
      <PYBHeader kicker="SORTEANDO AGORA 🎰" />
      <div style={{ position: 'absolute', inset: '160px 56px 110px',
        display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: YB_HAND, fontSize: 50, color: PYB.pink, transform: 'rotate(-2deg)' }}>
            quem vai levar?
          </div>
          <div style={{ fontFamily: YB_DISP, fontSize: 120, lineHeight: 0.92, letterSpacing: -2, marginTop: 14 }}>
            RIFA <span style={{ background: PYB.yellow, padding: '0 14px' }}>{mm}:{ss}</span>
          </div>
          <div style={{ fontFamily: YB_BODY, fontSize: 36, marginTop: 28, lineHeight: 1.3 }}>
            Prêmio: <strong>{RAFFLE.prize}</strong> <br /><span style={{ fontStyle: 'italic', opacity: .8 }}>{RAFFLE.prizeSub}</span>
          </div>
          <div style={{ marginTop: 28, display: 'inline-flex', gap: 16 }}>
            <div style={{ background: PYB.ink, color: PYB.paper, padding: '14px 24px', borderRadius: 999, fontFamily: YB_DISP, fontSize: 26 }}>
              {RAFFLE.enteredCount} participantes
            </div>
            <div style={{ background: PYB.yellow, color: PYB.ink, padding: '14px 24px', borderRadius: 999,
              fontFamily: YB_DISP, fontSize: 26, border: `3px solid ${PYB.ink}`, transform: 'rotate(-2deg)' }}>
              ⏳ sorteando...
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ background: PYB.ink, color: PYB.paper, padding: 36, borderRadius: 22,
            border: `5px solid ${PYB.yellow}`, boxShadow: '0 24px 56px rgba(0,0,0,.28)', transform: 'rotate(2deg)' }}>
            <div style={{ fontFamily: YB_DISP, fontSize: 28, color: PYB.yellow, textAlign: 'center', letterSpacing: 4, marginBottom: 18 }}>
              ✶ ✶ ✶ AGORA ✶ ✶ ✶
            </div>
            <div style={{ background: PYB.paper, color: PYB.ink, padding: 0, borderRadius: 12, overflow: 'hidden',
              border: `4px solid ${PYB.yellow}`, position: 'relative', height: 380 }}>
              {names.map((n, i) =>
              <div key={i} style={{ fontFamily: YB_DISP, fontSize: i === 2 ? 68 : 38, padding: '10px 22px',
                textAlign: 'center', opacity: i === 2 ? 1 : 0.25, color: i === 2 ? PYB.pink : PYB.ink, lineHeight: 1.1,
                background: i === 2 ? 'rgba(255,77,143,.1)' : 'transparent',
                animation: i === 2 ? 'pybwobble 0.6s infinite alternate' : 'none' }}>
                  {n}
                </div>
              )}
              <div style={{ position: 'absolute', top: '50%', left: -14, transform: 'translateY(-50%)', fontSize: 40 }}>👉</div>
              <div style={{ position: 'absolute', top: '50%', right: -14, transform: 'translateY(-50%) scaleX(-1)', fontSize: 40 }}>👉</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pybwobble { from{transform:scale(1)} to{transform:scale(1.04)} }`}</style>
      <PYBFooter hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 6. Raffle winner (celebratory) ─────
function PYB_RaffleWinner({ showTicker = true, justRevealed = false }) {
  const w = RAFFLE.winner;
  return (
    <PYBPaper>
      <PYBHeader kicker="VENCEDORA DA RIFA ✦" />
      {justRevealed && [...Array(50)].map((_, i) =>
      <div key={i} style={{ position: 'absolute', width: 18, height: 18,
        background: [PYB.pink, PYB.yellow, PYB.cyan, PYB.green, PYB.lavender][i % 5],
        left: `${i * 37 % 95 + 2}%`, top: -20,
        opacity: 0.9, borderRadius: i % 3 === 0 ? '50%' : 0,
        border: i % 2 === 0 ? `2px solid ${PYB.ink}` : 'none',
        animation: `pybconfetti ${3 + i % 5 * 0.4}s ${i % 10 * 0.1}s linear forwards`,
        transform: `rotate(${i * 27}deg)` }} />
      )}
      <style>{`@keyframes pybconfetti { to { transform: translateY(120vh) rotate(720deg); } }`}</style>
      <PYBStar color={PYB.yellow} size={70} style={{ position: 'absolute', top: 170, left: 480 }} />
      <PYBStar color={PYB.pink} size={56} style={{ position: 'absolute', top: 400, right: 560 }} />

      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', paddingTop: 64 }}>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: YB_HAND, fontSize: 60, color: PYB.pink, transform: 'rotate(-2deg)' }}>
            e a vencedora é...
          </div>
          <div style={{ marginTop: 28, position: 'relative', display: 'inline-block' }}>
            <PYBPolaroid src={w.src} caption={w.name} sub={w.stand} rot={-3} w={560} tapeColor={PYB.yellow} />
            <div style={{ position: 'absolute', top: -56, right: -88 }}>
              <PYBBurst color={PYB.pink} label="VENCE!" size={210} rot={16} />
            </div>
            <PYBArrow color={PYB.green} w={160} h={110} style={{ position: 'absolute', bottom: 200, left: -180, transform: 'scaleX(-1)' }} />
          </div>
          <div style={{ marginTop: 28, fontFamily: YB_DISP, fontSize: 60, color: PYB.ink }}>
            ganhou o <span style={{ background: PYB.yellow, padding: '0 14px' }}>{RAFFLE.prize}</span>
          </div>
          <div style={{ fontFamily: YB_HAND, fontSize: 40, marginTop: 10 }}>{RAFFLE.prizeSub} · entre {RAFFLE.enteredCount} participantes</div>
        </div>
      </div>
      <PYBFooter hidden={!showTicker} />
    </PYBPaper>);

}

// ─── 7. Full alert ─────
function PYB_AlertFull({ alert }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: PYB.red, color: PYB.paper, fontFamily: YB_DISP,
      overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50,
        backgroundImage: `repeating-linear-gradient(45deg, ${PYB.yellow} 0 42px, ${PYB.ink} 42px 84px)` }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
        backgroundImage: `repeating-linear-gradient(45deg, ${PYB.yellow} 0 42px, ${PYB.ink} 42px 84px)` }} />
      <PYBStar color={PYB.yellow} size={220} style={{ position: 'absolute', top: 130, right: 160, transform: 'rotate(20deg)' }} />
      <PYBStar color={PYB.paper} size={140} style={{ position: 'absolute', bottom: 130, left: 160, transform: 'rotate(-15deg)' }} />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ display: 'inline-block', background: PYB.ink, color: PYB.yellow, padding: '14px 36px',
          borderRadius: 999, fontFamily: YB_DISP, fontSize: 30, letterSpacing: 4, transform: 'rotate(-3deg)' }}>
          ⚠ AVISO IMPORTANTE
        </div>
        <div style={{ fontFamily: YB_DISP, fontSize: 360, lineHeight: 0.9, letterSpacing: -6, marginTop: 28,
          textShadow: `12px 12px 0 ${PYB.ink}` }}>
          50% <span style={{ fontSize: 200 }}>OFF</span>
        </div>
        <div style={{ fontFamily: YB_HAND, fontSize: 72, marginTop: 28 }}>
          últimos 30 minutinhos · vai correndo!!
        </div>
        <div style={{ marginTop: 44, display: 'inline-flex', gap: 32 }}>
          <div style={{ background: PYB.paper, color: PYB.ink, padding: '22px 32px', borderRadius: 14,
            fontFamily: YB_DISP, fontSize: 42, border: `5px solid ${PYB.ink}`, transform: 'rotate(-2deg)' }}>
            encerra 16:00
          </div>
          <div style={{ background: PYB.yellow, color: PYB.ink, padding: '22px 32px', borderRadius: 14,
            fontFamily: YB_DISP, fontSize: 42, border: `5px solid ${PYB.ink}`, transform: 'rotate(2deg)' }}>
            tudo da feira
          </div>
        </div>
      </div>
    </div>);

}

// ─── 8. Side overlay (sticker layered on top) ─────
function PYB_SideOverlay({ alert }) {
  return (
    <div style={{ position: 'absolute', top: 230, right: 130, width: 660,
      background: PYB.paper, border: `5px solid ${PYB.ink}`, borderRadius: 18, padding: '36px 40px',
      transform: 'rotate(-2deg)', boxShadow: '0 32px 80px rgba(0,0,0,.4)',
      animation: 'pybslide 380ms cubic-bezier(.2,.7,.3,1)', zIndex: 8 }}>
      <style>{`@keyframes pybslide { from{transform:rotate(-2deg) translateX(40px);opacity:0} to{transform:rotate(-2deg) translateX(0);opacity:1} }`}</style>
      <PYBTape color={PYB.pink} w={140} h={36} rot={-6} style={{ position: 'absolute', top: -20, left: '50%', marginLeft: -70 }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: PYB.pink, color: PYB.paper,
        padding: '8px 22px', borderRadius: 999, fontFamily: YB_DISP, fontSize: 26, letterSpacing: 1.6 }}>
        ⚡ {alert.kicker}
      </div>
      <div style={{ fontFamily: YB_DISP, fontSize: 64, lineHeight: 0.95, marginTop: 22, letterSpacing: -1, color: PYB.ink }}>
        {alert.title}
      </div>
      <div style={{ fontFamily: YB_BODY, fontSize: 28, fontStyle: 'italic', marginTop: 18, lineHeight: 1.3, color: PYB.ink }}>
        {alert.sub}
      </div>
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={{ background: PYB.ink, color: PYB.yellow, padding: '18px 28px', borderRadius: 14,
          fontFamily: YB_DISP, fontSize: 56, lineHeight: 0.95 }}>
          A-12
        </div>
        <PYBArrow color={PYB.pink} w={86} h={60} />
        <div style={{ fontFamily: YB_HAND, fontSize: 36 }}>corre lá!</div>
      </div>
    </div>);

}

window.SLIDE_KIT_YB = {
  label: 'Pop Yearbook',
  defaultAccentVisitor: '#FFE600',
  accentOptions: ['#FFE600', '#FF4D8F', '#00D4FF', '#2DCB7A', '#C0A6FF'],
  Visitor: PYB_Visitor,
  ExhibitorFeatured: PYB_ExhibitorFeatured,
  ExhibitorBento: PYB_ExhibitorBento,
  Partner: PYB_Partner,
  RaffleCountdown: PYB_RaffleCountdown,
  RaffleWinner: PYB_RaffleWinner,
  AlertFull: PYB_AlertFull,
  SideOverlay: PYB_SideOverlay
};
window.SLIDE_KIT = window.SLIDE_KIT_YB;