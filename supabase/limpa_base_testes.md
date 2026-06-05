# Limpeza da base de testes

Documentação do que o script [`limpa_base_testes.sql`](./limpa_base_testes.sql) apaga.
Use a lista abaixo para comunicar aos usuários/expositores antes de uma limpeza.

> ⚠️ A limpeza **não filtra por evento** — zera os dados de todos os eventos.
> As imagens no Cloudflare R2 permanecem armazenadas (o script remove apenas
> os registros no banco).

## 🧹 Dados que serão zerados

- 📸 **Fotos do feed** — todas as fotos enviadas ao mural
- ❤️ **Curtidas e reações** nas fotos
- 💬 **Comentários** nas fotos
- 👁️ **Visualizações** das fotos
- 🖨️ **Pedidos de impressão** de fotos
- 📊 **Visitas e métricas dos stands** — acessos aos expositores, cliques em Instagram/WhatsApp/site, compartilhamentos e visualizações de produtos
- 🛒 **Interesses de compra (leads)** registrados nos produtos
- ⭐ **Avaliações do público** — estrelas e comentários dos expositores
- 🧑‍⚖️ **Notas dos jurados**
- 🔔 **Notificações** enviadas
- 🎟️ **Participações no sorteio** e 🎁 **prêmios cadastrados**
- 📢 **Avisos/anúncios** cadastrados
- 📜 **Histórico de auditoria** do evento

## ✅ O que permanece intacto

Expositores, produtos, parceiros, usuários e suas permissões, categorias
(de expositores e de avaliação), pré-cadastros de acesso, os eventos
cadastrados e as mensagens de contato da landing page.
