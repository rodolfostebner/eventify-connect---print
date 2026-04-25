# 🎨 UX Design Spec — Eventify Connect & Print
> **Agente**: Sally (UX Designer) 🎨  
> **Workflow**: CU (bmad-create-ux-design)  
> **Gerado**: 2026-04-25 | **Referência**: PRD v4 + Architecture Doc

---

## 1. Visão de UX

### 1.1 Princípios de Design

| Princípio | Descrição |
|---|---|
| **Mobile-first** | Participantes usam celular durante o evento — toda UI deve ser thumb-friendly |
| **Theming dinâmico** | Cada evento tem cores próprias (primary_color, secondary_color, bg_*) — componentes devem respeitar o tema |
| **Zero atrito no upload** | FAB sempre visível, toque → câmera/galeria imediatamente |
| **Feedback imediato** | Toast para toda ação assíncrona (upload, like, comentário) |
| **Modo TV autônomo** | TVView roda sem interação humana — fullscreen, slideshow automático |

### 1.2 Design System em uso

- **Tipografia**: sistema nativo (sem Google Fonts configurado — oportunidade de melhoria)
- **Espaçamento**: Tailwind 4 — `p-3`, `p-4`, `p-6`, `p-8`, `p-10`
- **Border radius**: `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-[32px]`, `rounded-[40px]`, `rounded-[48px]` — estilo "pill" premium
- **Animações**: `motion/react` — `layout`, `initial/animate/exit`, `whileTap`
- **Sombras**: `shadow-sm`, `shadow-xl`, `shadow-2xl` + sombras coloridas com opacidade
- **Cor neutra**: sistema baseado em `neutral-*` (não gray ou slate)
- **Componentes de feedback**: `sonner` para toasts

---

## 2. Mapa de Fluxos

### 2.1 Fluxo do Participante (mobile)

```
Acessa /event/:slug
       │
       ├─── status: pre ──→ [PRE_EVENT VIEW]
       │                     Countdown + Parceiros
       │
       ├─── status: live ──→ [LIVE_EVENT VIEW]
       │                     Slideshow Destaques
       │                     Feed de fotos (approved)
       │                     FAB de Upload
       │                     └─── sem login → [LOGIN BANNER] → Google OAuth
       │                     └─── com login → câmera/galeria → upload → pending
       │                     PhotoCard → tap → [PHOTO MODAL]
       │                                        Like / Emoji reações
       │                                        Comentários
       │                                        Solicitar Impressão
       │
       └─── status: post ──→ [POST_EVENT VIEW]
                             Ranking / Destaques
                             Ver Álbum Completo
                             Download Resumo (PDF)
                             Parceiros
```

### 2.2 Fluxo do Admin

```
/ (root)
├── Não autenticado → [LOGIN SCREEN]
│                     "Entrar com Google" (Firebase)
│                     ⚠️ WIP: migrar para email/senha Supabase
│
└── Autenticado → [ADMIN DASHBOARD]
                  Lista de eventos (cards)
                  Criar novo evento
                  EventCard → [BRANDING MODAL] (personalização completa)
                           → Links: /event/:slug, /moderation/:slug, /operator/:slug, /tv/:slug
                  
    /moderation/:slug → [MODERATION PANEL]
                        Tabs: Fotos Pendentes | Comentários | Pedidos de Impressão
                        Controles de estado do evento
                        PhotoModeration → Aprovar / Rejeitar
                        CommentModeration
                        PrintOrderModeration → PrintOrderModal
    
    /operator/:slug → [OPERATOR PANEL]
                      Fila de impressão em tempo real
                      Marcar pedido como concluído
```

### 2.3 Fluxo TV (sem interação)

```
/tv/:slug → [TV VIEW]
            Slideshow automático de fotos approved
            Ranking por categorias (quando tv_show_ranking = true)
            Tema independente (tv_bg_*, tv_primary_color, etc.)
            Atualização em tempo real
```

---

## 3. Telas — Estado Atual

