# Componentes × Dados — guia de binding para o banco

> Este é o documento central do handoff. Para **cada seção/slide**, lista o componente, suas **props**, e **qual campo do banco** alimenta cada elemento visível. A forma dos dados espelha `reference/src/data.jsx`.

---

## Schema sugerido (Prisma-like)

Ajuste nomes/tipos ao seu banco. Esta é a forma mínima que os slides consomem.

```prisma
model Event {
  id          String   @id
  org         String   // "COLÉGIO JOURNEY"
  name        String   // "FEIRA DE EMPREENDEDORISMO 2026"
  handle      String   // "/fe2026"
  date        String   // "21 MAI · 2026"
  startsAt    String   // "9h"
  endsAt      String   // "16h"
  photos      VisitorPhoto[]
  exhibitors  Exhibitor[]
  partners    Partner[]
  raffles     Raffle[]
  alerts      Alert[]
}

model VisitorPhoto {
  id         String  @id
  eventId    String
  name       String  // nome do visitante
  category   String  // "ROCKSTAR" | "BOSS" | "CHEF" ...  (label de personalidade)
  emoji      String  // "🎸"
  imageUrl   String  // foto enviada
  reactHeart Int     @default(0)
  reactRock  Int     @default(0)
  reactFire  Int     @default(0)
  reactLaugh Int     @default(0)
  votes      Int     @default(0)   // usado no ranking
  createdAt  DateTime
  approved   Boolean @default(false) // moderação antes de ir pra TV
}

model Exhibitor {
  id        String  @id
  eventId   String
  name      String  // "Capivara Dog"
  category  String  // "COMIDA" | "DOCES" | "CASA" ...
  emoji     String  // "🌭"
  accent    String  // cor hex da marca do estande — tematiza o slide
  tier      String  // "gold" | "standard"  → controla destaque vs trio
  tagline   String  // frase curta
  stand     String  // "A-12"  (código do estande)
  imageUrl  String  // foto do produto
  instagram String  // "@capivaradog"
  active    Boolean @default(true)
}

model Partner {
  id       String @id
  eventId  String
  name     String // "Stebner Câmbio"
  role     String // "PATROCINADOR OURO" | "APOIO" | "PARCEIRO"
  accent   String // cor hex da marca — INUNDA o slide inteiro
  textOn   String // cor do texto sobre o accent ("#FFFFFF" ou "#1A1B3A")
  tagline  String
  logoText String // texto do logo ("STEBNER") — ver nota sobre logo em imagem
  logoUrl  String? // opcional, se houver logo em imagem
  tier     String // "gold" | "standard"
}

model Raffle {
  id           String  @id
  eventId      String
  prize        String  // "Kit Capivara Dog"
  prizeSub     String  // "4 combos + camiseta"
  drawAt       DateTime // horário do sorteio (alimenta a contagem regressiva)
  enteredCount Int
  status       String  // "scheduled" | "counting" | "revealed"
  winnerPhotoId String? // FK → VisitorPhoto (foto + nome da vencedora)
}

model Alert {
  id        String  @id
  eventId   String
  kind      String  // "full" | "overlay" | "ticker"
  kicker    String  // "AVISO · ENCERRAMENTO" | "OFERTA RELÂMPAGO"
  title     String  // "TUDO 50% OFF" | "Combo duplo R$ 18"
  sub       String  // linha de apoio
  stand     String? // estande relacionado (overlay) — "A-12"
  active    Boolean // se está no ar agora
  expiresAt DateTime?
}

model TickerItem {  // ou derive de exhibitors/raffles dinamicamente
  id      String @id
  eventId String
  text    String // "🍔 Burger Boom — combo do dia R$ 22"
  order   Int
}
```

---

## §Visitante — `<VisitorPhotoSlide>`

**Ref:** `PYB_Visitor` · **Props:** `{ photo, showRanking, showTicker, alertStrip, accent }`

| Elemento na tela | Componente filho | Campo do banco |
|---|---|---|
| Foto principal (polaroid) | `<Polaroid src caption sub>` | `photo.imageUrl` → `src` |
| Legenda manuscrita | `<Polaroid caption>` | `photo.name` |
| Sublegenda | `<Polaroid sub>` | `` `${photo.emoji} ${photo.category}` `` |
| Adesivo "VOTE!" | `<StickerBurst label>` | estático (`"VOTE!"`); cor = `accent` (tweak) |
| Barra de reações | inline | `photo.reactHeart / reactRock / reactFire / reactLaugh` (emojis ❤🎸🔥😂 fixos) |
| Card de ranking (lateral) | inline (`RANKING.slice(0,5)`) | top 5 `VisitorPhoto` por `votes` desc → `{ rank, name, imageUrl, votes }` |

