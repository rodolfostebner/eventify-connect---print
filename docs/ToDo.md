# Definições da Ultima Reunião

## Perfis de Usuários

- Admin 
    > Administrador do sistema, acessa todas as funcionalidade e gerencia configurações gerais
- EventAdmin 
    > Administrador do Evento - Cliente principal, dono do evento, que poderá alterar dados do evento, cadastrar expositores e demais
    > configurações do evento
- Expositor
    > Administrador do Estande/Expositor - perfil atrelado aos usuarios que farão a gestão de produtos e demais informações de seu estande de 
    > exposição.
- Avaliador
    > Perfil que fará a avaliação dos expositores, acessando pagina específica para esse fim e utilizando metricas de avaliação pré definidas 
    > pelo administrador do evento.
- Participante
    > Usuario participante da feira, que poderá acessar a aplicação na pagina de feed, avaliar e comentar expositores e postar fotos durante a 
    > feira.

# Definição de Features:

## 1. FEED
  > Pagina que será acessada pelo publico em geral para acompanhar expositores em 3 fases:

  - Pré evento
    Poderá visualizar expositores (com seus catalogo de produtos, registrar interesse em algum produto específico).
    Também sera gravado o interesse em expositores e seus produtos conforme interação do usuario, estilo google ads, registrando clicks para 
    geração de relatorio.
  - Dia do Evento
    Poderá curtir expositores, postar comentarios de avaliação e postar fotos suas durante o evento. Participações o tornarão elegível a 
    sorteio de brindes durante a feira.
    Também sera gravado o interesse em expositores e seus produtos conforme interação do usuario, estilo google ads, registrando clicks para 
    geração de relatorio.
    [D2] - Verificar se podemos vincular ao instagram da escola dona do evento para redirecionar posts do instagram para o app. 
  - Pós Evento
    Poderão acompanhar Fotos do evento, Ranking dos expositores e demais informações relevantes a feira.


### Informações do Feed
  > [D3] - Qual o mMelhor layout para adequar todas as informações sem prejudicar a usabilidade

- **Dados da Escola**
  Área no topo do feed, com algumas informações da escola.
  [D1] - Verificar se podemos vincular ao instagram da escola dona do evento para redirecionar posts do instagram para o app. 
- **Expositores**
  Área central do feed com a lista dos expositores e botão para visualizar o catalogo de produtos
- **Fotos dos Participantes**
  Área intercalada com expositores ou em área exclusiva para exibir fotos postadas pelos participantes
- **Patrocinadores**
  Área no fim da pagina para divulgação dos patrocinadores, com menor destaque

## 2. EXPOSITORES
  > Tela para gerenciamento do stand de exposição, que possibilitará alterar nome, descrição, fotos do estande e dados de contato e:
  - **Cadastrar produtos** -
    Adicionar, alterar e excluir produtos
  - **Registro de Interessados** - registrado no pré evento (com possibilidade de exportar para Excel) - 
    Listagem de pessoas que demonstraram interesse, com possibilidade de definir status (Atendido, Pago, Retirado)
  - **Listagem de Visitantes** - google ads do aplicativo - 
    Resumo de visitas no estande virtual e produtos

## 3. AVALIAÇÃO
> Tela para Avaliação dos Expositores, conforme categorias pré definidas

## 4. PAINEL TV
> Tela para exibir no Projetor/TV durante o evento, mostrando expositores, fotos, patrocinadores, Propaganda da Escola, Sorteios

- Carrosel Expositores (aplicar temporizador baseado no rank de curtidas, melhores rankeados ficam alguns segundos a mais, mas todos aparecem)
- Carrosel de Fotos/Comentarios [PD3]
- Carrosel de Patrocinadores
- Marketing Escola [PD4]
- Sorteios [PD1][PD2]
- Avisos em Geral


## 5. ADMINISTRAÇÃO DO EVENTO
> Tela para gerenciar informações do evento por parte da escola

- Cadastrar Expositores e seus usuários, resetar senha de usuários
- Cadastrar Fotos e Videos de divulgação
- Cadastrar Avaliadores
- Cadastrar Categorias de Avaliação de Expositores
- Moderação de fotos e comentarios **(comum para Administração Geral e Administração do Evento)**
- Cadastrar Avisos para exibir no telão **(comum para Administração Geral e Administração do Evento)**
- Definir pesos de avaliação por perfil (Participante, Expositor e Avaliador)
- Administração do painel TV (telão)
- Cadastro de Marketing para o telão [PD4]

