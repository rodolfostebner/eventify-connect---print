import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { subscribeToPrintOrders, completePrintOrder, deletePrintOrder } from '../../../services/printService';
import { fetchPosts } from '../../../services/posts';
import type { PrintOrder, PhotoData } from '../../../types';

export function usePrintQueue(eventId: string | undefined) {
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [photosMap, setPhotosMap] = useState<Record<string, PhotoData>>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load photos map (id -> photo) for displaying thumbnails
  useEffect(() => {
    if (!eventId) return;
    fetchPosts(eventId)
      .then(photos => {
        const map: Record<string, PhotoData> = {};
        photos.forEach(p => { map[p.id] = p; });
        setPhotosMap(map);
      })
      .catch(console.error);
  }, [eventId]);

  // Subscribe to print orders in real-time
  useEffect(() => {
    if (!eventId) return;

    const unsubscribe = subscribeToPrintOrders(
      eventId,
      (updatedOrders) => {
        setOrders(updatedOrders);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching print orders:', err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [eventId]);

  const handleComplete = useCallback(async (orderId: string) => {
    setProcessingId(orderId);
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    try {
      await completePrintOrder(orderId);
      toast.success('Pedido marcado como concluído!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao concluir pedido.');
      // Revert on failure
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' } : o));
    } finally {
      setProcessingId(null);
    }
  }, []);

  const handleDelete = useCallback(async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await deletePrintOrder(orderId);
      toast.success('Pedido removido.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover pedido.');
    }
  }, []);

  const pendingCount = orders.filter(o => o.status !== 'completed').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  return {
    orders,
    photosMap,
    loading,
    processingId,
    pendingCount,
    completedCount,
    handleComplete,
    handleDelete,
  };
}
