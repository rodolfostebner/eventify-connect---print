# Project Context: Eventify Connect & Print
> **Gerado por**: Mary (Business Analyst) & Paige (Technical Writer) | **Data**: 2026-05-27
> **BMAD Status**: PRD v5 validado ✅ | Fase de implementação: Linha do Tempo (Timeline Feed) concluída e homologada pelo usuário.

---

## 📋 Visão Geral

**Eventify Connect & Print** é uma plataforma **Phygital de eventos** em tempo real modelada para atender a feiras de negócios, eventos de exposição escolar e exposições B2B. A plataforma viabiliza a criação de stands virtuais para expositores com catálogos de produtos e captura de leads de pré-venda, além de um sistema interativo com feed de fotos sociais, avaliação técnica por jurados, votação pública por participantes com score ponderado em tempo real e exibição no telão (TV wall) com sorteios automatizados e anúncios sonoros inteligentes.

**Três estados de evento**: 
`pre` (landing + countdown + catálogo de expositores + registro de pré-vendas) 
→ `live` (feed social + upload + interações + votação pública/técnica + anúncios sonoros + sorteios) 
→ `post` (galeria social fechada + download de fotos + ranking oficial ponderado)

---

## 🏗️ Stack Técnica

| Camada | Tecnologia | Versão | Observação |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | 19.x | React 19 executando em modo estrito |
| **Build Tool** | Vite | 6.x | Servidor de desenvolvimento rápido |
| **Linguagem** | TypeScript | 5.8.x | Tipagem estrita de schemas e retornos |
| **Estilização** | Tailwind CSS | 4.x | Configuração CSS-First via `@layer` diretivas |
| **Animações** | Motion (Framer) | 12.x | Transições suaves de feeds e modais da UI |
| **Roteamento** | React Router DOM | 7.x | Rotas públicas e restritas por perfil |
| **Database** | Supabase (PostgreSQL 17) | 2.x | Tabelas normalizadas e views de ranking |
| **Realtime** | Supabase Realtime | — | Canais dedicados de sincronização |
| **Auth** | Supabase Auth | — | Google OAuth + Magic Link + BETA_MODE local |
| **Storage** | Cloudflare R2 | — | Direct browser upload via Edge Function presigned URL |
| **Ícones** | lucide-react | 0.546.x | Biblioteca de ícones vetoriais |
| **Notificações UI**| sonner | 2.x | Mensagens toast não bloqueantes |
| **Datas** | date-fns | 4.x | Formatação localizada para português (PT-BR) |
| **Testes E2E** | Playwright | 1.59.x | Testes integrados automatizados |

---

## 📁 Estrutura de Arquivos

Abaixo está o layout das pastas e a organização das features baseadas em domínio:

