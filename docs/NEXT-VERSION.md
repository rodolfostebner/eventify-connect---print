# Próxima Versão — Modularização do Evento

> Documento de design **em refinamento**. Nada aqui está fechado — serve para
> discutir e ajustar antes de implementar. Atualizado em 2026-06-16.

## Objetivo

Transformar a aplicação numa plataforma **modular**, onde cada evento liga/desliga
os módulos que quer usar e configura cada um conforme a necessidade. Hoje todo
evento carrega todas as features; queremos poder montar eventos diferentes
(uma feira, um campeonato, uma exposição escolar) escolhendo só as peças que fazem
sentido.

### TODO original que esta versão endereça
- [ ] Repensar aplicativo para atender eventos de outros tipos
- [ ] Melhorar apresentação visual de componentes
- [ ] Tornar componentes de evento reutilizáveis
- [ ] Verificar assinaturas para voltar ao plano free enquanto não tem eventos

---

## Diagnóstico do estado atual

Já existe **um** caso desse padrão funcionando: o telão. O `tv_config` define quais
módulos (MOD-01..07) entram na rotação, durações, módulo forçado e flags. É
exatamente "configuração de módulos por evento" — só que aplicada a um único
subsistema.

No resto do app, as features são ligadas/desligadas por **flags soltas** espalhadas
no `EventData`, cada uma criada de forma independente:

- `comment_moderation_enabled`
- `interactions_paused`
- `tv_show_ranking`
- `evaluation_status` (`open` / `closed` / `published`)
- `has_official_photos`
- `upload_source` (`camera` / `gallery` / `both`)
- `countdown_active`

Problema: não existe um conceito unificado de "módulo". Não dá pra olhar um evento
e dizer "esse usa feed + avaliação + sorteio, mas não usa pré-venda". A lógica de
gating está implícita e dispersa pelas views.

---

## Proposta: registry central de módulos + config por evento

### 1. Registry de módulos (fonte única da verdade)

Um `src/constants/modules.ts` declarando todos os módulos disponíveis, com label,
descrição, **dependências** e (opcional) rotas/perfis que cada um toca.

```ts
export const MODULES = {
  feed:         { label: 'Feed & Upload',          deps: [] },
  interactions: { label: 'Reações & Comentários',  deps: ['feed'] },
  exhibitors:   { label: 'Expositores & Catálogo', deps: [] },
  leads:        { label: 'Pré-venda / Leads',      deps: ['exhibitors'] },
  partners:     { label: 'Parceiros',              deps: [] },
  evaluation:   { label: 'Avaliações',             deps: ['exhibitors'] },
  raffle:       { label: 'Sorteio',                deps: [] },
  tv:           { label: 'Telão',                  deps: [] },
  announcements:{ label: 'Avisos',                 deps: [] },
  print:        { label: 'Impressão',              deps: ['feed'] },
} as const;

export type ModuleId = keyof typeof MODULES;
```

### 2. Config por evento como JSONB

Nova coluna `events.modules jsonb`:

```json
{
  "feed":       { "enabled": true },
  "interactions": { "enabled": true, "paused": false },
  "evaluation": { "enabled": true, "status": "open" },
  "raffle":     { "enabled": false },
  "tv":         { "enabled": true }
}
```

**Por que JSONB e não tabela normalizada `event_modules`:**
- Combina com o estilo do projeto (events já é uma linha "gorda").
- Evita join e canal realtime extra.
- Settings específicos de cada módulo cabem no mesmo objeto.
- O telão continua com `tv_config` próprio; aqui só liga/desliga o módulo `tv`.

### 3. Ponto único de leitura

Helper + hook consumidos em três lugares (roteamento, views pre/live/post, portal
admin):

```ts
isModuleEnabled(event, 'raffle')   // bool, já resolve dependências e fallback
useEventModules(event)             // { enabled, settings } por módulo
```

Módulo desabilitado: o componente não renderiza e a rota não existe.

### 4. UI de configuração (EventAdminPortal)

