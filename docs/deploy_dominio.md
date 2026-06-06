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

## Domínio canônico — sessão única e redirect (config aplicada em 2026-06-06)

> **Contexto:** a sessão de login (Supabase Auth) é guardada pelo navegador **por
> origem**. Com dois domínios ativos (`memorieshub.com.br` e
> `eventify-connect-print.vercel.app`), o usuário logava num e o outro continuava
> deslogado — abrindo a landing num domínio e o app no outro, e sem auto-login ao
> reabrir. A solução é forçar **um único domínio canônico**: `memorieshub.com.br`.

São **três frentes** que precisam estar todas configuradas:

### 1. Redirect de auth no código (já feito)

`src/services/authService.ts` usa `getAppUrl()` em `redirectTo` (Google OAuth) e
`emailRedirectTo` (Magic Link). `getAppUrl()` retorna `VITE_APP_URL` ou, na
ausência dela, `window.location.origin`. Assim o login **retorna sempre ao domínio
canônico** quando `VITE_APP_URL` está definida.

### 2. Variável de ambiente na Vercel

- **Settings → Environment Variables:** `VITE_APP_URL = https://memorieshub.com.br`
- ⚠️ `VITE_APP_URL` é variável **de build** (o Vite a "assa" no bundle). A mudança
  **só vale após um novo deploy** — não basta salvar a env.

### 3. Supabase Auth — URL Configuration

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `https://memorieshub.com.br`
- **Redirect URLs** (allowlist) — adicionar todos:
  - `https://memorieshub.com.br/**`
  - `https://www.memorieshub.com.br/**` (se o `www` estiver ativo)
  - `https://eventify-connect-print.vercel.app/**`
  - `http://localhost:3000/**`

> O **callback do Google** no Supabase (`https://<ref>.supabase.co/auth/v1/callback`)
> **não muda** — é sempre no domínio do Supabase. No Google Cloud Console também não
> é preciso mexer, pois quem redireciona de volta ao app é o Supabase.

### 4. Redirect de acesso direto à URL da Vercel (`vercel.json`)

O domínio **automático** `*.vercel.app` **não pode** ser redirecionado pela tela
de Domains da Vercel (lá só dá pra redirecionar domínios customizados). Por isso o
redirect de **acesso direto** (antes de qualquer login) é feito por um redirect de
edge no `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "eventify-connect-print.vercel.app" }],
      "destination": "https://memorieshub.com.br/$1",
      "permanent": true
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- Redireciona com **308** qualquer acesso à URL de produção da Vercel para o
  domínio canônico, **preservando path e query** (`$1`).
- Mira **só a URL de produção** — os **preview deployments** de branch (outras
  `*.vercel.app`) seguem funcionando normalmente para teste.
- ⚠️ O navegador faz **cache de redirect 308**. Ao validar, use aba anônima ou
  limpe o cache para não confundir.

### Como validar o fluxo completo

1. Aba anônima → abrir `https://eventify-connect-print.vercel.app` → deve
   redirecionar na hora para `memorieshub.com.br` (antes do login).
2. Em `memorieshub.com.br` sem sessão → mostra a **landing**.
3. Login por Google → ao voltar, a URL permanece em `memorieshub.com.br`.
4. Fechar e reabrir `memorieshub.com.br` → **auto-login** direto na tela da role.
5. Repetir o teste com login por **código (OTP)**.

---

## Checklist final

- [ ] Domínio adicionado na Vercel (apex + www)
- [ ] Registro **A** do apex criado no Registro.br (`76.76.21.21`)
- [ ] Registro **CNAME** do `www` criado no Registro.br (`cname.vercel-dns.com`)
- [ ] Status "Valid Configuration" na Vercel ✅
- [ ] HTTPS funcionando (cadeado no navegador)
- [ ] `VITE_APP_URL` = `https://memorieshub.com.br` na Vercel **+ redeploy**
- [ ] Site URL = domínio canônico no Supabase Auth
- [ ] Redirect URLs incluem canônico + `www` + `*.vercel.app` + `localhost` no Supabase
- [ ] Redirect de edge no `vercel.json` (URL da Vercel → domínio canônico)
- [ ] Acesso direto à URL da Vercel redireciona antes do login (testado em aba anônima)
- [ ] Login (Google OAuth + OTP/Magic Link) testado no domínio canônico
- [ ] Auto-login ao reabrir funcionando no domínio canônico

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

