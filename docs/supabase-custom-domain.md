# Custom Domain do Supabase (trocar `...supabase.co` no OAuth do Google)

> **Objetivo:** fazer a tela de consentimento do Google mostrar
> "Prosseguir para **auth.memorieshub.com.br**" em vez de
> "Prosseguir para `ijhakkzpzmybkuankucv.supabase.co`".
>
> Status: **pendente** — fazer quando decidir pagar o add-on.

---

## Por que isso é necessário

A linha "Prosseguir para `...supabase.co`" mostra o domínio que **recebe o callback
do OAuth**. Como o fluxo passa pela URL do projeto Supabase, é esse domínio que
aparece. O **único** jeito de trocá-lo é ativar o **Custom Domain do Supabase**.

Não confundir com:
- **Nome do app + logo** na tela de consentimento → configurado no Google Cloud
  (tela de permissão OAuth), de graça. É outro assunto.
- **Neon / outra hospedagem** → não resolve; Neon é só Postgres, não tem Auth.

---

## Custo

| Item | Custo | Observação |
|---|---|---|
| Plano **Pro** do projeto | ~US$ 25/mês | O add-on só existe em plano pago (Free não tem) |
| Add-on **Custom Domains** | ~US$ 10/mês | O recurso em si |

Se o projeto já estiver no Pro, paga só os +US$ 10/mês.

---

## Passo a passo

### 1. Subir pro plano Pro (se estiver no Free)
- Dashboard Supabase → organização → **Billing** → **Upgrade** para **Pro** → cadastrar cartão.

### 2. Ativar o add-on Custom Domains
- **Project Settings** → **General** → seção **Custom Domains** → habilitar o add-on.

### 3. Escolher o subdomínio e apontar o DNS
Subdomínio dedicado recomendado (não conflita com o app na Vercel):
```
auth.memorieshub.com.br
```
No **Registro.br** (mesmo lugar onde foi adicionado o TXT de verificação do Search Console):
- **CNAME** → Nome/Host: `auth` → Valor: o destino que o Supabase mostrar (`...supabase.co`).
- **TXT** de verificação → adicionar o que o Supabase pedir.

### 4. Verificar e ativar
Pelo dashboard (botões **Verify / Activate**) ou via CLI:
```bash
supabase domains create --project-ref ijhakkzpzmybkuankucv --custom-hostname auth.memorieshub.com.br
supabase domains activate --project-ref ijhakkzpzmybkuankucv
```

---

## Depois que o domínio estiver ativo (mudanças no projeto)

### 1. Google Cloud Console
APIs e Serviços → Credenciais → OAuth Client → **URIs de redirecionamento autorizados**, adicionar:
```
https://auth.memorieshub.com.br/auth/v1/callback
```
(manter o antigo `...supabase.co/auth/v1/callback` durante a transição).

### 2. Variáveis de ambiente (`.env.local` e Vercel)
Trocar a URL do Supabase para o domínio novo:
```env
VITE_SUPABASE_URL=https://auth.memorieshub.com.br
```
Isso faz o fluxo OAuth passar pelo domínio próprio → Google mostra
"Prosseguir para auth.memorieshub.com.br".

### 3. Rebuild / redeploy na Vercel.

---

## Checklist

- [ ] Projeto no plano Pro
- [ ] Add-on Custom Domains ativado
- [ ] CNAME `auth` + TXT no Registro.br
- [ ] Domínio verificado e ativado (dashboard ou CLI)
- [ ] Redirect URI novo no Google Cloud
- [ ] `VITE_SUPABASE_URL` atualizado (.env.local + Vercel)
- [ ] Redeploy na Vercel
- [ ] Testar login em aba anônima → conferir a linha do domínio

---

## Antes disso: por que o NOME DO APP não aparece (gratuito, resolver primeiro)

Sintoma: tela mostra só "Fazer login", sem "MemoriesHub".

Causa nº 1: **a tela de consentimento editada não é a do projeto Google que o
Supabase usa de fato.** A tela de consentimento é por projeto.

Conferir:
1. Supabase → Authentication → Providers → Google → copiar o **Client ID**.
2. Google Cloud Console → conferir o **seletor de projeto** no topo → APIs e
   Serviços → Credenciais → achar esse mesmo Client ID.
3. Nesse projeto (o certo), editar **Tela de permissão OAuth** → campo
   **Nome do app** = `MemoriesHub` → salvar.

Outras causas: não salvou/publicou; cache (propaga em min~horas); logout
incompleto (testar em aba anônima).
