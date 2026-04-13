/**
 * hooks/useEvent.ts
 *
 * Wraps subscribeToEvent into a reusable React hook for single-event pages.
 *
 * Usage:
 *   const { event, loading } = useEvent(slug);
 */

// TODO (Phase 2): implement after services are renamed.
// import { useState, useEffect } from 'react';
// import { subscribeToEvent } from '../services/events';
// import type { EventData } from '../types';
//
// export function useEvent(slug: string) {
//   const [event, setEvent] = useState<EventData | null>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     if (!slug) return;
//     return subscribeToEvent(slug, (data) => {
//       setEvent(data);
//       setLoading(false);
//     });
//   }, [slug]);
//
//   return { event, loading };
// }

export {};
