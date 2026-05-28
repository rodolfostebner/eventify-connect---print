# Manual do Administrador do Evento (EventAdmin)

> **Acesso:** `/eventadmin` — disponível para usuários com perfil `event_admin` (ou `admin` acessando via engrenagem no card do evento).

---

## Visão Geral da Tela

A tela é dividida em duas seções principais:

1. **Controles da Feira** — sempre visível no topo, com os botões de fase e acessos rápidos.
2. **Acordeões** — Dashboard e Configurações do Evento, expandíveis ao clicar.

---

## 1. Controles da Feira (topo fixo)

### Fases do evento

Três botões controlam em qual fase o evento se encontra. A transição é imediata e registrada no log de auditoria.

| Botão | Fase | O que acontece |
|-------|------|----------------|
| **PRÉ** | `pre` | Landing page com countdown e catálogo de expositores (sem feed) |
| **LIVE** | `live` | Feed de fotos ativo, uploads habilitados, interações abertas |
| **PÓS** | `post` | Feed vira galeria, mensagem pós-evento exibida, uploads encerrados |

> Clicar no botão da fase atual não faz nada.

### Acessos rápidos

Seis botões abrem em nova aba as ferramentas do evento:

| Botão | Destino |
|-------|---------|
| **App** | Página pública do evento (`/event/:slug`) |
| **TV** | Telão fullscreen (`/tv/:slug`) — exibir em projetor/TV |
| **Curadoria** | Painel de moderação de fotos e comentários |
| **Operador** | Fila de impressão |
| **Expositores** | Gestão completa dos stands |
| **Parceiros** | Gestão de patrocinadores, apoiadores e serviços |

---

## 2. Dashboard

Clique no acordeão **Dashboard** para expandir. Os dados são carregados no momento da abertura.

### Métricas Gerais

| Métrica | O que significa |
|---------|----------------|
| Expositores (previstos vs cadastrados) | Quantos foram planejados vs quantos estão no sistema |
| Média de produtos por expositor | Total de produtos ativos ÷ total de expositores |
| Média de valor por produto | Média dos preços cadastrados |
| Completos / Incompletos / Previstos | Expositores com perfil preenchido vs incompletos |
| Visitas Pré/Live/Pós (únicos vs total) | Visitantes únicos vs total de acessos por fase |

### Gráficos de Visitas

- **Top 10 expositores — mais visitas** (barras verdes)
- **Top 10 expositores — menos visitas** (barras vermelhas) — identifica quem precisa de atenção
- **Top 10 produtos — mais visitas** / **menos visitas**
- **Visitantes únicos por categoria** (gráfico de pizza)

---

## 3. Configurações do Evento

Clique no acordeão **Configurações do Evento** para expandir. As configurações são organizadas em abas.

### Aba: Dados do Evento

Campos editáveis:

- **Nome do Evento** — título exibido no app e no header
- **Data do Evento** — usada no countdown da fase `pre`
- **Sobre o Evento** — texto descritivo exibido na landing page
- **Mensagem Pós-Evento** — exibida quando o status for `post`

Clique em **Salvar Alterações** para confirmar. As modificações são registradas na auditoria.

---

### Aba: Aparência

#### Logos
- **Logo do Cliente** — URL da imagem do cliente/marca do evento
- **Logo do App** — URL do logo exibido no header do aplicativo

#### Cores
- **Cor Primária** e **Cor Secundária** do app — usadas em botões e destaques

#### Plano de Fundo (App)
Escolha o tipo de fundo e configure as cores:

| Tipo | Campos |
|------|--------|
| **Cor** | Uma cor sólida de fundo |
| **Degradê** | Cor inicial ("De") e cor final ("Para") |
| **Padrão** | Cor do fundo e cor do padrão geométrico |

#### Personalização da TV
Mesmas opções de fundo para o telão (`/tv/:slug`), com cores primária e secundária independentes.

Clique em **Salvar Alterações** para confirmar.

---

### Aba: Configurações

#### Moderação de Comentários
Toggle on/off. Quando ativado, comentários precisam ser aprovados manualmente na Curadoria antes de aparecer no feed.

#### Comentários Padrão
Lista de sugestões de comentário exibidas como atalhos para o participante. Digite separados por vírgula:
```
Lindo!, Adorei!, Que momento!, Incrível!
```

#### Categorias de Expositor
Gerencie as categorias usadas para classificar e filtrar expositores no app.

- Clique em **Adicionar** para criar uma nova categoria
- Escolha nome, ícone (emoji) e cor
- Use **Editar** ou **Remover** nas categorias existentes

> Remover uma categoria não apaga os expositores — eles ficam sem categoria.

#### Expositores Previstos
Número esperado de expositores. Usado como denominador nas métricas do Dashboard (completos/previstos).

#### Pesos de Avaliação
Controla como a nota final do ranking é calculada:

- **Peso Avaliação Visitantes** — fração da nota pública (0 a 1)
- **Peso Avaliação Jurados** — fração da nota dos jurados (0 a 1)
- A **soma dos dois pesos não pode ultrapassar 1.00**

Exemplo: `0.40` para visitantes e `0.60` para jurados → 40% voto popular, 60% técnico.

#### Origem de Upload (Live)
Define de onde os participantes podem enviar fotos durante o evento:

| Opção | Descrição |
|-------|-----------|
| Câmera e Galeria | Permite ambas as origens |
| Apenas Câmera | Força uso da câmera na hora |
| Apenas Galeria | Permite apenas fotos já existentes |

#### Fotos Oficiais
Toggle on/off. Habilita a seção de fotos da equipe/fotógrafo oficial no feed.

Clique em **Salvar Alterações** para confirmar.

---

### Aba: Avisos

