# TV Panel — Pop Yearbook · Pontos a Resolver

> Status: **análise concluída, aguardando decisões**. Retomar amanhã.
> Base: handoff de design em `design_handoff_pop_yearbook/` (Claude Design) vs. nosso `src/features/tv/TVView.tsx` atual e schema Supabase.

---

## Resumo do que o design entrega

Painel rotativo full-screen (1920×1080, scale-to-fit) na direção **"Pop Yearbook Sticker"** — papel craft creme, polaroids tortos com fita washi, doodles, adesivos burst, tipografia chunky. Público 15–18 anos (Feira de Empreendedorismo · Colégio Journey).

Arquitetura proposta (vale manter):
- **Motor** (`panel-app.jsx`): rotação temporizada round-robin + modos especiais (aviso full / rifa congelam a rotação; overlay sobrepõe) + `Stage` scale-to-fit.
- **Kit de 8 slides**: visitante, estande destaque (gold), trio de estandes, parceiro, rifa contagem, rifa vencedora, aviso full-bleed, aviso lateral.
- **Chrome**: header (logo + evento + handle) e footer (ticker rolante OU faixa de aviso vermelha).
- **Decorações reutilizáveis**: polaroid, burst, washi tape, estrela, squiggle, seta.

---

## Diferenças estruturais já identificadas

### 1. Framework
O handoff assume **Next.js** (`app/api/panel/feed/route.ts`, `next/font/google`). Nós somos **Vite + React 19 SPA** — sem API routes nem SSR.
- Slides buscam direto dos services Supabase (padrão do resto do app).
- Fontes via `<link>`/`@import`, não `next/font`.

### 2. Modelo de exibição é diferente do TV atual
- **Hoje** (`TVView.tsx`): slideshow de **rankings por categoria** (Mais Curtida, Mais Divertida, Rock Star… top 5 cada) + overlay de sorteio (`RaffleSpinner` polido) + overlay de anúncios (síntese Web Audio).
- **Design novo**: **rotação por tipo de conteúdo** (visitante → estande → parceiro → rifa).
- → São dois modelos diferentes. **Esta é a decisão central** (ver pergunta A).

### 3. Controle em tempo real
Design sugere SSE/WebSocket com `PanelCommand`. Nós já temos padrão que funciona: campos na linha `events` (`active_announcement_id`, `tv_raffle_state`, `tv_show_ranking`) com subscribe realtime + polling de fallback. → **Estender esse padrão**, não introduzir SSE.

### 4. Campos do design que NÃO existem no banco

| Slide | Campo do design | Status no nosso banco |
|---|---|---|
| Visitante | `name`, `imageUrl` | ✅ `posts` + `users` |
| Visitante | `category`/`emoji` (personalidade: ROCKSTAR 🎸) | ❌ não existe |
| Visitante | `votes` (ranking) | ❌ temos `likes` + `reactions` |
| Visitante | reações fixas heart/rock/fire/laugh | ⚠️ temos reações por emoji arbitrário |
| Estande | `accent` (cor da marca) | ❌ |
| Estande | `tier` gold/standard | ❌ |
| Estande | `emoji`, `tagline`, `stand` (código) | ❌ (temos `number`, `category`, `description`, `instagram`) |
| Parceiro | `accent`, `textOn`, `tier`, `role`, `tagline`, `logoText`/`logoUrl` | ⚠️ `partners` tem type/photos/`show_on_tv` (flag não consumida — dívida #6) |
| Rifa | prize/winner | ✅ `raffle_tickets` + `RafflePrize` + `tv_raffle_state` (mais avançado que o mock) |
| Aviso | kind full/overlay/ticker | ⚠️ `announcements` (só fullscreen hoje) |
| Ticker | itens de rodapé | ❌ sem tabela |

---

## DECISÕES PENDENTES

### A) Substituir ou conviver?
O painel novo **substitui** o `TVView.tsx` por completo, ou é um **modo alternativo** de telão (Pop Yearbook pra feira do Journey; atual continua pra outros eventos)?
> Muda todo o planejamento. **Recomendação:** tratar como segundo modo (não destruir o atual).

### B) Rotação por tipo vs. ranking por categoria
Largamos os 6 rankings por categoria e adotamos a rotação visitante/estande/parceiro? Ou preservamos as categorias dentro do novo visual?

### C) Campos faltantes — adicionar no banco ou derivar?
- **Personalidade do visitante** (ROCKSTAR/🎸): adicionar no fluxo de upload, derivar, ou **cortar** do slide?
- **`tier` gold/standard de estande**: coluna nova, ou derivar (destaque manual / mais visitado)? Parceiro dá pra mapear `partners.type` (patrocinador = gold).
- **`accent` (cor de marca)**: coluna nova, branding do evento, ou paleta fixa Pop Yearbook?
- **`tagline`, `emoji`, código `stand`**: colunas novas em `exhibitors`? (`number` pode virar o código do stand).
- **`votes`**: usar `likes` como proxy? (provável sim).

### D) Ticker
Gerar dinamicamente (anúncios + próxima rifa + estandes) ou criar tabela `ticker_items` editável pelo admin?

### E) Sorteio e anúncios atuais
Preservar `RaffleSpinner` + síntese de áudio (já bons) e só re-vestir com o visual Pop Yearbook? Ou adotar a sequência contagem→vencedora do design do zero?

### F) Escopo / faseamento
Port hi-fi completo dos 8 slides de uma vez, ou MVP primeiro (motor + header/footer + visitante + 1 estande + rotação) evoluindo depois?
> **Recomendação:** começar por MVP, com campos faltantes derivados/cortados antes de mexer no schema.

### G) Fontes
Carregar Mochiy Pop One + Fredoka + Caveat + Fraunces (Google Fonts)? Confirmar que pode adicionar.

---

## Recomendação de ponto de partida (a confirmar)
1. Tratar como **segundo modo de telão** (não destruir o atual) — depende de (A).
2. **MVP**: motor de rotação + header/footer + slides de visitante e estande, com campos faltantes **derivados/cortados** em vez de migração de schema.
3. Decidir depois quais colunas valem ser adicionadas no banco.

---

## Mapa rápido dos arquivos do handoff
```
src/EventFy_TV_Panel/design_handoff_pop_yearbook/
├── README.md                  ← visão geral + arquitetura
├── COMPONENTS_AND_DATA.md      ← mapa seção → componente → campo do banco (principal)
├── DESIGN_TOKENS.md            ← cores, fontes, espaçamento, rotações, animações
├── FEED.md                     ← como usar o feed mock
├── feed.example.json           ← mock da API
├── screenshots/                ← referência visual dos 8 slides
└── reference/
    ├── Prototype v3 (Pop Yearbook).html   ← abrir no navegador p/ ver rodando
    ├── tweaks-panel.jsx
    └── src/{panel-app, panel-slides-yb, data}.jsx
```
