# Analytics de Visitas — Planejamento

## Objetivo

Rastrear visitas e interações de cada visitante durante o evento, identificando visitantes únicos, tempo de permanência e comportamento de navegação — com ou sem login. Registrar ações qualificadoras para elegibilidade em sorteios, com sistema de tickets ponderados por engajamento.

---

## Identidade do Visitante

| Dado | Como é gerado | Onde é armazenado | Persistência |
|------|--------------|-------------------|--------------|
| `visitor_id` | UUID gerado no primeiro acesso ao app | `localStorage` | Permanente por browser (sem expiração automática) |
| `user_id` | Firebase UID após login com email/magic link | Tabela `users` (Supabase) | Permanente |
| `session_id` | UUID com timeout de 30 min de inatividade | `sessionStorage` + timestamp | Enquanto a sessão estiver ativa |

### visitor_id

- Gerado uma única vez por browser e salvo no `localStorage`
- Sobrevive a reloads e fechamento de abas, some apenas se o usuário limpar o cache
- É o identificador de **visitante único** para quem não faz login
- No modo incógnito/privado, um novo `visitor_id` é gerado a cada sessão

### session_id com idle timeout

Inspirado no modelo do Google Analytics:

- Um novo `session_id` é criado no primeiro acesso
- A cada interação/navegação, o timestamp de última atividade é atualizado
- Se o usuário ficar **30 minutos sem interagir** (celular no bolso, outra aba, etc.), a próxima ação gera um novo `session_id`
- Isso evita que uma visita de horas figure como uma única sessão

```
Usuário abre o app às 10h       → session_id: AAA
Visita 3 stands                 → session_id: AAA (mesma sessão)
Guarda o celular no bolso       → idle...
Volta ao app às 11h (> 30 min)  → session_id: BBB (nova sessão)
```

### Associação visitante anônimo → usuário identificado

Quando o visitante faz login, o `visitor_id` do browser é vinculado ao `user_id` (Firebase UID → email). Todas as visitas registradas anonimamente antes do login são retroativamente associadas ao email.

```
[Anônimo]  visitor_id: XYZ → visita stand A, produto B
    ↓
[Login]    visitor_id: XYZ + user_id: 123 (email: joao@email.com)
    ↓
[Relatório] Stand A foi visitado por joao@email.com
```

---

## Login

Método adotado: **email com magic link** (Supabase Auth nativo).

Motivo: evitar dependência exclusiva do Google OAuth, que pode restringir acesso a alguns visitantes.

---

## Modelo de Dados — Tabela `analytics_visits`

```sql
CREATE TABLE analytics_visits (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE,
  visitor_id   text NOT NULL,
  user_id      uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id   text NOT NULL,
  entity_type  text NOT NULL CHECK (entity_type IN ('event', 'exhibitor', 'product', 'sponsor', 'service')),
  entity_id    text NOT NULL,  -- text (não uuid) para suportar serviços sem tabela ainda
  entered_at   timestamptz DEFAULT now(),
  duration_sec int,
  device_type  text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  referrer     text
);
```

| Campo | Descrição |
|-------|-----------|
| `visitor_id` | UUID do browser (localStorage) |
| `user_id` | Preenchido se o visitante estava logado, ou após associação no login |
| `session_id` | UUID da sessão com idle timeout de 30 min |
| `entity_type` | O que foi visitado: o evento em si, um stand ou um produto |
| `entity_id` | ID do stand ou produto visitado |
| `entered_at` | Timestamp de entrada |
| `duration_sec` | Segundos até sair. `null` se o usuário saiu abruptamente (fechou o app) |
| `device_type` | Detectado via `navigator.userAgent` |
| `referrer` | `document.referrer` — de onde o visitante veio |

---

## Relatórios Extraíveis

### Por stand (expositor)

| Relatório | Query base |
|-----------|-----------|
| Total de visitas | `COUNT(*)` WHERE `entity_type = 'exhibitor'` AND `entity_id = X` |
| Visitantes únicos | `COUNT(DISTINCT visitor_id)` |
| Visitantes identificados (com email) | `COUNT(DISTINCT user_id)` WHERE `user_id IS NOT NULL` |
| Tempo médio de permanência | `AVG(duration_sec)` |
| Horário de pico | `GROUP BY DATE_TRUNC('hour', entered_at)` |
| Ranking de stands mais visitados | `GROUP BY entity_id ORDER BY COUNT(*) DESC` |
| Taxa de retorno | `visitor_id`s que aparecem mais de uma vez no mesmo stand |

### Por produto

