import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { subscribeToEvents, createEvent, updateEvent, inactivateEvent } from '../../../services/eventService';
import type { EventData } from '../../../types';

export function useAdminEvents(userId: string | undefined) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventAdminEmail, setNewEventAdminEmail] = useState('');

  useEffect(() => {
    if (!userId) return;
    return subscribeToEvents(
      (eventList) => setEvents(eventList),
      (error) => console.error('Error fetching events:', error),
    );
  }, [userId]);

  const updateStatus = async (eventId: string, status: 'pre' | 'live' | 'post') => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status } : e));
    try {
      await updateEvent(eventId, { status });
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar status do evento.');
    }
  };

  const handleInactivateEvent = async (eventId: string) => {
    try {
      await inactivateEvent(eventId);
      toast.success('Evento inativado com sucesso.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao inativar evento.');
    }
  };

  const createNewEvent = async () => {
    if (!newEventName || !newEventSlug) {
      toast.error('Preencha o nome e o slug do evento.');
      return;
    }
    setLoading(true);
    try {
      await createEvent({
        name: newEventName,
        slug: newEventSlug,
        date: new Date().toISOString(),
        countdown_active: true,
        status: 'pre',
        services: [],
        admin_emails: newEventAdminEmail ? [newEventAdminEmail] : [],
      });
      toast.success(`Evento criado! Acesse /event/${newEventSlug}`);
      setNewEventName('');
      setNewEventSlug('');
      setNewEventAdminEmail('');
    } catch (e: any) {
      if (e?.message === 'SLUG_TAKEN') {
        toast.error('Este slug já está em uso. Escolha outro.');
      } else {
        console.error(e);
        toast.error('Erro ao criar evento. Verifique as regras de segurança.');
      }
    }
    setLoading(false);
  };

  return {
    events,
    setEvents,
    loading,
    newEventName,
    setNewEventName,
    newEventSlug,
    setNewEventSlug,
    newEventAdminEmail,
    setNewEventAdminEmail,
    updateStatus,
    handleInactivateEvent,
    createNewEvent,
  };
}
