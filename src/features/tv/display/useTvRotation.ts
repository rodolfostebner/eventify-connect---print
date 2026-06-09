import { useState, useEffect, useRef } from 'react';
import type { TvConfig } from '../../../services/tvService';
import { ROTATION_MODULES, type RotationModuleId } from './theme';

// Quantos slides cada módulo exibe por visita (carrosséis mostram um lote).
// O tempo total do slot = duração × nº de slides, mantendo motor e módulo em sincronia.
export const SLIDES_PER_VISIT: Record<RotationModuleId, number> = {
  mod01: 1, mod02: 5, mod03: 1, mod04: 1, mod05: 1, mod06: 1,
};

/**
 * Motor de rotação dos módulos do telão.
 *
 * Regras:
 * - Monta a fila a partir de ROTATION_MODULES, pulando os módulos pausados.
 * - `active_module` força um módulo específico (não avança até ser limpo).
 * - `rotation_paused` congela no módulo atual.
 * - Cada módulo permanece `duration_modXX` segundos antes de avançar.
 *
 * Retorna o módulo ativo agora e se a rotação está congelada.
 */
export function useTvRotation(
  config: TvConfig | null,
  implemented?: readonly RotationModuleId[],
): {
  activeModule: RotationModuleId | null;
  forced: boolean;
} {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fila de módulos ativos (não pausados e — se informado — já implementados)
  const queue: RotationModuleId[] = (config ? ROTATION_MODULES.filter(
    (m) => !config[`paused_${m}` as keyof TvConfig],
  ) : [...ROTATION_MODULES]).filter((m) => !implemented || implemented.includes(m));

  // Só honra um módulo forçado se ele estiver implementado; senão ignora e
  // mantém a rotação normal (evita travar o telão num módulo inexistente).
  const rawForced = (config?.active_module as RotationModuleId | null) || null;
  const forcedModule = rawForced && (!implemented || implemented.includes(rawForced)) ? rawForced : null;
  const frozen = Boolean(config?.rotation_paused) || Boolean(forcedModule);

  // Módulo atual: forçado tem prioridade; senão posição na fila
  const activeModule: RotationModuleId | null = forcedModule
    ? forcedModule
    : queue.length > 0
      ? queue[index % queue.length]
      : null;

  // Mantém o índice dentro dos limites quando a fila muda
  useEffect(() => {
    if (queue.length > 0 && index >= queue.length) {
      setIndex(0);
    }
  }, [queue.length, index]);

  // Avanço automático
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (frozen || queue.length <= 1 || !activeModule || !config) return;

    const durationKey = `duration_${activeModule}` as keyof TvConfig;
    const seconds = (Number(config[durationKey]) || 10) * (SLIDES_PER_VISIT[activeModule] ?? 1);

    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % queue.length);
    }, seconds * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, frozen, queue.length, config?.updated_at]);

  return { activeModule, forced: Boolean(forcedModule) };
}
