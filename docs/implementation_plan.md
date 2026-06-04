# Plano de Implementação: Aba de Leads de Contato no Painel Administrativo

Este plano detalha a criação de uma nova aba "Leads" no painel de administração (`AdminDashboard.tsx`) do Eventify. Essa aba permitirá que os administradores gerenciem os leads captados pelo formulário de contato da Landing Page, espelhando as funcionalidades existentes no painel de leads dos expositores.

## User Review Required

> [!IMPORTANT]
> A nova tela de leads do admin exibirá os contatos captados pelo formulário público da Landing Page ("Fale com um Especialista"). 
> 
> Confirmamos as seguintes funcionalidades mapeadas a partir da tela de leads de expositores:
> 1. **Contador Total**: Exibição da quantidade total de leads captados.
> 2. **Lista/Cards de Leads**: Exibição dos dados (Nome, Telefone, E-mail, Nome do Evento e Data de Criação).
> 3. **Alteração de Status**: Dropdown com os status específicos da Landing Page (`Novo`, `Contatado`, `Concluído`) mapeados internamente para os valores do banco de dados (`new`, `contacted`, `closed`).
> 4. **Exportação CSV**: Botão para download de planilha CSV formatada com todos os leads.
> 5. **Filtro / Busca**: Barra de busca por nome, e-mail ou evento (não existente nos expositores, mas altamente recomendada para o volume de admin).
> 6. **Exclusão de Lead (Opcional)**: Capacidade de remover um lead inválido ou de teste.

## Open Questions

> [!WARNING]
> 1. **Mapeamento de Status**: Sugerimos os status `Novo` (new), `Contatado` (contacted) e `Concluído` (closed). Deseja manter estes ou prefere outros termos?
> 2. **Filtros e Busca**: Deseja adicionar busca rápida por texto (nome/e-mail) ou filtros por status na tela?
> 3. **Exclusão**: Devemos permitir que os administradores excluam leads diretamente da lista?

---

## Proposed Changes

### Componente de Backend/Serviço

#### [MODIFY] [contactLeadService.ts](file:///d:/OneDrive - wizardblumenau.com.br/APP PROJECTS/KOALAS/eventify-connect-&-print/eventify-connect---print/src/services/contactLeadService.ts)
- Adicionar a tipagem de retorno completa contendo `id`, `status` e `created_at`.
- Criar a função `getContactLeads(): Promise<ContactLead[]>` que busca todos os registros da tabela `contact_leads` ordenados por `created_at` descendente.
- Criar a função `updateContactLeadStatus(id: string, status: string): Promise<void>` para atualizar o status do lead no banco.
- Criar a função `deleteContactLead(id: string): Promise<void>` (caso aprovado).

---

### Componentes de Frontend

#### [NEW] [ContactLeadsPanel.tsx](file:///d:/OneDrive - wizardblumenau.com.br/APP PROJECTS/KOALAS/eventify-connect-&-print/eventify-connect---print/src/features/admin/components/ContactLeadsPanel.tsx)
- Novo componente para renderizar a aba de leads captados.
- Implementar tabela ou lista responsiva exibindo as colunas:
  - Nome
  - E-mail & Telefone
  - Evento de Interesse
  - Data de Envio
  - Status (seletor dropdown interativo com as cores estilizadas)
- Implementar exportação para CSV (`exportContactLeadsCSV`).
- Implementar barra de pesquisa e filtros.

#### [MODIFY] [AdminDashboard.tsx](file:///d:/OneDrive - wizardblumenau.com.br/APP PROJECTS/KOALAS/eventify-connect-&-print/eventify-connect---print/src/features/admin/AdminDashboard.tsx)
- Adicionar o estado de aba `leads` no tipo `activeTab`.
- Atualizar a navegação de abas no cabeçalho do painel para incluir o botão de Leads ao lado do botão de Usuários.
- Renderizar o componente `<ContactLeadsPanel />` quando a aba ativa for `leads`.

---

## Verification Plan

### Automated Tests
- N/A (Validação manual de rotas e operações do painel)

### Manual Verification
1. Fazer login como Administrador geral e acessar o Dashboard principal `/admin`.
2. Verificar a existência da aba "Leads" ao lado de "Usuários".
3. Clicar na aba "Leads" e verificar o carregamento de dados.
4. Alterar o status de um lead no dropdown e certificar-se de que a alteração persiste após recarregar a página.
5. Clicar em "Exportar Excel" e verificar a geração correta do arquivo CSV.
6. Submeter um novo lead através do formulário da Landing Page e verificar se ele aparece instantaneamente ou ao atualizar a aba.
