import { useMemo } from 'react';
import type { PhotoData, Partner } from '../../../types';
import { rotateByTime, pickPartnerPhoto, SPONSOR_ROTATION_MS } from '../../../lib/utils';

// ─── Tipos discriminados para o feed intercalado ─────────────────────────────

export interface FeedItemPhoto {
  type: 'photo';
  key: string;
  data: PhotoData;
}

export interface FeedItemSponsor {
  type: 'sponsor';
  key: string;
  data: Partner;
  photoUrl: string | null;
}

export type FeedItem = FeedItemPhoto | FeedItemSponsor;

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Pausa em número de fotos após completar um ciclo inteiro de parceiros */
const CYCLE_GAP = 15;

// Gerador pseudo-aleatório simples (LCG) com semente fixa para estabilidade
function createPRNG(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Intercala cards de parceiros entre fotos do feed.
 *
 * Regras:
 * - Apenas parceiros com `active && show_on_feed && photos.length > 0` entram
 * - A cada `interval` fotos (6 no timeline, aleatório entre 8 e 14 no grid) insere 1 card
 * - Percorre os parceiros em ordem rotacionada (rotateByTime — rodízio justo)
 * - Processado cronologicamente de baixo para cima (da mais antiga para a mais nova),
 *   garantindo que os patrocinadores se movam para baixo junto com as fotos à medida que novos
 *   posts são feitos no topo.
 * - Quando fechar um ciclo completo de parceiros, aplica pausa de 15 fotos.
 */
export function useInterleavedFeed(
  photos: PhotoData[],
  partners: Partner[],
  interval: number,
): FeedItem[] {
  return useMemo(() => {
    // Filtra parceiros elegíveis para o feed
    const eligible = partners.filter(
      p => p.active && p.show_on_feed && p.photos && p.photos.length > 0,
    );

    // Se não há parceiros elegíveis, retorna só fotos
    if (eligible.length === 0) {
      return photos.map(p => ({ type: 'photo' as const, key: p.id, data: p }));
    }

    // Aplica rodízio justo por tempo
    const rotated = rotateByTime(eligible, SPONSOR_ROTATION_MS);
    const sponsorCount = rotated.length;

    // Inverte a lista de fotos para processar da mais antiga para a mais nova (bottom-up)
    const reversedPhotos = [...photos].reverse();
    const reversedResult: FeedItem[] = [];

    // PRNG para obter intervalos pseudo-aleatórios e estáveis no grid
    const rng = createPRNG(42);
    const getNextInterval = () => {
      if (interval === 6) return 6; // Timeline usa fixo de 6
      // Grid usa aleatório estável entre 8 e 14
      return Math.floor(rng() * 7) + 8;
    };

    let currentInterval = getNextInterval();
    // Inicializa photosSinceLastSponsor = currentInterval para que o primeiro patrocinador
    // seja inserido imediatamente no primeiro elemento processado da ordem reversa
    // (o que no feed desreversado ficará como o segundo item, logo abaixo do post mais recente).
    let photosSinceLastSponsor = currentInterval;

    let sponsorIndex = 0;
    let sponsorsInCurrentCycle = 0;
    let gapRemaining = 0;
    let slotIndex = 0;

    for (const photo of reversedPhotos) {
      // Se há um gap pós-ciclo pendente, processa a foto e decrementa o gap
      if (gapRemaining > 0) {
        reversedResult.push({ type: 'photo', key: photo.id, data: photo });
        gapRemaining--;
        // Garante que o contador de fotos desde o último patrocinador fique zerado durante o gap
        photosSinceLastSponsor = 0;
        continue;
      }

      // Se atingimos ou superamos o intervalo, insere o patrocinador ANTES da foto (ordem reversa)
      // para que na visualização normal (nova -> antiga) ele fique ABAIXO dessa foto.
      if (photosSinceLastSponsor >= currentInterval) {
        const partner = rotated[sponsorIndex % sponsorCount];
        const photoUrl = pickPartnerPhoto(partner.photos, slotIndex);

        reversedResult.push({
          type: 'sponsor',
          key: `sponsor-${partner.id}-${slotIndex}`,
          data: partner,
          photoUrl,
        });

        photosSinceLastSponsor = 0;
        sponsorIndex++;
        sponsorsInCurrentCycle++;
        slotIndex++;
        currentInterval = getNextInterval();

        if (sponsorsInCurrentCycle >= sponsorCount) {
          sponsorsInCurrentCycle = 0;
          gapRemaining = CYCLE_GAP;
        }
      }

      // Adiciona a foto do feed
      reversedResult.push({ type: 'photo', key: photo.id, data: photo });
      photosSinceLastSponsor++;
    }

    // Desinverte o resultado final para retornar o feed na ordem normal (mais recentes no topo)
    return reversedResult.reverse();
  }, [photos, partners, interval]);
}