## 6. ADMINISTRAÇÃO GERAL
> Tela para cadastro de novo evento, definição de configurações gerais

- Criar Evento
- Demais configurações
- Moderação de Fotos e comentarios **(comum para Administração Geral e Administração do Evento)**
- Cadastrar Avisos para exibir no telão **(comum para Administração Geral e Administração do Evento)**

## 7. MODERAÇÃO DE FOTOS E COMENTARIOS

## 8. CADASTRO DE AVISOS
> Possibilitar exibir mensagens diversas via tela propria, com imagem de fundo e icones, dando flexibilidade ao organizador para uma eventual necessidade
Exemplos: 
- Proprietario do veiculo placa ABC1234 favor dirigir-se ao veiculo.
- Atenção ganhador do sorteio do kit velas aromaticas, valor dirigir-se ao estande para receber seu premio.
- Oferta especial - Estande de Pamonha com desconto de 50%, aproveite!!
- 30 minutos para o fim da feira, aproveite para adquirir produtos com desconto!!

## 9. ADMINISTRAÇÃO DO PAINEL TV (TELÃO)
> Define o que esta sendo exibido.

- Feed da feira - carrosel gerado pelo aplicativo;
- Sorteio - Interrompe carrosel de feed e exibe sorteio
- Avisos - interrompe carrosel de feed e exibe aviso

# DÚVIDAS
- [D1] - Verificar viabilidade tecnica de integração do app com o instagram
- [D2] - Possibilidade desse relatorio gerar alguma relevancia no rank de expositores
- [D3] - Verificar qual o melhor leiaute para organizar as informações (abas laterais, feed continuo, botões no topo...)
- [D4] - Musica de fundo talvez, para tocar no evento?
- ~~[D5] - Definição da tela de sorteio pendente... (cadastro de brindes, listagem de participantes registrados)~~ ✅ **Resolvido** — Prêmios cadastrados antecipadamente (`raffle_prizes`), fluxo de sorteio via EventAdmin, animação no telão

# REGRAS DE NEGOCIO

- [RN1] ~~Participantes da feira só poderão comentar e avaliar o mesmo expositor uma quantidade x (definida no painel de administração do evento)~~ ✅ **Backend resolvido** — UNIQUE(exhibitor_id, user_id) na tabela `evaluations` garante 1 avaliação por participante por expositor. ⏳ **UI pendente** — tela de avaliação do público não implementada (ver [PD5])
- [RN2] ~~Avaliações terão diferentes pesos e categorias, a ser definidas via Administração do Evento~~ ✅ **Resolvido** — `evaluation_categories.weight` + `events.public/juror_evaluation_weight`; CRUD + controles de status (encerrar/publicar) implementados na aba Config. Avaliação do EventAdmin.
- [RN3] Participantes que registram avaliação são registrados em uma tabela para concorrer aos sorteios — ⚠️ **Não conectado** — tabela `raffle_tickets` e `raffleService.ensureRaffleTicket()` existem, mas nenhum código chama `ensureRaffleTicket` após `submitEvaluation`. O vínculo avaliação→ticket ainda não está implementado

# PENDENCIA DE VIABILIDADE TECNICA

- [PVT1] ~~Identificar logins unicos na plataforma para evitar flood de comentarios e curtidas, descaracterizando ranking enviado pelos participantes da feira~~ ✅ **Resolvido** — Supabase Auth unificado (Google OAuth + Magic Link) com validação por email; UNIQUE constraints no banco impedem duplicatas
- ~~[PVT2] Registrar visitas aos expositores e seus produtos, estilo google analytics, registrar no banco e permitir consulta por expositores e possibilidade de gerar rank baseado nesse indicador de visitas~~ ✅ **Resolvido** — `trackVisit()` instrumentado nos cliques do feed (expositor, produto, instagram, whatsapp, site, lead, share). Aba "Visitas" com analytics disponível no painel admin e portal do expositor.
- [PVT3] **Analytics de Parceiros** — a aba "Visualização" do painel de Parceiros não tem fonte de dados: a tabela `visits` só rastreia `exhibitor_id`/`product_id`, não parceiros. Para popular a aba é preciso estender `visits` (ex.: `partner_id` + ações de clique) e instrumentar os cliques nos parceiros do feed. ❌ Não implementado (aba exibe placeholder)