### 3.1 Login Screen (`/`)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Container | `max-w-sm`, `rounded-[48px]`, `shadow-2xl`, fundo branco |
| Logo | `w-20 h-20`, `rounded-[32px]`, fundo `neutral-900`, emoji 🐨 |
| Título | `text-3xl font-black tracking-tighter` — "Eventify" |
| Subtítulo | `text-neutral-400 text-sm` |
| Botão Google | `w-full py-4`, `bg-neutral-900`, `text-white`, `rounded-2xl`, `font-black text-xs uppercase tracking-widest` |
| Fundo | `bg-[#fafafa]` |

**⚠️ Gap**: Botão diz "Entrar com Google" — quando auth admin migrar para email/senha, precisa de nova tela com campos de email e senha.

---

### 3.2 Pre-Event View (`/event/:slug` — status: pre)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Countdown | Card arredondado com `primary_color`, números `text-5xl font-black`, dias/horas/minutos |
| Parceiros | `PartnerSection` — Expositores, Patrocinadores, Serviços |
| Mensagem de espera | Texto estático em itálico |

**⚠️ Gap**: `countdown_active` existe no BD mas não é verificado — countdown aparece mesmo quando desabilitado. Falta: logo do evento no topo da página, mensagem de boas-vindas personalizada.

---

### 3.3 Live Event View (`/event/:slug` — status: live)
**Status**: ✅ Implementado

#### FeaturedSlideshow
| Elemento | Spec |
|---|---|
| Tipo | Slideshow horizontal por categoria de ranking |
| Fotos | `aspect-square`, `object-cover` |
| Navegação | Dots de paginação |

#### FeedGrid
| Elemento | Spec |
|---|---|
| Layout | Grid responsivo de `PhotoCard` |
| Seção Oficial | Cards com `is_official = true` (quando `has_official_photos = true`) |
| Galeria | Grid de fotos da galeria geral |

#### PhotoCard
| Elemento | Spec |
|---|---|
| Container | `rounded-3xl`, `border border-neutral-100`, hover com `shadow-xl` |
| Imagem | `aspect-square object-cover`, zoom no hover (110%) |
| Overlay | Gradiente bottom + nome do usuário — aparece no hover |
| InteractionBar | `p-3 bg-white/80 backdrop-blur-md` — Heart + MessageCircle |
| Animação | `motion.div layout`, fade-in + scale, `whileTap` scale-down |

#### InteractionBar
| Elemento | Spec |
|---|---|
| Like | `Heart` — neutro sem like, `fill-current text-red-500` com like |
| Comentários | `MessageCircle` — contador apenas (sem interação inline) |
| Interação | Toque abre PhotoModal |

**⚠️ Gap InteractionBar**: Exibe apenas likes e comentários. PRD diz: `like | funny | love | rock`. Os emojis de reação não aparecem no card — só no modal. Avaliar se deve aparecer no card também.

#### UploadFAB
| Elemento | Spec |
|---|---|
| Posição | Fixed, bottom-right |
| Comportamento | Sem login → dispara `onLogin()`; Com login → abre file input |
| `upload_source` | `camera` → `capture="camera"`, `gallery` → sem capture, `both` → sem capture |
| Estado de upload | Spinner animado durante o upload |

#### LoginBanner
| Elemento | Spec |
|---|---|
| Posição | Bottom, fixo ou inline |
| Comportamento | Exibido apenas quando `user === null` |

---

### 3.4 Photo Modal (overlay)
**Status**: ✅ Implementado (via `PhotoModal.tsx`)

| Elemento | Spec |
|---|---|
| Overlay | Full screen, blur de fundo |
| Imagem | Foto em destaque, grande |
| Reações | Botões de emoji (like/funny/love/rock) |
| Comentários | Lista de comentários aprovados + form de novo comentário |
| Comentários pré-definidos | Chips clicáveis de `custom_comments` do evento |
| Admin actions | Botão de deletar comentário (quando `isAdmin`) |

**⚠️ Gap**: Lógica de print (solicitar impressão) precisa estar acessível no modal ou via botão dedicado no card. Fluxo de seleção para impressão (`isSelectingForPrint`) existe no estado da LiveEventView mas a UX de como isso se apresenta ao usuário não está clara.

---

