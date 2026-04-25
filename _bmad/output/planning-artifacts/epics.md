# 🗺️ Epics & Stories — Eventify Connect & Print
> **Agente**: Paige (Product Owner) 📋  
> **Workflow**: CE (bmad-create-epics)  
> **Gerado**: 2026-04-25 | **Baseado em**: Architecture (CA) e UX (CU)

---

## 🎯 Visão do Backlog

Este documento organiza o backlog de implementação para alinhar a aplicação ao PRD v4, focar no pagamento de dívida técnica crítica e fechar os gaps de UX.

As implementações devem ser executadas em sequência, começando pela Fundação (Epic 1).

---

## Epic 1: Migração de Dados & Fundação (🔴 Alta Prioridade)
**Objetivo**: Concluir a migração da tabela legada `photos` para as novas tabelas normalizadas (`posts`, `reactions`, `comments`), garantindo integridade referencial e performance.

### Story 1.1: Atualização dos Contratos (Tipagem)
- **Como** desenvolvedor, **quero** atualizar a interface `PhotoData` em `types/index.ts`.
- **Regras de Negócio**: 
  - Mapear para a tabela `posts`.
  - Criar novos tipos `PostReaction` e `PostComment`.
  - Ajustar as dependências nos componentes da UI para tolerar a transição sem quebrar (temporariamente).
- **Aceitação**: Tipos TypeScript condizem com o novo schema normalizado. Código compila sem erros críticos de TS.

### Story 1.2: Refatoração do Serviço `posts.ts`
- **Como** sistema, **quero** ler e escrever nas tabelas corretas.
- **Regras de Negócio**:
  - Modificar `fetchPosts` e `subscribeToPosts` para ler de `posts`.
  - `likePost` deve gravar na tabela `reactions` usando `upsert` com `type` de reação (evitando denormalização jsonb).
  - `commentOnPost` deve inserir na tabela `comments`.
  - O upload na Edge Function deve gravar o URL diretamente em `posts`.
- **Aceitação**: Todo fluxo de curadoria e feed usa as novas tabelas. `posts.ts` não possui referências à tabela legada `photos`.

### Story 1.3: Migração de Dados Existentes
- **Como** admin, **quero** não perder os dados existentes do evento rodando na tabela antiga.
- **Ação**: Executar queries SQL (`execute_sql`) para transpor dados de `photos` para `posts`, parseando o `jsonb` de comentários e array de likes para suas tabelas de junção.
- **Aceitação**: Tabela `posts` reflete dados anteriores.

### Story 1.4: Limpeza da Dívida Técnica Arquitetural
- **Como** desenvolvedor, **quero** remover código morto que traz risco ao projeto.
- **Ação**: 
  - Excluir os falsos stubs de `photoService.ts`, `mockData.ts` e `mockFirestore.ts`.
  - Excluir `src/lib/storage/upload.ts` (stub) e refatorar qualquer importação residual para `src/services/storageService.ts`.
  - Limpar views antigas na raiz de `features/event/` (mantendo as de `components/`).
- **Aceitação**: Codebase sem falsos stubs. `UploadTest.tsx` removido.

---

## Epic 2: Bugfixing & Estabilidade (Configuração & Curadoria) (🔴 Alta Prioridade)
**Objetivo**: Realizar uma auditoria completa e correção de bugs no painel de moderação e no formulário de configuração do evento (BrandingModal), garantindo que as lógicas de negócio funcionem sem erros.

### Story 2.1: Auditoria e Correção do Admin Dashboard & BrandingModal
- **Como** admin, **quero** criar e configurar eventos sem erros ou dados inconsistentes.
- **Ação**: 
  - Testar o CRUD de Eventos (criação, leitura, atualização, exclusão).
  - Validar todos os campos do `BrandingModal` (cores, fundos, alternâncias de UI, parceiros, upload de resumo).
  - Corrigir falhas de salvar estado ou quebra de tipagem identificadas.
- **Aceitação**: O admin consegue criar um evento do zero, personalizar o tema completamente e salvar sem qualquer falha ou erro de console.

### Story 2.2: Auditoria e Correção do Painel de Moderação (Curadoria)
- **Como** admin, **quero** moderar as fotos e comentários com estabilidade.
- **Ação**:
  - Validar o fluxo de "Aprovar" e "Rejeitar" fotos na tabela recém-migrada `posts`.
  - Auditar os componentes em `/moderation/:slug` (`PhotoModeration`, `CommentModeration`, `PrintOrderModeration`).
  - Corrigir inconsistências de reatividade (realtime) ou comportamentos não esperados na interface de curadoria.
- **Aceitação**: A curadoria de conteúdo funciona sem engasgos, atualizando o painel em tempo real e não permitindo fotos rejeitadas irem pro feed.

---

## Epic 3: UX Refinements (🟡 Prioridade Média)
**Objetivo**: Resolver os Gaps de UX identificados, oferecendo uma experiência premium ("Aesthetics are very important").

### Story 3.1: Melhorias no `PreEventView` (Gaps G3, G7)
- **Como** participante, **quero** ver informações exatas antes do início do evento.
- **Ação**: 
  - Adicionar o `logo_url` no topo da tela.
  - Ocultar o countdown caso a flag `countdown_active` do banco esteja `false`.
- **Aceitação**: Tela apresenta os dados do evento corretamente.

### Story 3.2: Refatoração do `BrandingModal` (Gap G5)
- **Como** admin, **quero** editar as configurações do evento sem muito scroll.
- **Ação**: Dividir as dezenas de campos do modal em uma navegação por Tabs: "Info Básica", "Tema & Design", "TV", "Regras", "Expositores".
- **Aceitação**: Modal não excede 80vh sem quebras bruscas e se torna navegável.

### Story 3.3: Experiência da Galeria Digital (Gap G2)
- **Como** participante, **após** o evento, **quero** visualizar o "Álbum Digital Completo".
- **Ação**: Implementar lógica para o botão "Ver Álbum Completo" na view `PostEventView`. Pode carregar um modal fullscreen ou uma página contendo todas as fotos aprovadas da galeria.
- **Aceitação**: Participante clica e consome fotos em grid otimizado.

### Story 3.4: Reações Visuais no `InteractionBar` (Gap G6)
- **Como** participante, **quero** ver rapidamente quantas e quais interações a foto teve.
- **Ação**: Refatorar `InteractionBar` para exibir as contagens dos tipos de reação recebidas (não apenas corações genéricos).
- **Aceitação**: Exibir contador de emojis 🎸, ❤️, 😂, etc., no card da foto na aba Live.

### Story 3.5: Empty States e Loading (Gaps G8, G10)
- **Como** usuário, **quero** saber se o feed está vazio ou apenas carregando.
- **Ação**: 
  - Adicionar componente ilustrado de feed vazio.
  - Tela global de loading ao carregar app buscará os dados de `bg_color` da URL (se existir o slug).
- **Aceitação**: Nunca se observa telas brancas paralisadas sem indicativo ou "Não há nada aqui".

---

## 🚦 Próximo Passo

Os Epics já podem ser desenvolvidos de maneira isolada.
**Ação recomendada**: Rodar o fluxo `CS` (Create Story) ou `VS` (Verify Story) seguido de `DS` (Develop Story) para iniciar o desenvolvimento da **Story 1.1** e **Story 1.2** (migração de `photos` para `posts`).