# PENDENTE DE DEFINIÇÃO

- ~~[PD1] Tela de sorteios~~ ✅ **Implementado** — CRUD de prêmios no EventAdmin (aba Sorteio), picker de produto por expositor, controles de telão (Mostrar prêmio → Sortear!), animação de tambor giratório no TVView com revelação do ganhador. Ganhador persistido em `raffle_prizes.winner_ticket_id` + histórico consultável.
- [PD2] ~~Regra para sorteios~~ ✅ **Backend resolvido** — Modelo simplificado: 1 único ticket por participante por evento. UNIQUE(event_id, user_id) na tabela `raffle_tickets`.
- [PD3] Administradores poderão registrar fotos para enriquecer feed?
- [PD4] Criaremos uma tela para marketing da escola?
- [PD5] **Avaliação da comunidade UI** — backend pronto (`evaluations` com 1-5 estrelas + comentário, UNIQUE por usuário/expositor). Falta a tela de avaliação acessível ao participante durante o evento live (provavelmente no ExhibitorDetailModal ou LiveEventView). O card do avaliador já exibe resumo agregado dos dados existentes.
- [PD6] **Ranking no pós-evento** — `events.evaluation_status = 'published'` sinaliza que o ranking deve ser exibido. Falta consumir `view_exhibitor_rankings` na `PostEventView` quando status = published. Definir layout: lista rankeada simples, pódio top-3, ou tabela completa.

---

# REVIEW TÉCNICA — 2026-05-13

## Status de Implementação por Feature

