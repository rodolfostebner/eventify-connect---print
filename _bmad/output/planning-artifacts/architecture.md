# 🏗️ Architecture Document — Eventify Connect & Print
> **Agente**: Winston (System Architect) 🏗️  
> **Workflow**: CA (bmad-create-architecture)  
> **Gerado**: 2026-04-25 | **PRD**: v4 ✅  

---

## 1. Visão Arquitetural

### 1.1 Diagrama de Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                  │
│                                                                   │
│  ┌─────────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │  Participante   │  │  Admin/       │  │   TV / Telão     │   │
│  │  (Mobile/Web)   │  │  Operador     │  │   (Público)      │   │
│  └────────┬────────┘  └──────┬────────┘  └────────┬─────────┘   │
│           │ Google OAuth     │ Google OAuth         │ Anônimo     │
│           │ (Firebase)       │ (Firebase) [WIP→    │             │
│           │                  │  Supabase e/senha]  │             │
└───────────┼──────────────────┼─────────────────────┼─────────────┘
            │                  │                      │
            ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React SPA (Vite + TypeScript)                  │
│                                                                   │
│  /event/:slug        /           /moderation/:slug               │
│  /tv/:slug           (dashboard) /operator/:slug                 │
└────────────┬─────────────────────────────────────────┬──────────┘
             │                                          │
    ┌────────▼────────┐                    ┌────────────▼─────────┐
    │  Supabase       │                    │  Cloudflare R2       │
    │  PostgreSQL     │◄─── Realtime ─────►│  (Object Storage)    │
    │  + Auth         │    WebSocket       │                      │
    └─────────────────┘                    └──────────────────────┘
             │
    ┌────────▼────────┐
    │  Supabase Edge  │──► Gera presigned URL para R2
    │  Functions      │
    │  (Deno/TypeScript)
    └─────────────────┘
             │
    ┌────────▼────────┐
    │  Firebase Auth  │──► Google OAuth (participantes + admins atual)
    └─────────────────┘
```

### 1.2 Princípios Arquiteturais

1. **Boring technology** — PostgreSQL, React, TypeScript. Sem inventar.
2. **BFF mínimo** — Edge Functions apenas onde o cliente não pode ter credenciais (R2 keys).
3. **Realtime por refetch** — Callbacks de realtime disparam um refetch completo, não merge de payload. Mais seguro, mais simples.
4. **Null-safety explícita** — `supabase` pode ser `null`; todos os serviços verificam antes de operar.
5. **Migração incremental** — Tabela `photos` (legado) coexiste com `posts` (novo) até migração completa. Sem big-bang.
6. **Slug como chave de rota pública** — Legível, estável, sem expor UUIDs para participantes.

---

## 2. ADRs — Architecture Decision Records

### ADR-001: Autenticação via Firebase Auth

**Status**: Implementado ✅  
**Data**: 2026-04-25  

**Contexto**: O projeto utiliza Firebase Auth (Google OAuth) para autenticação.

**Decisão**: Autenticação mantida 100% no Firebase.

| Ator | Método | Provider | Identificador |
|---|---|---|---|
| Participante | Google OAuth | Firebase Auth | `firebase_uid` (text) |
| Admin/Operador | Google OAuth | Firebase Auth | `firebase_uid` (text) |

**Consequências**:
- (+) Zero atrito com Google para todos os usuários.
- (+) Código unificado de autenticação (um único SDK de auth no frontend).
- (-) Controle de role (admin) precisa ser validado de outra forma (ex: email do usuário bater com `admin_emails` do evento ou role custom).

---

### ADR-002: Storage em Cloudflare R2 com Presigned URLs

**Status**: Implementado ✅  
**Data**: 2026-04-25  

**Contexto**: Fotos são o core do produto. Precisam de upload rápido, custo baixo por GB e acesso público via URL.

**Decisão**: Cloudflare R2 com presigned URLs geradas por Edge Function no Supabase.

**Fluxo implementado**:
```
Browser → POST /functions/v1/get-r2-upload-url
       ← { url: presignedPutUrl, publicUrl: "https://cdn.../filename" }
