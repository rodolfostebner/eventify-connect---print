/**
 * hooks/useEvents.ts
 *
 * Wraps subscribeToEvents into a reusable React hook for the admin event list.
 *
 * Usage:
 *   const { events, loading } = useEvents();
 */

// TODO (Phase 2): implement after services are renamed.
// import { useState, useEffect } from 'react';
// import { subscribeToEvents } from '../services/events';
// import type { EventData } from '../types';
//
// export function useEvents() {
//   const [events, setEvents] = useState<EventData[]>([]);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     return subscribeToEvents((data) => {
//       setEvents(data);
//       setLoading(false);
//     });
//   }, []);
//
//   return { events, loading };
// }

export {};