## Login por link de 1 toque no e-mail (desativado em 2026-06-06 — como reativar)

> **Por que está desativado:** o botão aponta para `memorieshub.com.br` (domínio
> novo, sem reputação). Enquanto o domínio/Resend não estiverem "aquecidos" (DKIM +
> SPF + DMARC verificados e histórico de envio), links para domínio novo aumentam o
> greylisting do iCloud e atrasam a entrega. Por isso voltamos ao **e-mail só com
> código OTP**. Quando a reputação estiver madura, reative o link — ele é seguro
> contra scanners (ver abaixo).

**Pré-requisitos para reativar com segurança:**
- Resend com `memorieshub.com.br` **Verified** (DKIM/SPF/DMARC OK).
- Sender no domínio (`no-reply@memorieshub.com.br`) e `Site URL` do Supabase = canônico.
- Entrega no iCloud em segundos (testar com mail-tester.com, mira 9–10/10).

**1. Template `supabase/templates/magic_link.html`** — reinserir o botão logo após
o bloco do código OTP (antes do `<!-- Instrução -->`):

```html
<!-- Botão de 1 toque (abre a tela de login com o código preenchido) -->
<tr>
  <td align="center" style="padding:20px 40px 0 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr>
        <td align="center" bgcolor="#1A1816" style="border-radius:14px;">
          <a class="btn" href="{{ .SiteURL }}/login?email={{ .Email }}&otp={{ .Token }}"
             style="display:inline-block; padding:14px 32px; font-family:'Outfit', Arial, sans-serif; font-size:15px; font-weight:700; color:#FFFFFF; background-color:#1A1816; border-radius:14px; text-decoration:none;">
            Entrar com 1 toque
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

E ajustar a instrução para: _"Toque no botão acima para entrar direto, ou digite o
código na tela de login do Eventify."_

**2. `src/features/landing/components/LoginModal.tsx`** — reativar a leitura da URL.
Importar `useSearchParams` do `react-router-dom`, e dentro do componente:

```tsx
const [searchParams] = useSearchParams();
const autoLoginTried = useRef(false);

// Abrir a página NÃO consome o token — a verificação só roda aqui, e o guard de
// visibilidade evita que scanners de e-mail (que buscam em 2º plano) o consumam.
useEffect(() => {
  if (BETA_MODE || autoLoginTried.current) return;
  const urlEmail = searchParams.get('email');
  const urlCode = (searchParams.get('otp') || '').replace(/\D/g, '');
  if (!urlEmail || urlCode.length < 6) return;

  autoLoginTried.current = true;
  setEmail(urlEmail);
  setCode(urlCode);
  setSent(true);

  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    (async () => {
      setVerifying(true);
      try {
        await verifyOtp(urlEmail.trim(), urlCode);
      } catch {
        toast.error('Não foi possível entrar automaticamente. Confira o código e toque em Entrar.');
      } finally {
        setVerifying(false);
      }
    })();
  }
}, [searchParams, verifyOtp]);
```

> **Notas de design:** usar `otp` (não `code`) no query param — `code` colide com o
> fluxo PKCE do `supabase-js` (`detectSessionInUrl`). O guard `visibilityState`
> garante que scanners de e-mail (Outlook Safe Links / iCloud), que buscam em 2º
> plano, **não** disparem a verificação e consumam o token. O código manual no
> e-mail continua como fallback. Commits de referência: `f49f527` (implementação)
> e `2a10ecc` (desativação).

---

## Referências

- Vercel — [Adding & Configuring a Custom Domain](https://vercel.com/docs/projects/domains)
- Vercel — [Web Analytics](https://vercel.com/docs/analytics)
- Registro.br — [Editar Zona DNS](https://registro.br/ajuda/dns/)
