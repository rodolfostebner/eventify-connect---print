# CLAUDE.md — Eventify Connect & Print

## O que e este projeto

Plataforma "phygital" para feiras e eventos ao vivo. Participantes fotografam, interagem e avaliam expositores durante o evento. As fotos sao moderadas em tempo real, exibidas no feed e no telao (TV wall), e podem ser enviadas para fila de impressao (stickers/albuns). Expositores gerenciam seu proprio stand virtual com catalogo de produtos e registro de leads de pre-venda.

Tres estados de evento: `pre` (landing + countdown + catalogo) → `live` (feed + upload + interacoes) → `post` (galeria + ranking)

Projeto criado pelo Google AI App (Firebase Studio / Project IDX). Denis colabora a partir da versao atual.

---

## Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4
- **Database/Realtime**: Supabase (PostgreSQL + Realtime subscriptions)
- **Auth**: Supabase Auth unificado — Google OAuth + Magic Link para todos os perfis. BETA_MODE ignora Supabase Auth e autentica por email direto na tabela `users` (para desenvolvimento sem OAuth configurado)
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

# Cloudflare R2
VITE_R2_PUBLIC_URL=

# Opcional
VITE_APP_URL=          # default: window.location.origin
VITE_BETA_MODE=true    # true = login por email sem OAuth (dev); false = Google OAuth + Magic Link (prod)
```

Edge Functions (Supabase): `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

---

## Estrutura do Projeto

```
src/
  App.tsx                  # Rotas por perfil (admin, event_admin, avaliador, expositor, participant + publicas)
  main.tsx                 # Entry point React 19
  index.css                # Estilos globais Tailwind 4 (@layer directives)

  constants/
    index.ts               # EventStatus enum (pre|live|post), ROUTES

  types/
    index.ts               # Todos os tipos TS
                           # ExhibitorSponsor — tipo legado (JSON em events.services[])
                           # Exhibitor, AppUser, UserRole, UserEmailRole — schema normalizado
                           # EventData, PostData, PhotoData, PrintOrder, Product, Lead, Partner (type patrocinador/apoiador/servico)
                           # AuditLog — auditoria de alteracoes do evento
                           # EvaluationCategory, Evaluation, JurorEvaluation — avaliações
                           # RaffleTicket — sorteio
                           # Visit, VisitAction — analytics
                           # ExhibitorRanking — view de ranking ponderado

  lib/
    supabase/client.ts     # Supabase client (null-safe se sem .env)
    utils.ts               # cn(), getAppUrl()

  services/
    authService.ts         # Login Google OAuth + Magic Link + logout (Supabase Auth)
    userService.ts         # syncUser, findOrCreateUserByEmail, CRUD users, pré-cadastro email roles
    eventService.ts        # CRUD eventos + subscriptions realtime
    posts.ts               # CRUD posts + reactions + comments (tabelas posts, reactions, comments)
    viewTracker.ts         # Tracker singleton de visualizações em lote e sem duplicados por sessão
    printService.ts        # Pedidos de impressao (usa photo_ids array — legado parcial — INATIVO)
    storageService.ts      # Upload R2 via Edge Function get-r2-upload-url
    notificationService.ts # CRUD + subscribe notificacoes
    exhibitorService.ts    # CRUD expositores + subscription realtime (tabela exhibitors)
    productService.ts      # CRUD produtos do expositor (tabela products)
    leadService.ts         # Criar/listar leads de pre-venda (tabela leads)
    partnerService.ts      # CRUD parceiros - patrocinador/apoiador/servico (tabela partners)
    evaluationService.ts   # CRUD avaliacoes publico + jurados, categorias, ranking (view)
    raffleService.ts       # Criacao de ticket, listagem, sorteio aleatorio
    visitService.ts        # Registro silencioso de visitas/cliques, relatorios por expositor
    auditService.ts        # Log de auditoria de alteracoes do evento (diff + autor)
    dashboardService.ts    # Agrega metricas do evento (expositores, produtos, visitas) p/ o dashboard

  contexts/
    AuthContext.tsx         # AuthProvider + useAuth + BETA_MODE — re-exportado em hooks/useAuth.ts

  hooks/
    useAuth.ts             # Re-exporta AuthContext: user (AppUser), loading, login, loginMagic, loginBeta, logout
    useEvent.ts            # subscribeToEvent por slug
    useEvents.ts           # subscribeToEvents (todos os eventos)
    usePosts.ts            # fetchPosts + subscribe (tabela posts)

  pages/                   # Re-exportam features/ (thin wrappers)
    AdminDashboard.tsx
    EventPage.tsx
    LoginPage.tsx
    ModerationPanel.tsx
    OperatorPanel.tsx
    TVView.tsx
    ExhibitorPanelPage.tsx   # Admin: gestao de expositores do evento
    ExhibitorPortalPage.tsx  # Expositor: portal pos-login
    PartnerPanelPage.tsx     # Admin: gestao de parceiros (patrocinadores/apoiadores/servicos)
    EventAdminPortalPage.tsx # EventAdmin: portal de administracao do evento
    AvaliadorPage.tsx        # Avaliador: painel de avaliacao (stub)

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
        LiveEventView.tsx           # View principal LIVE (feed + upload + interacoes)
        PostEventView.tsx           # View pos-evento (galeria + download)
        PreEventView.tsx            # Landing + countdown + lista de expositores
        ExhibitorCatalogModal.tsx   # Modal de catalogo de produtos + pre-venda
        PartnerSection.tsx          # Patrocinadores/servicos (ExhibitorSponsor legado)
        SocialLinks.tsx             # Links sociais do app
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

    exhibitors/
      ExhibitorPanel.tsx   # Admin: sidebar com lista + detail (tabs: dados/produtos/usuarios/leads)

    auth/
      LoginPage.tsx        # Login unificado: Google OAuth + Magic Link + Beta mode

    exhibitor/
      ExhibitorPortal.tsx  # Portal do expositor (tabs: perfil/produtos/leads)

    eventAdmin/
      EventAdminPortal.tsx # Portal do EventAdmin: controles + dashboard + config (abas) + auditoria. Acesso admin e event_admin

    avaliador/
      AvaliadorPage.tsx    # Painel do avaliador (stub — a implementar)

    partners/
      PartnerPanel.tsx     # Admin: CRUD parceiros (abas Dados/Fotos/Contatos/Visualizacao); tipo patrocinador/apoiador/servico

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
    ErrorBoundary.tsx          # Boundary global de erro
    NotificationsListener.tsx  # Ouve notificacoes em tempo real

  utils/
    formatters.ts          # Formatadores de URL (Instagram, WhatsApp, Website)

supabase/
  config.toml              # Supabase CLI (PostgreSQL 17, porta 54322)
  functions/
    get-r2-upload-url/
      index.ts             # Edge Function Deno: gera presigned URL para R2 (5 min)
    create-event-role-user/
      index.ts             # Edge Function Deno: cria usuario Supabase Auth para qualquer perfil
    reset-event-role-password/
      index.ts             # Edge Function Deno: reseta senha de usuario por perfil

tests/
  smoke.spec.ts
  admin-dashboard.spec.ts
  event-page.spec.ts
  feed.spec.ts

docs/
  project-context.md       # Contexto gerado por BMAD (referencia historica)
  ToDo.md                  # Definicoes e features da ultima reuniao
```

