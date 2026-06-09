# Handoff: Painel de TV do Evento — direção **Pop Yearbook Sticker**

> Painel rotativo exibido em TV/projetor durante a Feira de Empreendedorismo do Colégio Journey (09h–16h). Mostra fotos de visitantes, estandes, parceiros/patrocinadores, rifas e avisos urgentes, em rotação automática.

---

## 1. Visão geral

Este pacote documenta **uma única tela** — um painel _full-screen_ (1920×1080, 16:9) que roda em loop numa TV. Não há navegação por clique; tudo é **rotação automática temporizada**, com **interrupções** (avisos/rifas) que podem ser disparadas pelo backend.

A direção visual escolhida é **Pop Yearbook Sticker**: papel craft creme, polaroids inclinados com fita washi, doodles (estrelas, setas, rabiscos), adesivos "burst" e tipografia _chunky_ — pensado para um público de 15–18 anos.

## 2. Sobre os arquivos de referência

Os arquivos em `reference/` são **protótipos de design feitos em HTML/React+Babel** — eles demonstram a aparência e o comportamento pretendidos. **Não são código de produção para copiar e colar.** A tarefa é **recriar estes designs no seu app Next.js**, usando os padrões, componentes e convenções que você já tem (ou que o Claude Code estabelecer): componentes React reais (`.tsx`), CSS/Tailwind/styled-components conforme seu projeto, e os dados vindo do seu banco em vez dos mocks.

O JSX de referência usa **estilos inline** para ser autossuficiente no protótipo. Ao portar para o Next, converta para o seu sistema de estilo. Os valores exatos (cores, fontes, tamanhos, rotações) estão documentados em `DESIGN_TOKENS.md`.

## 3. Fidelidade

**Alta fidelidade (hi-fi).** Cores, tipografia, espaçamento, rotações e animações são finais. Recrie pixel-a-pixel usando as bibliotecas do seu codebase. Onde um valor não estiver no doc, leia o componente correspondente em `reference/src/panel-slides-yb.jsx`.

---

## 4. Arquitetura: motor + kit de slides

O protótipo separa **motor de rotação** (genérico) de **kit de slides** (visual). Vale manter essa separação no Next.

| Camada | Arquivo de referência | Papel |
|---|---|---|
| **Motor** | `reference/src/panel-app.jsx` | Estado de rotação, timers, modos especiais (alerta/rifa), escala _scale-to-fit_, painel de Tweaks |
| **Kit de slides (Yearbook)** | `reference/src/panel-slides-yb.jsx` | Os 8 componentes de slide + decorações + header/footer |
| **Dados (mock)** | `reference/src/data.jsx` | Forma dos dados — **substituir pelo banco** |
| **Tweaks (opcional)** | `reference/tweaks-panel.jsx` | Painel de controle (admin/preview). Provavelmente vira tela de config no seu app |

> 📌 **O documento mais importante para você é `COMPONENTS_AND_DATA.md`** — ele lista cada seção, cada componente nomeado, e exatamente qual campo do banco alimenta cada um.

## 5. Componentes (nomes sugeridos para o Next)

Renomeei os componentes de referência (prefixo `PYB_`) para nomes limpos de produção. Use estes no seu codebase:

### Slides (8 tipos)
| Componente de referência | Componente no Next | Tipo de slide |
|---|---|---|
| `PYB_Visitor` | `<VisitorPhotoSlide>` | Foto de visitante + ranking + reações |
| `PYB_ExhibitorFeatured` | `<ExhibitorFeaturedSlide>` | Estande em destaque (tier "gold") |
| `PYB_ExhibitorBento` | `<ExhibitorTrioSlide>` | Vitrine 3 estandes |
| `PYB_Partner` | `<PartnerSlide>` | Parceiro / patrocinador |
| `PYB_RaffleCountdown` | `<RaffleCountdownSlide>` | Rifa — contagem / roleta |
| `PYB_RaffleWinner` | `<RaffleWinnerSlide>` | Rifa — vencedora |
| `PYB_AlertFull` | `<AlertFullBleedSlide>` | Aviso urgente full-bleed |
| `PYB_SideOverlay` | `<AlertOverlayCard>` | Aviso lateral (overlay sobre o slide) |

### Chrome (compartilhado)
| Referência | Next | Papel |
|---|---|---|
| `PYBHeader` | `<PanelHeader>` | Faixa de topo (logo Journey + nome do evento + /fe2026) |
| `PYBFooter` | `<PanelTicker>` | Rodapé: ticker rolante **ou** faixa de aviso vermelha |

### Primitivos de decoração (reutilizáveis)
| Referência | Next | Uso |
|---|---|---|
| `PYBPaper` | `<PaperBackground>` | Fundo creme com grid de pontos |
| `PYBPolaroid` | `<Polaroid>` | Moldura polaroid com fita + legenda manuscrita |
| `PYBBurst` | `<StickerBurst>` | Adesivo estrelado com texto ("VOTE!", "NEW!", "DESTAQUE") |
| `PYBTape` | `<WashiTape>` | Fita adesiva |
| `PYBStar` | `<DoodleStar>` | Estrela doodle |
| `PYBSquiggle` | `<DoodleSquiggle>` | Rabisco ondulado |
| `PYBArrow` | `<DoodleArrow>` | Seta desenhada à mão |

### Motor / orquestração
| Referência | Next | Papel |
|---|---|---|
| `PanelApp` | `<EventPanel>` | Container raiz: orquestra rotação + modos |
| `Stage` | `<FitStage>` | Escala o canvas 1920×1080 para qualquer viewport |
| `Crossfader` | `<SlideTransition>` | Cross-fade / entrada animada entre slides |
| `CornerLabel` | `<NowPlayingBadge>` | Etiqueta de debug (o que está tocando) — opcional |

