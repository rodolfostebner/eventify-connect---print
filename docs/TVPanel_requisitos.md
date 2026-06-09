# Requisitos — TV Panel (Telão)

> Documento de referência para implementação. Atualizado em 2026-06-09.

---

## Visão Geral

O telão exibe conteúdo em tela cheia (1920×1080, scale-to-fit) em modo contínuo.
Há dois tipos de comportamento: **rotação automática** (fila de módulos configurável) e **modo especial** (interrompe a rotação por tempo determinado).

O footer (ticker) é uma barra fixa sempre visível na parte inferior, independente do módulo ativo.

O visual é **plugável por tema** — o primeiro tema a implementar é "Pop Yearbook" (craft/polaroid, Colégio Journey). O `TVView.tsx` atual continua existindo como tema padrão. Novos temas poderão ser selecionados por evento no futuro.

---

## Módulos de Rotação Automática

Os módulos entram em uma **fila de rotação**. Cada módulo tem duração configurável e pode ser pausado individualmente. Módulo pausado não aparece na rotação até ser reativado.

---

### MOD-01 · Rank de Fotos

**O que mostra:** top 5 fotos mais curtidas do evento, com ranking lateral e contagem de reações.

**Dados:** `posts` (`status = approved`, `is_official = false`) ordenadas por total de curtidas decrescente.

**Personalidade do visitante:** derivada da reação predominante recebida na foto — o emoji mais usado define o label exibido (ex: mais 🔥 = "On Fire"). Usa as reações habilitadas pelo evento.

**Parâmetros:**
- Duração do slide (segundos)
- Pausado/ativo

---

### MOD-02 · Carrossel de Fotos

**O que mostra:** fotos aprovadas em sequência, uma por vez, estilo polaroid. Inclui fotos oficiais (`is_official = true`), que podem aparecer como destaque dentro do carrossel.

**Dados:** `posts` com `status = approved`, priorizando fotos ainda não exibidas no telão (histórico via `tv_photo_history`).

**Parâmetros:**
- Duração por foto (segundos)
- Número máximo de fotos na rotação (ex: últimas 30)
- Pausado/ativo

---

### MOD-03 · Expositor Destaque

**O que mostra:** um expositor por slide, com foto, nome, categoria, tagline e contato.

**Quem entra:** expositores selecionados pelo admin no painel de controle do telão. A seleção é assistida por ranking de curtidas (total e última hora). O histórico de expositores já exibidos fica registrado em `tv_exhibitor_spotlight` para evitar repetição.

**Dados:** `tv_exhibitor_spotlight` com `ended_at IS NULL` (em destaque agora).

**Parâmetros:**
- Duração por slide (segundos)
- Pausado/ativo

---

### MOD-04 · Trio de Expositores

**O que mostra:** 3 expositores por slide (grid), percorre todos os expositores ativos em grupos de 3 (round-robin).

**Dados:** `exhibitors` com `status = active`.

**Parâmetros:**
- Duração por slide (segundos)
- Pausado/ativo

---

### MOD-05 · Patrocinadores / Parceiros

**O que mostra:** um parceiro por slide, com logo/nome e identidade visual da marca.

**Dados:** `partners` com `show_on_tv = true`, ordenados por `order_index`.

**Parâmetros:**
- Duração por slide (segundos)
- Pausado/ativo

---

### MOD-06 · Marketing do Evento ✅ Cadastro implementado

**O que mostra:** slides com imagens de marketing do organizador. Cada slide pode ter só a foto, foto + frase de chamada, ou foto + frase + texto complementar.

**Dados:** `event_marketing_photos` com `active = true`, ordenados por `order_index`.

> ⚠️ **Pendente:** definir layout do slide no telão para cada combinação:
> - Só foto → imagem ocupa tela inteira
> - Foto + frase → frase sobreposta (posição? tamanho? fundo semitransparente?)
> - Foto + frase + texto → posição do bloco de texto?

**Parâmetros:**
- Duração por imagem (segundos)
- Pausado/ativo

---

## Módulos Especiais (interrompem a rotação)

Ativados por ação do admin em tempo real. Ao expirar, a rotação retoma do ponto onde parou.

---

### MOD-07 · Aviso Full-Screen

**O que mostra:** aviso em tela cheia com título, subtítulo e kicker. **Congela a rotação.**

**Dados:** `announcements` com `target_tv = true`.

**Parâmetros:**
- Duração (segundos) ou manter até fechar manualmente

---

### MOD-08 · Aviso Overlay

**O que mostra:** card lateral sobreposto ao slide atual, sem congelar a rotação.

**Dados:** `announcements` com `kind = overlay`.

**Parâmetros:**
- Duração (segundos)

---

### MOD-09 · Sorteio — Contagem Regressiva

**O que mostra:** tela de contagem regressiva com prêmio, número de participantes e timer. **Congela a rotação.**

Mantém o `RaffleSpinner` atual. Modelos visuais alternativos poderão ser selecionados no futuro.

**Dados:** `raffle_tickets` (contagem) + `raffle_prizes` (prêmio, horário).

**Parâmetros:**
- Quantos minutos antes ativar automaticamente

---

### MOD-10 · Sorteio — Vencedor

**O que mostra:** tela de revelação do vencedor com foto (se disponível), nome e prêmio. **Congela a rotação.**

**Dados:** `raffle_tickets` (vencedor) + foto em `posts`.

**Parâmetros:**
- Duração antes de voltar à rotação (segundos)

---

## Footer — Ticker (sempre visível)

Barra fixa na parte inferior presente em todos os módulos. Scroll horizontal contínuo.

