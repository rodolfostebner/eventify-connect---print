# Project Context: Eventify Connect & Print
> **Gerado por**: GPC (bmad-generate-project-context) | **Data**: 2026-05-02
> **BMAD Status**: PRD v4 validado ✅ | Fase de implementação: Arquitetura em andamento

---

## 📋 Visão Geral

**Eventify Connect & Print** é uma plataforma **Phygital de eventos** em tempo real. Participantes fotografam durante o evento, as fotos são moderadas, exibidas no feed e TV (telão), e podem ser enviadas para fila de impressão física (stickers).

**Três estados de evento**: `pre` (landing + countdown) → `live` (feed + upload + interações) → `post` (galeria + download)

---

## 🏗️ Stack Técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 19.x |
| Build Tool | Vite | 6.x |
| Linguagem | TypeScript | 5.8.x |
| Estilização | Tailwind CSS | 4.x |
| Animações | Motion (Framer) | 12.x |
| Roteamento | React Router DOM | 7.x |
| Banco de Dados | Supabase (PostgreSQL) | @supabase/supabase-js 2.x |
| Realtime | Supabase Realtime | — |
| Auth | Firebase Auth (Google OAuth) | firebase 12.x |
| Storage | Cloudflare R2 (presigned URLs via Edge Function) | — |
| AI Layer | Google Generative AI (Gemini) | @google/genai 1.x |
| Ícones | lucide-react | 0.546.x |
| Notificações UI | sonner | 2.x |
| Datas | date-fns | 4.x |
| Testes E2E | Playwright | 1.59.x |

---

## 📁 Estrutura de Arquivos

```
src/
├── App.tsx                        # Rotas e LoginScreen (Firebase Google)
├── main.tsx                       # Entry point
├── index.css                      # Estilos globais Tailwind 4
│
├── types/
│   └── index.ts                   # Todos os tipos TypeScript do projeto (PostData normalizado)
│
├── lib/
│   ├── firebase/client.ts         # Firebase: auth + googleProvider
│   ├── supabase/client.ts         # Supabase: createClient (null se sem .env)
│   ├── storage/upload.ts          # (legado — não usar; usar storageService.ts)
│   └── utils.ts                   # Utilitários gerais
│
├── hooks/
│   ├── useAuth.ts                 # Firebase onAuthStateChanged + createUserIfNotExists
│   ├── useEvent.ts                # subscribeToEvent por slug
│   ├── useEvents.ts               # subscribeToEvents (todos)
│   └── usePosts.ts                # fetchPosts + subscribeToPosts (tabela posts)
│
├── services/
│   ├── authService.ts             # Firebase Auth: Google, email/senha, logout
│   ├── eventService.ts            # CRUD events + subscribeToEvents/Event
│   ├── notificationService.ts     # CRUD + subscribe notifications
│   ├── posts.ts                   # Gerenciamento de posts, reações e comentários (tabelas posts, reactions, comments)
│   ├── printService.ts            # CRUD print_orders (usa photo_ids array — legado parcial)
│   ├── storageService.ts          # uploadImage → R2 via Edge Function `get-r2-upload-url`
│   └── userService.ts             # createUserIfNotExists (sync Firebase → Supabase users)
│
├── pages/                         # Re-exportações — renderizam features/
│   ├── AdminDashboard.tsx
│   ├── EventPage.tsx
│   ├── ModerationPanel.tsx
│   ├── OperatorPanel.tsx
│   └── TVView.tsx
│
├── features/
│   ├── admin/
│   │   ├── AdminDashboard.tsx     # Lista eventos, CRUD, modais
│   │   ├── components/
│   │   │   ├── BrandingModal.tsx  # Editor de tema do evento
│   │   │   ├── EventCard.tsx      # Card do evento no dashboard
│   │   │   └── ShareModal.tsx     # Compartilhar links do evento
│   │   └── hooks/
│   │       ├── useAdminEvents.ts  # State dos eventos no dashboard
│   │       └── useBrandingForm.ts # Form state do branding
│   │
│   ├── event/
│   │   ├── EventPage.tsx          # Orquestrador — detecta estado do evento
│   │   ├── LiveEventView.tsx      # View LIVE (duplicata — ver components/)
│   │   ├── PostEventView.tsx      # View POST (duplicata — ver components/)
│   │   ├── PreEventView.tsx       # View PRE (duplicata — ver components/)
│   │   ├── components/
│   │   │   ├── LiveEventView.tsx  # View principal LIVE
│   │   │   ├── PostEventView.tsx  # View pós-evento
│   │   │   ├── PreEventView.tsx   # Landing + countdown + parceiros
│   │   │   ├── PartnerSection.tsx # Expositores/patrocinadores
│   │   │   ├── SocialLinks.tsx    # Links sociais do app
│   │   │   └── Feed/
│   │   │       ├── FeedGrid.tsx      # Grid de fotos aprovadas
│   │   │       ├── FeaturedSlideshow.tsx # Slideshow de destaques
│   │   │       ├── LoginBanner.tsx   # Banner de login para participar
│   │   │       └── UploadFAB.tsx     # Botão flutuante de upload
│   │   │   └── PhotoCard/
│   │   │       ├── PhotoCard.tsx     # Card de foto com reações
│   │   │       ├── InteractionBar.tsx # Barra de likes/emojis/comentários
│   │   │       └── PhotoModal.tsx    # Modal de foto ampliada
│   │   └── hooks/
│   │       ├── useEventPhotos.ts     # Fotos do evento (feed)
│   │       ├── useModerationPhotos.ts # Fotos para moderação
│   │       ├── usePhotoUpload.ts     # Upload para R2
│   │       ├── useAdminActions.ts    # Ações de moderação inline
│   │       ├── useCategoryGroups.ts  # Agrupamento por ranking
│   │       ├── usePrintOrders.ts     # Print orders do participante
│   │       └── useSlideshow.ts       # Controle do slideshow
│   │
│   ├── moderation/
│   │   ├── ModerationPanel.tsx    # Painel completo de curadoria
│   │   └── components/
│   │       ├── PhotoModeration.tsx    # Grid de fotos para aprovar/rejeitar
│   │       ├── CommentModeration.tsx  # Lista de comentários pendentes
│   │       ├── ModerationControls.tsx # Controles de estado do evento
│   │       ├── PrintOrderModal.tsx    # Modal de detalhes do pedido
│   │       └── PrintOrderModeration.tsx # Lista de pedidos de impressão
│   │
│   ├── operator/
│   │   ├── OperatorPanel.tsx      # Painel de fila de impressão
│   │   └── hooks/
│   │       └── usePrintQueue.ts   # Subscribe à fila em tempo real
│   │
│   └── tv/
│   │   └── TVView.tsx             # Live Wall — slideshow fullscreen + ranking
│
├── components/
│   ├── ErrorBoundary.tsx          # Boundary global de erro
│   └── NotificationsListener.tsx  # Ouve notificações em tempo real
│
└── constants/                     # Constantes globais (verificar conteúdo)

supabase/
├── config.toml                    # Configuração do projeto Supabase CLI
└── functions/
    └── get-r2-upload-url/
        └── index.ts               # Edge Function: gera presigned URL para R2
```

