# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

Plataforma "phygital" para feiras e eventos ao vivo. Três fases de evento: `pre` (landing + countdown + catálogo de expositores) → `live` (feed de fotos + upload + interações) → `post` (galeria + ranking). Código e comentários em **português**.

---

## Comandos

```bash
npm run dev          # dev server em http://localhost:3000
npm run build        # build de produção (Vite)
npm run lint         # type-check TypeScript (tsc --noEmit) — sem eslint
npm run test:e2e     # testes E2E (Playwright)
npm run test:e2e:ui  # Playwright com UI interativa
```

`npm run lint` é o único validador de correctness disponível — rode sempre antes de commitar.

---

## Variáveis de Ambiente (.env.local)

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_R2_PUBLIC_URL=          # base URL pública do bucket R2
VITE_APP_URL=                # opcional, default: window.location.origin
VITE_BETA_MODE=true          # true = login por email sem OAuth (dev)
```

Edge Functions Supabase precisam de: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

Com `VITE_BETA_MODE=true`, qualquer email faz login direto na tabela `users` — sem Supabase Auth. Usar em dev enquanto OAuth não estiver configurado.

---

## Stack

- React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS 4
- Supabase (PostgreSQL + Realtime + Auth)
- Cloudflare R2 (storage, upload direto via presigned URL)
- `lucide-react` (ícones), `sonner` (toasts), `motion` (animações), `date-fns` (PT-BR)
- Deploy: Vercel (SPA rewrite em `vercel.json`)

> **Deps não utilizadas no código:** `firebase`, `@google/genai`, `express`, `react-markdown` — estão no package.json mas não são importadas.

---

## Arquitetura

### Convenções obrigatórias

- **Services isolam todo acesso ao Supabase** — componentes nunca importam `supabase` diretamente, apenas funções dos services em `src/services/`.
- **Null-safety:** todo service começa com `if (!supabase) return` — o client pode ser `null` se as env vars não estiverem definidas.
- **Realtime:** callbacks sempre fazem refetch completo (`load()`), nunca merge parcial do payload do evento.
- **Tailwind 4 CSS-first:** sem `tailwind.config.js`. Configuração via `@layer` em `index.css`.
- **Path alias:** `@/` → raiz do projeto (`src/`).
- `snake_case` no banco, `camelCase` no TypeScript — mapeamento explícito em cada service.
- `import type { ... }` para interfaces TypeScript.

### Organização de código

```
src/
  App.tsx            # Rotas + guards de autenticação por role
  types/index.ts     # Todos os tipos TS (fonte única de verdade)
  services/          # Uma função por operação de banco/API
  features/          # Agrupado por feature (não por tipo de arquivo)
  pages/             # Thin wrappers que re-exportam features/
  hooks/             # useAuth, useEvent, useEvents, usePosts
  contexts/          # AuthContext (AuthProvider + BETA_MODE)
