# Project Context: Eventify Connect & Print
> **Gerado por**: GPC (bmad-generate-project-context) | **Data**: 2026-04-25  
> **BMAD Status**: PRD v4 validado ✅ | Fase de implementação: aguardando Arquitetura + Epics

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
│   └── index.ts                   # Todos os tipos TypeScript do projeto
│                                  # ⚠️ PhotoData ainda reflete schema legado (photos)
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
│   └── usePosts.ts                # fetchPosts + subscribeToPosts (→ tabela photos ⚠️)
│
├── services/
│   ├── authService.ts             # Supabase Auth: OTP, Google, email/senha, logout
│   ├── eventService.ts            # CRUD events + subscribeToEvents/Event
│   ├── notificationService.ts     # CRUD + subscribe notifications
│   ├── posts.ts                   # ⚠️ LEGADO: aponta para tabela `photos`
│   │                              #   Inclui: fetch, create, update, subscribe, react, comment
│   ├── printService.ts            # CRUD print_orders (usa photo_ids array — legado parcial)
│   ├── storageService.ts          # uploadImage → R2 via Edge Function `get-r2-upload-url`
│   ├── userService.ts             # createUserIfNotExists (sync Firebase → Supabase users)
│   ├── photoService.ts            # ⚠️ DESCONTINUADO — stub vazio
│   ├── mockData.ts                # ⚠️ DESCONTINUADO — stub vazio
│   └── mockFirestore.ts           # ⚠️ DESCONTINUADO — stub vazio
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
│       └── TVView.tsx             # Live Wall — slideshow fullscreen + ranking
│
├── components/
│   ├── ErrorBoundary.tsx          # Boundary global de erro
│   ├── NotificationsListener.tsx  # Ouve notificações em tempo real
│   └── UploadTest.tsx             # ⚠️ Componente de teste — remover em prod
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

- **Firebase Auth (Google OAuth)** para todos os usuários (participantes e admins) via `useAuth.ts`
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
- **`posts`** — ✅ tabela nova normalizada (destino da migração)
- **`reactions`** — ✅ tabela nova normalizada
- **`comments`** — ✅ tabela nova normalizada
- **`print_orders`** — usa `photo_ids` (array texto) — estrutura legada parcial
- **`print_order_items`** — ✅ tabela nova (FK: print_order_id + post_id)

### Tabela legada (em migração)
- **`photos`** — denormalizada (`likes int`, `reactions jsonb`, `comments jsonb`, `reacted_users text[]`, `firebase_uid`)
- **Status**: `posts.ts` ainda aponta para esta tabela — migração incompleta

---

## 🔗 Camada de Serviços

| Serviço | Tabela(s) | Status |
|---|---|---|
| `eventService.ts` | `events` | ✅ Ativo |
| `posts.ts` | `photos` ⚠️ | 🔴 WIP — aponta para legado |
| `printService.ts` | `print_orders` | ⚠️ Usa `photo_ids` array (legado) |
| `notificationService.ts` | `notifications` | ✅ Ativo |
| `userService.ts` | `users` | ✅ Ativo (Firebase→Supabase sync) |
| `storageService.ts` | Cloudflare R2 | ✅ Ativo |
| `authService.ts` | Supabase Auth | ⚠️ Código órfão (A auth será 100% Firebase) |
| `photoService.ts` | — | ⚠️ Descontinuado — remover |
| `mockData.ts` | — | ⚠️ Descontinuado — remover |
| `mockFirestore.ts` | — | ⚠️ Descontinuado — remover |

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
- `public:photos:event_id=eq.{id}` — feed (⚠️ legado)
- `public:photos:all:event_id=eq.{id}` — moderação (⚠️ legado)
- `public:print_orders:event_id=eq.{id}` — operador
- `public:notifications:user_id=eq.{id}` — notificações

---

## ⚠️ WIP / Dívida Técnica

| # | Item | Impacto | Prioridade |
|---|---|---|---|
| 1 | `posts.ts` aponta para tabela `photos` (legado) | Alto — toda lógica de feed/moderação está no legado | 🔴 Alta |
| 2 | `PhotoData` type não reflete schema de `posts` | Alto — TypeScript inconsistente com BD | 🔴 Alta |
| 3 | `print_orders` usa `photo_ids` array (não FK) | Médio — perda de integridade referencial | 🟡 Média |
| 5 | Arquivos `photoService.ts`, `mockData.ts`, `mockFirestore.ts` não removidos | Baixo — ruído de código morto | 🟢 Baixa |
| 6 | `UploadTest.tsx` presente em components | Baixo — não deve ir para produção | 🟢 Baixa |
| 7 | Duplicata de views em `features/event/` (raiz vs `components/`) | Baixo — confusão de estrutura | 🟢 Baixa |

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
| Arquitetura (CA) | ⏳ Próximo passo |
| UX Design (CU) | ⏳ Aguardando CA |
| Epics & Stories (CE) | ⏳ Aguardando CA + CU |
| Sprint Plan (SP) | ⏳ Aguardando CE |