| Feature | Status | Observação |
|---------|--------|------------|
| Feed — Redesign v2 (layout novo) | ✅ Implementado | PreEventView/LiveEventView/PostEventView reescritos com novo design (ExhibitorCard 3 tamanhos, ExhibitorList com filtro por categoria + toggle de tamanho, ExhibitorDetailModal, EventWelcomeModal) |
| Feed — Expositores + catálogo | ✅ Implementado | ExhibitorDetailModal como primeira tela (hero, stats, fotos de produtos, integrantes); abre ExhibitorCatalogModal internamente via botão "Confira o catálogo" |
| Feed — Boas-vindas (splash) | ✅ Implementado | EventWelcomeModal: exibe foto/texto do evento por 5s na abertura, uma vez por sessão (sessionStorage) |
| Feed — Fotos dos participantes | ✅ Implementado | Ainda na tabela `photos` legada |
| Feed — Patrocinadores | ✅ Implementado | Tabela dedicada `sponsors`, carrossel de fotos, dados do banco |
| Feed — Contador pré-evento responsivo | ✅ Implementado | Ajustado para mobile |
| Feed — Registro de clicks/visitas | ✅ Implementado | `trackVisit()` instrumentado nos cliques do feed; aba Visitas no painel admin e portal do expositor |
| Feed — Sorteios | 🔶 Parcial | Ticket criado por participante ok; vínculo avaliação→ticket [RN3] ainda não implementado |
| Expositores — CRUD + produtos + usuários | ✅ Implementado | Painel admin `/expositores/:slug` |
| Expositores — Foto do stand (photo_url) | ✅ Implementado | Upload no painel admin e portal do expositor |
| Expositores — Leads de pré-venda | ✅ Implementado | Status (novo/atendido/pago/retirado) + exportação CSV/Excel. Aba renomeada para "Interessados" no painel admin e portal do expositor |
| Expositores — Categoria | ✅ Implementado | Tabela dedicada `exhibitor_categories` (id, event_id, name, icon, color, order_index) substituindo array legado em `events.exhibitor_categories`. CRUD completo no EventAdmin. FK `category_id` na tabela `exhibitors`. Combobox no cadastro admin e portal do expositor |
| Expositores — Campos escolares (tagline/ano/turma/integrantes) | ✅ Implementado | `tagline` (50 chars, exibida no card médio e no detalhe), `ano`, `turma`, `members` (JSON array de nomes). CRUD no painel admin e portal do expositor. Seção "Integrantes" em pills no ExhibitorDetailModal |
| Parceiros — Painel unificado | ✅ Implementado | `/parceiros/:slug` (ex-`/patrocinadores`). Unifica Patrocinador/Apoiador/Serviço via campo `type`. Abas Dados/Fotos/Contatos Marketing/Visualização. Tabela `partners` (ex-`sponsors`). Campos internos: contato, valor do patrocínio. Flags MostraTelão/MostraFeed |
| Apoiadores - Parceiros que não pagam | ✅ Implementado | Absorvido pela tela de Parceiros (tipo `apoiador`) |
| Serviços | ✅ Implementado | Absorvido pela tela de Parceiros (tipo `servico`) |
| Parceiros — filtro MostraFeed no feed público | ❌ Não implementado | Flag `show_on_feed` é salva mas o feed (Pre/Live/Post) ainda exibe todos; falta aplicar o filtro |
| Parceiros — Analytics (aba Visualização) | ❌ Não implementado | Ver [PVT3] — sem fonte de dados (visits não rastreia parceiros) |
| Relatório financeiro do evento (valor de patrocínio) | ❌ Não implementado | `partners.sponsorship_value` já é capturado; falta tela/exportação do relatório financeiro |
| Perfil Expositor (portal dedicado) | ✅ Implementado | `/expositor` com Supabase Auth |
| Perfil EventAdmin | ✅ Implementado | Portal `/eventadmin` dedicado (substitui acúmulo no Admin). Acesso completo às telas do evento: moderação, expositores e parceiros. Botão voltar nessas telas redireciona para `/eventadmin` |
| Perfil Avaliador | ✅ implementado | via cadastro de usuarios |
| Sistema de Avaliação | 🔶 Backend pronto, UI pendente | Tabelas + `evaluationService` + view de ranking ok; falta módulo `src/features/evaluation/` |
| Painel TV — Fotos + Rankings | ✅ Implementado | Ranking por curtidas; ranking ponderado (`view_exhibitor_rankings`) ainda não exibido na TV |
| Painel TV — Carrossel expositores | ❌ Não implementado | |
| Painel TV — Sorteios | ✅ Implementado | Overlay `showing_prize` (foto do prêmio em tela cheia) + `showing_winner` (tambor giratório com nomes dos participantes, para no ganhador). Estado controlado por `tv_raffle_state` + `tv_raffle_prize_id` em `events` via realtime |
| Painel TV — Avisos | ✅ Implementado | Sino premium sintetizado (5 presets via Web Audio API) e reprodução de áudios customizados (upload de até 3 arquivos R2 por evento), com exibição reativa em tela cheia com Framer Motion e autoplay bypass. Áudio interrompido (`.pause()`) quando o aviso some |
| Painel TV — Parceiros | ❌ Não implementado | Cadastro unificado pronto (`partners` + flag `show_on_tv`); falta o carrossel na TV consumir a flag |
| Administração Geral — Dashboard redesenhado | ✅ Implementado | Full-width, botão '+' inline, EventCard com ícones. Painel de usuários oculta participantes por padrão (toggle "Mostrar participantes") |
| Administração do Evento — base | ✅ Implementado | |
| Tela de Administração do Evento (`/eventadmin`) | ✅ Implementado | Seção fixa de controles + acordeons (Dashboard, Configurações com 8 abas). Acesso: admin geral (engrenagem do card → `/eventadmin/:slug`) e event_admin (tela de entrada). Abas Dados/Aparência/Configurações/Avaliação/Sorteio funcionais; Relatórios/Marketing em branco |
| Auditoria de alterações do evento | ✅ Implementado | Tabela `audit_logs` + `auditService`; registra autor e diff (antes/depois) de edições e mudanças de fase. Visível na aba Auditoria com modal de detalhes |
| Dashboard de métricas do evento | ✅ Implementado | Seção Dashboard do `/eventadmin`: Métricas Gerais (previstos vs cadastrados, média produtos/expositor, média valor produto, completos/incompletos, visitas únicas/total por fase) + Visitas (top/bottom 10 expositores e produtos, pizza por categoria). Gráficos CSS/SVG. ⚠️ Visitas zeradas até `trackVisit()` ser instrumentado [PVT2] |
| Config de pesos de avaliação (EventAdmin) | ✅ Implementado | Campos Peso Avaliação Visitantes/Jurados (`public/juror_evaluation_weight`) com validação soma ≤ 1, + Expositores Previstos (`exhibitors_estimation`) |
| Visitas — coluna de fase (pre/live/post) | ✅ Backend pronto | `visits.event_status` + `trackVisit(eventStatus)` prontos; falta instrumentar os cliques [PVT2] |
| Administração do Evento — Avaliadores/Categorias/Pesos | 🔶 Backend pronto, UI pendente | CRUD de categorias/pesos in `evaluationService`; falta tela de cadastro |
| Sistema de Sorteios | ✅ Implementado | `raffle_prizes` (nova tabela) com CRUD no EventAdmin, picker de produto por expositor (nome/descrição/foto do produto), `drawPrize()` persiste ganhador, `setTvRaffleState()` controla telão. Vínculo avaliação→ticket [RN3] ainda pendente |
| Sistema de Avaliação | 🔶 Backend pronto, UI pendente | Duplicado da linha acima; backend ok, UI pendente |
| Cadastro de Avisos | ✅ Implementado | Módulo completo com CRUD no Admin, biblioteca de upload de sons no R2 (máx. 3 por evento), dropdown seletor de áudio (silencioso/synth/custom) e envio realtime inteligente |
| Moderação fotos e comentários | ✅ Implementado | |

