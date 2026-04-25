# 📘 PRD v4 — Eventify Connect & Print
> **Status**: Validado (VP) — 2026-04-25 | Aprovado para Fase 2 (Arquitetura + UX)

---

# 🧭 1. Visão do Produto

## 🎯 Objetivo

Criar uma plataforma **Phygital de eventos** que conecta experiência digital em tempo real com entrega física (stickers/fotos), permitindo:

- Compartilhamento colaborativo de fotos
- Interação social em tempo real
- Curadoria de conteúdo
- Exibição ao vivo (TV / telão)
- Impressão física sob demanda
- Memória digital pós-evento

## 💡 Proposta de Valor

📸 Feed social ao vivo → 🖨️ Produto físico (stickers) → 📺 Experiência visual em telão

---

# 🔄 2. Estados do Evento

Controlado por `events.status`

| Valor no BD | Label | Comportamento |
|---|---|---|
| `pre` | PRÉ-EVENTO | Landing + countdown + expositores |
| `live` | AO VIVO | Feed ativo + upload + interações + impressão |
| `post` | PÓS-EVENTO | Galeria ativa + download |

---

# 👥 3. Perfis de Usuário

## 👤 Participante
- Acessa evento via URL pública `/event/:slug`
- **Requisito de Interação**: Deve estar autenticado via **Firebase Auth (Google OAuth)** para enviar fotos, reagir ou comentar.
- **Acesso Público**: Visitantes não logados podem apenas visualizar o feed e informações do evento.
- Solicita impressão (apenas se logado)
- Baixa fotos após o evento
- Identificado por `firebase_uid` (texto)

## 🧑‍💼 Expositor / Patrocinador / Serviço
- Aparece na landing do evento (pré-evento)
- Configurado via campos `jsonb` em `events` (exhibitors / sponsors / services)
- Possui links externos (Instagram, WhatsApp, website)

## 🧑‍💻 Operador (Admin)
- Autentica via **Supabase Auth (email + senha)**
- Acessa `/` (dashboard), `/moderation/:slug`, `/operator/:slug`
- Modera fotos e comentários
- Define destaques (is_official)
- Gerencia fila de impressão
- Controla estado do evento
- Identificado por `role = 'admin'` na tabela `users`

---

# ⚙️ 4. Funcionalidades

## 📱 Feed (estado: LIVE e POST)
- Grid de fotos em tempo real via Supabase Realtime
- Ordenação: recente | ranking
- Exibe apenas fotos com `status = 'approved'`
- Quando `interactions_paused = true`: feed visível, interações desabilitadas

## ⬆️ Upload (estado: LIVE apenas)
- Controlado por `events.upload_source`: `camera | gallery | both`
- Upload direto para **Cloudflare R2** via presigned URL (Supabase Edge Function)
- Registro do post no Supabase (`posts` table)
- Status inicial: `pending`

## ❤️ Sistema de Reações
- Tipos: `like | funny | love | rock`
- Armazenados na tabela `reactions` (normalizada)
- Regras: máximo 2 reações por usuário por post; não pode repetir o mesmo tipo

## 💬 Comentários
- Tabela normalizada: `comments`
- Tipos: pré-definidos (`is_predefined = true` → aprovados automaticamente) e texto livre (requer aprovação)
- Regra: máximo 2 comentários por usuário por post
- Moderação de comentários controlada por `events.comment_moderation_enabled`

## 🛡️ Curadoria (Painel: `/moderation/:slug`)
- **Fotos**: `pending` → invisível | `approved` → feed e TV | `rejected` → oculto
- **Comentários**: mesmo fluxo (quando moderação habilitada)
- Gestão de fotos oficiais (`is_official = true`)

## 📺 Modo TV (Live Wall — `/tv/:slug`)
- Slideshow de fotos aprovadas em tela cheia
- Exibe ranking por categorias (quando `events.tv_show_ranking = true`)
- Atualização em tempo real via Supabase Realtime
- Tema visual independente (campos `tv_*` em `events`)

## 🏆 Sistema de Ranking
| Categoria | Critério |
|---|---|
| Mais curtidas | total de reações |
| Mais divertida | contagem de `funny` |
| Mais fofura | contagem de `love` |
| Rockstar | contagem de `rock` |
| Mais comentadas | quantidade de comentários |
| Destaques oficiais | `is_official = true` |

## 🖨️ Impressão (Painel: `/operator/:slug`)
1. Usuário seleciona fotos e cria pedido
2. Operador visualiza fila em tempo real
3. Status: `pending → printing → completed`
4. Permite múltiplas fotos por pedido (via `print_order_items`)

## 🔔 Notificações
- Tabela `notifications` com `user_id`, `title`, `body`, `read`, `link`
- Disparadas ao aprovar foto ou comentário do usuário