---

## Rotas

| Rota | Acesso | Componente | Status |
|------|--------|------------|--------|
| `/login` | Publico | LoginPage | Ativo |
| `/` | Admin | AdminDashboard | Ativo |
| `/admin` | — | Redireciona para `/` | — |
| `/event/:slug` | Publico | EventPage (3 views por status) | Ativo |
| `/tv/:slug` | Publico | TVView (slideshow fullscreen) | Ativo |
| `/moderation/:slug` | Admin | ModerationPanel | Ativo |
| `/operator/:slug` | Admin | OperatorPanel | UI incompleta |
| `/expositores/:slug` | Admin | ExhibitorPanelPage | Ativo |
| `/parceiros/:slug` | Admin | PartnerPanelPage | Ativo |
| `/expositor` | Expositor | ExhibitorPortalPage | Ativo |
| `/eventadmin` | EventAdmin | EventAdminPortalPage | Ativo |
| `/eventadmin/:slug` | Admin | EventAdminPortalPage (admin geral via engrenagem do card) | Ativo |
| `/avaliador` | Avaliador | AvaliadorPage | Stub |
| `*` | — | Redireciona para `/` | — |

---

## Fluxo de Auth

### Todos os perfis (Supabase Auth unificado)
1. Usuario acessa `/login`
2. **BETA_MODE=true** (desenvolvimento): digita email → `findOrCreateUserByEmail()` → sessao em localStorage
3. **BETA_MODE=false** (producao): Google OAuth ou Magic Link via Supabase
4. `AuthContext` escuta `supabase.auth.onAuthStateChange` → chama `syncUser()` → retorna `AppUser`
5. `AppUser.role` determina redirecionamento: `admin→/`, `event_admin→/eventadmin`, `avaliador→/avaliador`, `expositor→/expositor`, `participant→/`