## Login via Magic Link (participantes)

> Definido em reunião de 2026-05-19 como substituto/complemento ao Google OAuth para participantes.

| Item | Status |
|------|--------|
| `authService.ts` — suporte a OTP | ✅ Resolvido — `loginWithMagicLink` ativo |
| Modal de login em `EventPage.tsx` | ✅ Resolvido — Campo de e-mail e Google integrados no modal do feed |
| Supabase `signInWithOtp({ email })` | ✅ Resolvido — Integrado no service e nos fluxos de login |
| Handler de retorno da magic link URL | ✅ Resolvido — Supabase Auth client gerencia tokens de retorno automaticamente no AuthProvider |
| Hook de auth para participantes via Supabase | ✅ Resolvido — Integrado ao `useAuth.ts` |

**Implementado:**
1. Banner do Feed atualizado para "Acessar com E-mail ou Google", indicando explicitamente a opção sem login externo.
2. Novo modal de login unificado contendo o campo de e-mail integrado para disparo de OTP (Magic Link).
3. Resgate automático de sessão de retorno via Supabase no `AuthProvider` na inicialização do aplicativo.
4. Identificação segura e normalização de dados do visitante associado ao evento.

**Motivação:** evitar dependência exclusiva do Google OAuth, que pode restringir acesso a alguns visitantes. Magic link cobre quem não tem conta Google ou prefere não usar.

---

## Dúvidas — Recomendação de Encerramento

| Item | Recomendação |
|------|-------------|
| [D1] Integração Instagram | **Descartar** — API do Instagram requer Meta Business Verification, inviável |
| [D2] Relatório de visitas no rank | Manter aberto — depende de [PVT2] |
| [D3] Layout do feed | ✅ **Resolvido** — Novo design implementado: abas (Fotos/Expositores/Patrocinadores) no Live, cards em 3 tamanhos com filtro por categoria, layout pós-evento em seções verticais |
| [D4] Música de fundo | **Descartar** — autoplay de áudio é bloqueado por padrão em todos os browsers modernos |
| [D5] Tela de sorteio | Manter aberto — depende de [PD1][PD2] |

## Configuração de Auth (pendente — com o outro desenvolvedor)

| Item | Status | Responsável |
|------|--------|-------------|
| Habilitar Google OAuth no Supabase (Authentication → Providers → Google) | ⏳ Pendente | Outro dev |
| Criar credenciais OAuth no Google Cloud Console e vincular ao Supabase | ⏳ Pendente | Outro dev |
| Adicionar `VITE_BETA_MODE=false` em `.env.local` de produção ao ativar OAuth | ⏳ Pendente | Outro dev |
| Aplicar migration `20260520000000_unified_auth.sql` no banco | ⏳ Pendente | — |
| Seed do primeiro admin: INSERT em `user_email_roles` com role='admin' e email do admin geral | ⏳ Pendente | — |

> **Enquanto OAuth não está configurado:** use `VITE_BETA_MODE=true` em `.env.local`.
> O modo beta aceita qualquer e-mail, verifica se o usuário existe em `users`, aplica a role cadastrada em `user_email_roles` ou cria com role `participant`. Nenhuma senha ou verificação de e-mail é necessária.

---

## Ajuste de Schema Necessário (antes de ir para produção)