| Relatório | Query base |
|-----------|-----------|
| Produtos mais visualizados | `COUNT(*) WHERE entity_type = 'product' GROUP BY entity_id` |
| Taxa de conversão em pré-venda | Cruzar `analytics_visits` com tabela `leads` pelo `entity_id` (product_id) |

### Por visitante

| Relatório | Como |
|-----------|------|
| Histórico de navegação | Todas as linhas do `visitor_id` ordenadas por `entered_at` |
| Stands visitados por email | JOIN com `users` pelo `user_id` |
| Visitou o mesmo stand mais de uma vez? | `COUNT(*) > 1` para o par `visitor_id + entity_id` |
| Quantas sessões gerou | `COUNT(DISTINCT session_id)` por `visitor_id` |

### Visão geral do evento

| Relatório | Query base |
|-----------|-----------|
| Visitantes únicos totais | `COUNT(DISTINCT visitor_id)` |
| Identificados vs. anônimos | `COUNT DISTINCT` com e sem `user_id` |
| Breakdown por device | `GROUP BY device_type` |
| Curva de acessos ao longo do tempo | `GROUP BY DATE_TRUNC('hour', entered_at)` |
| Taxa de conversão de login | Visitantes que tinham `user_id IS NULL` e passaram a ter |

---

## Mapa Completo de Eventos Rastreados

### Visão geral

| # | Evento | Tabela | Já existe? | Logado obrigatório | Conta no sorteio |
|---|--------|--------|------------|-------------------|-----------------|
| 1 | Abriu página do evento | `analytics_visits` | Não | Não | Não |
| 2 | Abriu modal de stand | `analytics_visits` | Não | Não | Não |
| 3 | Visualizou produto | `analytics_visits` | Não | Não | Não |
| 4 | Abriu modal de patrocinador | `analytics_visits` | Não | Não | Não |
| 5 | Abriu modal de serviço | `analytics_visits` | Não | Não | Não |
| 6 | Confirmou visita a stand | `stand_checkins` | Não | **Sim** | **Sim** |
| 7 | Postou foto aprovada | `posts` / `photos` | **Sim** | **Sim** | **Sim** |
| 8 | Registrou interesse em produto | `leads` | **Sim** | Não* | **Sim** |
| 9 | Clicou em link de stand | `analytics_events` | Não | Não | **Sim** |
| 10 | Clicou em link de patrocinador | `analytics_events` | Não | Não | **Sim** |
| 11 | Clicou em link de serviço | `analytics_events` | Não | Não | **Sim** |
| 12 | Compartilhou o evento | `analytics_events` | Não | Não | **Sim** |
| 13 | Reagiu a uma foto | `reactions` | **Sim** | **Sim** | **Sim** |

*Leads registram `customer_name` e `customer_phone` mas não têm `user_id` — ver nota abaixo.

### Nota sobre leads e sorteio

A tabela `leads` atual armazena nome e telefone do visitante, mas não o `user_id`. Para habilitar leads no sorteio será necessário ou:
- Adicionar campo `user_id` (nullable) ao criar o lead quando o visitante estiver logado, ou
- Cruzar pelo `visitor_id` — menos confiável, mas possível

### Nota sobre patrocinadores e serviços

| Entidade | Status atual | `entity_id` disponível |
|----------|-------------|------------------------|
| Patrocinadores | Tabela `sponsors` própria com UUID | Sim — `sponsor.id` |
| Serviços | JSON legado em `events.services[]` | Parcial — `ExhibitorSponsor.id` (string, não UUID formal) |

Serviços precisarão de tabela dedicada (similar à `sponsors`) para rastreamento ideal. Enquanto isso, o `id` do JSON pode ser usado como identificador textual em `entity_id` com a ressalva de não ter FK garantida.

### Tabela nova: `analytics_events`

Para os eventos 7 (clique em link) e 8 (compartilhamento) que não têm tabela própria:

```sql
CREATE TABLE analytics_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  visitor_id   text NOT NULL,
  user_id      uuid REFERENCES users(id) ON DELETE SET NULL,
  session_id   text NOT NULL,
  event_type   text NOT NULL CHECK (event_type IN ('link_click', 'share')),
  metadata     jsonb,          -- ex: {"link_type": "instagram", "exhibitor_id": "..."}
  occurred_at  timestamptz DEFAULT now()
);
```