---

## 6. Comportamento & estados

### Rotação automática
- Um slide por vez. Duração padrão **7000ms** (configurável, faixa 3–20s).
- Mix padrão **pesado em visitantes** — ver `ROTATION` em `panel-app.jsx`:
  ```
  ['v','v','eF','v','v','p','v','eB','v','v','eF','v','p','v','v','eB']
  ```
  `v`=visitante · `eF`=estande destaque · `eB`=trio de estandes · `p`=parceiro.
- Estandes/visitantes/parceiros avançam por **contadores** independentes (round-robin), então repetem em ordem sem pular.
- Tier **gold** dos estandes aparece no slot destaque; demais entram no trio.

### Interrupções (disparadas pelo backend / admin)
| Modo | Duração no protótipo | Comportamento |
|---|---|---|
| **Aviso lateral** (`overlay`) | 7s | Card desliza por cima do slide atual; rotação **continua** por baixo |
| **Aviso full-bleed** (`alertFull`) | 9s | Toma a tela inteira; **congela** a rotação; sem ticker |
| **Rifa** (`raffle`) | 12s contagem → 9s vencedora | Sequência de 2 fases; **congela** a rotação |

No app real, troque os timers/botões por **gatilhos do servidor** (websocket, polling, ou Server-Sent Events). Ver `COMPONENTS_AND_DATA.md → §Triggers`.

### Animações
- **Entrada de slide**: cross-fade 600ms `cubic-bezier(.4,0,.2,1)`; modo "energetic" adiciona `scale(1.04)→1` + leve translateY, 700ms.
- **Ticker/aviso rolante**: translateX linear, ~60s loop (ticker), ~22s (faixa de aviso).
- **Overlay lateral**: entra com `translateX(40px)→0` + fade, 380ms.
- **Confete** (rifa vencedora): 50 peças caindo, `translateY(120vh) rotate(720deg)`, 3–5s.
- **Roleta** (rifa contagem): nome central pulsa `scale(1)→1.04`, 0.6s alternado.
- Respeite `prefers-reduced-motion` no port: mantenha o estado final visível, anime só a partir do oculto.

### Scale-to-fit
O canvas é desenhado em **1920×1080 fixo** e escalado via `transform: scale()` para caber no viewport (letterbox preto). Ver `Stage` em `panel-app.jsx`. Numa TV 1080p roda 1:1.

---

## 7. Tweaks (vira config no app)

O painel de Tweaks do protótipo expõe controles que provavelmente viram **configurações de admin** no seu app:

| Tweak | Chave | Default | Vira no app |
|---|---|---|---|
| Duração por slide | `slideMs` | 7000 | Config de rotação |
| Transição | `transition` | `fade` | `fade` \| `energetic` |
| Mostrar ticker | `showTicker` | `true` | Toggle |
| Mostrar ranking | `showRanking` | `true` | Toggle |
| Ticker = aviso | `stripAlert` | `false` | Modo do rodapé |
| Cor de destaque | `accentVisitor` | `#FFE600` | Acento dos slides de visitante |
| Botões de simulação | — | — | **Substituir por gatilhos reais** |

---

## 8. Arquivos deste pacote

```
design_handoff_pop_yearbook/
├── README.md                  ← este arquivo
├── COMPONENTS_AND_DATA.md      ← mapa seção → componente → campo do banco (LEIA ESTE)
├── DESIGN_TOKENS.md            ← cores, fontes, espaçamento, raios, sombras
├── FEED.md                     ← como usar o feed de exemplo
├── feed.example.json           ← mock da API (event, fotos, estandes, parceiros, rifa, avisos, ticker)
├── screenshots/                ← referência visual dos 8 tipos de slide (1920×1080)
│   ├── 01-visitor-photo.png
│   ├── 02-exhibitor-featured.png
│   ├── 03-exhibitor-trio.png
│   ├── 04-partner.png
│   ├── 05-raffle-countdown.png
│   ├── 06-raffle-winner.png
│   ├── 07-alert-fullbleed.png
│   └── 08-alert-overlay.png
└── reference/
    ├── Prototype v3 (Pop Yearbook).html   ← abra no navegador para ver rodando
    ├── tweaks-panel.jsx
    └── src/
        ├── panel-app.jsx       ← motor de rotação + modos + Stage
        ├── panel-slides-yb.jsx ← os 8 slides + decorações (a "fonte da verdade" visual)
        └── data.jsx            ← forma dos dados mock (espelha o schema sugerido)
```

## 9. Fontes (Google Fonts)

Carregue no Next (`next/font/google` recomendado):
- **Fredoka** (peso 500–700) — display _chunky_ (títulos, números, adesivos)
- **Caveat** (400–700) — manuscrita (legendas, kickers)
- **Fraunces** (ital 400–500) — serifada (taglines, citações em itálico)
- **Archivo Black** — fallback de display
- _Mochiy Pop One_ é o ideal para o display; Fredoka é o fallback usado. Avalie carregar Mochiy Pop One para fidelidade máxima.

## 10. Assets

O protótipo usa `picsum.photos` como placeholder para todas as fotos. **Nenhum asset proprietário** está embutido. No app real:
- Fotos de visitantes, produtos de estandes e vencedores vêm do **banco/storage**.
- Logo do Journey é renderizado como **texto/SVG** (círculo amarelo + "J"). Substitua pelo logo oficial se houver.
- Logos de parceiros: o protótipo usa `logoText` (texto). Se houver logos em imagem, ver nota em `COMPONENTS_AND_DATA.md → §Partner`.