Aba **"Módulos"** com toggles, validando dependências: desligar "Expositores"
desliga "Pré-venda" e "Avaliações" junto, com aviso ao usuário.

### 5. Migração gradual (sem quebrar nada)

As flags atuais viram **settings dentro do módulo** (`interactions.paused`,
`evaluation.status`), migradas uma de cada vez. O helper lê de `modules` com
**fallback** para as flags antigas enquanto a migração não termina.

---

## Por que essa abordagem (e não outra)

- **Não é micro-frontend / plugin system real.** Pra uma SPA React desse tamanho
  seria over-engineering. Modularização aqui = composição condicional + config,
  não carregar bundles separados.
- **Lazy-loading** dos módulos pesados (telão, avaliação) com `React.lazy` é um
  bônus fácil depois — otimização, não a arquitetura base.

---

## Faseamento sugerido

1. **Fundação** — registry + coluna `events.modules` + helper/hook. Sem mudar
   comportamento (tudo `enabled`).
2. **UI** — aba "Módulos" no EventAdminPortal.
3. **Gating** — aplicar os gates em rotas e views.
4. **Migração** — mover as flags soltas para dentro dos módulos.

---

---

## Frente paralela: layout ajustável por módulo do telão

Hoje o telão só tem ajustes **globais**: `text_scale` (escala o `font-size` raiz, e
os módulos em `rem` acompanham) e `ticker_scale`. Queremos descer ao nível de
**cada módulo** e de **cada parte dele** — tamanho de fonte por item, espaço de
imagens, header, footer, gaps etc.

### Proposta: schema de layout por módulo + tokens via CSS variables

**1. Cada módulo declara seus "knobs" (schema).** Em vez de inventar campos soltos
no `tv_config`, cada módulo descreve quais partes são ajustáveis:

```ts
// ex. MOD-04 (trio de expositores)
export const MOD04_LAYOUT = {
  titleScale:  { label: 'Título',        min: 50, max: 200, default: 100 },
  bodyScale:   { label: 'Texto/tagline', min: 50, max: 200, default: 100 },
  imageArea:   { label: 'Altura da foto', min: 30, max: 90,  default: 60, unit: 'vh' },
  headerSpace: { label: 'Espaço do header', min: 0, max: 30, default: 10 },
  footerSpace: { label: 'Espaço do rodapé', min: 0, max: 30, default: 8 },
  gap:         { label: 'Espaçamento entre itens', min: 0, max: 40, default: 16 },
} as const;
```

**2. Valores guardados no `tv_config` por módulo (JSONB).** Um objeto por módulo,
ex. `mod04_layout: { titleScale: 120, imageArea: 55, gap: 24 }`. Combina com o
estilo atual do `tv_config` (campos por módulo) sem explodir o número de colunas.

**3. Módulo lê os tokens via CSS variables.** O componente do módulo aplica os
valores como custom properties no seu container raiz e o CSS consome:

```tsx
<section style={{
  '--mod-title': `${layout.titleScale}%`,
  '--mod-img': `${layout.imageArea}vh`,
  '--mod-gap': `${layout.gap}px`,
}}>
```

Mantém o padrão `rem`/escala que já existe e isola o ajuste a cada módulo (não vaza
para os outros).

**4. Painel de controle renderiza os sliders automaticamente** a partir do schema
de cada módulo — não precisa codar UI nova a cada knob. Live preview no próprio
telão via realtime do `tv_config` (já existe).

### Pontos a definir
- [ ] Quais knobs cada módulo (MOD-01..07) realmente expõe — fazer o inventário.
- [ ] Presets de layout ("compacto", "grande", "acessível") por módulo?
- [ ] Reset por módulo aos defaults do tema.
- [ ] Os knobs são por evento (no `tv_config`) ou também por tema? Sugestão: default
      vem do tema, override vive no `tv_config` do evento.

---

## Pesquisa: auto-ajuste do telão a qualquer tela