- ~~Tabela `leads`: adicionar campo `status ENUM('novo','atendido','pago','retirado') DEFAULT 'novo'`~~ ✅ Feito (migration 20260518000000_leads_status.sql)
- ~~Tabela `sponsors`~~: ✅ Criada (migration 20260519000000_sponsors.sql)
- ~~Tabelas de avaliação e sorteio~~: ✅ Criadas (migration 20260522000000_evaluations_and_analytics.sql) — `evaluation_categories`, `evaluations`, `juror_evaluations`, `raffle_tickets`, `visits`, `view_exhibitor_rankings`
- ~~Decisões de [PD2] e [RN2]~~: ✅ Definidas e implementadas
- ~~Tabela `raffle_prizes` e campos `tv_raffle_prize_id`/`tv_raffle_state` em `events`~~: ✅ Criados (migration `20260602000000_raffle_prizes.sql`) — prêmios com nome, descrição, foto, ordem, ganhador e timestamp do sorteio

---

# DIVISÃO DE TRABALHO — 2 PROGRAMADORES

> Estratégia: dividir por **eixo de produto**, não por tipo de arquivo.
> Cada eixo tem domínio claro sobre suas features e arquivos, minimizando conflitos de merge.

## Dev A — Eixo "Feed & Participante"
> Responsável pela experiência do participante na tela do evento.

**Features:**
- Decisão e implementação do novo layout do feed [D3] — pré / live / post
- Sistema de Avaliação de Expositores (novo módulo completo)
- Tickets de sorteio vinculados a avaliações [PD2][RN3]

> ⚠️ Pendente definição de [D3] (layout), [RN2] (pesos/categorias de avaliação) e [PD2] (regra de sorteio)

**Arquivos de domínio exclusivo (Dev A):**
```
src/features/event/components/LiveEventView.tsx
src/features/event/components/PreEventView.tsx
src/features/event/components/PostEventView.tsx
src/features/event/components/Feed/
src/features/event/hooks/
src/features/evaluation/          ← novo módulo, criar do zero
supabase/migrations/*_evaluation* ← migrations de avaliação
```

---

## Dev B — Eixo "Expositor & Backoffice"
> Responsável pela experiência do expositor e das telas de administração/telão.

**Features:**
- ~~Status do lead (Atendido/Pago/Retirado) + exportação Excel~~ ✅ Feito
- ~~Painel de Patrocinadores~~ ✅ Feito (fora da divisão original)
- ~~Foto do stand (photo_url) no painel e portal~~ ✅ Feito
- Analytics de visitas ao stand [PVT2] — ver `docs/analytics-visitas.md` para plano completo de implementação
- Cadastro de Avisos para o telão (Feature #8)
- Painel TV expandido: carrossel expositores por rank, exibição de avisos (Feature #9)
- Administração do Evento: cadastro de Avaliadores, Categorias e Pesos

**Arquivos de domínio exclusivo (Dev B):**
```
src/features/exhibitors/ExhibitorPanel.tsx
src/features/exhibitor/ExhibitorPortal.tsx
src/services/leadService.ts
src/services/exhibitorService.ts
src/features/tv/TVView.tsx
src/features/announcements/       ← novo módulo, criar do zero
supabase/migrations/*_leads*      ← migration de status
supabase/migrations/*_visits*     ← migration de analytics
```

---

## Arquivos Compartilhados — Coordenar via PR

Estes arquivos serão alterados pelos dois. Combinar quem faz cada PR e na qual ordem:

| Arquivo | Motivo | Recomendação |
|---------|--------|--------------|
| `src/types/index.ts` | Dev A adiciona tipos de Avaliação; Dev B adiciona status de Lead e Visit | Cada um abre PR separado; revisar antes de fazer merge do segundo |
| `src/App.tsx` | Novas rotas de Avaliação (Dev A) e Avisos/Admin (Dev B) | Merge sequencial — um PR de cada vez |
| `supabase/migrations/` | Migrations têm ordem numérica e dependência entre si | Coordenar numeração antes de iniciar; nunca criar migration com mesmo timestamp |
| `CLAUDE.md` | Documentação atualizada por ambos | Atualizar no final de cada PR, não durante |

## Fluxo de Branch Sugerido

```
main
 ├── feature/feed-layout-participante     (Dev A)
 ├── feature/sistema-avaliacao            (Dev A)
 ├── feature/lead-status-excel            (Dev B)
 ├── feature/analytics-visitas            (Dev B)
 ├── feature/avisos-telao                 (Dev B)
 └── feature/tv-carrossel-expositores     (Dev B)
```

Cada branch é independente. PRs para `main` com review cruzado antes do merge.