### Como role e definida
- Novo usuario: verifica `user_email_roles` (pre-cadastro pelo admin) → aplica role cadastrada ou `participant`
- Expositor: admin pre-cadastra em `user_email_roles` com `role='expositor'` e `exhibitor_id`; Edge Function `create-event-role-user` cria usuario Supabase Auth
- Apos primeiro login, registro em `user_email_roles` e deletado (role fica em `users.role`)
- Admin pode alterar role via `updateUserRole()` diretamente na tabela `users`

---

## Fluxo de Upload de Fotos

1. Usuario seleciona imagem — compressao no browser (`usePhotoUpload.ts`)
2. `storageService.ts` chama Edge Function `get-r2-upload-url` com `{ fileName, contentType }`
3. Edge Function retorna presigned URL (valida 5 min)
4. Browser faz `PUT` direto no Cloudflare R2
5. URL publica: `${VITE_R2_PUBLIC_URL}/${fileName}`

O mesmo `storageService.uploadImage()` e usado para fotos de posts, logos de expositores e fotos de produtos.

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
- `public:event_data:{id}` — feed + moderacao (posts, reactions, comments)
- `public:print_orders:event_id=eq.{id}` — operador
- `public:notifications:user_id=eq.{id}` — notificacoes
- `public:exhibitors:event_id=eq.{id}` — painel de expositores

---

## Tabelas Supabase

### Tabelas ativas (schema normalizado)

| Tabela | Descricao | Status |
|--------|-----------|--------|
| `events` | Config completa do evento (~40 campos): status, branding, admin_emails[], TV config, social, flags, active_announcement_id, announcement_trigger_at, public/juror_evaluation_weight (pesos de ranking) | Ativo |
| `announcements` | Avisos cadastrados pelo admin do evento (event_id, title, message, bg_color, text_color, icon, show_duration_sec, flags target_tv/target_app_popup/target_push) | Ativo |
| `users` | Perfil unificado: supabase_user_id, email, display_name, photo_url, role, event_id, exhibitor_id | Ativo |
| `user_email_roles` | Pre-cadastro de email com role antes do primeiro login | Ativo |
| `posts` | Fotos normalizadas (id, event_id, user_id, image_url, status, is_official, printed) | Ativo |
| `reactions` | Emoji + user por post (normalizado) | Ativo |
| `comments` | Texto + status moderacao por post (normalizado) | Ativo |
| `print_orders` | Pedidos de impressao (option, photo_ids[] texto, status) | Legado parcial |
| `print_order_items` | FK: print_order_id + post_id (normalizado) | Ativo |
| `notifications` | Notificacoes por usuario (title, body, read, link) | Ativo |
| `exhibitors` | Stand virtual: name, category (texto livre, opcoes vem de events.exhibitor_categories), description, logo_url, photo_url, contatos, status, number | Ativo |
| `products` | Produtos do expositor (name, description, price, photos[], active) | Ativo |
| `leads` | Interesse de pre-venda (product_id, exhibitor_id, customer_name, customer_phone, status) | Ativo |
| `partners` | Parceiros do evento (type patrocinador/apoiador/servico, name, description, photos[], contato interno, valor patrocinio, show_on_tv, show_on_feed, contatos, order_index, active) — ex-`sponsors` | Ativo |
| `audit_logs` | Auditoria de alteracoes do evento (event_id, autor + snapshot nome/email, action, changes jsonb) | Ativo |
| `evaluation_categories` | Categorias de avaliacao tecnica por evento (name, weight, order_index) | Ativo |
| `evaluations` | Avaliacoes do publico: 1-5 estrelas + comentario, UNIQUE(exhibitor_id, user_id) | Ativo |
| `juror_evaluations` | Notas dos jurados por categoria, UNIQUE(exhibitor_id, user_id, category_id) | Ativo |
| `raffle_tickets` | Tickets de sorteio: 1 por participante por evento, UNIQUE(event_id, user_id) | Ativo |
| `visits` | Analytics de visitas/cliques (event_status pre/live/post no momento da visita; relatorio pos-evento, nao afeta ranking) | Ativo |
| `view_exhibitor_rankings` | View SQL: ranking ponderado (publico × peso + jurado × peso) em tempo real | Ativo |

---

## Camada de Servicos — Status

