# Manual do Expositor

> **Acesso:** `/expositor` — disponível somente para usuários com perfil `expositor`.
> Suas credenciais (e-mail e senha) foram criadas pela administração do evento.

---

## Como entrar

1. Acesse o link do app e vá para `/login`
2. Digite seu e-mail cadastrado
3. Use **Google OAuth** (se seu e-mail for Google) ou clique em **Entrar com link mágico** para receber um link por e-mail
4. Após o login, você é redirecionado automaticamente para a **Área do Expositor**

---

## Visão Geral

A Área do Expositor tem quatro abas no topo da tela:

| Aba | O que você encontra |
|-----|---------------------|
| **Perfil** | Dados do stand: logo, foto, textos e contatos |
| **Produtos** | Catálogo: adicionar, editar e remover produtos |
| **Interessados** | Lista de pessoas que demonstraram interesse em seus produtos |
| **Visitas ao Stand** | Relatório de acessos e interações com seu stand |

---

## Aba: Perfil

Gerencie como seu stand aparece para os visitantes no app.

### Logo

- Clique em **Alterar logo** para fazer upload de uma imagem
- Formatos aceitos: JPG, PNG, GIF, WebP
- O logo aparece no card do seu stand no feed e no catálogo

### Foto do stand

- Imagem de destaque exibida como banner no card do feed
- Clique em **Adicionar foto** (ou **Alterar foto** se já houver uma)
- Para remover, clique no **X** sobre a imagem

### Nome

Nome obrigatório do stand. É o título principal exibido em todas as telas.

### Categoria

Selecione a categoria do seu stand no menu. As categorias são definidas pela organização do evento.

### Frase Chamada

Texto curto (máx. 50 caracteres) exibido como subtítulo no card. Use para chamar atenção:
> "O melhor açaí da feira!" · "Produtos sustentáveis desde 2010" · "Venha nos conhecer!"

### Descrição

Texto livre sobre o stand, empresa ou projeto. Aparece no modal do catálogo quando o visitante toca no card.

### Ano e Turma

Campos opcionais para identificar o grupo/turma responsável pelo stand (uso típico em feiras escolares).

### Integrantes

Lista de nomes das pessoas do stand.

- Digite o nome e clique em **+** (ou pressione Enter) para adicionar
- Clique no **X** ao lado de um nome para remover

### Contatos

| Campo | Formato | Exemplo |
|-------|---------|---------|
| **Instagram** | `@usuario` ou URL completa | `@meunegocio` |
| **WhatsApp** | Número completo com DDI e DDD, sem espaços | `5511999999999` |
| **Website** | URL completa com `https://` | `https://meunegocio.com.br` |

Esses contatos aparecem como botões clicáveis no modal do catálogo.

### Salvar

Clique em **Salvar alterações** (botão preto no final da aba) para confirmar qualquer mudança.

---

## Aba: Produtos

Gerencie o catálogo de produtos que os visitantes podem ver e demonstrar interesse.

### Adicionar um produto

1. Clique em **Novo produto**
2. Preencha:
   - **Nome do produto** (obrigatório)
   - **Descrição** — detalhes, materiais, benefícios
   - **Preço** — use ponto ou vírgula como separador decimal (ex: `99,90`)
3. Adicione até **3 fotos**:
   - Clique na área pontilhada com ícone de upload
   - Selecione uma imagem do seu dispositivo
   - Repita para adicionar mais fotos (máx. 3)
   - Para remover uma foto, clique no **X** sobre ela
4. Clique em **Salvar**

### Editar um produto

No card do produto, clique em **Editar**. O mesmo formulário é aberto com os dados atuais.

### Remover um produto

No card do produto, clique no ícone de **lixeira** vermelho e confirme na caixa de diálogo.

> Produtos removidos não aparecem mais no catálogo para os visitantes.

---

## Aba: Interessados

Lista de pessoas que clicaram em **"Tenho interesse"** em algum produto do seu stand.

### O que cada registro mostra

- **Nome** e **Telefone** do visitante
- **Produto** de interesse
- **Data e hora** do registro
- **Status** atual do lead

### Gerenciar o status

Cada lead tem um status que você atualiza conforme avança no atendimento:

| Status | Quando usar |
|--------|------------|
| **Novo** | Recém-chegado, ainda não entrou em contato |
| **Atendido** | Já conversou com o cliente |
| **Pago** | Venda concluída |
| **Retirado** | Produto entregue / pedido finalizado |

Para alterar, clique no selector colorido ao lado do lead e escolha o novo status.

### Exportar para Excel

Clique no botão verde **Exportar Excel** para baixar um arquivo `.csv` com todos os interessados.

O arquivo pode ser aberto no Excel, Google Planilhas ou qualquer editor de tabelas. Colunas exportadas: Nome, Telefone, Produto, Status, Data.

---

## Aba: Visitas ao Stand

Relatório de interações dos visitantes com o seu stand. Os dados são acumulados durante todo o evento.

### Total de interações

Número grande em fundo escuro no topo — soma de todas as ações registradas no seu stand.

### Detalhamento por tipo

| Tipo de interação | O que conta |
|-------------------|-------------|
| **Visitas ao stand** | Visitante abriu o modal/card do seu stand |
| **Visualizações de produto** | Visitante clicou em um produto do catálogo |
| **Interesses de compra** | Cliques em "Tenho interesse" (= leads gerados) |
| **Cliques no Instagram** | Acessos ao seu Instagram via botão no stand |
| **Cliques no WhatsApp** | Acessos ao seu WhatsApp via botão no stand |
| **Cliques no site** | Acessos ao seu Website via botão no stand |
| **Compartilhamentos** | Stand compartilhado por visitantes |

### Produtos mais vistos

Ranking dos produtos com mais visualizações. A barra horizontal mostra proporcionalmente quantas views cada produto teve em relação ao mais acessado.

---

## Dúvidas frequentes

**Não consigo fazer login. O que fazer?**
Verifique se está usando o e-mail exato que foi cadastrado pela organização do evento. Se ainda não funcionar, entre em contato com o administrador do evento.

**Minha conta diz "Acesso não configurado". O que significa?**
Seu usuário foi criado mas ainda não foi vinculado a um stand. Avise o administrador do evento para fazer a vinculação.

**Alterei o perfil mas as mudanças não aparecem no app. Por quê?**
Certifique-se de clicar em **Salvar alterações** antes de sair da aba. O app atualiza em tempo real após o salvamento.

**Posso ter mais de um produto com o mesmo nome?**
Sim, não há restrição. Mas recomendamos nomes distintos para evitar confusão na lista de leads.

**Os dados de visitas são em tempo real?**
Sim. A aba de Visitas é carregada ao abrir, mostrando os dados mais recentes até aquele momento.

**Os interessados recebem alguma confirmação?**
Não automaticamente. O contato fica registrado com o telefone, e você entra em contato manualmente. Use o WhatsApp do cliente para um retorno rápido.