Módulo de mensagens urgentes disparadas em tempo real durante o evento.

#### Criar um aviso

1. Preencha **Título** (máx. 80 caracteres) e **Mensagem** (máx. 250 caracteres)
2. Escolha **Cor de Fundo** e **Cor do Texto** do banner
3. Selecione o **Ícone** (Megafone, Sino, Info, Alerta, Festa)
4. Defina a **Duração em segundos** (5–120 s) — tempo que o aviso fica visível
5. Escolha o **Som de Notificação**:
   - Silencioso
   - Sino Clássico, Alerta Futurista, Festa/Sucesso, Atenção Suave, Beep Retrô
   - Sons personalizados do evento (ver abaixo)
6. Selecione os **Canais de Destino**:
   - **Telão / TV** — aparece no `tv/:slug`
   - **Popup no App** — aparece para participantes no app
   - **Notificação Push** — enviada como push notification
7. Clique em **Salvar Aviso**

#### Disparar um aviso

Na lista de avisos cadastrados, clique no botão vermelho **Disparar** ao lado do aviso desejado. O aviso aparece imediatamente nos canais selecionados.

Para limpar todos os canais de uma vez, clique em **Limpar Todos os Canais** (canto superior direito da seção).

#### Sons personalizados

Faça upload de arquivos MP3, WAV ou OGG (máx. 2 MB cada, limite de 3 sons por evento). Para adicionar:

1. Clique em **Upload de Som** no painel "Sons do Evento"
2. Selecione o arquivo
3. O som ficará disponível no seletor de todos os avisos

Para remover um som, clique no ícone de lixeira ao lado dele.

---

### Aba: Config. Avaliação

#### Categorias de Avaliação

Critérios usados pelos jurados para pontuar os expositores.

- **Nome**: ex. "Inovação", "Apresentação", "Sustentabilidade"
- **Peso**: influência relativa no ranking (ex. peso 2 vale o dobro de peso 1)
- A coluna **%** mostra a proporção de cada categoria em relação ao total de pesos

Para adicionar: clique em **Adicionar** → preencha nome e peso → confirme.

#### Avaliadores (Jurados)

Cadastre os e-mails das pessoas que terão acesso ao painel de avaliação técnica.

- **Ativo** (verde) — já fez login pelo menos uma vez
- **Pendente** (amarelo) — convite enviado, aguardando primeiro login

Para adicionar um avaliador:
1. Clique em **Adicionar**
2. Digite o e-mail
3. Confirme — o avaliador poderá entrar com Google OAuth ou magic link

Para remover um avaliador ativo, use **Remover** (o acesso é revogado, o usuário vira `participant`).

---

### Aba: Config. Sorteio

#### Participantes concorrendo
Exibido no topo da aba: quantos participantes têm tickets válidos para o sorteio.

#### Criar um prêmio

1. Clique em **Novo Prêmio**
2. Escolha a **Origem**:
   - **Edição livre** — preencha manualmente nome, descrição e foto
   - **De um expositor** — navegue pelos expositores e produtos; os campos são preenchidos automaticamente com os dados do produto
3. Faça upload da **Foto do Prêmio** (opcional)
4. Preencha **Nome** (obrigatório), **Descrição** e **Ordem do Sorteio**
5. Clique em **Criar Prêmio**

#### Realizar o sorteio (passo a passo)

O fluxo é em duas etapas para criar suspense no telão:

1. No card do prêmio, clique em **Mostrar** (azul) → o prêmio aparece no telão
2. O estado do telão muda para *"Exibindo prêmio"*
3. No momento certo, clique em **Sortear!** (verde) → um ganhador é sorteado aleatoriamente
4. O nome do ganhador aparece no telão com animação
5. Clique em **Encerrar** para limpar o telão e voltar ao estado inativo

> Após o sorteio, o prêmio fica marcado como "Sorteado" e não pode ser sorteado novamente.

---

### Aba: Relatórios / Marketing

Em desenvolvimento. Serão implementadas em breve.

---

### Aba: Auditoria

Log completo de todas as alterações feitas no evento.

| Coluna | Descrição |
|--------|-----------|
| Data/Hora | Quando a alteração foi feita |
| Autor | Nome ou e-mail de quem alterou |
| Ação | Tipo de alteração (Edição de dados, Mudança de fase) |
| Detalhes | Abre modal com o diff campo a campo (antes/depois) |

Clique em **Detalhes** para ver exatamente o que foi alterado, com os valores anteriores (fundo vermelho) e novos (fundo verde).

---

## Fluxo recomendado antes do evento

1. Aba **Dados** → confirme nome, data e texto descritivo
2. Aba **Aparência** → ajuste logos e cores
3. Aba **Configurações** → defina categorias de expositor, pesos e origem de upload
4. Aba **Config. Avaliação** → cadastre categorias e jurados
5. Aba **Config. Sorteio** → cadastre os prêmios
6. Aba **Avisos** → crie os avisos que vai precisar durante o evento
7. Acesse **Expositores** e **Parceiros** via acessos rápidos para preencher o conteúdo
8. Quando tudo pronto: altere a fase para **LIVE**

---

## Dúvidas frequentes

**Posso mudar a fase de volta?**
Sim. A transição entre fases é livre — você pode ir de `live` para `pre` se precisar, por exemplo.

**O que acontece com os dados ao mudar de fase?**
Nada é apagado. As fotos, leads e avaliações são preservados independente da fase.

**Avaliador não recebeu o e-mail de acesso. O que fazer?**
O sistema usa Google OAuth ou magic link. O avaliador deve acessar `/login` com o e-mail cadastrado. Se usar Google, o login é direto; se preferir e-mail, clica em "Entrar com link mágico".
