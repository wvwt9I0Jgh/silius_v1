
import { supabase, supabaseAdmin, hasAdminClient } from './lib/supabase';
import { User, Event, Comment, EventParticipant, Friend, EventGalleryPhoto } from './types';

// Helper: Get the appropriate client for admin operations
// Uses supabaseAdmin (service role) which bypasses RLS for all admin operations
const getAdminClient = () => {
  if (hasAdminClient && supabaseAdmin) {
    return supabaseAdmin;
  }
  return supabase;
};

// ==================== EVENTS ====================

export const db = {
  // Events
  getEvents: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Events fetch error:', error);
      return [];
    }
    return data || [];
  },

  getEventById: async (eventId: string): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Event fetch error:', error);
      return null;
    }
    return data;
  },

  // Günlük vibe limiti kontrolü
  checkDailyVibeLimit: async (userId: string): Promise<{ canCreate: boolean; remaining: number; resetTime?: string }> => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('dailyVibeCount, lastVibeDate')
        .eq('id', userId)
        .single();

      if (error) {
        return { canCreate: true, remaining: 3 };
      }

      const today = new Date().toISOString().split('T')[0];
      const lastVibeDate = userData?.lastVibeDate;
      let dailyCount = userData?.dailyVibeCount || 0;

      if (lastVibeDate !== today) {
        dailyCount = 0;
      }

      const MAX_DAILY_VIBES = 3;
      const remaining = MAX_DAILY_VIBES - dailyCount;
      const canCreate = remaining > 0;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const resetTime = tomorrow.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      return { canCreate, remaining, resetTime: canCreate ? undefined : `Yarın ${resetTime}` };
    } catch {
      return { canCreate: true, remaining: 3 }; 
    }
  },

  // Günlük vibe sayacını artır
  incrementDailyVibeCount: async (userId: string): Promise<boolean> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: userData, error: selectError } = await supabase
        .from('users')
        .select('dailyVibeCount, lastVibeDate')
        .eq('id', userId)
        .single();

      if (selectError) {
        return true;
      }

      const lastVibeDate = userData?.lastVibeDate;
      let newCount = 1;

      if (lastVibeDate === today) {
        newCount = (userData?.dailyVibeCount || 0) + 1;
      }

      const { error } = await supabase
        .from('users')
        .update({ 
          dailyVibeCount: newCount,
          lastVibeDate: today
        })
        .eq('id', userId);

      if (error) {
        console.error('Increment daily vibe count error:', error);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },

  saveEvent: async (event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return null;
    }

    // Günlük limit kontrolü
    const limitCheck = await db.checkDailyVibeLimit(userData.user.id);
    if (!limitCheck.canCreate) {
      throw new Error(`Günlük vibe limitine ulaştınız (3/3). ${limitCheck.resetTime} sıfırlanacak.`);
    }

    const eventData: Record<string, any> = {
      ...event,
      user_id: userData.user.id
    };

    // Koordinat alanları boşsa gönderme
    if (!eventData.latitude) delete eventData.latitude;
    if (!eventData.longitude) delete eventData.longitude;

    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Event save error:', error);
      return null;
    }

    // Başarılı olursa günlük sayacı artır
    await db.incrementDailyVibeCount(userData.user.id);

    // Etkinlik sahibini otomatik olarak canlı katılımcı yap
    await supabase
      .from('event_participants')
      .insert({
        event_id: data.id,
        user_id: userData.user.id,
        checked_in: true
      });

    return data;
  },

  updateEvent: async (eventId: string, updates: Partial<Event>): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('events')
      .update(updates)
      .eq('id', eventId);

    if (error) {
      console.error('Event update error:', error);
      return false;
    }
    return true;
  },

  deleteEvent: async (eventId: string): Promise<boolean> => {
    const client = getAdminClient();
    
    try {
      // Önce ilişkili verileri temizle (foreign key constraint hatası önlenir)
      await Promise.all([
        client.from('event_participants').delete().eq('event_id', eventId),
        client.from('comments').delete().eq('event_id', eventId),
        client.from('event_gallery').delete().eq('event_id', eventId),
        client.from('notifications').delete().eq('link', `/events/${eventId}`),
      ]);

      const { error } = await client
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Event delete error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Event delete cascade error:', error);
      return false;
    }
  },

  // ==================== EVENT PARTICIPANTS ====================

  getEventParticipants: async (eventId: string): Promise<Array<{ user_id: string }>> => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('user_id')
      .eq('event_id', eventId);

    if (error) {
      console.error('Participants fetch error:', error);
      return [];
    }
    return data || [];
  },

  joinEvent: async (eventId: string): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { error } = await supabase
      .from('event_participants')
      .insert({
        event_id: eventId,
        user_id: userData.user.id
      });

    if (error) {
      console.error('Join event error:', error);
      return false;
    }
    return true;
  },

  leaveEvent: async (eventId: string): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { error } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Leave event error:', error);
      return false;
    }
    return true;
  },

  getParticipantCount: async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) {
      console.error('Participant count error:', error);
      return 0;
    }
    return count || 0;
  },

  /**
   * Returns the number of participants who physically checked in (checked_in = true).
   * This is the "live" count shown on event cards and detail pages.
   */
  getLiveParticipantCount: async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('checked_in', true);

    if (error) {
      // checked_in kolonu henüz eklenmemişse sessizce 0 dön (migration bekliyor)
      const isColMissing =
        error.code === 'PGRST204' ||
        (error as any).status === 400 ||
        error.message?.includes('checked_in') ||
        error.message?.includes('schema cache') ||
        error.details?.toString().includes('checked_in');
      if (isColMissing) return 0;
      console.error('Live participant count error:', error);
      return 0;
    }
    return count || 0;
  },

  isUserParticipant: async (eventId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    return !error && !!data;
  },

  isUserCheckedIn: async (eventId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('checked_in')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return false;
    return !!data.checked_in;
  },

  // ==================== COMMENTS ====================

  getComments: async (eventId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        event_id,
        user_id,
        text,
        created_at,
        users (
          username,
          avatar
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments fetch error:', error);
      return [];
    }

    // Transform data to match Comment type
    return (data || []).map((item: any) => ({
      ...item,
      users: item.users ? (Array.isArray(item.users) ? item.users[0] : item.users) : undefined
    })) as Comment[];
  },

  saveComment: async (eventId: string, text: string): Promise<Comment | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        event_id: eventId,
        user_id: userData.user.id,
        text
      })
      .select(`
        id,
        event_id,
        user_id,
        text,
        created_at,
        users (
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('Comment save error:', error);
      return null;
    }

    // Transform data to match Comment type
    return {
      ...data,
      users: data.users ? (Array.isArray(data.users) ? data.users[0] : data.users) : undefined
    } as Comment;
  },

  // ==================== USERS ====================

  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return [];
    }
    return data || [];
  },

  getUserById: async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('User fetch error:', error);
      return null;
    }
    return data;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<boolean> => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('User update error:', error);
      return false;
    }
    return true;
  },

  // ==================== FRIENDS ====================

  getFriends: async (userId: string): Promise<User[]> => {
    const { data: friendRelations, error: relError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);

    if (relError) {
      console.error('Friends relation fetch error:', relError);
      return [];
    }

    if (!friendRelations || friendRelations.length === 0) {
      return [];
    }

    const friendIds = friendRelations.map(f => f.friend_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    if (usersError) {
      console.error('Friends users fetch error:', usersError);
      return [];
    }

    return users || [];
  },

  // Beni arkadaş ekleyenler (reverse friends)
  getReverseFriends: async (userId: string): Promise<User[]> => {
    const { data: friendRelations, error: relError } = await supabase
      .from('friends')
      .select('user_id')
      .eq('friend_id', userId);

    if (relError) {
      console.error('Reverse friends relation fetch error:', relError);
      return [];
    }

    if (!friendRelations || friendRelations.length === 0) {
      return [];
    }

    const userIds = friendRelations.map(f => f.user_id);

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (usersError) {
      console.error('Reverse friends users fetch error:', usersError);
      return [];
    }

    return users || [];
  },

  getFriendIds: async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Friend IDs fetch error:', error);
      return [];
    }
    return data?.map(f => f.friend_id) || [];
  },

  addFriend: async (friendId: string): Promise<boolean> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const userId = userData.user.id;

    // Kendini arkadaş olarak eklemeyi engelle
    if (userId === friendId) return false;

    const client = getAdminClient();

    try {
      // Zaten arkadaş mı kontrol et
      const { data: existingFriend } = await client
        .from('friends')
        .select('id')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (existingFriend) return true;

      // Arkadaş ekle
      const { error: insertError } = await client
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // Duplicate = başarılı
        if (insertError.code === '23505') return true;
        console.error('Add friend error:', insertError);
        return false;
      }

      return true;
    } catch (err) {
      console.error('addFriend exception:', err);
      return false;
    }
  },

  isFriend: async (userId: string, friendId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .maybeSingle();

    return !error && !!data;
  },

  // ==================== CURRENT USER (Auth) ====================

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return await db.getUserById(user.id);
  },

  // ==================== NOTIFICATIONS ====================

  getNotifications: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:from_user_id(id, firstName, lastName, username, avatar)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        // Sessizce boş array döndür
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  getUnreadNotificationCount: async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        // Sessizce 0 döndür - notification tablosu olmayabilir
        return 0;
      }
      return count || 0;
    } catch {
      return 0;
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Mark as read error:', error);
    }
  },

  markAllNotificationsAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Mark all as read error:', error);
    }
  },

  createNotification: async (notification: {
    user_id: string;
    type: 'friend_request' | 'event_join' | 'event_comment';
    title: string;
    message: string;
    link?: string;
    from_user_id?: string;
    event_id?: string;
  }) => {
    const { error } = await supabase
      .from('notifications')
      .insert(notification);

    if (error) {
      console.error('Create notification error:', error);
    }
  },

  // ==================== ADMIN - BAN MANAGEMENT ====================

  banUser: async (userId: string, reason: string, bannedBy: string, expiresAt?: string): Promise<boolean> => {
    const client = getAdminClient();

    // Validate bannedBy is a valid UUID, otherwise use null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validBannedBy = uuidRegex.test(bannedBy) ? bannedBy : null;

    const { error } = await client
      .from('banned_users')
      .insert({
        user_id: userId,
        banned_by: validBannedBy,
        reason,
        expires_at: expiresAt
      });

    if (error) {
      console.error('Ban user error:', error);
      return false;
    }
    return true;
  },

  unbanUser: async (userId: string): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('banned_users')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Unban user error:', error);
      return false;
    }
    return true;
  },

  isUserBanned: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('banned_users')
      .select('id, expires_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return false;

    // Check if ban has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      // Auto unban
      await supabase.from('banned_users').delete().eq('id', data.id);
      return false;
    }
    return true;
  },

  getBanInfo: async (userId: string): Promise<{ reason: string; bannedAt: string; bannedBy?: string } | null> => {
    const { data, error } = await supabase
      .from('banned_users')
      .select('reason, banned_at, banned_by')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      reason: data.reason || 'Sebep belirtilmemiş',
      bannedAt: data.banned_at,
      bannedBy: data.banned_by
    };
  },

  getBannedUsers: async () => {
    const client = getAdminClient();
    const { data, error } = await client
      .from('banned_users')
      .select(`
        *,
        user:user_id(id, email, firstName, lastName, username, avatar)
      `)
      .order('banned_at', { ascending: false });

    if (error) {
      console.error('Get banned users error:', error);
      return [];
    }
    return data || [];
  },

  banIP: async (ip: string, userId: string | null, reason: string, bannedBy: string): Promise<boolean> => {
    const client = getAdminClient();

    // Validate bannedBy is a valid UUID, otherwise use null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validBannedBy = uuidRegex.test(bannedBy) ? bannedBy : null;

    const { error } = await client
      .from('banned_ips')
      .insert({
        ip_address: ip,
        user_id: userId,
        banned_by: validBannedBy,
        reason
      });

    if (error) {
      console.error('Ban IP error:', error);
      return false;
    }
    return true;
  },

  unbanIP: async (ip: string): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('banned_ips')
      .delete()
      .eq('ip_address', ip);

    if (error) {
      console.error('Unban IP error:', error);
      return false;
    }
    return true;
  },

  getBannedIPs: async () => {
    const client = getAdminClient();
    const { data, error } = await client
      .from('banned_ips')
      .select(`
        *,
        user:user_id(id, email, firstName, lastName, username)
      `)
      .order('banned_at', { ascending: false });

    if (error) {
      console.error('Get banned IPs error:', error);
      return [];
    }
    return data || [];
  },

  // ==================== ADMIN - USER MANAGEMENT ====================

  updateUserRole: async (userId: string, role: 'user' | 'admin'): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Update user role error:', error);
      return false;
    }
    return true;
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    const client = getAdminClient();

    // 1. Önce ilişkili verileri temizle
    try {
      // Kullanıcının sahip olduğu etkinliklerin ID'lerini al
      const { data: userEvents } = await client
        .from('events')
        .select('id')
        .eq('user_id', userId);

      // Kullanıcının etkinliklerine ait galeri, katılımcı, yorum ve bildirimleri sil
      if (userEvents && userEvents.length > 0) {
        const eventIds = userEvents.map(e => e.id);
        await Promise.all([
          client.from('event_gallery').delete().in('event_id', eventIds),
          client.from('event_participants').delete().in('event_id', eventIds),
          client.from('comments').delete().in('event_id', eventIds),
        ]);
      }

      // Kullanıcıya ait doğrudan ilişkili verileri temizle
      await Promise.all([
        client.from('event_participants').delete().eq('user_id', userId),
        client.from('comments').delete().eq('user_id', userId),
        client.from('friends').delete().eq('user_id', userId),
        client.from('friends').delete().eq('friend_id', userId),
        client.from('notifications').delete().eq('user_id', userId),
        client.from('banned_users').delete().eq('user_id', userId),
        client.from('events').delete().eq('user_id', userId),
      ]);

      // Users tablosundan sil
      const { error: userError } = await client
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) {
        console.error('Delete user from users table error:', userError);
        return false;
      }

      // Supabase Auth'tan kullanıcıyı sil (admin client gerekli)
      if (hasAdminClient && supabaseAdmin) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Delete user from Auth error:', authError);
        }
      }

      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  },

  // ==================== CMS - PAGES ====================

  getCMSPages: async () => {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .order('menu_order', { ascending: true });

    if (error) {
      console.error('Get CMS pages error:', error);
      return [];
    }
    return data || [];
  },

  getCMSPage: async (slugOrId: string) => {
    // Try by slug first, then by id
    let { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slugOrId)
      .maybeSingle();

    if (!data && !error) {
      const result = await supabase
        .from('cms_pages')
        .select('*')
        .eq('id', slugOrId)
        .maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Get CMS page error:', error);
      return null;
    }
    return data;
  },

  saveCMSPage: async (page: {
    slug: string;
    title: string;
    is_published?: boolean;
    show_in_menu?: boolean;
    menu_order?: number;
    created_by: string;
  }) => {
    const client = getAdminClient();

    // Validate created_by is a valid UUID, otherwise use null
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCreatedBy = uuidRegex.test(page.created_by) ? page.created_by : null;

    const { data, error } = await client
      .from('cms_pages')
      .insert({ ...page, created_by: validCreatedBy })
      .select()
      .single();

    if (error) {
      console.error('Save CMS page error:', error);
      return null;
    }
    return data;
  },

  updateCMSPage: async (pageId: string, updates: {
    slug?: string;
    title?: string;
    is_published?: boolean;
    show_in_menu?: boolean;
    menu_order?: number;
  }): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('cms_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', pageId);

    if (error) {
      console.error('Update CMS page error:', error);
      return false;
    }
    return true;
  },

  deleteCMSPage: async (pageId: string): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('cms_pages')
      .delete()
      .eq('id', pageId);

    if (error) {
      console.error('Delete CMS page error:', error);
      return false;
    }
    return true;
  },

  // ==================== CMS - MODULES ====================

  getCMSModules: async (pageId: string) => {
    const { data, error } = await supabase
      .from('cms_modules')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Get CMS modules error:', error);
      return [];
    }
    return data || [];
  },

  saveCMSModule: async (module: {
    page_id: string;
    module_type: string;
    content: Record<string, any>;
    styles: Record<string, any>;
    order_index: number;
  }) => {
    const client = getAdminClient();
    const { data, error } = await client
      .from('cms_modules')
      .insert(module)
      .select()
      .single();

    if (error) {
      console.error('Save CMS module error:', error);
      return null;
    }
    return data;
  },

  updateCMSModule: async (moduleId: string, updates: {
    module_type?: string;
    content?: Record<string, any>;
    styles?: Record<string, any>;
    order_index?: number;
  }): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('cms_modules')
      .update(updates)
      .eq('id', moduleId);

    if (error) {
      console.error('Update CMS module error:', error);
      return false;
    }
    return true;
  },

  deleteCMSModule: async (moduleId: string): Promise<boolean> => {
    const client = getAdminClient();
    const { error } = await client
      .from('cms_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      console.error('Delete CMS module error:', error);
      return false;
    }
    return true;
  },

  reorderCMSModules: async (pageId: string, moduleIds: string[]): Promise<boolean> => {
    const client = getAdminClient();
    try {
      // Update each module's order_index
      for (let i = 0; i < moduleIds.length; i++) {
        await client
          .from('cms_modules')
          .update({ order_index: i })
          .eq('id', moduleIds[i])
          .eq('page_id', pageId);
      }
      return true;
    } catch (error) {
      console.error('Reorder CMS modules error:', error);
      return false;
    }
  },

  // ==================== COMMENTS WITH REPLIES (NESTED) ====================

  getCommentsWithReplies: async (eventId: string, eventOwnerId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        event_id,
        user_id,
        text,
        created_at,
        parent_comment_id,
        users (
          username,
          avatar
        )
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Comments fetch error:', error);
      return [];
    }

    // Organize comments into parent-child structure
    const commentsMap = new Map<string, any>();
    const rootComments: any[] = [];

    (data || []).forEach((comment: any) => {
      commentsMap.set(comment.id, {
        ...comment,
        users: comment.users ? (Array.isArray(comment.users) ? comment.users[0] : comment.users) : undefined,
        replies: []
      });
    });

    commentsMap.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentsMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    // Sort: Owner comments first, then by date
    rootComments.sort((a, b) => {
      const aIsOwner = a.user_id === eventOwnerId;
      const bIsOwner = b.user_id === eventOwnerId;

      if (aIsOwner && !bIsOwner) return -1;
      if (!aIsOwner && bIsOwner) return 1;

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return rootComments;
  },

  saveCommentReply: async (eventId: string, parentCommentId: string, text: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return null;
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        event_id: eventId,
        user_id: userData.user.id,
        text,
        parent_comment_id: parentCommentId
      })
      .select(`
        id,
        event_id,
        user_id,
        text,
        created_at,
        parent_comment_id,
        users (
          username,
          avatar
        )
      `)
      .single();

    if (error) {
      console.error('Comment reply save error:', error);
      return null;
    }

    return {
      ...data,
      users: data.users ? (Array.isArray(data.users) ? data.users[0] : data.users) : undefined
    };
  },

  // ==================== VIBE SCORE SYSTEM ====================

  /**
   * Vibe Score hesaplama:
   * - Her oluşturulan etkinlik: +1 puan
   * - Her katılınan etkinlik: +1 puan  
   * - Platformda geçirilen süre: Her 5 dakika = +0.10 puan
   */
  calculateVibeScore: async (userId: string): Promise<number> => {
    try {
      // 1. Kullanıcının oluşturduğu etkinlik sayısı
      const { count: createdCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // 2. Kullanıcının katıldığı etkinlik sayısı
      const { count: joinedCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // 3. Kullanıcının toplam platformda geçirdiği süre (dakika cinsinden)
      const { data: userData } = await supabase
        .from('users')
        .select('totalTimeSpent')
        .eq('id', userId)
        .single();
      
      const totalMinutes = userData?.totalTimeSpent || 0;
      const timeScore = Math.floor(totalMinutes / 5) * 0.10; // Her 5 dk = 0.10 puan
      
      const totalScore = (createdCount || 0) + (joinedCount || 0) + timeScore;
      
      return Math.round(totalScore * 100) / 100; // 2 ondalık hane
    } catch (error) {
      console.error('Vibe score calculation error:', error);
      return 0;
    }
  },

  getAllUsersWithVibeScores: async (): Promise<Array<{ user: User; vibeScore: number }>> => {
    try {
      // Tüm verileri paralel olarak al — 3 query aynı anda
      const [usersResult, allEventsResult, allParticipationsResult] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('user_id'),
        supabase.from('event_participants').select('user_id'),
      ]);

      const users = usersResult.data;
      if (!users || users.length === 0) return [];

      // Sayıları hesapla
      const createdCounts: Record<string, number> = {};
      const joinedCounts: Record<string, number> = {};

      allEventsResult.data?.forEach(e => {
        createdCounts[e.user_id] = (createdCounts[e.user_id] || 0) + 1;
      });

      allParticipationsResult.data?.forEach(p => {
        joinedCounts[p.user_id] = (joinedCounts[p.user_id] || 0) + 1;
      });

      // Her kullanıcı için score hesapla
      const usersWithScores = users.map(user => {
        const created = createdCounts[user.id] || 0;
        const joined = joinedCounts[user.id] || 0;
        const timeScore = Math.floor((user.totalTimeSpent || 0) / 5) * 0.10;
        const vibeScore = Math.round((created + joined + timeScore) * 100) / 100;
        
        return { user, vibeScore };
      });

      // Score'a göre sırala (en yüksek önce)
      usersWithScores.sort((a, b) => b.vibeScore - a.vibeScore);

      return usersWithScores;
    } catch (error) {
      console.error('Get all users with vibe scores error:', error);
      return [];
    }
  },

  // Event'lerin sahiplerinin vibe score'larını al (Home sayfası için)
  getEventsWithOwnerVibeScores: async (): Promise<Array<{ event: Event; ownerVibeScore: number }>> => {
    try {
      // Tüm verileri paralel olarak al — 3 query aynı anda
      const [eventsResult, allEventsResult, allParticipationsResult] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('user_id'),
        supabase.from('event_participants').select('user_id'),
      ]);

      const events = eventsResult.data;
      if (!events || events.length === 0) return [];

      // Tüm unique user_id'leri al ve kullanıcı bilgilerini çek
      const userIds = [...new Set(events.map(e => e.user_id))];
      // totalTimeSpent, migration-vibe-score.sql çalıştırılmamışsa olmayabilir
      // hata durumunda users null kalır, forEach skip edilir, scorelar 0 olur
      let users: { id: string; totalTimeSpent: number }[] | null = null;
      try {
        const res = await supabase
          .from('users')
          .select('id, totalTimeSpent')
          .in('id', userIds);
        users = res.data as any;
      } catch {
        users = null;
      }

      // Sayıları hesapla
      const createdCounts: Record<string, number> = {};
      const joinedCounts: Record<string, number> = {};
      const timeSpentMap: Record<string, number> = {};

      allEventsResult.data?.forEach(e => {
        createdCounts[e.user_id] = (createdCounts[e.user_id] || 0) + 1;
      });

      allParticipationsResult.data?.forEach(p => {
        joinedCounts[p.user_id] = (joinedCounts[p.user_id] || 0) + 1;
      });

      users?.forEach(u => {
        timeSpentMap[u.id] = u.totalTimeSpent || 0;
      });

      // Her event için owner'ın vibe score'unu hesapla
      const eventsWithScores = events.map(event => {
        const created = createdCounts[event.user_id] || 0;
        const joined = joinedCounts[event.user_id] || 0;
        const timeScore = Math.floor((timeSpentMap[event.user_id] || 0) / 5) * 0.10;
        const ownerVibeScore = Math.round((created + joined + timeScore) * 100) / 100;
        
        return { event, ownerVibeScore };
      });

      return eventsWithScores;
    } catch (error) {
      console.error('Get events with owner vibe scores error:', error);
      return [];
    }
  },

  // Vibe Puanı Güncelle
  incrementVibeScore: async (userId: string, points: number): Promise<boolean> => {
     try {
       const { data: user } = await supabase
         .from('users')
         .select('vibeScore')
         .eq('id', userId)
         .single();
       
       const currentScore = (user as any)?.vibeScore || (user as any)?.vibe_score || 0;
       
       const { error } = await supabase
         .from('users')
         .update({ vibeScore: currentScore + points })
         .eq('id', userId);
         
       return !error;
     } catch {
       return false;
     }
  },

  // Check-in Process
  checkInToEvent: async (eventId: string, userId: string): Promise<{ success: boolean; message: string; points: number }> => {
     try {
        // 1. Katılım kontrolü
        const { data: part } = await supabase
            .from('event_participants')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .maybeSingle();
        
        if (part && part.checked_in) {
            return { success: true, message: 'Zaten giriş yapıldı', points: 0 };
        }

        if (part && !part.checked_in) {
            // Mevcut kaydı sil ve checked_in: true ile yeniden ekle
            // (RLS'de UPDATE policy olmadığı için delete+insert kullanıyoruz)
            await supabase
                .from('event_participants')
                .delete()
                .eq('event_id', eventId)
                .eq('user_id', userId);
        }

        // Yeni kayıt: doğrudan checked_in: true ile ekle
        const { error: insertError } = await supabase
            .from('event_participants')
            .insert({ event_id: eventId, user_id: userId, checked_in: true });
        
        if (insertError) throw insertError;

        return { success: true, message: 'Giriş Başarılı!', points: 1 };
     } catch (err: any) {
         console.error('Check-in error:', err);
         return { success: false, message: err.message || 'Hata', points: 0 };
     }
  },

  // Platformda geçirilen süreyi güncelle (her 5 dakikada bir çağrılacak)
  updateTimeSpent: async (userId: string, minutesToAdd: number): Promise<boolean> => {
    try {
      const { data: currentUser, error: selectError } = await supabase
        .from('users')
        .select('totalTimeSpent')
        .eq('id', userId)
        .single();

      if (selectError) {
        return true;
      }

      const currentTime = currentUser?.totalTimeSpent || 0;
      const newTime = currentTime + minutesToAdd;

      const { error } = await supabase
        .from('users')
        .update({ 
          totalTimeSpent: newTime,
          lastActiveAt: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Update time spent error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Update time spent error:', error);
      return false;
    }
  },

  // ==================== EVENT GALLERY ====================

  // Bir etkinliğin galeri fotoğraflarını getir
  getEventGallery: async (eventId: string): Promise<EventGalleryPhoto[]> => {
    const { data, error } = await supabase
      .from('event_gallery')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Gallery fetch error:', error);
      return [];
    }
    return data || [];
  },

  // Galeriye fotoğraf ekle (base64 string olarak)
  addGalleryPhoto: async (eventId: string, imageUrl: string, caption?: string): Promise<EventGalleryPhoto | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return null;
    }

    // Mevcut fotoğraf sayısını al (sıralama için)
    const { count } = await supabase
      .from('event_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    const { data, error } = await supabase
      .from('event_gallery')
      .insert({
        event_id: eventId,
        user_id: userData.user.id,
        image_url: imageUrl,
        caption: caption || '',
        display_order: (count || 0)
      })
      .select()
      .single();

    if (error) {
      console.error('Gallery photo add error:', error);
      return null;
    }
    return data;
  },

  // Birden fazla fotoğrafı aynı anda ekle
  addMultipleGalleryPhotos: async (eventId: string, images: { imageUrl: string; caption?: string }[]): Promise<EventGalleryPhoto[]> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return [];
    }

    // Mevcut fotoğraf sayısını al
    const { count } = await supabase
      .from('event_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    const startOrder = count || 0;

    const rows = images.map((img, index) => ({
      event_id: eventId,
      user_id: userData.user!.id,
      image_url: img.imageUrl,
      caption: img.caption || '',
      display_order: startOrder + index
    }));

    const { data, error } = await supabase
      .from('event_gallery')
      .insert(rows)
      .select();

    if (error) {
      console.error('Gallery bulk add error:', error);
      return [];
    }
    return data || [];
  },

  // Galeri fotoğrafını sil
  deleteGalleryPhoto: async (photoId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('event_gallery')
      .delete()
      .eq('id', photoId);

    if (error) {
      console.error('Gallery photo delete error:', error);
      return false;
    }
    return true;
  },

  // Bir etkinliğin galeri fotoğraf sayısını getir
  getGalleryCount: async (eventId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('event_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) {
      console.error('Gallery count error:', error);
      return 0;
    }
    return count || 0;
  }
};

export default db;

