import { useState, useEffect } from 'react';
import { getPendingEvaluations, subscribeToAllEvaluations } from '../../../services/evaluationService';
import type { Evaluation } from '../../../types';

export const useModerationEvaluations = (eventId: string | undefined) => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let mounted = true;

    const loadEvaluations = async () => {
      try {
        const data = await getPendingEvaluations(eventId);
        if (mounted) {
          setEvaluations(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching pending evaluations:', err);
        if (mounted) setLoading(false);
      }
    };

    loadEvaluations();

    const unsubscribe = subscribeToAllEvaluations(eventId, () => {
      if (!mounted) return;
      loadEvaluations();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [eventId]);

  return { evaluations, setEvaluations, loading };
};