Browser → PUT presignedPutUrl (upload direto para R2, sem passar pelo servidor)
Browser → Supabase: INSERT posts { image_url: publicUrl }
```

**Consequências**:
- (+) Upload não passa pelo servidor → sem bottleneck de largura de banda
- (+) Credenciais R2 ficam apenas na Edge Function (seguro)
- (+) CDN global nativo do Cloudflare
- (-) CORS precisa estar configurado no R2 bucket (já debugado)
- (-) URL pública depende de `VITE_R2_PUBLIC_URL` estar configurada no `.env`
- **⚠️ Atenção**: `src/lib/storage/upload.ts` é um stub falso — usar sempre `src/services/storageService.ts`

**Variáveis de ambiente da Edge Function**:
```
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
VITE_R2_PUBLIC_URL  (opcional — cliente pode construir a URL)
```

---

### ADR-003: Supabase como Banco Primário + Realtime

**Status**: Implementado ✅  
**Data**: 2026-04-25  

**Contexto**: Projeto iniciou com Firestore. Migração para Supabase PostgreSQL para suporte a queries relacionais, RLS nativo e realtime integrado.

**Decisão**: Supabase (PostgreSQL) para todo o estado de aplicação. Realtime via `postgres_changes`.

**Padrão de realtime adotado**:
```typescript
// Padrão: sempre refetch completo no callback (não merge de payload)
supabase
  .channel(`public:{tabela}:{campo}=eq.${valor}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: '{tabela}', filter }, 
      () => fetchAll()) // ← refetch, não merge
  .subscribe()
```

**Motivação do refetch vs. merge**:
- Payload de realtime pode chegar out-of-order
- Merge de listas é complexo e bug-prone
- Refetch é sempre consistente com o BD
- Trade-off aceitável: volume de dados por evento é pequeno

**Consequências**:
- (+) Queries SQL reais — JOINs, CTEs, índices
- (+) RLS garante segurança por row
- (+) Realtime nativo sem serviço adicional
- (-) `supabase` pode ser `null` se vars de ambiente não configuradas (tratado com guards)

---

### ADR-004: Normalização do Schema (photos → posts + reactions + comments)

**Status**: Em migração 🔄  
**Data**: 2026-04-25  

**Contexto**: A tabela `photos` original era denormalizada: `likes` (int), `reactions` (jsonb), `comments` (jsonb), `reacted_users` (text[]). Impossível fazer queries relacionais eficientes ou aplicar RLS granular.

**Decisão**: Migrar para schema normalizado.

**Schema origem (legado)**:
```
photos: id, event_id(text), url, user_name, firebase_uid,
        likes(int), reactions(jsonb), reacted_users(text[]),
        comments(jsonb), status, is_official
```

**Schema destino (novo)**:
```
posts:     id, event_id(uuid), user_id(text), image_url, status, is_official, printed
reactions: id, post_id(uuid), user_id(text), type(text)
comments:  id, post_id(uuid), user_id(text), text, status, is_predefined
```

**Estado da migração**:
```
✅ Tabelas novas criadas no Supabase
🔴 posts.ts ainda aponta para `photos` (legado)
🔴 PhotoData interface ainda reflete schema legado
⏳ Migração de dados: a fazer
⏳ Atualização de posts.ts: a fazer
⏳ Atualização de types/index.ts: a fazer
```

**Consequências**:
- (+) Constraints de unicidade aplicáveis (ex: 1 reaction type por user/post)
- (+) RLS granular por tabela
- (+) Queries de ranking por tipo de reação via SQL
- (-) Período de transição com dois schemas coexistindo
- (-) Risco: código que escreve em `photos` precisa ser totalmente migrado antes de dropar a tabela

---

### ADR-005: React SPA sem SSR

**Status**: Implementado ✅  
**Data**: 2026-04-25  

**Contexto**: Evento é uma experiência em tempo real. Páginas públicas (`/event/:slug`, `/tv/:slug`) são de baixo volume e não requerem SEO.

**Decisão**: SPA com Vite + React Router DOM. Sem Next.js ou SSR.

**Consequências**:
- (+) Deploy simples (Vercel static ou qualquer CDN)
- (+) Toda a lógica de realtime é nativa ao cliente
- (-) `/event/:slug` sem SEO (aceitável — acesso por link direto/QR code)
- **Vercel config**: `vercel.json` já configurado para redirecionar todas as rotas para `index.html`

---

### ADR-006: Feature-First File Structure

**Status**: Implementado ✅ (parcialmente inconsistente — ver abaixo)  
**Data**: 2026-04-25  

**Decisão**: Organização por feature, não por tipo de arquivo.

```
src/features/{feature}/
  {Feature}.tsx          ← componente raiz da feature
  components/            ← componentes internos
  hooks/                 ← hooks específicos da feature
```

**Inconsistência identificada**: `src/features/event/` tem views tanto na raiz quanto em `components/` (duplicatas de `LiveEventView.tsx`, `PreEventView.tsx`, `PostEventView.tsx`). Os arquivos raiz são versões antigas — os de `components/` são os ativos.

**Regra**: sempre usar os arquivos dentro de `components/`. Os arquivos duplicados na raiz devem ser removidos.

---

## 3. Arquitetura de Componentes

### 3.1 Hierarquia de Estado

```
App.tsx
├── useAuth() [Firebase] → user | null
│
├── /event/:slug → EventPage
│   ├── subscribeToEvent(slug) → event (status: pre|live|post)
│   ├── usePosts(event.id) → posts[] [→ photos table ⚠️]
│   ├── PreEventView    (status === 'pre')
│   ├── LiveEventView   (status === 'live')
│   │   ├── FeedGrid → PhotoCard[] → InteractionBar
│   │   ├── UploadFAB → storageService.uploadImage()
│   │   └── FeaturedSlideshow
│   └── PostEventView   (status === 'post')
│
├── / → AdminDashboard
│   ├── subscribeToEvents() → events[]
│   ├── EventCard[] → BrandingModal | ShareModal
│   └── useAdminEvents(), useBrandingForm()
│
├── /moderation/:slug → ModerationPanel
│   ├── subscribeToEvent(slug)
│   ├── fetchAllPosts(event.id) [→ photos table ⚠️]
│   ├── subscribeToPrintOrders(event.id)
│   ├── PhotoModeration → updatePostStatus()
│   ├── CommentModeration
│   ├── PrintOrderModeration → PrintOrderModal
│   └── ModerationControls → updateEvent()
│
├── /operator/:slug → OperatorPanel
│   ├── subscribeToEvent(slug)
│   └── usePrintQueue(event.id) → subscribeToPrintOrders()
│
└── /tv/:slug → TVView
    ├── subscribeToEvent(slug)
    ├── usePosts(event.id) → approved photos
    ├── useSlideshow()
    └── useCategoryGroups() → ranking por tipo
```

### 3.2 Camada de Serviços

```
┌─────────────────────────────────────────────────────┐
│                  Componentes / Hooks                 │
└────────────────────────┬────────────────────────────┘
                         │ chamam diretamente
┌────────────────────────▼────────────────────────────┐
│                  src/services/                       │
│                                                      │
│  eventService.ts      → CRUD + Realtime events       │
│  posts.ts             → CRUD + Realtime photos ⚠️    │
│  printService.ts      → CRUD + Realtime print_orders │
│  notificationService  → CRUD + Realtime notifications│
│  userService.ts       → Sync Firebase→Supabase users │
│  storageService.ts    → Upload R2 via Edge Function  │
│  authService.ts       → Supabase Auth (admin WIP)    │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
   ┌──────────▼──────┐   ┌─────────▼────────┐
   │ supabase client │   │ firebase client   │
   │ (nullable)      │   │ (sempre ativo)    │
   └─────────────────┘   └──────────────────┘
```

---

## 4. Arquitetura de Dados

### 4.1 Diagrama Entidade-Relacionamento (schema destino)

```
events (1) ──────────── (N) posts
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                  (N)        (N)        (N)
               reactions  comments  print_order_items
                                         │
                                    print_orders (N) ──── (1) events
                                    
users ──── (firebase_uid) ──── posts.user_id
      ──── (firebase_uid) ──── reactions.user_id
      ──── (firebase_uid) ──── comments.user_id
      ──── (firebase_uid) ──── print_orders.user_id
      ──── (firebase_uid) ──── notifications.user_id
```

### 4.2 Regras de Integridade (a implementar via RLS + Constraints)

| Regra | Implementação |
|---|---|
| Max 2 reactions por user/post | Unique constraint parcial ou trigger |
| Não repetir reaction type | UNIQUE(post_id, user_id, type) |
| Max 2 comments por user/post | Trigger ou CHECK via RPC |
| Upload apenas em status='live' | Validação no cliente + RLS policy |
| Moderação apenas por admin | RLS: `role = 'admin'` |

### 4.3 Índices Necessários (a validar)

```sql
-- Performance crítica para feed
CREATE INDEX idx_posts_event_status ON posts(event_id, status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Ranking por tipo de reação
CREATE INDEX idx_reactions_post_type ON reactions(post_id, type);

-- Moderação
CREATE INDEX idx_comments_post_status ON comments(post_id, status);

-- Notificações
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
```

---

## 5. Arquitetura de Segurança

### 5.1 Modelo de Acesso

| Recurso | Participante | Admin | Anônimo |
|---|---|---|---|
| `events` (read) | ✅ | ✅ | ✅ |
| `events` (write) | ❌ | ✅ | ❌ |
| `posts` (read approved) | ✅ | ✅ | ✅ |
| `posts` (read pending) | ❌ | ✅ | ❌ |
| `posts` (insert) | ✅ (own) | ✅ | ❌ |
| `posts` (update status) | ❌ | ✅ | ❌ |
| `reactions` (insert) | ✅ (own) | ✅ | ❌ |
| `comments` (insert) | ✅ (own) | ✅ | ❌ |
| `print_orders` (insert) | ✅ (own) | ✅ | ❌ |
| `print_orders` (update status) | ❌ | ✅ | ❌ |
| `notifications` (read) | ✅ (own) | ✅ | ❌ |

### 5.2 RLS — Status Atual

> ⚠️ RLS é obrigatório pelo PRD mas o status atual de implementação precisa ser auditado via `get_advisors` do Supabase.

**Política padrão recomendada para `posts`**:
```sql
-- Leitura pública de posts aprovados
CREATE POLICY "read_approved_posts" ON posts
  FOR SELECT USING (status = 'approved');

-- Admin lê todos
CREATE POLICY "admin_read_all_posts" ON posts
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Participante insere próprios posts
CREATE POLICY "insert_own_post" ON posts
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);
```

### 5.3 Edge Function — Segurança

A função `get-r2-upload-url` valida:
- Header `Authorization` presente (rejeita com 401 se ausente)
- `fileName` e `contentType` presentes no body
- Credenciais R2 em variáveis de ambiente (nunca expostas ao cliente)
- Presigned URL expira em **5 minutos**

---

## 6. Arquitetura de Implantação

### 6.1 Ambientes

| Camada | Produção | Desenvolvimento |
|---|---|---|
| Frontend | Vercel (SPA estático) | `npm run dev` (porta 3000) |
| Banco | Supabase Cloud | Supabase Cloud (mesmo projeto) |
| Edge Functions | Supabase Edge Runtime | Supabase Edge Runtime |
| Storage | Cloudflare R2 | Cloudflare R2 (mesmo bucket) |
| Auth | Firebase | Firebase |

### 6.2 Variáveis de Ambiente Necessárias

```env
# Frontend (.env)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_R2_PUBLIC_URL=

# Edge Function (Supabase Secrets)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

### 6.3 Vercel Config

```json
// vercel.json — redireciona todas as rotas para SPA
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## 7. Plano de Migração `photos → posts`

> Esta é a maior dívida técnica do projeto. Precisa ser o **primeiro epic de implementação**.

### Fase A — Atualizar a camada de tipos
1. Atualizar `PhotoData` em `types/index.ts` para refletir schema de `posts`
2. Criar `PostReaction` e `PostComment` como tipos separados

### Fase B — Migrar `posts.ts`
1. Trocar todas as queries de `photos` para `posts`
2. Adaptar `mapRowToPhotoData()` para novo schema
3. Implementar reactions via tabela `reactions` (não mais jsonb)
4. Implementar comments via tabela `comments` (não mais jsonb)

### Fase C — Migrar dados existentes
1. Script SQL: copiar `photos` → `posts` + `reactions` + `comments`
2. Validar contagem antes e depois

### Fase D — Limpar legado
1. Remover `photoService.ts`, `mockData.ts`, `mockFirestore.ts`
2. Remover `src/lib/storage/upload.ts` (stub falso)
3. Remover `UploadTest.tsx`
4. Remover views duplicadas na raiz de `features/event/`
5. DROP TABLE `photos` (após validação)



---

## 8. Decisões em Aberto

| ID | Questão | Impacto | Recomendação |
|---|---|---|---|
| OQ-1 | RLS está habilitado em todas as tabelas? | 🔴 Segurança | Auditar com `get_advisors` antes de produção |
| OQ-2 | `print_order_items` está sendo populado ou só `photo_ids`? | 🟡 Integridade | Migrar `printService.ts` para usar `print_order_items` |
| OQ-3 | Existe rate limiting no upload? | 🟡 Abuse | PRD recomenda 5/min — não implementado |
| OQ-4 | `useEvent.ts` está comentado — quem chama `subscribeToEvent`? | 🟡 Consistência | Ativar o hook ou remover o arquivo |
| OQ-5 | `@google/genai` em `package.json` — para que serve? | 🟢 Limpeza | Remover se não usado |

---

## 9. Checklist de Conformidade Arquitetural

Para cada nova feature ou story, verificar:

- [ ] Serviço verifica `if (!supabase) return` antes de operar
- [ ] Realtime usa refetch completo (não merge de payload)
- [ ] Upload sempre via `storageService.ts` (nunca `src/lib/storage/upload.ts`)
- [ ] Identificador do usuário é `firebase_uid` (text) — não UUID do Supabase
- [ ] Moderação de conteúdo verifica `role = 'admin'` no servidor (RLS)
- [ ] Tipos TypeScript alinhados com schema real do Supabase
- [ ] Componentes em `features/{feature}/components/` — não na raiz da feature