> **Ranking** = query separada: `SELECT ... ORDER BY votes DESC LIMIT 5`. O slide mostra `rank` (1–5), `imageUrl` (avatar), `name`, `votes`.
> `showRanking` e `showTicker` vêm da config (Tweaks). `accent` é a cor de destaque (default `#FFE600`).

---

## §Estande destaque — `<ExhibitorFeaturedSlide>`

**Ref:** `PYB_ExhibitorFeatured` · **Props:** `{ exhibitor, showTicker, alertStrip }` · **Filtro:** `tier === "gold"`

| Elemento | Campo |
|---|---|
| Polaroid do produto | `exhibitor.imageUrl` |
| Legenda do polaroid | `exhibitor.name` + `"feito por estudantes · " + exhibitor.stand` |
| Adesivo "DESTAQUE DO DIA" | estático |
| Card colorido (fundo) | `exhibitor.accent` (cor de fundo) |
| Categoria + emoji | `exhibitor.emoji` + `exhibitor.category` |
| Nome grande | `exhibitor.name` |
| Tagline | `exhibitor.tagline` |
| Pílula de Instagram | `exhibitor.instagram` |
| Selo do estande | `exhibitor.stand` |

---

## §Trio de estandes — `<ExhibitorTrioSlide>`

**Ref:** `PYB_ExhibitorBento` · **Props:** `{ exhibitors, showTicker, alertStrip }` · **Entrada:** array de **3** exhibitors

| Elemento (×3) | Campo |
|---|---|
| Polaroid | `exhibitor.imageUrl` |
| Legenda | `exhibitor.name` |
| Sublegenda | `` `${exhibitor.stand} · ${exhibitor.category.toLowerCase()}` `` |
| Citação | `exhibitor.tagline` |
| Adesivo "NEW!" (só o do meio) | estático/condicional |

> O motor fatia os estandes em grupos de 3 (round-robin). Cores de fita alternam (rosa/amarelo/ciano) — puramente decorativo, não vem do banco.

---

## §Parceiro — `<PartnerSlide>`

**Ref:** `PYB_Partner` · **Props:** `{ partner, showTicker, alertStrip }`

| Elemento | Campo |
|---|---|
| Bloco de cor (fundo inteiro) | `partner.accent` |
| Cor do texto | `partner.textOn` |
| Logo grande (texto) | `partner.logoText` |
| Tagline em itálico | `partner.tagline` |
| Pílula de função | `partner.role` |

> **Logo em imagem:** o protótipo renderiza `logoText` como tipografia. Se você tiver `logoUrl`, substitua o bloco `{p.logoText}` por um `<img>` centralizado, mantendo o fundo `accent`. Garanta contraste com `textOn`.

---

## §Rifa — contagem · `<RaffleCountdownSlide>`

**Ref:** `PYB_RaffleCountdown` · **Props:** `{ remainingMs, showTicker }`

| Elemento | Campo |
|---|---|
| Relógio MM:SS | derivado de `raffle.drawAt - now` → passe como `remainingMs` |
| Prêmio | `raffle.prize` |
| Subtítulo do prêmio | `raffle.prizeSub` |
| Nº de participantes | `raffle.enteredCount` |
| Roleta de nomes | amostra de `VisitorPhoto.name` (efeito visual; nome central = candidato animado) |

> O componente formata `remainingMs` em MM:SS internamente. O servidor só precisa fornecer `drawAt`; calcule `remainingMs` no cliente a cada tick.

---

## §Rifa — vencedora · `<RaffleWinnerSlide>`

**Ref:** `PYB_RaffleWinner` · **Props:** `{ showTicker, justRevealed }`

| Elemento | Campo |
|---|---|
| Polaroid da vencedora | `raffle.winner.imageUrl` (via `winnerPhotoId → VisitorPhoto`) |
| Nome | `raffle.winner.name` |
| Sublegenda | `raffle.winner.stand` (ex: "visitante · /fe2026") |
| Prêmio | `raffle.prize` + `raffle.prizeSub` |
| Confete | dispara quando `justRevealed === true` |