O campo `metadata` armazena detalhes flexíveis sem precisar de colunas fixas para cada variação:
- Link click de stand: `{ "entity_type": "exhibitor", "entity_id": "...", "link_type": "instagram" | "whatsapp" | "website" }`
- Link click de patrocinador: `{ "entity_type": "sponsor", "entity_id": "...", "link_type": "instagram" | "whatsapp" | "website" }`
- Link click de serviço: `{ "entity_type": "service", "entity_id": "...", "link_type": "instagram" | "whatsapp" | "website" }`
- Share: `{ "method": "native" | "copy_link" }`

---

## Sistema de Tickets para Sorteio

Cada tipo de ação elegível gera **1 ticket** no pool. Máximo de **6 tickets** por visitante:

| Ação | Tickets | Observação |
|------|---------|-----------|
| Confirmou visita a stand | +1 | Conta uma vez por evento (independente de quantos stands) |
| Postou foto aprovada | +1 | Conta uma vez por evento (independente de quantas fotos) |
| Registrou interesse em produto | +1 | Requer `user_id` no lead |
| Clicou em link de stand | +1 | Conta uma vez por evento |
| Compartilhou o evento | +1 | Conta uma vez por evento |
| Reagiu a uma foto | +1 | Conta uma vez por evento |

> A contagem é **binária por ação** (fez ou não fez), não acumula por repetição. Quem avaliou 5 stands ainda tem 1 ticket por esse critério.

### Query do pool completo de sorteio

```sql
WITH eligible AS (
  -- 1. Confirmou visita a stand
  SELECT DISTINCT user_id FROM stand_checkins WHERE event_id = 'EVT'
  UNION ALL
  -- 2. Postou foto aprovada
  SELECT DISTINCT user_id FROM posts WHERE event_id = 'EVT' AND status = 'approved' AND user_id IS NOT NULL
  UNION ALL
  -- 3. Registrou interesse em produto (requer user_id no lead)
  SELECT DISTINCT user_id FROM leads WHERE event_id = 'EVT' AND user_id IS NOT NULL
  UNION ALL
  -- 4. Clicou em link de stand
  SELECT DISTINCT user_id FROM analytics_events WHERE event_id = 'EVT' AND event_type = 'link_click' AND user_id IS NOT NULL
  UNION ALL
  -- 5. Compartilhou o evento
  SELECT DISTINCT user_id FROM analytics_events WHERE event_id = 'EVT' AND event_type = 'share' AND user_id IS NOT NULL
  UNION ALL
  -- 6. Reagiu a uma foto
  SELECT DISTINCT user_id FROM reactions r
  JOIN posts p ON p.id = r.post_id
  WHERE p.event_id = 'EVT'
)
SELECT
  u.email,
  u.display_name,
  COUNT(*) AS tickets
FROM eligible e
JOIN users u ON u.id = e.user_id
GROUP BY u.id, u.email, u.display_name
ORDER BY tickets DESC;
```

Para sortear: adicionar `ORDER BY RANDOM() LIMIT 1` na query do pool sem o `GROUP BY`.

---

## Plano de Implementação

> **Sequência definida:** implementar as páginas pendentes do app primeiro, depois aplicar o analytics em todas de uma vez. Isso evita integrações parciais e garante que todos os modais (patrocinador, serviço) já existam no momento da integração.

### Pré-requisito: páginas a criar antes da implementação do analytics

| Página / Modal | Motivo |
|----------------|--------|
| Modal de patrocinador | `entity_type: 'sponsor'` precisa do modal para rastrear abertura e links |
| Modal / card de serviço | `entity_type: 'service'` idem |
| Botão de compartilhamento do evento | Necessário para rastrear `share` em `analytics_events` |

---

### Banco de dados — 4 alterações

| # | Tipo | Descrição |
|---|------|-----------|
| 1 | Nova tabela | `analytics_visits` — visitas com duração (ver DDL acima) |
| 2 | Nova tabela | `analytics_events` — ações discretas: link_click, share (ver DDL acima) |
| 3 | Nova tabela | `stand_checkins` — confirmações de visita para sorteio (ver DDL abaixo) |
| 4 | Nova coluna | `leads.user_id uuid NULL REFERENCES users(id)` — habilita leads no sorteio |

---