### 3.5 Post-Event View (`/event/:slug` — status: post)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Hero | Card com Trophy icon + título "Evento Encerrado" + `post_event_message` |
| CTA | "Ver Álbum Digital Completo" — botão full width com `primary_color` |
| Ranking | Scroll horizontal de cards por categoria (destaques do evento) |
| Download | Link para `summary_file_url` (PDF) — só aparece se preenchido |
| Parceiros | `PartnerSection` — Expositores, Patrocinadores, Serviços |

**⚠️ Gap**: "Ver Álbum Digital Completo" não tem destino implementado — o botão existe mas não navega para nenhum lugar.

---

### 3.6 Admin Dashboard (`/`)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Layout | Lista de `EventCard` |
| EventCard | Mostra nome, data, status com badge colorido |
| Ações no card | Branding (✏️), Share, links para Moderação/TV/Operador/Evento |
| Criar evento | Botão "+" com modal de criação |

---

### 3.7 Branding Modal
**Status**: ✅ Implementado (componente mais complexo)

Seções do modal:
1. **Info básica**: Nome, Data, Logo URL
2. **Cores**: Primary color, Secondary color (pickers)
3. **Fundo do App**: tipo (cor/degradê/padrão) + configuração
4. **Personalização TV**: cores + fundo independente
5. **Feature toggles**: Moderação de comentários, Fotos oficiais
6. **Configurações de conteúdo**: Comentários padrão, Origem de upload
7. **App & Identidade**: Descrição, Logo, WhatsApp, Instagram, Website, Texto/Foto do dono, Mensagem pós-evento
8. **Arquivo de resumo**: Upload de PDF
9. **Expositores / Patrocinadores / Serviços**: CRUD inline
10. **Preview + Salvar**

**⚠️ Gap**: Modal tem scroll `max-h-[70vh]` — muitas seções. Candidato a refatoração em abas (tabs) para melhor UX.

---

### 3.8 Moderation Panel (`/moderation/:slug`)
**Status**: ✅ Implementado

| Seção | Componente | Status |
|---|---|---|
| Fotos pendentes | `PhotoModeration` | ✅ |
| Aprovação/Rejeição | Buttons Aprovar/Rejeitar por card | ✅ |
| Moderação de comentários | `CommentModeration` | ✅ |
| Controles de evento | `ModerationControls` | ✅ (estado, pausar interações) |
| Pedidos de impressão | `PrintOrderModeration` + `PrintOrderModal` | ✅ |

---

### 3.9 Operator Panel (`/operator/:slug`)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Fila em tempo real | `usePrintQueue` → `subscribeToPrintOrders` |
| Ações | Marcar como concluído, ver detalhes |

---

### 3.10 TV View (`/tv/:slug`)
**Status**: ✅ Implementado

| Elemento | Spec |
|---|---|
| Layout | Fullscreen, sem barra de navegação |
| Slideshow | Automático, fotos approved |
| Ranking | Lateral ou overlay por categoria |
| Tema | `tv_bg_*`, `tv_primary_color`, `tv_secondary_color` |
| Realtime | Atualiza ao receber novas fotos aprovadas |

---

## 4. Gaps de UX — Priorizados

### 🔴 Críticos (bloqueiam funcionalidade)

| ID | Gap | Componente | Ação |
|---|---|---|---|
| G1 | Auth admin sem tela de email/senha | `App.tsx` / LoginScreen | Criar `AdminLoginScreen` com campos email/senha |
| G2 | Botão "Ver Álbum Completo" sem destino | `PostEventView` | Implementar galeria completa ou rota `/album/:slug` |
| G3 | `countdown_active = false` não respeita countdown | `PreEventView` | Adicionar check `if (!event.countdown_active) return null` |

### 🟡 Importantes (degradam experiência)

| ID | Gap | Componente | Ação |
|---|---|---|---|
| G4 | Fluxo de seleção para impressão confuso | `LiveEventView` | UX clara: modo "selecionar para imprimir" com indicador visual |
| G5 | Branding Modal com scroll excessivo | `BrandingModal` | Refatorar em tabs (Info / Tema / TV / Conteúdo / Parceiros) |
| G6 | Emoji reactions (funny/love/rock) não visíveis no FeedGrid | `PhotoCard` / `InteractionBar` | Exibir contagem de reações por emoji no card |
| G7 | Logo do evento ausente no PreEventView | `PreEventView` | Adicionar logo no topo da landing |
| G8 | Tela de carregamento genérica | `App.tsx` | Loading screen com branding do evento (quando slug disponível) |