**Conteúdo (configurável individualmente):**
1. Horário do próximo sorteio
2. Avisos em aberto (faixa vermelha quando ativo)
3. Produtos de expositores — nome + preço + estande

**Em modo especial de aviso:** ticker substituído por faixa vermelha com o texto do aviso.

**Parâmetros:**
- Velocidade do scroll
- Itens ativos (próximo sorteio, avisos, produtos)
- Mostrar produtos sem foto: sim/não

---

## Ordem de Rotação Padrão

```
MOD-01 → MOD-02 → MOD-03 → MOD-04 → MOD-05 → MOD-06 → volta para MOD-01
```

Módulos pausados são pulados automaticamente.

---

## Status de Implementação

### ✅ Fase 1 (implementada)
- **Painel de controle** (`/tvcontrol/:slug`) — rotação, módulos, expositor destaque, ticker, avisos, sorteio, curadoria. Grava em `tv_config`.
- **Motor de rotação modular** (`features/tv/display/`): `TVDisplay` + `useTvRotation` (fila, pausa geral, módulo forçado, durações).
- **MOD-01 · Rank de Fotos** e **MOD-02 · Carrossel** no tema **Pop Yearbook**.
- **Ticker** (rodapé) com sorteio + produtos, velocidade configurável.
- **Roteamento por tema** (`TVScreen`): `default` → TVView legado; `pop-yearbook` → novo motor.

> O motor só rotaciona módulos já implementados (`IMPLEMENTED` em `TVDisplay.tsx`). Ao implementar MOD-03→06, incluí-los nessa lista.

### ⏳ Próximas fases
- MOD-03 (Expositor Destaque), MOD-04 (Trio), MOD-05 (Parceiros), MOD-06 (Marketing)
- Modos especiais no novo motor: aviso full-screen/overlay (MOD-07/08) e sorteio (MOD-09/10) — hoje só no TVView legado
- Priorizar fotos não exibidas no MOD-02 via `tv_photo_history`
- Layout dos slides do MOD-06 (foto / foto+frase / foto+frase+texto)
- Faixa de aviso vermelha no ticker quando há aviso ativo

---

## Painel de Controle do Telão

> ✅ **Implementado** (`features/tv/TVControlPanel.tsx`).

### Controle da Rotação
- Pausar/retomar rotação geral
- Forçar módulo específico imediatamente
- Ver qual módulo está ativo agora
- Configurar duração de cada módulo
- Pausar/ativar módulos individualmente
- Selecionar tema visual do telão por evento

### Gestão de Destaque de Expositores (MOD-03)
- Ranking de expositores por curtidas — total do evento e última hora
- Selecionar/remover expositores em destaque agora
- Histórico de expositores já exibidos como destaque (para não repetir)
- Indicação visual de "ainda não foi destaque hoje"

### Gestão de Fotos Exibidas (MOD-01 e MOD-02)
- Histórico de fotos de visitantes já exibidas no telão
- Histórico de fotos oficiais já exibidas
- Priorizar fotos ainda não exibidas na rotação
- Possibilidade de resetar histórico (ex: virada de turno)

### Avisos (MOD-07 e MOD-08)
- Criar e disparar aviso full-screen com texto, subtítulo e duração
- Criar e disparar aviso overlay com texto e duração
- Ver avisos ativos agora

### Sorteio (MOD-09 e MOD-10)
- Iniciar contagem regressiva do sorteio
- Revelar vencedor (dispara MOD-10)

### Configuração do Ticker
- Ativar/desativar cada item (próximo sorteio, avisos, produtos)
- Velocidade do scroll
- Mostrar produtos sem foto: sim/não

### Notificações em Tempo Real (para o operador do painel)
- Novas fotos postadas aguardando atenção
- Novas inscrições no sorteio
- Aviso próximo de expirar

---

## Temas Visuais

| Tema | Descrição | Status |
|------|-----------|--------|
| `default` | `TVView.tsx` atual — ranking por categoria | ✅ Existente |
| `pop-yearbook` | Craft/polaroid · Fontes: Mochiy Pop One + Fredoka + Caveat + Fraunces (Google Fonts) | ⚠️ A implementar |

---

## Banco de Dados — Pendências

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `event_marketing` | Contato de marketing do evento | ✅ Criado |
| `event_marketing_photos` | Fotos de marketing com frase/texto | ✅ Criado |
| `tv_exhibitor_spotlight` | Histórico de expositores em destaque no telão (event_id, exhibitor_id, started_at, ended_at) | ⚠️ Pendente |
| `tv_photo_history` | Histórico de fotos exibidas no telão (event_id, post_id, module, shown_at) | ⚠️ Pendente |

---

## Decisões Registradas

| # | Decisão | Resolução |
|---|---------|-----------|
| A | Visual plugável ou fixo? | Plugável — tema `pop-yearbook` novo, `default` mantido |
| B | MOD-01 e MOD-02 juntos ou separados? | Módulos separados na fila de rotação |
| C | Personalidade do visitante? | Derivada da reação predominante recebida |
| D | Como definir expositor destaque? | Controlado em tempo real pelo painel do telão, com histórico em `tv_exhibitor_spotlight` |
| E | Fotos de marketing — onde cadastrar? | Aba Marketing do admin do evento (implementada) |
| F | RaffleSpinner — refazer ou manter? | Manter atual; modelos alternativos no futuro |
| G | Fontes Pop Yearbook? | Aprovado — Google Fonts via `<link>` |
| H | Ticker — produtos sem foto? | Parâmetro configurável no painel de controle do telão |