**Problema real (último evento):** não se sabe de antemão o tamanho/resolução do
monitor/TV/projetor, e foi preciso ficar fazendo ajuste fino de módulo na hora. O
objetivo é um telão que **se ajusta sozinho** a qualquer tela, mantendo o ajuste
manual só como exceção.

São dois problemas distintos — convém atacar os dois:

### A) Resolução/aspect ratio desconhecido (a tela em si)

**Técnica recomendada — "canvas de referência + scale".** Desenha-se o telão para
uma resolução fixa de referência (ex. 1920×1080) e aplica-se um único
`transform: scale(fator)` no container raiz, onde
`fator = min(innerWidth/1920, innerHeight/1080)`. Recalcula com `ResizeObserver`.

- Vantagem: tudo (fontes, imagens, gaps) escala proporcionalmente de uma vez. O
  layout fica idêntico em qualquer resolução — zero ajuste manual.
- Cuidado: aspect ratios diferentes (16:9 vs 4:3 vs ultrawide) geram letterbox
  (barras) se usar `min`. Decidir: barras (preserva proporção) vs. `fit` por eixo
  (distorce/recorta). Para telão, barras na cor do tema costuma ser o certo.

**Alternativa/complemento — unidades responsivas.** Trocar `rem`/`px` por
`clamp()` + `vw/vh/vmin` nos módulos. Mais simples, mas cada módulo precisa ser
revisado e o resultado é menos previsível que o scale global. Bom como base, mas
não substitui o canvas de referência.

### B) Conteúdo de tamanho variável (texto que estoura)

Mesmo com a tela resolvida, nomes longos de expositor, taglines grandes etc. podem
estourar o quadro. Aqui entra **auto-fit de conteúdo**:

- **Medir e encolher** com `ResizeObserver`: o componente mede se o conteúdo
  excede o container e reduz o `font-size` em passos até caber (algoritmo
  "fit text"). É o verdadeiro "auto-ajuste" ciente do conteúdo.
- Existem libs (`react-textfit`, `fitty`, `react-resize-detector`) mas o algoritmo
  é simples e dá pra fazer um hook próprio (`useFitText`) — evita dependência.

### C) Overscan de TVs/projetores

TVs e projetores frequentemente **cortam as bordas** (overscan, ~3–5%). Solução:
uma `safe-area` configurável (padding %) no container raiz do telão, ajustável no
painel de controle. Resolve o caso "o rodapé/ticker está sendo cortado".

### Recomendação

Combinar **A (canvas de referência + scale)** como base — resolve o problema
principal de "não sei o tamanho da tela" sem tocar em cada módulo — com **B
(auto-fit de texto)** nos pontos onde o conteúdo varia (nomes, taglines), e **C
(safe-area)** como rede de segurança para overscan. Manter o ajuste manual por
módulo (seção anterior) apenas como override para casos extremos.

Isso transforma o fluxo no evento em: abrir `/tv/:slug` na tela → já cai certo.
No máximo, um slider global de "zoom" e um de "safe-area" para acertar overscan.

### A pesquisar / validar
- [ ] Testar `transform: scale` com os módulos atuais (verificar se quebra layout
      que usa `vh/vw` direto — esses precisariam virar relativos ao canvas).
- [ ] Definir resolução de referência (1920×1080 cobre a maioria).
- [ ] Política de aspect ratio: letterbox (recomendado) vs. recorte.
- [ ] Avaliar custo de reescrever módulos para o canvas vs. ganho.
- [ ] Detectar resolução real do dispositivo e logar (ajuda a calibrar defaults).

---

## Feature: login por QR Code (convidado do evento)

**Objetivo:** o visitante escaneia um QR Code no evento e entra direto — sem Google
nem Magic Link — podendo **postar fotos e avaliar**. "Anônimo, mas nem tanto":
capturamos uma identidade leve (nome, e talvez WhatsApp) para diferenciá-lo,
permitir o sorteio (precisa contatar o ganhador) e dar continuidade à sessão.

### Por que não dá pra ser 100% anônimo

