import { useState, useEffect } from 'react';
import { subscribeToPrintOrders } from '../../../services/printService';
import type { PrintOrder } from '../../../types';

export const usePrintOrders = (eventId: string | undefined) => {
  const [printOrders, setPrintOrders] = useState<PrintOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    
    setLoading(true);
    const unsubscribe = subscribeToPrintOrders(
      eventId,
      (orders) => {
        setPrintOrders(orders);
        setLoading(false);
      },
      (err) => {
        console.error('Error subscribing to print orders:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  return { printOrders, loading };
};
