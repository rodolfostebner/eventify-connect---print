// Panel — rotating stage with Tweaks for the EventFy TV.
// Stage is 1920×1080, scaled to fit any viewport.
// Rotation: visitor-heavy by default. Tweaks override speed, ticker, ranking,
// accents. Buttons trigger fake alerts / raffle sequences for demo.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─── Persisted defaults (editable via host tweaks). ──────────
// `accentVisitor` default is overridden by the loaded slide kit at boot.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "slideMs": 7000,
  "transition": "fade",
  "showTicker": true,
  "showRanking": true,
  "accentVisitor": "#5EEAD4",
  "stripAlert": false
}/*EDITMODE-END*/;

// Slide kit: each prototype variant (Editorial / Broadcast / Yearbook) sets
// window.SLIDE_KIT before this script runs. The kit provides the slide
// renderers + design metadata (default accent, accent options, label).
const KIT = window.SLIDE_KIT;
if (!KIT) throw new Error('SLIDE_KIT not set — load a panel-slides-* module first.');

// ─── Rotation schedule ──────────────────────────────────────
// 'v' visitor photo, 'eF' exhibitor featured (gold tier),
// 'eB' exhibitor bento, 'p' partner. Visitor-heavy mix.
const ROTATION = [
  'v', 'v', 'eF', 'v', 'v', 'p', 'v', 'eB', 'v', 'v', 'eF', 'v', 'p', 'v', 'v', 'eB',
];

const GOLD_EXHIBITORS = EXHIBITORS.filter(e => e.tier === 'gold');

function pickSlide(rotationIdx, counters) {
  const kind = ROTATION[rotationIdx % ROTATION.length];
  if (kind === 'v')  return { kind: 'visitor',  data: PHOTOS[counters.v % PHOTOS.length] };
  if (kind === 'eF') return { kind: 'eFeat',    data: GOLD_EXHIBITORS[counters.eF % GOLD_EXHIBITORS.length] };
  if (kind === 'eB') {
    const start = (counters.eB * 3) % EXHIBITORS.length;
    const slice = [0,1,2].map(i => EXHIBITORS[(start + i) % EXHIBITORS.length]);
    return { kind: 'eBento', data: slice };
  }
  if (kind === 'p')  return { kind: 'partner',  data: PARTNERS[counters.p % PARTNERS.length] };
}

function advanceCounters(c, kind) {
  const next = { ...c };
  if (kind === 'v')  next.v++;
  if (kind === 'eF') next.eF++;
  if (kind === 'eB') next.eB++;
  if (kind === 'p')  next.p++;
  return next;
}