## 📦 Pós-evento (estado: POST)
- Download das fotos
- Galeria permanece ativa
- Expositores continuam visíveis
- `post_event_message` customizável
- `summary_file_url` para arquivo de memória do evento

---

# 🏗️ 5. Arquitetura Técnica

## Stack
| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Estilização | Tailwind CSS 4 + Framer Motion |
| Roteamento | React Router DOM 7 |
| Auth — Participantes | Firebase Authentication (Google OAuth) |
| Auth — Admins | Supabase Auth (email + senha) |
| Banco de Dados | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (canais por `event_id`) |
| Storage | Cloudflare R2 (via presigned URLs em Edge Function) |
| Testes | Playwright (E2E) |

## 🔄 Fluxo de Upload
1. Cliente solicita presigned URL à Supabase Edge Function
2. Upload direto para R2
3. Retorna URL pública
4. Salva registro em `posts` (Supabase)
5. Feed atualiza via Realtime

## 📡 Realtime
- Canal por `event_id`
- Tabelas assinadas: `posts`, `reactions`, `comments`, `print_orders`

---

# 🗄️ 6. Modelo de Dados

> ⚠️ **Migração em curso**: a tabela legada `photos` (denormalizada) está sendo substituída pelas tabelas normalizadas abaixo. O serviço `posts.ts` ainda aponta para `photos` durante a transição.

## `users`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | text | PK — Firebase UID |
| `email` | text | |
| `display_name` | text | |
| `photo_url` | text | |
| `role` | text | `admin` ou `participant` |
| `firebase_uid` | text | Unique — redundância para lookup |
| `created_at` | timestamptz | |

## `events`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `slug` | text | Unique — usado em todas as rotas |
| `status` | text | `pre | live | post` |
| `date` | timestamptz | |
| `logo_url` | text | |
| `primary_color` | text | Tema do evento |
| `secondary_color` | text | |
| `bg_type` | text | `color | gradient | pattern` |
| `bg_value` | text | |
| `bg_gradient_from/to` | text | |
| `bg_pattern_bg/fg` | text | |
| `tv_bg_type` | text | Tema da TV (independente) |
| `tv_bg_value` | text | |
| `tv_bg_gradient_from/to` | text | |
| `tv_bg_pattern_bg/fg` | text | |
| `tv_primary_color` | text | |
| `tv_secondary_color` | text | |
| `tv_show_ranking` | bool | Exibe ranking na TV |
| `owner_text` | text | Texto do organizador |
| `owner_photo` | text | |
| `post_event_message` | text | Mensagem pós-evento |
| `summary_file_url` | text | Arquivo de memória |
| `app_description` | text | Info do app na landing |
| `app_whatsapp` | text | |
| `app_instagram` | text | |
| `app_website` | text | |
| `app_logo` | text | |
| `comment_moderation_enabled` | bool | Moderação de comentários |
| `has_official_photos` | bool | Habilita fotos oficiais |
| `upload_source` | text | `camera | gallery | both` |
| `interactions_paused` | bool | Pausa likes/comentários |
| `countdown_active` | bool | Exibe countdown no pre |
| `exhibitors` | jsonb | Array de expositores |
| `sponsors` | jsonb | Array de patrocinadores |
| `services` | jsonb | Array de serviços |
| `custom_comments` | jsonb | Comentários pré-definidos |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

## `posts` _(tabela nova — destino da migração)_
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → events |
| `user_id` | text | Firebase UID |
| `image_url` | text | URL pública no R2 |
| `status` | text | `pending | approved | rejected` |
| `is_official` | bool | Destaque oficial |
| `printed` | bool | Já impresso |
| `created_at` | timestamptz | |

## `reactions`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `post_id` | uuid | FK → posts |
| `user_id` | text | Firebase UID |
| `type` | text | `like | funny | love | rock` |
| `created_at` | timestamptz | |

_Constraint_: unique(`post_id`, `user_id`, `type`) — não repetir tipo por usuário

## `comments`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `post_id` | uuid | FK → posts |
| `user_id` | text | Firebase UID |
| `text` | text | |
| `status` | text | `pending | approved | rejected` |
| `is_predefined` | bool | Pré-definidos = auto-aprovados |
| `created_at` | timestamptz | |

## `print_orders`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `event_id` | uuid | FK → events |
| `user_id` | text | Firebase UID |
| `user_name` | text | Snapshot do nome |
| `user_email` | text | Opcional |
| `option` | text | Tipo do pedido |
| `status` | text | `pending | printing | completed` |
| `created_at` | timestamptz | |

## `print_order_items`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `print_order_id` | uuid | FK → print_orders |
| `post_id` | uuid | FK → posts |