---

## 🗺️ Rotas da Aplicação

| Rota | Acesso | Componente |
|---|---|---|
| `/` | Admin (Firebase Google Auth) | `AdminDashboard` |
| `/admin` | — | Redireciona para `/` |
| `/event/:slug` | Público | `EventPage` (3 views por status) |
| `/moderation/:slug` | Admin | `ModerationPanel` |
| `/operator/:slug` | Admin | `OperatorPanel` |
| `/tv/:slug` | Público | `TVView` |
| `*` | — | Redireciona para `/` |

---

## 🔐 Autenticação — Estado Atual

- **Firebase Auth (Google OAuth)** para todos os usuários (participantes e admins) via `authService.ts`
- Hook: `onAuthStateChanged` → `signInWithPopup(googleProvider)`
- Sincronização: `createUserIfNotExists()` → salva em `users` (Supabase) por `firebase_uid`
- Identificador principal: `firebase_uid` (text)
- O controle de acesso administrativo é feito checando `role = 'admin'` no usuário ou validando e-mail contra `admin_emails` do evento.

---

## 🗄️ Banco de Dados — Estado Real

### Tabelas ativas (em uso)
- **`events`** — completo, 40+ campos, inclui temas, TV, social, flags de controle
- **`users`** — sincronização Firebase→Supabase por `firebase_uid`
- **`notifications`** — notificações por `user_id`, com leitura em tempo real
- **`posts`** — ✅ Tabela principal normalizada (substitui `photos`)
- **`reactions`** — ✅ Tabela normalizada de reações
- **`comments`** — ✅ Tabela normalizada de comentários
- **`print_orders`** — usa `photo_ids` (array texto) — estrutura legada parcial (**INATIVO nesta versão**)
- **`print_order_items`** — ✅ Estrutura pronta (FK: print_order_id + post_id) — implementação pendente nos services
- **`evaluation_categories`** — ✅ Categorias de avaliação técnica por evento (name, weight, order_index)
- **`evaluations`** — ✅ Avaliações do público (1-5 estrelas + comentário), UNIQUE(exhibitor_id, user_id)
- **`juror_evaluations`** — ✅ Notas dos jurados por categoria, UNIQUE(exhibitor_id, user_id, category_id)
- **`raffle_tickets`** — ✅ Tickets de sorteio (1 por participante por evento), UNIQUE(event_id, user_id)
- **`visits`** — ✅ Analytics de visitas/cliques (relatório pós-evento, não afeta ranking)
- **`view_exhibitor_rankings`** — ✅ View SQL: ranking ponderado público×peso + jurado×peso em tempo real