As tabelas atuais exigem `user_id`: `posts`, `reactions`, `comments`,
`evaluations` (`UNIQUE(exhibitor_id, user_id)`) e `raffle_tickets`
(`UNIQUE(event_id, user_id)`). Hoje `app_sessions.user_id = null` cobre só
**presença** (visitante navegando), não interação. Para postar/avaliar é preciso
um `user_id` real.

### Abordagem recomendada — Supabase Anonymous Auth + captura de nome

1. **QR aponta para uma rota de entrada**, ex. `/join/:slug` (ou
   `/event/:slug?join=qr`), que abre um modal leve pedindo **nome** (e WhatsApp
   opcional). Esse é o "nem tanto anônimo".
2. **Cria uma sessão anônima** via `supabase.auth.signInAnonymously()` — gera um
   `user_id` real, sem credenciais. O `AuthContext`/`syncUser` cria o registro em
   `users` com `role = participant`, `display_name` = nome digitado,
   `event_id` = evento do QR, e uma flag `is_guest = true`.
3. **Sessão persiste no localStorage** (Supabase já faz) — ele continua logado
   durante o evento, no mesmo dispositivo.
4. **Pode postar e avaliar** imediatamente (moderação de fotos já existe, então
   convidado postando não é risco).
5. **Upgrade opcional**: depois pode vincular Google/e-mail à mesma conta anônima
   (`linkIdentity`), mantendo histórico — útil se quiser salvar as fotos depois do
   evento.

Alternativa sem Anonymous Auth: reaproveitar o padrão `findOrCreateUserByEmail`
do BETA_MODE, mas gerando um identificador sintético (sem e-mail real). Funciona,
porém fica fora do fluxo de sessão do Supabase e exige RLS mais permissiva. A
Anonymous Auth é mais limpa e já integra com o `onAuthStateChange`.

### Geração e distribuição do QR

- O QR codifica a URL `/join/:slug` do evento (lib `qrcode`/`qrcode.react`).
- Exibir no painel admin (para imprimir/colar no stand) **e** no telão — encaixa
  no MOD-06 (boas-vindas) ou no ticker: "Aponte a câmera e participe".
- Opcional: QR por expositor (`/join/:slug?ex=:id`) já levando o convidado direto
  ao stand para avaliar aquele expositor.

### Pontos a definir
- [ ] Quais campos capturar: só nome? nome + WhatsApp (melhor p/ sorteio e leads)?
- [ ] Habilitar Anonymous Auth no projeto Supabase (config + limites anti-abuso).
- [ ] RLS: permitir `INSERT` em posts/reactions/comments/evaluations para usuários
      anônimos autenticados (lembrar do padrão anon + authenticated do projeto).
- [ ] Como o convidado aparece na moderação/relatórios (badge "convidado").
- [ ] Convidado entra no contador de "no app agora" (`app_sessions`)? (sim,
      provavelmente já entra ao abrir o EventPage).
- [ ] Política de limpeza: contas guest somem após o evento ou viram lead?
- [ ] Esse login é um **módulo** (liga/desliga por evento) — encaixa na
      modularização acima.

---

## Questões em aberto (refinar)

- [ ] **Granularidade**: módulo no nível de feature (feed, sorteio, avaliação) ou
      também sub-features dentro de cada um?
- [ ] **Tipos de evento / presets**: faz sentido ter "templates" de evento (ex.
      "Feira", "Campeonato", "Exposição") que já vêm com um conjunto de módulos
      ligado? Isso conecta com "atender eventos de outros tipos".
- [ ] **Módulos que mudam por estado** (pre/live/post): um módulo pode estar ligado
      só em parte do ciclo do evento?
- [ ] **Defaults**: evento novo nasce com quais módulos ligados?
- [ ] **Impacto no telão**: o módulo `tv` apenas liga/desliga, ou a config de
      módulos do evento influencia o que o telão pode mostrar (ex. sem sorteio →
      ticker não oferece sorteio)?
- [ ] **Assinatura/planos**: módulos podem virar a base de planos pagos (free =
      X módulos). Conecta com o TODO de voltar ao plano free entre eventos.
