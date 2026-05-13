# Considerações Claude — Pivot Eventify (mai/2026)

> Análise do pivot de "galeria social com impressão" para "ecossistema B2B de avaliação para feiras".
> Contexto: conversa do colega com IA externa, compartilhada para revisão.

---

## O que está bem pensado

**Modelo B2B é mais sustentável economicamente.** Expositor pagando por perfil/catálogo/leads é receita recorrente. Impressão de sticker não escala.

**Sistema de pesos de voto (estilo Rotten Tomatoes) é o diferencial real.** Um expositor sabe que o score é confiável porque avaliadores técnicos pesam mais — isso tem valor de negócio tangível.

**"Interagiu, concorre"** é mecanismo elegante: força engajamento orgânico que alimenta métricas dos expositores sem exigir esforço extra do participante.

---

## Onde travar antes de avançar

### 1. Fraude no sistema de pesos — risco técnico crítico

Firebase Google Auth não impede múltiplas contas com emails diferentes. Se o role "Professor/Avaliador" pode ser reivindicado por qualquer um, o sistema de pesos perde sentido em minutos.

**Pergunta que precisa de resposta antes de escrever uma linha de código:** como um usuário vira "Avaliador/Professor"? Via convite do admin? Via código de acesso? Via verificação manual? Isso precisa estar no PRD v5 antes de qualquer schema.

### 2. Este não é um PRD v5 — é quase um produto novo

O pivot muda:
- Os atores principais (de participante para expositor/avaliador)
- O modelo de dados central (de `photos` para `exhibitors` + `ratings`)
- O modelo de negócio (de B2C para B2B)
- A proposta de valor do telão (de ranking de fotos para ranking de expositores)

Código existente que sobrevive: auth Firebase, feed realtime, Supabase + R2 pipeline, TV view (adaptada).
Código que vira legacy além do que já era: print queue inteira, photo ranking, maior parte do `posts.ts`.

### 3. Escopo vs. entrega

O documento descreve ao mesmo tempo:
- Feed estilo TikTok com injeção de ads
- Sistema de rating com pesos
- Sorteio automatizado com notificação no telão
- Catálogo de produtos por expositor
- Relatórios tipo "Google Meu Negócio"
- Pesquisa de satisfação pós-evento

Isso é 6+ meses de trabalho feito com qualidade. Recomenda-se fortemente definir qual é o **MVP do novo produto**: provavelmente expositor com perfil + participante avalia + TV exibe ranking. Todo o resto é fase 2.

---

## Impacto no schema atual

Tabelas que precisarão ser criadas do zero:

```
exhibitors         — entidade de primeira classe (hoje é JSONB em events)
products           — catálogo por expositor
ratings            — avaliação por (user_id, exhibitor_id, category)
rating_weights     — config de pesos por role e evento
ads                — conteúdo dos expositores para injeção no feed
raffle_entries     — participações por interação
raffle_draws       — sorteios realizados
survey_responses   — pesquisa pós-evento
leads              — interesse em produto/expositor
```

Tabelas que sobrevivem: `events`, `users`, `posts`/`photos` (feed social continua existindo, só deixa de ser o centro), `notifications`, `comments`, `reactions`.

A migração `photos → posts` já na dívida técnica continua sendo prioritária — o feed social ainda existe nesse novo modelo.

---

## Recomendação prática

Resolver estas 4 questões antes de atualizar PRD, schema e arquitetura:

1. **Como o role "Avaliador/Professor" é atribuído?** (mecanismo anti-fraude)
2. **Qual é o MVP mínimo do novo produto?** (expositor + rating + TV ranking — sem ads, sorteio, relatórios)
3. **Impressão: desabilitar ou remover?** Sugestão: desabilitar na UI mas não deletar o código — mudar de ideia custa caro.
4. **O feed social (fotos dos participantes) ainda existe no novo modelo?** O documento do colega não deixa claro.

---

## Decisões — 2026-05-12

1. **Avaliador/Professor**: criado pelo admin via portal (controle centralizado, não auto-declarado). Resolve o risco de fraude.
2. **Escopo MVP**: expositor + rating + TV ranking + ads + sorteio + relatórios. Todo esse conjunto entra no MVP.
3. **Impressão**: desabilitar na UI — possivelmente via toggle no portal admin. Código não será removido.
4. **Feed social**: mantido. Possibilidade de exibi-lo no telão fica para discussão futura.

**Status**: PRD v5 e schema podem avançar.
