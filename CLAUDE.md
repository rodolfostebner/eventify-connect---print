# CLAUDE.md — Eventify Connect & Print

## O que e este projeto

Plataforma "phygital" de engajamento para eventos ao vivo. Participantes fotografam durante o evento, as fotos sao moderadas em tempo real, exibidas no feed web e no telao (TV wall), e podem ser enviadas para fila de impressao fisica (stickers/albuns). Inclui painel de moderacao para curadoria de conteudo e painel de operador para gerenciar a fila de impressao.

Tres estados de evento: `pre` (landing + countdown) → `live` (feed + upload + interacoes) → `post` (galeria + download)

Projeto criado pelo Google AI App (Firebase Studio / Project IDX). Denis colabora a partir da versao atual.

---

## Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4
- **Database/Realtime**: Supabase (PostgreSQL + Realtime subscriptions)
- **Auth**: Firebase (Google OAuth via popup — unico metodo de auth)
- **Storage**: Cloudflare R2 (upload direto via presigned URL gerada por Edge Function)
- **UI**: Motion/Framer (animacoes), lucide-react (icones), sonner (toasts), date-fns (datas PT-BR)
- **Deploy**: Vercel (SPA rewrite via vercel.json)
- **Testes**: Playwright (E2E)

---

## Comandos

```bash
npm install            # instalar dependencias
npm run dev            # dev server em http://localhost:3000
npm run build          # build de producao
npm run preview        # preview do build
npm run lint           # checagem TypeScript (tsc --noEmit)
npm run test:e2e       # testes E2E (Playwright)
```

---

## Variaveis de Ambiente (.env.local)

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=

# Cloudflare R2
VITE_R2_PUBLIC_URL=

# Opcional
VITE_APP_URL=          # default: window.location.origin
```

Edge Function (Supabase): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

---

## Estrutura do Projeto

```
src/
  App.tsx                  # Rotas + LoginScreen (Firebase Google)
  main.tsx                 # Entry point React 19
  index.css                # Estilos globais Tailwind 4 (@layer directives)

  constants/
    index.ts               # EventStatus enum (pre|live|post), ROUTES

  types/
    index.ts               # Todos os tipos TS: EventData, PhotoData, PrintOrder, etc.
                           # ATENCAO: PhotoData ainda reflete schema legado (tabela photos)

  lib/
    firebase/client.ts     # Firebase Auth + googleProvider
    supabase/client.ts     # Supabase client (null-safe se sem .env)
    utils.ts               # cn(), getAppUrl()

  services/
    eventService.ts        # CRUD eventos + subscriptions realtime
    posts.ts               # LEGADO: aponta para tabela `photos` (nao migrou)
    printService.ts        # Pedidos de impressao (usa photo_ids array — legado parcial)
    storageService.ts      # Upload R2 via Edge Function get-r2-upload-url
    userService.ts         # Sync Firebase -> Supabase (createUserIfNotExists)
    notificationService.ts # CRUD + subscribe notificacoes
    authService.ts         # ORFAO: codigo de Supabase Auth (auth e 100% Firebase)
    photoService.ts        # DESCONTINUADO — stub vazio, remover
    mockData.ts            # DESCONTINUADO — stub vazio, remover
    mockFirestore.ts       # DESCONTINUADO — stub vazio, remover

  hooks/
    useAuth.ts             # Firebase onAuthStateChanged + createUserIfNotExists
    useEvent.ts            # subscribeToEvent por slug
    useEvents.ts           # subscribeToEvents (todos os eventos)
    usePosts.ts            # fetchPosts + subscribe (tabela photos — legado)

  pages/                   # Re-exportam features/ (thin wrappers)
    AdminDashboard.tsx
    EventPage.tsx
    ModerationPanel.tsx
    OperatorPanel.tsx
    TVView.tsx

  features/
    admin/
      AdminDashboard.tsx   # Lista + CRUD eventos, modais
      components/
        BrandingModal.tsx  # Editor de tema (cores, gradientes, padroes)
        EventCard.tsx      # Card do evento no dashboard
        ShareModal.tsx     # Compartilhar links do evento
      hooks/
        useAdminEvents.ts  # State da lista de eventos
        useBrandingForm.ts # Form state do branding

    event/
      EventPage.tsx        # Orquestrador: detecta estado pre/live/post
      LiveEventView.tsx    # DUPLICATA — ver components/LiveEventView.tsx
      PostEventView.tsx    # DUPLICATA — ver components/PostEventView.tsx
      PreEventView.tsx     # DUPLICATA — ver components/PreEventView.tsx
      components/
        LiveEventView.tsx  # View principal LIVE (feed + upload + interacoes)
        PostEventView.tsx  # View pos-evento (galeria + download)
        PreEventView.tsx   # Landing + countdown + parceiros
        PartnerSection.tsx # Expositores/patrocinadores
        SocialLinks.tsx    # Links sociais do app
        Feed/
          FeedGrid.tsx            # Grid de fotos aprovadas
          FeaturedSlideshow.tsx   # Slideshow de destaques
          LoginBanner.tsx         # Banner de login para participar
          UploadFAB.tsx           # Botao flutuante de upload
        PhotoCard/
          PhotoCard.tsx           # Card de foto
          InteractionBar.tsx      # Barra de likes/emojis/comentarios
          PhotoModal.tsx          # Modal de foto ampliada
      hooks/
        useEventPhotos.ts         # Fotos aprovadas do evento (feed)
        useModerationPhotos.ts    # Todas as fotos (para moderacao)
        usePhotoUpload.ts         # Upload para R2 + compressao no browser
        useAdminActions.ts        # Acoes de moderacao inline
        useCategoryGroups.ts      # Agrupamento por ranking (likes, emojis)
        usePrintOrders.ts         # Print orders do participante
        useSlideshow.ts           # Controle de slideshow

    moderation/
      ModerationPanel.tsx  # Painel de curadoria
      components/
        PhotoModeration.tsx        # Grid de fotos para aprovar/rejeitar
        CommentModeration.tsx      # Lista de comentarios pendentes
        ModerationControls.tsx     # Controles de estado do evento
        PrintOrderModal.tsx        # Modal de detalhes do pedido
        PrintOrderModeration.tsx   # Lista de pedidos de impressao

    operator/
      OperatorPanel.tsx    # Fila de impressao (UI incompleta)
      hooks/
        usePrintQueue.ts   # Subscribe a fila em tempo real

    tv/
      TVView.tsx           # Live Wall: slideshow fullscreen + rankings por categoria

  components/
    ErrorBoundary.tsx      # Boundary global de erro
    NotificationsListener.tsx  # Ouve notificacoes em tempo real
    UploadTest.tsx         # DESCONTINUADO — remover em producao

  utils/
    formatters.ts          # Formatadores de URL (Instagram, WhatsApp, Website)