---

## 🔗 Camada de Serviços

| Serviço | Tabela(s) | Status |
|---|---|---|
| `eventService.ts` | `events` | ✅ Ativo |
| `posts.ts` | `posts`, `reactions`, `comments` | ✅ Ativo e normalizado |
| `printService.ts` | `print_orders` | ⛔ Inativo (impressão desativada nesta versão) |
| `notificationService.ts` | `notifications` | ✅ Ativo |
| `userService.ts` | `users` | ✅ Ativo (Firebase→Supabase sync) |
| `storageService.ts` | Cloudflare R2 | ✅ Ativo |
| `authService.ts` | Firebase Auth | ✅ Ativo |
| `evaluationService.ts` | `evaluations`, `juror_evaluations`, `evaluation_categories`, `view_exhibitor_rankings` | ✅ Ativo |
| `raffleService.ts` | `raffle_tickets` | ✅ Ativo |
| `visitService.ts` | `visits` | ✅ Ativo |

---

## ☁️ Storage — Cloudflare R2

**Fluxo de upload** (`storageService.ts`):
1. Invoca Edge Function `get-r2-upload-url` com `{ fileName, contentType }`
2. Recebe `{ url: presignedUrl, publicUrlBase }`
3. `PUT` direto do browser para R2
4. Monta URL pública: `${VITE_R2_PUBLIC_URL}/${fileName}`

**Variável de ambiente**: `VITE_R2_PUBLIC_URL`

---

## 📡 Realtime — Padrão de Canais

Todos os serviços usam o mesmo padrão:
```ts
supabase.channel(`public:{tabela}:{campo}=eq.${valor}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: '{tabela}', filter: '...' }, cb)
  .subscribe()
```

Canais ativos:
- `public:events` — dashboard admin
- `public:events:slug=eq.{slug}` — página do evento
- `public:posts:event_id=eq.{id}` — feed
- `public:print_orders:event_id=eq.{id}` — operador
- `public:notifications:user_id=eq.{id}` — notificações

---

## ⚠️ WIP / Dívida Técnica

| # | Item | Impacto | Prioridade |
|---|---|---|---|
| 1 | `print_orders` usa `photo_ids` array (não FK) | Médio — perda de integridade referencial | 🟡 Média |
| 2 | Duplicata de views em `features/event/` (raiz vs `components/`) | Baixo — confusão de estrutura | 🟢 Baixa |
| 3 | Migrar `print_orders` para usar `print_order_items` | Médio — integridade de dados | 🟡 Média |

---

## 🌍 Variáveis de Ambiente

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

# AI
GEMINI_API_KEY=
```

---

## 📐 Convenções de Código

- **Nomenclatura**: snake_case no BD, camelCase no TypeScript, mapeamento explícito em cada service
- **Realtime**: sempre refetch completo no callback (não merge de payload) — padrão de segurança
- **Supabase null-safe**: todos os serviços verificam `if (!supabase) return` antes de operar
- **Imports de tipo**: `import type { ... }` para interfaces TypeScript
- **Tailwind 4**: sem `tailwind.config.js` — configuração por CSS nativo

---

## 🚦 Status do Projeto — Fase BMAD

| Fase | Status |
|---|---|
| PRD | ✅ v4 validado |
| Project Context | ✅ Este documento |
| Arquitetura (CA) | ⏳ Em andamento |
| UX Design (CU) | ⏳ Aguardando CA |
| Epics & Stories (CE) | ⏳ Aguardando CA + CU |
| Sprint Plan (SP) | ⏳ Aguardando CE |