```
src/
├── App.tsx                        # Roteador principal e gerenciador de acessos
├── main.tsx                       # Entry point do React 19
├── index.css                      # Estilos globais Tailwind 4
│
├── constants/
│   └── index.ts                   # Constantes de rotas e Enums de estado do evento
│
├── types/
│   └── index.ts                   # Central de interfaces TypeScript (Schemas normais e legados)
│
├── lib/
│   ├── supabase/client.ts         # Inicializador do Supabase (null-safe para builds locais)
│   └── utils.ts                   # Funções auxiliares utilitárias (ex. cn, getAppUrl)
│
├── contexts/
│   └── AuthContext.tsx            # Provedor de sessão Supabase e gestão do BETA_MODE
│
├── hooks/
│   ├── useAuth.ts                 # Hook utilitário para consumo de contexto de autenticação
│   ├── useEvent.ts                # Assinatura em tempo real de um evento específico por slug
│   ├── useEvents.ts               # Escuta reativa de múltiplos eventos no dashboard
│   ├── usePosts.ts                # Gerenciador de queries e realtime do feed de posts
│   └── usePhotoUpload.ts          # Compressão no navegador e upload direto ao R2
│
├── services/
│   ├── authService.ts             # Chamadas de autenticação do Supabase (OAuth, OTP, Logout)
│   ├── userService.ts             # Sincronização e cadastro de novos usuários com Relação de Emails
│   ├── eventService.ts            # CRUD de eventos e subscrições realtime
│   ├── posts.ts                   # CRUD de fotos, comentários e reações do feed
│   ├── exhibitorService.ts        # Gerenciamento de expositores, logos, fotos e integrantes
│   ├── productService.ts          # CRUD de catálogo de produtos do expositor
│   ├── leadService.ts             # Captura e controle de status de interessados na pré-venda
│   ├── partnerService.ts          # CRUD de patrocinadores, apoiadores e prestadores de serviço
│   ├── storageService.ts          # Pipeline de R2 (Edge Function presigned URL + PUT)
│   ├── notificationService.ts     # Gerenciamento e subscrição de alertas na UI
│   ├── evaluationService.ts       # CRUD de notas, categorias técnicas e view de rankings
│   ├── raffleService.ts           # Geração de tickets e execução dos sorteios
│   ├── visitService.ts            # Registro e agregados de métricas de clique silenciosas
│   ├── auditService.ts            # Logs de auditoria administrativa de alterações de eventos
│   ├── dashboardService.ts        # Consolidação de métricas gerais no backoffice do administrador
│   ├── announcementService.ts     # Transmissão de anúncios com áudio e imagem
│   └── printService.ts            # Pedidos de impressão física (INATIVO nesta versão)
│
├── pages/                         # Thin wrappers que encapsulam e renderizam as features
│   ├── AdminDashboard.tsx
│   ├── EventPage.tsx
│   ├── LoginPage.tsx
│   ├── ModerationPanel.tsx
│   ├── OperatorPanel.tsx
│   ├── TVView.tsx
│   ├── ExhibitorPanelPage.tsx
│   ├── ExhibitorPortalPage.tsx
│   ├── PartnerPanelPage.tsx
│   ├── EventAdminPortalPage.tsx
│   └── AvaliadorPage.tsx
│
├── features/
│   ├── admin/                     # Dashboard principal do administrador geral do sistema
│   ├── auth/                      # Página de login unificado
│   ├── avaliador/                 # Área restrita do jurado técnico (stub de interface atual)
│   ├── event/                     # Orquestração do Feed Público nas fases Pré/Live/Pós
│   ├── eventAdmin/                # Painel de controle completo do cliente dono do evento
│   ├── exhibitor/                 # Portal exclusivo do expositor para gerenciar seu stand
│   ├── exhibitors/                # Área administrativa de controle de expositores pelo organizador
│   ├── moderation/                # Painel de curadoria de fotos e comentários
│   ├── operator/                  # Fila de controle de impressão (UI desativada)
│   ├── partners/                  # Gestão de patrocinadores, apoiadores e serviços
│   └── tv/                        # Exibição do telão da TV (Live Wall com carrossel e sorteios)
│
└── utils/
    └── formatters.ts              # Auxiliares de sanitização de links sociais (WhatsApp, Insta, Web)
```

---

## 🔐 Autenticação — Fluxo Unificado

O ecossistema migrou completamente do Firebase Auth para o **Supabase Auth**.
* **Tipos de Autenticação**: Provedor Google OAuth (Produção) + Magic Link com código OTP (Alternativa) + `BETA_MODE=true` (Desenvolvimento local por inserção direta de e-mail na tabela `users`).
* **Como a Role é Definida**:
  1. O administrador realiza o pré-cadastro do e-mail com a respectiva permissão na tabela `user_email_roles`.
  2. No primeiro login do usuário, a Edge Function `create-event-role-user` (ou trigger de sincronização) consulta o pré-cadastro, cria a conta no Supabase Auth e insere o registro na tabela `users` com a role correspondente (`admin`, `event_admin`, `avaliador`, `expositor`).
  3. O registro de pré-cadastro é removido e o controle de sessão passa a ler diretamente a coluna `role` da tabela `users`.
  4. Novos usuários comuns sem pré-cadastro ganham automaticamente a role de `participant` (participante).

---

## 🗄️ Banco de Dados — Schema Normalizado

O banco de dados PostgreSQL do Supabase opera com políticas ativas de RLS (Row Level Security) e tabelas normalizadas que substituem antigas estruturas JSONB:

