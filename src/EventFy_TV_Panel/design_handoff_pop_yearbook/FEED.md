# Feed de exemplo — `feed.example.json`

Mock da resposta da API que alimenta o painel, para desenvolver o front antes do banco estar pronto. A forma espelha o schema em `COMPONENTS_AND_DATA.md`.

## Como usar no Next

```ts
// app/api/panel/feed/route.ts  (mock temporário)
import feed from '@/mocks/feed.example.json';
export async function GET() {
  return Response.json(feed);
}
```

```ts
// no client (<EventPanel>)
const feed = await fetch('/api/panel/feed').then(r => r.json());
// feed.config        → Tweaks/configuração da rotação
// feed.visitorPhotos → filtre approved === true; ranking = ordby votes desc, top 5
// feed.exhibitors    → tier "gold" vão pro slide destaque; demais entram no trio
// feed.partners      → 1 por slide de parceiro
// feed.raffle        → status: "scheduled" | "counting" | "revealed"
// feed.alerts        → kind: "full" | "overlay" | "ticker" (active === true dispara)
// feed.ticker        → itens do rodapé
// feed.command       → modo atual do painel (rotate | overlay | alertFull | raffle)
```

## Campo `command` (controle em tempo real)

O `command` no fim do JSON representa o que o canal em tempo real empurraria. No mock está `{"type":"rotate"}` (rotação normal). Para testar os outros modos, troque por:

```jsonc
// aviso lateral (não congela a rotação)
{ "type": "overlay", "alertId": "a2", "ttlMs": 7000 }

// aviso full-bleed (congela a rotação)
{ "type": "alertFull", "alertId": "a1", "ttlMs": 9000 }

// rifa — fase de contagem (usa raffle.drawAt para o relógio)
{ "type": "raffle", "raffleId": "r1", "phase": "counting" }

// rifa — revelação da vencedora (defina raffle.winnerPhotoId e status "revealed")
{ "type": "raffle", "raffleId": "r1", "phase": "revealed" }
```

No app real isso vem por SSE/WebSocket, não dentro do feed — está aqui só para mock. Ver `COMPONENTS_AND_DATA.md → §Triggers`.

## Notas
- `imageUrl` aponta para `https://yourcdn.example/...` — troque pelo seu storage. No protótipo são placeholders do picsum.
- `visitorPhotos[5]` (`Lucas Prado`) tem `approved: false` de propósito — **não deve** entrar na rotação nem no ranking. Use para testar o filtro de moderação.
- `reactions` aqui é objeto aninhado; no schema Prisma sugerido são colunas (`reactHeart`...). Use o que fizer sentido no seu banco.
