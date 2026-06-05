# Deploy de Domínio — Vercel + Registro.br

Guia passo a passo para registrar um domínio próprio na Vercel e apontar o DNS no
Registro.br para o projeto **Eventify Connect & Print**.

> Mantenha este documento atualizado sempre que o domínio, os IPs da Vercel ou a
> estrutura de DNS mudarem.

---

## Visão geral

O processo tem **dois lados** que precisam estar coordenados:

1. **Vercel** — adicionar o domínio ao projeto e obter os registros DNS a criar.
2. **Registro.br** — criar esses registros na zona DNS do domínio.

Depois é só aguardar a propagação e validar. O **certificado SSL (HTTPS)** é
emitido automaticamente pela Vercel assim que o DNS validar.

---

## Pré-requisitos

- Domínio `.com.br` (ou outro) já registrado e ativo no [registro.br](https://registro.br).
- Acesso de administrador ao projeto na [Vercel](https://vercel.com).
- O projeto já implantado na Vercel (deploy de produção funcionando no domínio `*.vercel.app`).

---

## Parte 1 — Adicionar o domínio na Vercel

1. Acesse o projeto na Vercel → aba **Settings** → **Domains**.
2. Digite o domínio (ex.: `seudominio.com.br`) e clique em **Add**.
3. A Vercel sugere adicionar tanto o **apex** (`seudominio.com.br`) quanto o
   **www** (`www.seudominio.com.br`). Recomendado adicionar os dois e definir qual
   é o principal — o outro passa a redirecionar automaticamente.
4. A Vercel exibe os **registros DNS a criar**. Anote os valores exatos da sua tela.
   Os valores padrão atuais costumam ser:

   - **Apex (`@`)** → registro **A** apontando para `76.76.21.21`
   - **www** → registro **CNAME** apontando para `cname.vercel-dns.com`

   > ⚠️ Use sempre os valores **exatos que a sua tela da Vercel mostrar**, pois
   > podem variar com o tempo ou conforme a conta/projeto.

---

## Parte 2 — Configurar o DNS no Registro.br

Forma mais simples: usar o **DNS hospedado pelo próprio Registro.br** (sem trocar
os servidores de nomes para outro provedor).

1. Entre em [registro.br](https://registro.br) → faça login → clique no domínio.
2. Vá em **DNS** → **Editar Zona** (o "DNS hosted by Registro.br" precisa estar ativo).
3. Adicione os registros conforme a Vercel pediu:

   | Tipo  | Nome / Host             | Valor / Dados            |
   |-------|-------------------------|--------------------------|
   | A     | (em branco ou `@`)      | `76.76.21.21`            |
   | CNAME | `www`                   | `cname.vercel-dns.com`   |

4. **Salve** as alterações.

> ⚠️ **Apex não aceita CNAME:** o Registro.br **não** permite registro CNAME na
> raiz do domínio (`@`). Por isso o apex usa registro **A** com o IP, e somente o
> `www` usa CNAME. É exatamente o que a Vercel recomenda.

---

## Parte 3 — Propagação e validação

- A propagação de DNS pode levar de **alguns minutos a algumas horas** (depende do TTL).
- Na Vercel (**Settings → Domains**), o status deve mudar de
  **"Invalid Configuration"** para **"Valid Configuration"** ✅.
- O **SSL/HTTPS** é provisionado automaticamente pela Vercel após a validação do DNS.
- Para checar a propagação, use ferramentas como
  [dnschecker.org](https://dnschecker.org) ou:

  ```bash
  nslookup seudominio.com.br
  nslookup www.seudominio.com.br
  ```

---

## Decisão: apex vs www como principal

- **Apex principal** (`seudominio.com.br`) — URL mais curta e limpa. `www` redireciona.
- **www principal** (`www.seudominio.com.br`) — leve vantagem técnica em CDN/cookies.

Recomendado para este projeto: **apex como principal**, com `www` redirecionando.
A escolha é definida na própria tela de Domains da Vercel.

---

## Impacto no app (variáveis de ambiente)

- `VITE_APP_URL` — se estiver definida no `.env` / nas Environment Variables da
  Vercel, atualize para o novo domínio (ex.: `https://seudominio.com.br`). Se não
  estiver definida, o app usa `window.location.origin` automaticamente (ver
  `lib/utils.ts → getAppUrl()`), então funciona sem alteração.
- **Supabase Auth** — adicione o novo domínio nas URLs de redirecionamento permitidas:
  Supabase Dashboard → **Authentication** → **URL Configuration** →
  **Site URL** e **Redirect URLs** (ex.: `https://seudominio.com.br/**`).
  Sem isso, Google OAuth e Magic Link falham no novo domínio.
- **Templates de email** (`supabase/templates/`) — confirme que os links gerados
  apontam para o domínio correto após a troca.

---

## Checklist final

- [ ] Domínio adicionado na Vercel (apex + www)
- [ ] Registro **A** do apex criado no Registro.br (`76.76.21.21`)
- [ ] Registro **CNAME** do `www` criado no Registro.br (`cname.vercel-dns.com`)
- [ ] Status "Valid Configuration" na Vercel ✅
- [ ] HTTPS funcionando (cadeado no navegador)
- [ ] `VITE_APP_URL` atualizada (se aplicável)
- [ ] Site URL / Redirect URLs atualizadas no Supabase Auth
- [ ] Login (Google OAuth + Magic Link) testado no novo domínio

---

## Vercel Web Analytics

Coleta de pageviews e métricas de tráfego diretamente no painel da Vercel, sem
depender de Google Analytics.

### Já feito no código (2026-06-05)

- Pacote instalado: `npm i @vercel/analytics`
- Componente montado na raiz do app, em `src/main.tsx`, dentro do `AuthProvider`:

  ```tsx
  import { Analytics } from '@vercel/analytics/react';

  // ...
  <App />
  <Analytics />
  ```

- Como o app é um **SPA com React Router**, as trocas de rota são rastreadas
  automaticamente — não é preciso configuração adicional.

### Pendente (no painel da Vercel)

1. No projeto, acesse **Settings → Analytics**.
2. Em **Web Analytics**, clique em **Enable**.
   > ⚠️ Sem habilitar aqui, **nenhum dado é coletado**, mesmo com o componente no código.
3. Faça (ou aguarde) um novo deploy de produção.
4. Os pageviews começam a aparecer no dashboard **Analytics** do projeto em alguns minutos.

### Observações

- Web Analytics tem um nível gratuito com limite de eventos/mês — verifique o plano
  da conta se o tráfego do evento for alto.
- Para rastrear eventos customizados (cliques, conversões), usar `track('nome_evento')`
  de `@vercel/analytics`. Ainda **não** implementado neste projeto — o app já tem
  rastreamento próprio de visitas/cliques via `visitService.ts` (tabela `visits`).

---

## Referências

- Vercel — [Adding & Configuring a Custom Domain](https://vercel.com/docs/projects/domains)
- Vercel — [Web Analytics](https://vercel.com/docs/analytics)
- Registro.br — [Editar Zona DNS](https://registro.br/ajuda/dns/)