## `notifications`
| Campo | Tipo | Obs |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | text | Firebase UID do destinatário |
| `title` | text | |
| `body` | text | |
| `read` | bool | |
| `link` | text | Deep link opcional |
| `created_at` | timestamptz | |

> **Legado — a remover**: tabela `photos` ainda existe com schema denormalizado (`firebase_uid`, `likes`, `reactions jsonb`, `comments jsonb`, `reacted_users`). Será dropada após migração completa do serviço `posts.ts`.

---

# 📏 7. Regras de Negócio

## Upload
- Permitido apenas no estado `live`
- `events.upload_source` controla a fonte permitida
- Sempre inicia como `pending`

## Visibilidade
- Feed → apenas `approved`
- TV → apenas `approved`
- Moderação → apenas `pending`

## Reações
- Máximo 2 por usuário por post
- Não pode repetir o mesmo `type`
- Desabilitadas quando `interactions_paused = true`

## Comentários
- Pré-definidos (`is_predefined = true`) → `approved` automaticamente
- Texto livre → `pending`, requer aprovação (quando `comment_moderation_enabled = true`)
- Máximo 2 por usuário por post

## Impressão
- Apenas fotos `approved`
- Múltiplas fotos por pedido via `print_order_items`
- Status final: `completed` (não `done`)

## Exclusão
- Remove registro do Supabase
- Remove arquivo do R2

## Segurança
- Admins identificados por `users.role = 'admin'`
- Participantes identificados por Firebase UID
- **Restrição de Escrita**: RLS (Row Level Security) configurado para permitir `INSERT` em `posts`, `comments` e `reactions` apenas se o `user_id` constar na tabela `users` (garantindo que apenas usuários autenticados via Firebase possam interagir).
- Operações de moderação exigem `role = 'admin'`

---

# 🗺️ 8. Rotas da Aplicação

| Rota | Acesso | Página |
|---|---|---|
| `/` | Admin (Supabase Auth) | Dashboard Admin |
| `/admin` | — | Redireciona para `/` |
| `/event/:slug` | Público | Página do evento (3 estados) |
| `/moderation/:slug` | Admin | Painel de curadoria/moderação |
| `/operator/:slug` | Admin | Painel de impressão |
| `/tv/:slug` | Público | Live Wall (TV) |

---

# ✅ 9. Critérios de Aceite

- [ ] Upload só funciona no estado `live`
- [ ] Fotos iniciam como `pending` e só aparecem no feed após `approved`
- [ ] Não permitir 3ª reação por usuário por post
- [ ] Não permitir repetir o mesmo tipo de reação
- [ ] Não permitir 3º comentário por usuário por post
- [ ] Comentários de texto livre não aparecem sem aprovação (quando moderação ativa)
- [ ] TV atualiza em tempo real
- [ ] Impressão suporta múltiplas fotos via `print_order_items`
- [ ] Exclusão remove do Supabase e do R2
- [ ] Admin não consegue acessar rotas protegidas sem autenticação Supabase
- [ ] `interactions_paused = true` desabilita likes e comentários
- [ ] `upload_source` controla câmera/galeria/ambos no upload

---

# 🧠 10. Decisões Arquiteturais

| Decisão | Racional |
|---|---|
| Firebase Auth (participantes) | Google OAuth sem atrito; UID é chave de identidade universal |
| Supabase Auth (admins) | Email/senha com controle de role; independente do Firebase |
| Cloudflare R2 | Storage de arquivos; presigned URLs via Edge Function evitam expor credenciais |
| Supabase Realtime | Canal por event_id; evita polling |
| Normalização das tabelas | `photos` (denormalizado) → `posts` + `reactions` + `comments` (normalizado) |
| `slug` como identificador de rota | Legível, único e estável para URLs públicas |

---

# 🚦 11. Status de Migração

| Item | Status |
|---|---|
| Tabela `posts` criada | ✅ |
| Tabelas `reactions`, `comments` criadas | ✅ |
| Tabela `notifications` criada | ✅ |
| Serviço `posts.ts` apontando para `photos` (legado) | 🔴 WIP |
| TypeScript `PhotoData` interface desalinhada | 🔴 WIP |
| `print_orders` com campos legados | 🟡 Parcial |
| Admin usando Google OAuth (deveria ser email/senha) | 🟡 WIP |
| Tabela `photos` legada para remoção | ⏳ Após migração |

---

# 🚀 12. Próximas Etapas (pós-VP)

1. **GPC** — Atualizar `project-context.md` com scan do codebase atual
2. **CA** — Documento de Arquitetura (Winston)
3. **CU** — UX Design spec (Sally)
4. **IR** — Check de Prontidão de Implementação
5. **CE** — Epics & Stories (incluindo Epic de Migração `photos → posts`)