### Arquivos novos — 5

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/utils/session.ts` | `getVisitorId()` (localStorage sem expiração), `getSessionId()` (idle 30min), `getDeviceType()` |
| `src/services/analyticsService.ts` | `trackVisit()`, `endVisit()` (fetch keepalive), `associateVisitorToUser()`, `trackEvent()` |
| `src/services/checkinService.ts` | `confirmCheckin()`, `getCheckin()` (idempotente), `listEligible()` |
| `src/hooks/useVisitTracker.ts` | Registra entrada no mount, calcula `duration_sec` no unmount (fire and forget) |
| `src/hooks/useStandCheckin.ts` | Estado do check-in + ação de confirmar visita |

---

### Arquivos modificados — 6

| Arquivo | O que muda |
|---------|-----------|
| `src/hooks/useAuth.ts` | Chamar `associateVisitorToUser(uid)` no `onAuthStateChanged` quando usuário loga |
| `src/services/leadService.ts` | Aceitar `user_id?: string` em `createLead()` e incluir no insert quando disponível |
| `src/types/index.ts` | Adicionar `user_id?: string` à interface `Lead` |
| `src/features/event/components/SocialLinks.tsx` | Adicionar prop `onLinkClick?: (type: 'instagram' \| 'whatsapp' \| 'website') => void` — chamada no onClick de cada link |
| `src/features/event/components/PartnerSection.tsx` | Receber `entityType?` e `entityId?` — repassar para `SocialLinks`; props opcionais para não quebrar contextos sem tracking |
| `src/features/event/components/ExhibitorCatalogModal.tsx` | Usar `useVisitTracker` na abertura, `useStandCheckin` para o botão "Confirmar visita", receber `user` como prop |

---

### Pontos de integração por evento rastreado

| Evento | Arquivo de integração |
|--------|----------------------|
| Visita à página do evento | `EventPage.tsx` via `useVisitTracker` |
| Abertura de modal de stand | `ExhibitorCatalogModal.tsx` via `useVisitTracker` |
| Visualização de produto | `ExhibitorCatalogModal.tsx` via `useVisitTracker` |
| Abertura de modal de patrocinador | Modal de patrocinador (a criar) via `useVisitTracker` |
| Abertura de modal de serviço | Modal de serviço (a criar) via `useVisitTracker` |
| Confirmação de visita a stand | `ExhibitorCatalogModal.tsx` via `useStandCheckin` |
| Clique em link de stand | `SocialLinks.tsx` via `onLinkClick` → `analyticsService.trackEvent()` |
| Clique em link de patrocinador | `SocialLinks.tsx` via `onLinkClick` → `analyticsService.trackEvent()` |
| Clique em link de serviço | `SocialLinks.tsx` via `onLinkClick` → `analyticsService.trackEvent()` |
| Compartilhamento do evento | Botão de share (a criar) → `analyticsService.trackEvent()` |
| Reação a foto | `reactions` — já existe, sem mudança, entra só na query do sorteio |
| Interesse em produto (lead) | `leadService.ts` — adicionar `user_id` no insert |
| Postagem de foto | `posts` / `photos` — já existe, sem mudança, entra só na query do sorteio |

---

### Nota de performance

Todas as chamadas de analytics devem ser **fire and forget** — nunca `await` no caminho de renderização. O `endVisit()` usa `fetch` com `keepalive: true` para garantir envio mesmo quando o componente desmonta abruptamente.

---

## Sorteios — Confirmação de Visita a Stands

### Regra de negócio

- Visitante **precisa estar logado** (email identificado) para concorrer
- Basta confirmar visita a **pelo menos 1 stand** para ser elegível
- Não há nota ou avaliação qualitativa — é um check-in simples
- Um visitante só pode confirmar visita ao mesmo stand **uma vez**

### Tabela: `stand_checkins`

```sql
CREATE TABLE stand_checkins (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id     uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  visitor_id   text NOT NULL,
  checked_in_at timestamptz DEFAULT now(),

  UNIQUE (user_id, exhibitor_id)  -- um check-in por stand por usuário
);
```

| Campo | Descrição |
|-------|-----------|
| `user_id` | Obrigatório — só usuários logados podem confirmar visita |
| `visitor_id` | Registrado também para cruzar com `analytics_visits` |
| `checked_in_at` | Timestamp do momento da confirmação |
| `UNIQUE (user_id, exhibitor_id)` | Impede check-in duplicado no mesmo stand |

### Fluxo de UX

```
Visitante abre o modal do stand (ExhibitorCatalogModal)
    ↓
Botão "Confirmar visita" visível apenas se logado
    ↓
Um clique registra o check-in (sem formulário, sem nota)
    ↓
Botão muda para "Visita confirmada ✓" (idempotente)
    ↓