// ─── Stage — scales 1920×1080 design to viewport ────────────
function Stage({ children }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  React.useLayoutEffect(() => {
    const fit = () => {
      // Prefer the wrapper's measured box (works even if window dimensions
      // haven't settled yet inside an iframe); fall back to the window.
      const w = (wrapRef.current && wrapRef.current.clientWidth)  || window.innerWidth  || document.documentElement.clientWidth;
      const h = (wrapRef.current && wrapRef.current.clientHeight) || window.innerHeight || document.documentElement.clientHeight;
      if (!w || !h) return;
      setScale(Math.max(0.01, Math.min(w / 1920, h / 1080)));
    };
    fit();
    window.addEventListener('resize', fit);
    // A second fit on rAF picks up any post-mount layout that the initial
    // measurement missed (font loading, scrollbar appearance).
    const raf = requestAnimationFrame(fit);
    return () => { window.removeEventListener('resize', fit); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={wrapRef} style={{ position: 'fixed', inset: 0, background: '#000',
      display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      <div style={{ width: 1920, height: 1080, position: 'relative',
        transform: `scale(${scale})`, transformOrigin: 'center',
        boxShadow: '0 0 0 1px rgba(255,255,255,.05)' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Crossfader — swaps children with a fade ────────────────
function Crossfader({ children, signal, mode = 'fade' }) {
  // Render current child + previous child during a transition (~500ms).
  const [layers, setLayers] = useState([{ key: signal, content: children }]);
  const prevSignal = useRef(signal);
  useEffect(() => {
    if (prevSignal.current === signal) return;
    setLayers((prev) => [
      { key: prevSignal.current, content: prev[prev.length - 1].content, leaving: true },
      { key: signal, content: children, entering: true },
    ]);
    prevSignal.current = signal;
    const t = setTimeout(() => setLayers([{ key: signal, content: children }]), 700);
    return () => clearTimeout(t);
  }, [signal, children, mode]);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {layers.map((l) => (
        <div key={l.key}
          style={{
            position: 'absolute', inset: 0,
            opacity: l.leaving ? 0 : 1,
            transform: mode === 'energetic'
              ? (l.leaving ? 'scale(1.04)' : l.entering ? 'scale(1)' : 'scale(1)')
              : 'none',
            transition: 'opacity 600ms cubic-bezier(.4,0,.2,1), transform 800ms cubic-bezier(.4,0,.2,1)',
            // entering layer animates in via @keyframes for the energetic mode
            animation: l.entering && mode === 'energetic' ? 'pedenter 700ms cubic-bezier(.2,.7,.3,1)' : 'none',
          }}>
          {l.content}
        </div>
      ))}
      <style>{`@keyframes pedenter { from{ opacity: 0; transform: scale(1.04) translateY(8px); } to{ opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
}

// ─── Main app ───────────────────────────────────────────────
function PanelApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Rotation state
  const [rotIdx, setRotIdx] = useState(0);
  const counters = useRef({ v: 0, eF: 0, eB: 0, p: 0 });

  // Special modes — when set, override the regular rotation
  const [mode, setMode] = useState(null); // null | 'raffle' | 'alertFull'
  const [raffleStep, setRaffleStep] = useState(null); // 'countdown' | 'winner'
  const [raffleTargetMs, setRaffleTargetMs] = useState(0);
  const [nowMs, setNowMs] = useState(Date.now());

  // Overlay (sits on top of the regular slide, doesn't take over)
  const [overlayUntil, setOverlayUntil] = useState(0);

  // Current regular slide
  const slide = useMemo(() => pickSlide(rotIdx, counters.current), [rotIdx]);

  // Advance rotation
  useEffect(() => {
    if (mode) return; // freeze rotation during alert/raffle takeover
    const id = setTimeout(() => {
      counters.current = advanceCounters(counters.current, ROTATION[rotIdx % ROTATION.length]);
      setRotIdx((i) => i + 1);
    }, t.slideMs);
    return () => clearTimeout(id);
  }, [rotIdx, t.slideMs, mode]);

  // Tick the clock (for countdown)
  useEffect(() => {
    if (raffleStep !== 'countdown') return;
    const id = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(id);
  }, [raffleStep]);

  // Overlay auto-dismiss
  useEffect(() => {
    if (!overlayUntil) return;
    const id = setTimeout(() => setOverlayUntil(0), overlayUntil - Date.now());
    return () => clearTimeout(id);
  }, [overlayUntil]);

  const triggerAlert = useCallback(() => {
    setMode('alertFull');
    setTimeout(() => setMode(null), 9000);
  }, []);

  const triggerRaffle = useCallback(() => {
    // Countdown: 12s of fake clock, then winner card for 9s.
    setMode('raffle');
    setRaffleStep('countdown');
    setRaffleTargetMs(Date.now() + 12000);
    setNowMs(Date.now());
    setTimeout(() => setRaffleStep('winner'), 12000);
    setTimeout(() => { setRaffleStep(null); setMode(null); }, 21000);
  }, []);

  const triggerOverlay = useCallback(() => {
    setOverlayUntil(Date.now() + 7000);
  }, []);

  // Signal for crossfade — changes whenever the visible "main" slide changes.
  const signal = mode === 'alertFull' ? 'alert' :
                 mode === 'raffle'    ? `raffle-${raffleStep}` :
                 `rot-${rotIdx}`;

  // What to render as the main slide
  let mainSlide = null;
  if (mode === 'alertFull') {
    mainSlide = <KIT.AlertFull alert={ALERTS.flash} />;
  } else if (mode === 'raffle') {
    mainSlide = raffleStep === 'countdown'
      ? <KIT.RaffleCountdown remainingMs={raffleTargetMs - nowMs} showTicker={t.showTicker} />
      : <KIT.RaffleWinner showTicker={t.showTicker} justRevealed={true} />;
  } else {
    const stripAlert = t.stripAlert ? ALERTS.strip.text : null;
    if (slide.kind === 'visitor') {
      mainSlide = <KIT.Visitor photo={slide.data} accent={t.accentVisitor}
        showRanking={t.showRanking} showTicker={t.showTicker} alertStrip={stripAlert} />;
    } else if (slide.kind === 'eFeat') {
      mainSlide = <KIT.ExhibitorFeatured exhibitor={slide.data}
        showTicker={t.showTicker} alertStrip={stripAlert} />;
    } else if (slide.kind === 'eBento') {
      mainSlide = <KIT.ExhibitorBento exhibitors={slide.data}
        showTicker={t.showTicker} alertStrip={stripAlert} />;
    } else if (slide.kind === 'partner') {
      mainSlide = <KIT.Partner partner={slide.data}
        showTicker={t.showTicker} alertStrip={stripAlert} />;
    }
  }

  return (
    <Stage>
      <Crossfader signal={signal} mode={t.transition}>
        {mainSlide}
      </Crossfader>
      {overlayUntil > Date.now() && mode !== 'alertFull' && (
        <KIT.SideOverlay alert={ALERTS.side} />
      )}

      {/* Slide-type indicator in corner (small, removable) */}
      <CornerLabel slide={slide} mode={mode} raffleStep={raffleStep} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Rotação" />
        <TweakSlider label="Duração por slide" value={t.slideMs} min={3000} max={20000} step={500} unit="ms"
          onChange={(v) => setTweak('slideMs', v)} />
        <TweakRadio label="Transição" value={t.transition} options={['fade', 'energetic']}
          onChange={(v) => setTweak('transition', v)} />

        <TweakSection label="Chrome" />
        <TweakToggle label="Mostrar ticker" value={t.showTicker} onChange={(v) => setTweak('showTicker', v)} />
        <TweakToggle label="Mostrar ranking" value={t.showRanking} onChange={(v) => setTweak('showRanking', v)} />
        <TweakToggle label="Ticker = aviso" value={t.stripAlert} onChange={(v) => setTweak('stripAlert', v)} />

        <TweakSection label="Cor de destaque" />
        <TweakColor label="Visitante" value={t.accentVisitor}
          options={KIT.accentOptions || ['#5EEAD4', '#FFE600', '#FF4D8F', '#3D8BFF', '#E0B544']}
          onChange={(v) => setTweak('accentVisitor', v)} />

        <TweakSection label="Simular ao vivo" />
        <TweakButton label="⚡ Aviso lateral (overlay)" onClick={triggerOverlay} />
        <TweakButton label="⚠ Aviso full-bleed" onClick={triggerAlert} />
        <TweakButton label="🎁 Rifa (contagem → vencedora)" onClick={triggerRaffle} />
        {(mode || overlayUntil > Date.now()) && (
          <TweakButton label="✕ Encerrar simulação" secondary={true}
            onClick={() => { setMode(null); setRaffleStep(null); setOverlayUntil(0); }} />
        )}
      </TweaksPanel>
    </Stage>
  );
}

// Small label in bottom-right showing what's playing (great for demos).
function CornerLabel({ slide, mode, raffleStep }) {
  let txt = '';
  if (mode === 'alertFull') txt = '⚠ aviso · full';
  else if (mode === 'raffle') txt = raffleStep === 'countdown' ? '🎁 rifa · contagem' : '🎁 rifa · vencedora';
  else if (slide.kind === 'visitor') txt = `visitante · ${slide.data.name}`;
  else if (slide.kind === 'eFeat') txt = `estande · ${slide.data.name}`;
  else if (slide.kind === 'eBento') txt = `vitrine · 3 estandes`;
  else if (slide.kind === 'partner') txt = `parceiro · ${slide.data.name}`;
  return (
    <div style={{ position: 'absolute', bottom: 76, left: 28, zIndex: 20, pointerEvents: 'none',
      background: 'rgba(0,0,0,.55)', color: '#fff', padding: '8px 14px', borderRadius: 999,
      fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, letterSpacing: 0.2,
      backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.12)' }}>
      {txt}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PanelApp />);