> No protótipo o vencedor é fixo (`RAFFLE.winner`). No app: quando `raffle.status` vira `"revealed"`, busque a foto via `winnerPhotoId` e passe `justRevealed` para disparar o confete uma vez.

---

## §Aviso full-bleed — `<AlertFullBleedSlide>`

**Ref:** `PYB_AlertFull` · **Props:** `{ alert }` · **Filtro:** `alert.kind === "full"`

| Elemento | Campo |
|---|---|
| Kicker | `alert.kicker` |
| Título gigante | `alert.title` (ex: "TUDO 50% OFF" → protótipo separa "50%"/"OFF") |
| Subtítulo | `alert.sub` |
| Pílulas (horário/CTA) | estáticas no protótipo — pode derivar de `event.endsAt` |

> O protótipo formata "50% OFF" com estilo fixo. Para títulos genéricos, simplifique para renderizar `alert.title` direto, mantendo o tamanho/sombra.

---

## §Aviso lateral — `<AlertOverlayCard>`

**Ref:** `PYB_SideOverlay` · **Props:** `{ alert }` · **Filtro:** `alert.kind === "overlay"`

| Elemento | Campo |
|---|---|
| Kicker | `alert.kicker` (ex: "OFERTA RELÂMPAGO") |
| Título | `alert.title` (ex: "Combo duplo R$ 18") |
| Subtítulo | `alert.sub` |
| Selo do estande | `alert.stand` (ex: "A-12") |

> Diferente do full-bleed, este **não** congela a rotação — desliza por cima do slide atual e some após `expiresAt`.

---

## §Aviso no ticker — `<PanelTicker alertStrip>`

**Ref:** `PYBFooter` com prop `alertStrip` · **Filtro:** `alert.kind === "ticker"`

Quando há aviso tipo `ticker` (ou o toggle `stripAlert`), o rodapé troca o ticker normal por uma **faixa vermelha rolante** com `alert.title`/texto. Caso contrário, mostra `TickerItem.text` em loop.

---

## §Header — `<PanelHeader>`

**Ref:** `PYBHeader` · **Props:** `{ kicker }`

| Elemento | Campo |
|---|---|
| Logo Journey | estático (círculo + "J") ou logo oficial |
| Nome do evento + ano | `event.name` (protótipo: "Feira Empreendedorismo 2026") |
| Handle | `event.handle` ("/fe2026") |
| Kicker (muda por slide) | string contextual ("manda foto sua...", "estande da hora ✶", etc.) |

---

## Triggers — como o backend controla o painel

No protótipo, botões de Tweaks disparam os modos. No app real, recomendo **um canal em tempo real** (SSE/WebSocket) que empurra um "comando de exibição":

```ts
type PanelCommand =
  | { type: 'rotate' }                              // segue rotação normal
  | { type: 'overlay'; alertId: string; ttlMs: number }
  | { type: 'alertFull'; alertId: string; ttlMs: number }
  | { type: 'raffle'; raffleId: string; phase: 'counting' | 'revealed' };
```

- `<EventPanel>` assina o canal. Sem comando especial → rotação automática.
- `overlay` → renderiza `<AlertOverlayCard>` por cima, mantém rotação.
- `alertFull` / `raffle` → congelam a rotação até `ttlMs` expirar ou novo comando chegar.
- O **conteúdo** (qual foto, qual estande) também pode vir por API: `GET /api/panel/feed` retornando a lista aprovada e ordenada; o cliente faz o round-robin (ou o servidor define a ordem).

### Moderação
`VisitorPhoto.approved` deve filtrar o que vai pra TV. Só fotos aprovadas entram na rotação e no ranking.

---

## Resumo do fluxo de dados

```
[Banco]
  Event ─┬─ VisitorPhoto[] (approved) ──► VisitorPhotoSlide + ranking
         ├─ Exhibitor[] (tier=gold) ─────► ExhibitorFeaturedSlide
         ├─ Exhibitor[] (standard, 3-up) ► ExhibitorTrioSlide
         ├─ Partner[] ───────────────────► PartnerSlide
         ├─ Raffle (status) ─────────────► RaffleCountdown / RaffleWinner
         ├─ Alert[] (kind) ──────────────► AlertFullBleed / AlertOverlay / ticker
         └─ TickerItem[] ────────────────► PanelTicker

[Canal realtime] ──► EventPanel (decide modo: rotate | overlay | alertFull | raffle)
```