### Tabelas Principais
* **`events`**: Guarda as definições de branding do evento (cores, logos, planos de fundo), status de fase (`pre`, `live`, `post`), parâmetros de peso para cálculo de pontuação (`public_evaluation_weight`, `juror_evaluation_weight`) e estados ativos de anúncios (`active_announcement_id`) e sorteio do telão.
* **`users`**: Armazena as contas sincronizadas do Supabase Auth e o mapeamento de permissões (roles) e vínculos com stands virtuais (`exhibitor_id`) ou eventos (`event_id`).
* **`user_email_roles`**: Tabela temporária de e-mails pré-cadastrados pelos organizadores.
* **`exhibitors`**: Entidade B2B dos stands virtuais. Contém número do stand, nome, descrição, foto, contatos e campos acadêmicos (`tagline`, `ano`, `turma`, `members`).
* **`exhibitor_categories`**: Tabela dedicada contendo as categorias dos expositores (Gastronomia, Tecnologia, Artesanato, etc.), cores e ícones que alimentam os filtros da UI.
* **`products`**: Catálogo de produtos vinculados a stands de expositores com preços e arrays de imagens.
* **`leads`**: Interesse em produtos por parte de participantes. Possui coluna `status` com valores estruturados em `novo`, `atendido`, `pago` e `retirado`.
* **`partners`**: Tabela de parcerias unificada. Agrega patrocinadores, apoiadores e prestadores de serviços distinguíveis pela coluna `type`, além de guardar informações de contato interno, valor de patrocínio (`sponsorship_value`), ordem e flags de exibição (`show_on_feed`, `show_on_tv`).
* **`posts`**: Fotos sociais da galeria enviadas por participantes, contendo estado de moderação (`pending`, `approved`, `rejected`) e flag de destaque oficial.
* **`reactions`**: Reações normalizadas vinculando `post_id`, `user_id` e o caractere emoji de reação.
* **`comments`**: Comentários associados a fotos sociais com moderação individual de status.
* **`evaluation_categories`**: Categorias de avaliação técnica criadas por evento (Melhor Atendimento, Criatividade, etc.) com pesos customizáveis.
* **`evaluations`**: Notas dadas pelo público comum (1 a 5 estrelas + comentário). Possui restrição de chave UNIQUE para garantir a regra `[RN1]` (uma avaliação por participante por stand).
* **`juror_evaluations`**: Pontuações numéricas dadas por jurados especializados em cada categoria técnica por stand virtual.
* **`raffle_tickets`**: Registro de bilhetes gerados para sorteios. UNIQUE impede flood de tickets por usuário.
* **`raffle_prizes`**: Prêmios cadastrados para sorteio pelo organizador com referência ao bilhete ganhador (`winner_ticket_id`).
* **`announcements`**: Cadastro de avisos textuais com cores e imagens, integrados a uploads de sons customizados em R2 (`audio_url`).
* **`visits`**: Captura silenciosa de analytics. Grava cliques em links de contato, visualizações de produto e stand, registrando a fase ativa (`event_status`) no momento da ação.
* **`audit_logs`**: Logs administrativos capturando diffs JSONB de alterações críticas feitas por organizadores.

### Views de Banco de Dados
* **`view_exhibitor_rankings`**: View SQL que calcula em tempo real o ranking ponderado dos expositores, integrando médias do público avaliador, médias pesadas de categorias dos jurados e aplicando os coeficientes do evento.

---

## 📡 Realtime — Canais do Supabase

A plataforma adota o padrão de subscrição a canais com consultas resilientes baseadas em refetch completo no callback de alteração para evitar dessincronização de payloads parciais:
* `public:events` — Dashboard admin geral
* `public:events:slug=eq.{slug}` — Transmissão do estado da TV e avisos em tempo real
* `public:event_data:{id}` — Orquestração de comentários, reações e novos posts no feed live
* `public:exhibitors:event_id=eq.{id}` — Alterações de stands virtuais
* `public:print_orders` — Inserção de novas requisições de impressão na fila do operador
* `public:notifications:user_id=eq.{id}` — Central de mensagens instantâneas do usuário

---

## ⚠️ WIP e Dívida Técnica Mapeada

Abaixo constam os pontos de atenção atuais na transição da arquitetura:

1. **Stub de Interface da Área de Avaliação**: O backend de avaliações técnicas (`evaluationService`) está concluído, mas o painel `/avaliador` necessita de interface final para preenchimento de notas de jurados.
2. **Vínculo Avaliação → Ticket de Sorteio**: A lógica `[RN3]` (atribuir ticket ao registrar feedback) está mapeada em `raffleService`, mas não está conectada no acionamento do clique final no frontend.
3. **Analytics e Tabela de Visitas**: A aba de visualizações de Parceiros ainda é um placeholder, pois a tabela `visits` rastreia exclusivamente interações de stands (`exhibitor_id`) e produtos (`product_id`), excluindo interações específicas com parceiros.
4. **Acúmulo de Tipagens**: O pseudônimo de tipo `PhotoData` foi mantido para retrocompatibilidade em componentes legados do feed, coexistindo com o schema normalizado do tipo `PostData`.
5. **Flags Inativas no Feed**: A lógica para que os carrosséis da TV e o Feed filtrem patrocinadores e parceiros com base nas flags `show_on_feed` e `show_on_tv` ainda precisa ser amarrada nos arquivos de visualização.

---

## 🌍 Variáveis de Ambiente (.env.local)

```env
# Supabase Backend
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare R2 CDN Public Endpoint
VITE_R2_PUBLIC_URL=https://pub-your-bucket-hash.r2.dev

# Configurações de Comportamento
VITE_APP_URL=http://localhost:3000
VITE_BETA_MODE=true # Define login simplificado por email sem autenticação externa de provedor
```