```

`pages/` existe apenas para compatibilidade de roteamento — a lógica real fica em `features/`.

Há duplicatas em `features/event/` (arquivos na raiz e em `components/`) — os canônicos são os de `components/`.

### Padrão de Realtime

```ts
const channel = supabase
  .channel(`public:{tabela}:{filtro}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: '{tabela}', filter: '...' }, () => load())
  .subscribe();
return () => { supabase.removeChannel(channel); };
```

---

## Rotas e Perfis

| Rota | Role | Componente principal |
|------|------|---------------------|
| `/login` | público | `features/auth/LoginPage` |
| `/` | admin | `features/admin/AdminDashboard` |
| `/event/:slug` | público | `features/event/EventPage` (orquestra pre/live/post) |
| `/tv/:slug` | público | `features/tv/TVView` |
| `/moderation/:slug` | admin | `features/moderation/ModerationPanel` |
| `/expositores/:slug` | admin | `features/exhibitors/ExhibitorPanel` |
| `/parceiros/:slug` | admin | `features/partners/PartnerPanel` |
| `/expositor` | expositor | `features/exhibitor/ExhibitorPortal` |
| `/eventadmin` e `/eventadmin/:slug` | event_admin + admin | `features/eventAdmin/EventAdminPortal` |
| `/avaliador` | avaliador | `features/avaliador/AvaliadorPage` |

Roles: `admin` · `event_admin` · `avaliador` · `expositor` · `participant`

---

## Fluxo de Auth

1. Login em `/login` → BETA_MODE chama `findOrCreateUserByEmail()`, produção usa Supabase Auth (Google OAuth ou Magic Link).
2. `AuthContext` escuta `onAuthStateChange` → chama `syncUser()` → retorna `AppUser`.
3. `AppUser.role` determina redirecionamento automático em `App.tsx`.
4. Pré-cadastro: admin insere email em `user_email_roles` com a role desejada. No primeiro login, `syncUser()` aplica a role e deleta o registro de `user_email_roles`.
5. Expositores e avaliadores são pré-cadastrados via `addEmailRole()` em `userService.ts`.

---

## Fluxo de Upload (R2)

1. Browser comprime a imagem (`usePhotoUpload.ts`).
2. `storageService.uploadImage()` chama a Edge Function `get-r2-upload-url` → recebe presigned URL (5 min).
3. Browser faz `PUT` direto no R2.
4. URL pública: `${VITE_R2_PUBLIC_URL}/${fileName}`.

O mesmo `uploadImage()` é usado para fotos de posts, logos de expositores, fotos de produtos e fotos de parceiros.

---

## Schema de Banco (tabelas ativas)

| Tabela | Descrição |
|--------|-----------|
| `events` | Config completa (~40 campos): status, branding, TV, `exhibitor_categories[]`, `public/juror_evaluation_weight` |
| `users` | `supabase_user_id`, email, `display_name`, role, `event_id`, `exhibitor_id` |
| `user_email_roles` | Pré-cadastro de email+role antes do primeiro login |
| `posts` | Fotos: `event_id`, `user_id`, `image_url`, `status` (pending/approved/rejected), `is_official` |
| `reactions` | Emoji + user por post |
| `comments` | Texto + status de moderação por post |
| `exhibitors` | Stand virtual: nome, categoria, logo, foto, contatos, `status`, `number` |
| `products` | Produtos do expositor: nome, preço, `photos[]`, `active` |
| `leads` | Interesse de pré-venda: `product_id`, `exhibitor_id`, `customer_name`, `customer_phone`, `status` |
| `partners` | Patrocinadores/apoiadores/serviços: `type`, `show_on_tv`, `show_on_feed`, `sponsorship_value` |
| `evaluation_categories` | Critérios de avaliação por evento: `name`, `weight`, `order_index` |
| `evaluations` | Avaliação pública: 1–5 estrelas + comentário, `UNIQUE(exhibitor_id, user_id)` |
| `juror_evaluations` | Nota do avaliador por categoria: `score` 0–5, `UNIQUE(exhibitor_id, user_id, category_id)` |
| `raffle_tickets` | 1 ticket por participante por evento, `UNIQUE(event_id, user_id)` |
| `visits` | Analytics de cliques: `action`, `exhibitor_id`, `product_id`, `event_status` (pre/live/post) |
| `audit_logs` | Diff de alterações do evento: `action`, `changes` JSONB, autor |
| `notifications` | Notificações por usuário |
| `print_orders` / `print_order_items` | Fila de impressão (feature inativa nesta versão) |
| `view_exhibitor_rankings` | View SQL: ranking ponderado (público × peso + jurado × peso) |

---

## Estado Atual das Features

| Feature | Status |
|---------|--------|
| Feed (fotos + expositores + parceiros) | ✅ Implementado |
| Analytics de visitas (`trackVisit`) | ✅ Instrumentado no feed |
| Portal Expositor (perfil, produtos, leads, visitas) | ✅ Implementado |
| Painel Admin Expositores | ✅ Implementado |
| Painel Parceiros | ✅ Implementado (`show_on_feed`/`show_on_tv` salvos mas não filtram ainda) |
| EventAdmin (dashboard, config, auditoria) | ✅ Implementado |
| EventAdmin — categorias de avaliação + avaliadores | ✅ Implementado |
| Sistema de Avaliação — backend | ✅ `evaluationService.ts` completo |
| Sistema de Avaliação — UI (tela `/avaliador`) | ⏳ Stub — em desenvolvimento |
| Sorteios — backend | ✅ `raffleService.ts` completo |
| Sorteios — UI + vínculo avaliação→ticket | ⏳ Pendente |
| Painel TV — ranking ponderado, parceiros, avisos | ⏳ Pendente |
| Magic Link para participantes | ⏳ Pendente |

---

## Dívida Técnica Conhecida

| # | Item |
|---|------|
| 1 | `PhotoData` é type alias de `PostData` — mantido por compatibilidade com a UI |
| 2 | `print_orders.photo_ids` é `text[]` sem FK para `posts` |
| 3 | Duplicatas em `features/event/` (raiz vs `components/`) — canônicos são os de `components/` |
| 4 | `ExhibitorSponsor` (tipo legado em `types/index.ts`) coexiste com `Exhibitor` (tabela dedicada) |
| 5 | `@google/genai`, `firebase`, `express`, `react-markdown` no `package.json` sem uso |
| 6 | `partners.show_on_feed` / `show_on_tv` salvas mas não consumidas no feed/TV |
| 7 | Aba "Visualização" do PartnerPanel sem dados — `visits` não rastreia `partner_id` |
| 8 | `ensureRaffleTicket()` nunca é chamado após `submitEvaluation()` — o vínculo avaliação→sorteio [RN3] está incompleto |

---

## Notas sobre documentação interna

- `docs/project-context.md` — **desatualizado**. Gerado em 2026-05-02 antes da migração de Firebase Auth para Supabase Auth. Referencia `lib/firebase/client.ts` e Gemini que não existem mais. Não usar como fonte de verdade.
- `docs/ToDo.md` — fonte atual de regras de negócio, pendências e decisões de reunião. Consultar antes de implementar features novas.