supabase/
  config.toml              # Supabase CLI (PostgreSQL 17, porta 54322)
  functions/
    get-r2-upload-url/
      index.ts             # Edge Function Deno: gera presigned URL para R2 (5 min)
      deno.json

tests/
  smoke.spec.ts
  admin-dashboard.spec.ts
  event-page.spec.ts
  feed.spec.ts

docs/
  project-context.md       # Contexto gerado por BMAD (referencia historica)
```

---

## Rotas

| Rota | Acesso | Componente | Status |
|------|--------|------------|--------|
| `/` | Admin (Firebase Auth) | AdminDashboard | Ativo |
| `/admin` | — | Redireciona para `/` | — |
| `/event/:slug` | Publico | EventPage (3 views por status) | Ativo |
| `/tv/:slug` | Publico | TVView (slideshow fullscreen) | Ativo |
| `/moderation/:slug` | Admin | ModerationPanel | Ativo |
| `/operator/:slug` | Admin | OperatorPanel | UI incompleta |
| `*` | — | Redireciona para `/` | — |

---

## Fluxo de Auth

1. Firebase Google OAuth (`signInWithPopup`)
2. `useAuth.ts` escuta `onAuthStateChanged`
3. No login, `createUserIfNotExists()` sincroniza usuario na tabela `users` do Supabase
4. Admin = `role='admin'` na tabela users OU email presente em `admin_emails[]` do evento
5. `authService.ts` existe mas e orfao — auth e 100% Firebase, nao Supabase Auth

---

## Fluxo de Upload de Fotos

1. Usuario seleciona imagem — compressao no browser (`usePhotoUpload.ts`)
2. `storageService.ts` chama Edge Function `get-r2-upload-url` com `{ fileName, contentType }`
3. Edge Function retorna presigned URL (valida 5 min)
4. Browser faz `PUT` direto no Cloudflare R2
5. URL publica: `${VITE_R2_PUBLIC_URL}/${fileName}`

---

## Realtime (Supabase)

Padrao unico em todos os servicos:

```ts
supabase.channel(`public:{tabela}:{filtro}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: '{tabela}', filter: '...' }, cb)
  .subscribe()
```

Callbacks sempre fazem refetch completo — nunca merge parcial do payload.

Canais ativos:
- `public:events` — dashboard admin
- `public:events:slug=eq.{slug}` — pagina do evento
- `public:photos:event_id=eq.{id}` — feed (LEGADO)
- `public:photos:all:event_id=eq.{id}` — moderacao (LEGADO)
- `public:print_orders:event_id=eq.{id}` — operador
- `public:notifications:user_id=eq.{id}` — notificacoes

---

## Tabelas Supabase

### Tabelas ativas (schema normalizado)

| Tabela | Descricao | Status |
|--------|-----------|--------|
| `events` | Config completa do evento (~40 campos): status, branding, admin_emails[], TV config, social, flags | Ativo |
| `users` | Sync Firebase (firebase_uid, email, display_name, photo_url) | Ativo |
| `posts` | Fotos normalizadas (id, event_id, user_id, image_url, status, is_official, printed) | Destino da migracao |
| `reactions` | Emoji + user por post (normalizado) | Novo |
| `comments` | Texto + status moderacao por post (normalizado) | Novo |
| `print_orders` | Pedidos de impressao (option, photo_ids[] texto, status) | Legado parcial |
| `print_order_items` | FK: print_order_id + post_id (normalizado) | Novo |
| `notifications` | Notificacoes por usuario (title, body, read, link) | Ativo |

### Tabela legada (em migracao)

| Tabela | Descricao | Status |
|--------|-----------|--------|
| `photos` | Denormalizada: likes (int), reactions (jsonb), comments (jsonb), reacted_users[], firebase_uid | Em uso por posts.ts — migracao incompleta |

---

## Camada de Servicos — Status

| Servico | Tabela(s) | Status |
|---------|-----------|--------|
| `eventService.ts` | `events` | Ativo |
| `posts.ts` | `photos` (legado) | WIP — deve migrar para `posts` |
| `printService.ts` | `print_orders` | Ativo (usa array legado) |
| `notificationService.ts` | `notifications` | Ativo |
| `userService.ts` | `users` | Ativo |
| `storageService.ts` | Cloudflare R2 | Ativo |
| `authService.ts` | Supabase Auth | Orfao — remover ou documentar |
| `photoService.ts` | — | Descontinuado — remover |
| `mockData.ts` | — | Descontinuado — remover |
| `mockFirestore.ts` | — | Descontinuado — remover |

---

## Divida Tecnica Conhecida

| # | Item | Impacto | Prioridade |
|---|------|---------|------------|
| 1 | `posts.ts` aponta para tabela `photos` (legado) | Alto — todo feed/moderacao no schema antigo | Alta |
| 2 | `PhotoData` type nao reflete schema de `posts` | Alto — TypeScript inconsistente com BD | Alta |
| 3 | `print_orders.photo_ids` e text[] sem FK | Medio — sem integridade referencial | Media |
| 4 | Duplicatas em `features/event/` (raiz vs `components/`) | Baixo — confusao de estrutura | Baixa |
| 5 | `photoService.ts`, `mockData.ts`, `mockFirestore.ts` nao removidos | Baixo — codigo morto | Baixa |
| 6 | `UploadTest.tsx` em components | Baixo — nao deve ir para producao | Baixa |
| 7 | `authService.ts` orfao (auth e Firebase, nao Supabase) | Baixo — confusao conceitual | Baixa |
| 8 | `@google/genai` no package.json sem uso | Baixo — dependencia desnecessaria | Baixa |

---

## Convencoes

- Projeto e comentarios em **portugues**
- Feature-based: logica agrupada por feature, nao por tipo de arquivo
- Services isolam todo acesso a DB/APIs — componentes nunca chamam Supabase diretamente
- Tailwind 4 CSS-first: sem `tailwind.config.js`, configuracao via CSS nativo (@layer)
- Path alias: `@/*` mapeia para a raiz do projeto (`src/`)
- snake_case no BD, camelCase no TypeScript — mapeamento explicito em cada service
- Supabase null-safe: todos os servicos verificam `if (!supabase) return` antes de operar
- `import type { ... }` para interfaces TypeScript
- Realtime: sempre refetch completo no callback (nunca merge parcial)

---

## Features por Perfil de Usuario

### Admin (Firebase Auth + role=admin ou admin_emails)
- Dashboard: criar, editar, excluir eventos
- Branding: cores, gradientes, padroes, logo, config TV
- Adicionar patrocinadores, expositores, servicos, links sociais
- Alterar status do evento (pre/live/post)
- Moderacao: aprovar/rejeitar fotos e comentarios
- Gerenciar pedidos de impressao
- Upload de fotos oficiais

### Participante (Firebase Auth — qualquer usuario logado)
- Ver feed de fotos aprovadas
- Fazer upload de fotos (PUT direto no R2)
- Reagir com emojis e curtidas
- Comentar fotos
- Solicitar impressao de ate 10 fotos

### Visitante (sem auth)
- Ver feed e slideshow
- Ver pagina do evento (pre/live/post)
- Ver telao (TV wall)
- Nao pode interagir nem fazer upload

### Operador
- Ver fila de impressao em tempo real
- Marcar pedidos como concluidos

---

## Status BMAD

| Fase | Status |
|------|--------|
| PRD | v4 validado |
| Project Context | Este documento (substituiu docs/project-context.md) |
| Arquitetura (CA) | Proximo passo |
| UX Design (CU) | Aguardando CA |
| Epics & Stories (CE) | Aguardando CA + CU |
| Sprint Plan (SP) | Aguardando CE |
