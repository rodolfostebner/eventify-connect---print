import { useState, useEffect, useRef } from 'react';
import type { TvConfig } from '../../../services/tvService';
import { ROTATION_MODULES, type RotationModuleId } from './theme';

/**
 * Motor de rotação dos módulos do telão.
 *
 * Regras:
 * - Monta a fila a partir de ROTATION_MODULES, pulando os módulos pausados.
 * - `active_module` força um módulo específico (não avança até ser limpo).
 * - `rotation_paused` congela no módulo atual.
 * - A duração configurada (`duration_modXX`) é o tempo de cada ITEM do módulo.
 *   O módulo permanece ativo por `duração × nº de itens`, garantindo que todos
 *   os seus itens apareçam em sequência antes de avançar para o próximo.
 *
 * Retorna o módulo ativo agora e se a rotação está congelada.
 */
export function useTvRotation(
  config: TvConfig | null,
  implemented: readonly RotationModuleId[] | undefined,
  itemCounts: Partial<Record<RotationModuleId, number>>,
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

  // Quantos itens o módulo ativo vai exibir (cada um pelo tempo configurado)
  const activeCount = activeModule ? Math.max(1, itemCounts[activeModule] ?? 1) : 1;

  // Mantém o índice dentro dos limites quando a fila muda
  useEffect(() => {
    if (queue.length > 0 && index >= queue.length) {
      setIndex(0);
    }
  }, [queue.length, index]);

  // Avanço automático — slot do módulo = duração por item × nº de itens
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (frozen || queue.length <= 1 || !activeModule || !config) return;

    const durationKey = `duration_${activeModule}` as keyof TvConfig;
    const perItem = Number(config[durationKey]) || 10;
    const seconds = perItem * activeCount;

    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % queue.length);
    }, seconds * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, activeCount, frozen, queue.length, config?.updated_at]);

  return { activeModule, forced: Boolean(forcedModule) };
}