### 🟢 Menores (melhorias de polimento)

| ID | Gap | Componente | Ação |
|---|---|---|---|
| G9 | `upload_source = camera` não bloqueia galeria corretamente | `UploadFAB` | Verificar atributo `capture` no input |
| G10 | Sem estado vazio animado no Feed | `FeedGrid` | Empty state com ilustração quando não há fotos |
| G11 | Notificações existem no BD mas sem UI de exibição | — | `NotificationsListener` existe mas como é apresentado? |
| G12 | Sem confirmação antes de rejeitar foto | `PhotoModeration` | Dialog de confirmação para rejeição |
| G13 | Sem paginação no Feed (carrega tudo) | `FeedGrid` | Infinite scroll ou paginação para eventos com muitas fotos |

---

## 5. Componentes a Criar (novos)

| Componente | Feature | Prioridade |
|---|---|---|
| `AdminLoginScreen` | Auth | 🔴 Alta |
| `AlbumView` ou galeria pós-evento | Event / Post | 🟡 Média |
| `PrintSelectionMode` overlay | Event / Live | 🟡 Média |
| `BrandingModal` refatorado em tabs | Admin | 🟡 Média |
| `NotificationBell` / notif dropdown | Global | 🟢 Baixa |
| Empty states animados | FeedGrid, PhotoModeration | 🟢 Baixa |

---

## 6. Padrões de Interação

### 6.1 Toque vs. Clique
- **Cards** → toque abre modal (não ação imediata)
- **FAB** → toque dispara ação imediata (upload ou login)
- **Botões de ação** → `active:scale-95` para feedback tátil
- **Modais** → click no overlay fecha

### 6.2 Estados de Loading
- Upload: spinner no FAB
- Aprovação: botão disabled + spinner
- Carregamento inicial: spinner centralizado com texto "Carregando Sistema..."

### 6.3 Feedback de Ações
- Sucesso: `toast.success()` via sonner
- Erro: `toast.error()` via sonner
- Interações pausadas: toast informativo (não erro)

### 6.4 Animações (padrão Motion)
```typescript
// Entry animation (padrão para cards)
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}

// Modal
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}

// Tap feedback
whileTap={{ scale: 0.98 }}

// Layout animations
layout  // em listas que mudam
```

---

## 7. Theming Dinâmico — Contrato

Componentes que devem respeitar o tema do evento:

| Campo | Uso |
|---|---|
| `primary_color` | Cor principal (botões CTAs, contadores, destaques) |
| `secondary_color` | Texto sobre `primary_color` |
| `bg_type` + `bg_value` | Fundo da página do evento |
| `bg_gradient_from/to` | Degradê do fundo |
| `bg_pattern_bg/fg` | Cores do padrão vetorial |
| `logo_url` | Logo no topo do evento |

**TV** usa campos `tv_*` equivalentes — completamente independente do tema do app.

---

## 8. Responsividade

| Breakpoint | Layout |
|---|---|
| Mobile (default) | Single column, full width |
| `md:` | 2 colunas no FeedGrid, 2 colunas na PhotoModeration |
| `lg:` | 3 colunas na PhotoModeration |
| TV (`/tv/:slug`) | Fullscreen, sem responsividade — projetado para 16:9 |

---

## 9. Checklist de Conformidade UX

Para cada nova tela ou componente, verificar:

- [ ] Funciona no mobile (thumb zone — botões acessíveis no terço inferior da tela)
- [ ] Respeita `primary_color` e `secondary_color` do evento (quando na `/event/:slug`)
- [ ] Tem estado de loading explícito
- [ ] Tem estado vazio (empty state) com mensagem clara
- [ ] Animação de entrada (mínimo: `initial/animate opacity`)
- [ ] Feedback de ação via toast (`sonner`)
- [ ] `whileTap={{ scale: 0.98 }}` em botões principais
- [ ] Borda `border-neutral-100` em cards de conteúdo (consistência visual)