| Servico | Tabela(s) | Status |
|---------|-----------|--------|
| `authService.ts` | Supabase Auth | Ativo |
| `userService.ts` | `users`, `user_email_roles` | Ativo |
| `eventService.ts` | `events` | Ativo |
| `posts.ts` | `posts`, `reactions`, `comments` | Ativo |
| `exhibitorService.ts` | `exhibitors`, `users` | Ativo |
| `productService.ts` | `products` | Ativo |
| `leadService.ts` | `leads` | Ativo |
| `partnerService.ts` | `partners` | Ativo |
| `storageService.ts` | Cloudflare R2 | Ativo |
| `notificationService.ts` | `notifications` | Ativo |
| `printService.ts` | `print_orders` | Inativo (impressao desativada nesta versao) |
| `evaluationService.ts` | `evaluations`, `juror_evaluations`, `evaluation_categories`, `view_exhibitor_rankings` | Ativo |
| `raffleService.ts` | `raffle_tickets` | Ativo |
| `visitService.ts` | `visits` | Ativo |
| `auditService.ts` | `audit_logs` | Ativo |
| `dashboardService.ts` | `exhibitors`, `products`, `visits` (agregacao client-side p/ o dashboard do EventAdmin) | Ativo |
| `announcementService.ts`| `announcements`, `events`, `notifications`, `users` | Ativo |

---

## Divida Tecnica Conhecida

| # | Item | Impacto | Prioridade |
|---|------|---------|------------|
| 1 | `PhotoData` type alias para `PostData` — mantido por compatibilidade com UI | Baixo — TypeScript verboso | Baixa |
| 2 | `print_orders.photo_ids` e text[] sem FK | Medio — sem integridade referencial | Media |
| 3 | Duplicatas em `features/event/` (raiz vs `components/`) | Baixo — confusao de estrutura | Baixa |
| 4 | `ExhibitorSponsor` (tipo legado em types/index.ts) coexiste com `Exhibitor` (tabela dedicada) | Baixo — confusao conceitual | Baixa |
| 5 | `@google/genai` no package.json sem uso | Baixo — dependencia desnecessaria | Baixa |
| 6 | Flags `partners.show_on_tv`/`show_on_feed` armazenadas mas nao consumidas (feed mostra todos, TV nao mostra parceiros) | Medio — flags sem efeito ate o consumo ser implementado | Media |
| 7 | Aba "Visualizacao" do PartnerPanel sem fonte de dados — `visits` nao rastreia parceiros (so expositores/produtos) | Medio — analytics de parceiro inexistente | Media |

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

### Admin (role=admin)
- Dashboard: criar, editar, excluir eventos
- Branding: cores, gradientes, padroes, logo, config TV
- Gerenciar expositores: criar, editar, excluir, ver produtos e leads
- Criar e resetar credenciais de usuarios expositores
- Alterar status do evento (pre/live/post)
- Moderacao: aprovar/rejeitar fotos e comentarios
- Gerenciar pedidos de impressao
- Upload de fotos oficiais

### Expositor (Supabase Auth — credenciais geradas pelo admin)
- Editar perfil do stand: nome, descricao, logo, contatos (Instagram, WhatsApp, Website)
- Gerenciar catalogo de produtos (criar, editar, desativar — ate 3 fotos por produto)
- Ver leads de pre-venda gerados pelo feed publico
- Acesso via `/expositor` (portal dedicado, sem acesso ao admin geral)

### Participante (Firebase Auth — qualquer usuario logado)
- Ver feed de fotos aprovadas
- Fazer upload de fotos (PUT direto no R2)
- Reagir com emojis e curtidas
- Comentar fotos
- Ver catalogo de expositores e registrar interesse em produtos (pre-venda no estado `pre`)
- Solicitar impressao de ate 10 fotos

### Visitante (sem auth)
- Ver feed e slideshow
- Ver pagina do evento (pre/live/post)
- Ver telao (TV wall)
- Ver lista de expositores e catalogo de produtos
- Nao pode interagir, fazer upload nem registrar pre-venda

### Operador
- Ver fila de impressao em tempo real
- Marcar pedidos como concluidos

---

## Status BMAD

| Fase | Status |
|------|--------|
| PRD | v4 validado (pivot B2B feiras — ver docs/ToDo.md) |
| Project Context | Este documento |
| Arquitetura (CA) | Proximo passo |
| UX Design (CU) | Aguardando CA |
| Epics & Stories (CE) | Aguardando CA + CU |
| Sprint Plan (SP) | Aguardando CE |
