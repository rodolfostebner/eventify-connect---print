# Design Tokens — Pop Yearbook Sticker

> Valores exatos extraídos de `reference/src/panel-slides-yb.jsx`. Tudo foi desenhado num canvas **1920×1080**; tamanhos em px são para essa escala (o `<FitStage>` escala o conjunto).

---

## Cores

```css
/* Paleta Pop Yearbook */
--paper:        #FBF5E8;  /* fundo creme (papel craft) */
--paper-dark:   #1F1E24;  /* fundo escuro alternativo */
--ink:          #1A1B2E;  /* tinta — texto, bordas, contornos */
--pink:         #FF4D8F;  /* rosa neon — adesivos, acentos */
--yellow:       #FFE600;  /* amarelo — destaque padrão, fitas */
--cyan:         #00D4FF;  /* ciano — fitas, doodles */
--green:        #2DCB7A;  /* verde — logo Journey, doodles */
--lavender:     #C0A6FF;  /* lavanda — confete */
--red:          #FF3B5C;  /* vermelho — avisos urgentes */
--gold:         #F0AB00;  /* dourado — rifa */
```

### Acento de destaque (visitante) — opções do Tweak
`#FFE600` (default) · `#FF4D8F` · `#00D4FF` · `#2DCB7A` · `#C0A6FF`

### Cores de marca (vêm do banco, não são tokens fixos)
- `Exhibitor.accent` — tematiza o card do estande em destaque.
- `Partner.accent` + `Partner.textOn` — inundam o slide do parceiro.

---

## Tipografia

```css
--font-display: 'Mochiy Pop One', 'Fredoka', 'Recoleta', 'Archivo Black', system-ui, sans-serif;
--font-body:    'Fraunces', 'Georgia', serif;
--font-hand:    'Caveat', 'Patrick Hand', 'Comic Sans MS', cursive;
```

| Uso | Fonte | Tamanho (px @1080) | Peso |
|---|---|---|---|
| Nome de visitante (polaroid) | hand (Caveat) | 38 | — |
| Título de estande/parceiro | display (Fredoka) | 96–200 | 700–900 |
| Número da rifa (MM:SS) | display | 120 | 700 |
| Nome do evento (header) | display | 32 | 700 |
| Kicker do header | hand | 28 | — |
| Tagline / citações | body (Fraunces) itálico | 22–40 | 400–500 |
| Adesivo "burst" | display | ~18% do tamanho do adesivo | 900 |
| Ticker (rodapé) | body | 24 | — |

> **Mochiy Pop One** é o display ideal; **Fredoka** é o fallback usado nos protótipos. Para fidelidade máxima, carregue Mochiy Pop One.

---

## Espaçamento & layout

```css
--header-height: 110px;   /* faixa de topo */
--footer-height: 76px;    /* ticker / faixa de aviso */
--page-pad-x:    44–92px; /* margens laterais variam por slide */
--canvas:        1920 × 1080;
```

- Slides de conteúdo respeitam `top: header-height` e `bottom: footer-height` (quando o ticker está visível).
- Polaroids: largura 540–780px conforme o slide; `padding: 20px`, `padding-bottom: 96px` (área da legenda).

---

## Raios, bordas, sombras

```css
/* Border radius */
--r-card:     10–18px;   /* cards coloridos, overlays */
--r-pill:     999px;     /* pílulas (instagram, role, kicker) */
--r-sticker-photo: 0;    /* polaroid é retangular */

/* Bordas */
--border-ink: 4–5px solid var(--ink);   /* contorno "marcador" de cards/polaroids */
--tape-dash:  5px dashed var(--yellow);  /* topo do rodapé */

/* Sombras */
--shadow-polaroid: 0 20px 56px rgba(0,0,0,.18), 0 3px 6px rgba(0,0,0,.08);
--shadow-card:     0 18px 50px rgba(0,0,0,.18);
--shadow-overlay:  0 32px 80px rgba(0,0,0,.40);
--shadow-sticker:  0 10px 24px rgba(0,0,0,.20);
```

---

## Rotações (a "imperfeição" intencional)

Elementos são levemente girados para o look colado-à-mão. Valores típicos:

| Elemento | Rotação |
|---|---|
| Polaroid principal | `-3deg` a `-4deg` |
| Polaroids do trio | `-4deg`, `+2deg`, `-2deg` |
| Card de ranking | `+2deg` |
| Adesivo burst | `+12deg` a `+16deg` |
| Fita washi | `-6deg` a `-8deg` |
| Logo Journey (header) | `-6deg` |
| Selo do estande | `-8deg` |
| Pílulas do parceiro | `-2deg` / `+1.5deg` |

> Mantenha essas rotações — são a assinatura da direção. Aplique via `transform: rotate()`; cuidado para não dobrar a rotação em animações (veja `pybslide` que preserva `rotate(-2deg)` nos keyframes).

---

## Animações (timings)

```css
/* Entrada de slide (cross-fade) */
opacity 600ms cubic-bezier(.4,0,.2,1);
/* modo "energetic": + scale(1.04)→1, translateY(8px)→0, 700ms cubic-bezier(.2,.7,.3,1) */

/* Overlay lateral entra */
@keyframes pybslide { from{ translateX(40px); opacity:0 } to{ translateX(0); opacity:1 } } /* 380ms */

/* Confete (rifa vencedora) */
@keyframes pybconfetti { to { translateY(120vh) rotate(720deg) } } /* 3–5s, stagger 0.1s */

/* Roleta (rifa contagem) — nome central */
@keyframes pybwobble { from{ scale(1) } to{ scale(1.04) } } /* 0.6s alternate infinite */

/* Ticker / faixa de aviso rolante */
translateX linear: ticker ~60s loop · faixa de aviso ~22s
```

**Acessibilidade:** envolva animações decorativas em `@media (prefers-reduced-motion: no-preference)`. O estado final (slide visível, conteúdo no lugar) deve ser o estado base — anime _a partir_ do oculto, nunca deixe conteúdo preso em `opacity:0`.

---

## Decorações SVG (primitivos)

Desenhados em SVG inline, recoloríveis via prop `color`:

| Componente | viewBox | Nota |
|---|---|---|
| `DoodleStar` | `0 0 24 24` | estrela de 5 pontas com contorno ink |
| `DoodleSquiggle` | `0 0 80 16` | onda senoidal, `stroke-width: 2.5` |
| `DoodleArrow` | `0 0 90 60` | seta curva desenhada à mão |
| `StickerBurst` | `0 0 100 100` | polígono estrelado de ~22 pontas + texto centralizado |
| `WashiTape` | — | div com `repeating-linear-gradient` (listras) + `opacity: .88` |

Todos aceitam `color` (preenchimento) e usam `--ink` no contorno. Reaproveite como componentes puros sem dependência de dados.
