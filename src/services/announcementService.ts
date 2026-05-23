import { supabase } from '../lib/supabase/client';
import type { Announcement } from '../types';

export async function getAnnouncements(eventId: string): Promise<Announcement[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Announcement[];
}

export async function createAnnouncement(
  data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>,
): Promise<Announcement> {
  if (!supabase) throw new Error('Supabase não inicializado');
  const { data: result, error } = await supabase
    .from('announcements')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result as Announcement;
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('announcements')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/**
 * Triggers an announcement, setting active_announcement_id and announcement_trigger_at in the event table.
 * If target_push is true, inserts bulk notifications for all users registered in this event.
 */
export async function triggerAnnouncement(eventId: string, announcementId: string | null): Promise<void> {
  if (!supabase) return;

  let announcement = null;
  let eventSlug = '';

  // 1. Fetch announcement details first if we have an ID
  if (announcementId) {
    const { data, error: announceError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single();

    if (announceError) throw announceError;
    announcement = data;

    // Fetch the event slug to generate correct redirect URLs
    const { data: eventRow } = await supabase
      .from('events')
      .select('slug')
      .eq('id', eventId)
      .single();
    eventSlug = eventRow?.slug || '';
  }

  // 2. Decide if we should update the event table's active announcement
  // We only update if clearing (announcementId is null) OR if the announcement targets TV or App Popup
  const shouldUpdateEvent = !announcementId || (announcement && (announcement.target_tv || announcement.target_app_popup));

  if (shouldUpdateEvent) {
    const { error: eventError } = await supabase
      .from('events')
      .update({
        active_announcement_id: announcementId,
        announcement_trigger_at: announcementId ? new Date().toISOString() : null,
      })
      .eq('id', eventId);

    if (eventError) throw eventError;
  }

  // If announcementId is null, we are just clearing the active announcement, so no notifications need to be sent
  if (!announcementId || !announcement) return;

  // 3. Handle target_push bulk insert if enabled
  if (announcement.target_push) {
    // Fetch all users associated with this event
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('event_id', eventId);

    if (usersError) {
      console.error('[AnnouncementService] Error fetching users for push:', usersError);
      return;
    }

    if (users && users.length > 0) {
      // When popup is ALSO active alongside push, mark notifications as silent.
      // The NotificationsListener will see #silent in the link and skip all visual alerts,
      // sending the notification directly to the history drawer only.
      const isSilent = announcement.target_app_popup === true;
      const notifLink = `/event/${eventSlug}${isSilent ? '#silent' : ''}`;

      const notificationInserts = users.map(u => ({
        user_id: u.id,
        title: announcement.title,
        body: announcement.message,
        read: false,
        link: notifLink
      }));

      // Supabase supports bulk inserts easily
      const { error: pushError } = await supabase
        .from('notifications')
        .insert(notificationInserts);

      if (pushError) {
        console.error('[AnnouncementService] Error inserting bulk notifications:', pushError);
      }
    }
  }
}