Visitante agora é elegível ao sorteio do evento
```

Se o visitante não estiver logado, o botão exibe "Faça login para confirmar visita" e abre o modal de login.

### Relatórios de Sorteio

| Relatório | Query |
|-----------|-------|
| Lista de elegíveis (confirmaram ao menos 1 stand) | `SELECT DISTINCT user_id FROM stand_checkins WHERE event_id = X` |
| Elegíveis com email | JOIN com `users` pelo `user_id` |
| Quantos stands cada elegível visitou | `COUNT(exhibitor_id) GROUP BY user_id` |
| Ranking de engajamento (mais stands confirmados) | `COUNT(exhibitor_id) GROUP BY user_id ORDER BY COUNT DESC` |
| Stands com mais check-ins | `COUNT(*) GROUP BY exhibitor_id ORDER BY COUNT DESC` |

### Sorteio aleatório de um ganhador (query direta)

```sql
SELECT u.email, u.display_name, COUNT(sc.exhibitor_id) AS stands_visitados
FROM stand_checkins sc
JOIN users u ON u.id = sc.user_id
WHERE sc.event_id = 'ID_DO_EVENTO'
GROUP BY u.id, u.email, u.display_name
ORDER BY RANDOM()
LIMIT 1;
```

---

## Sorteios — Postagem de Fotos

### Regra de negócio

Postar foto durante o evento é um segundo critério de participação no sorteio, independente ou combinado com o check-in em stands.

Isso permite configurar o sorteio de três formas:

| Modalidade | Critério |
|------------|---------|
| Só avaliação | Confirmou visita em ao menos 1 stand |
| Só foto | Postou ao menos 1 foto aprovada durante o evento |
| Tickets duplos | Fez os dois — aparece duas vezes no pool do sorteio |

### Fonte de dados

Fotos já são registradas na tabela `photos` (legado) / `posts` (schema novo). Não é necessária nova tabela — apenas consultar registros vinculados ao `user_id` do visitante dentro do evento.

Critérios da foto para contar no sorteio:
- `event_id` corresponde ao evento
- `status = 'approved'` (foto aprovada pela moderação)
- `user_id` identificado (visitante logado)

### Sistema de Tickets

Cada ação elegível gera **1 ticket** no pool do sorteio. O mesmo visitante pode acumular até **2 tickets**:

```
Confirmou visita em stand  →  +1 ticket
Postou foto aprovada       →  +1 ticket
─────────────────────────────────────────
Máximo por visitante       →   2 tickets
```

Quem tem 2 tickets tem o dobro de chances — sem precisar de campo adicional, apenas gerando 2 linhas no pool antes do sorteio.

### Query do pool de sorteio (tickets ponderados)

```sql
-- Gera o pool com 1 ou 2 entradas por usuário
WITH checkin_eligible AS (
  SELECT DISTINCT user_id
  FROM stand_checkins
  WHERE event_id = 'ID_DO_EVENTO'
),
photo_eligible AS (
  SELECT DISTINCT user_id
  FROM posts           -- ou photos (legado)
  WHERE event_id = 'ID_DO_EVENTO'
    AND status = 'approved'
    AND user_id IS NOT NULL
),
pool AS (
  SELECT user_id FROM checkin_eligible
  UNION ALL
  SELECT user_id FROM photo_eligible
)
SELECT u.email, u.display_name, COUNT(*) AS tickets
FROM pool p
JOIN users u ON u.id = p.user_id
GROUP BY u.id, u.email, u.display_name
ORDER BY tickets DESC;

-- Para sortear: gerar linhas duplicadas e selecionar aleatoriamente
WITH pool AS (
  SELECT user_id FROM stand_checkins WHERE event_id = 'ID_DO_EVENTO'
  UNION ALL
  SELECT user_id FROM posts WHERE event_id = 'ID_DO_EVENTO' AND status = 'approved' AND user_id IS NOT NULL
)
SELECT u.email, u.display_name
FROM pool p
JOIN users u ON u.id = p.user_id
ORDER BY RANDOM()
LIMIT 1;
```

### Relatórios adicionais

| Relatório | Descrição |
|-----------|-----------|
| Quem tem tickets duplos | Aparece em ambas as CTEs (`checkin_eligible` e `photo_eligible`) |
| Fotos postadas por evento (autores únicos) | `COUNT(DISTINCT user_id)` em `posts` WHERE `event_id` e `status = approved` |
| Taxa de postagem | Visitantes que postaram / total de visitantes logados |

---

## Limitações Conhecidas

| Situação | Comportamento |
|----------|---------------|
| Mesmo visitante em dois devices | Dois `visitor_id` distintos — unidos apenas se logar em ambos |
| Modo incógnito | Novo `visitor_id` a cada sessão |
| `duration_sec` null | Ocorre quando o usuário fecha o app sem navegar para outra tela (sem unmount limpo) |
| IP do visitante | Não coletado — exigiria Edge Function; omitido por ora |
