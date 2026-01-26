
import { supabase, supabaseAdmin, hasAdminClient } from './lib/supabase';
import { User, Event, Comment, EventParticipant, Friend } from './types';

// Helper: Get the appropriate client for admin operations
// Uses supabaseAdmin (service role) which bypasses RLS for all admin operations
const getAdminClient = () => {
  // If service role key is available, always use it for admin operations
  if (hasAdminClient && supabaseAdmin) {
    console.log('🔑 Using admin client (service role)');
    return supabaseAdmin;
  }
  // Fallback to normal client
  console.warn('⚠️ Admin client not available, using normal client');
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

  saveEvent: async (event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error('Unauthorized: User not logged in');
      return null;
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Event save error:', error);
      return null;
    }
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
    const { error } = await client
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Event delete error:', error);
      return false;
    }
    return true;
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

  isUserParticipant: async (eventId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('event_participants')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    return !error && !!data;
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
    console.log('📋 getFriends called for:', userId);

    // 1. Önce arkadaş ID'lerini al
    const { data: friendRelations, error: relError } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);

    if (relError) {
      console.error('Friends relation fetch error:', relError);
      return [];
    }

    if (!friendRelations || friendRelations.length === 0) {
      console.log('No friends found for user:', userId);
      return [];
    }

    const friendIds = friendRelations.map(f => f.friend_id);
    console.log('Friend IDs:', friendIds);

    // 2. Şimdi bu ID'lere sahip kullanıcıları çek
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    if (usersError) {
      console.error('Friends users fetch error:', usersError);
      return [];
    }

    console.log('Friends fetched:', users?.length || 0);
    return users || [];
  },

  // Beni arkadaş ekleyenler (reverse friends)
  getReverseFriends: async (userId: string): Promise<User[]> => {
    console.log('📋 getReverseFriends called for:', userId);

    // 1. Önce beni ekleyenlerin ID'lerini al
    const { data: friendRelations, error: relError } = await supabase
      .from('friends')
      .select('user_id')
      .eq('friend_id', userId);

    if (relError) {
      console.error('Reverse friends relation fetch error:', relError);
      return [];
    }

    if (!friendRelations || friendRelations.length === 0) {
      console.log('No reverse friends found for user:', userId);
      return [];
    }

    const userIds = friendRelations.map(f => f.user_id);
    console.log('Reverse Friend User IDs:', userIds);

    // 2. Şimdi bu ID'lere sahip kullanıcıları çek
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);

    if (usersError) {
      console.error('Reverse friends users fetch error:', usersError);
      return [];
    }

    console.log('Reverse friends fetched:', users?.length || 0);
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
    if (!userData.user) {
      console.error('❌ addFriend: User not logged in');
      return false;
    }

    const userId = userData.user.id;
    console.log('📤 Adding friend:', { user_id: userId, friend_id: friendId });

    // Kendini arkadaş olarak eklemeyi engelle
    if (userId === friendId) {
      console.warn('⚠️ Cannot add yourself as friend');
      return false;
    }

    // Admin client kullan - RLS bypass
    const client = getAdminClient();

    try {
      // 1. Önce arkadaşlık var mı kontrol et
      const { data: existingFriend, error: checkError } = await client
        .from('friends')
        .select('id')
        .eq('user_id', userId)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Friend check error:', checkError);
      }

      // 2. Zaten arkadaşsa başarılı dön
      if (existingFriend) {
        console.log('✅ Already friends, returning success');
        return true;
      }

      // 3. Arkadaş değilse INSERT yap (admin client ile)
      const { error: insertError } = await client
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        // Duplicate hatası olsa bile başarılı say
        if (insertError.code === '23505' ||
          insertError.message?.toLowerCase().includes('duplicate') ||
          insertError.message?.toLowerCase().includes('unique')) {
          console.log('✅ Friend already exists, treating as success');
          return true;
        }

        console.error('❌ Add friend insert error:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details
        });
        return false;
      }

      console.log('✅ Friend added successfully');
      return true;
    } catch (err) {
      console.error('❌ addFriend exception:', err);
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
    console.log('🗑️ Kullanıcı siliniyor:', userId);

    try {
      // Kullanıcının event_participants kayıtlarını sil
      await client.from('event_participants').delete().eq('user_id', userId);

      // Kullanıcının yorumlarını sil
      await client.from('comments').delete().eq('user_id', userId);

      // Kullanıcının arkadaşlık kayıtlarını sil (her iki yönde)
      await client.from('friends').delete().eq('user_id', userId);
      await client.from('friends').delete().eq('friend_id', userId);

      // Kullanıcının bildirimlerini sil
      await client.from('notifications').delete().eq('user_id', userId);

      // Kullanıcının ban kayıtlarını sil
      await client.from('banned_users').delete().eq('user_id', userId);

      // Kullanıcının etkinliklerini sil
      await client.from('events').delete().eq('user_id', userId);

      // 2. Users tablosundan sil
      const { error: userError } = await client
        .from('users')
        .delete()
        .eq('id', userId);

      if (userError) {
        console.error('Delete user from users table error:', userError);
        return false;
      }

      // 3. Supabase Auth'tan kullanıcıyı sil (admin client gerekli)
      if (hasAdminClient && supabaseAdmin) {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Delete user from Auth error:', authError);
          // Auth'tan silinemese bile users tablosundan silindi, yine de başarılı say
          console.warn('⚠️ Kullanıcı users tablosundan silindi ancak Auth\'tan silinemedi');
        } else {
          console.log('✅ Kullanıcı hem veritabanından hem Auth\'tan silindi');
        }
      } else {
        console.warn('⚠️ Admin client yok, sadece users tablosundan silindi');
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
      console.error('Comments with replies fetch error:', error);
      return [];
    }

    // Organize comments into parent-child structure
    const commentsMap = new Map<string, any>();
    const rootComments: any[] = [];

    // First pass: create map of all comments
    (data || []).forEach((comment: any) => {
      commentsMap.set(comment.id, {
        ...comment,
        users: comment.users ? (Array.isArray(comment.users) ? comment.users[0] : comment.users) : undefined,
        replies: []
      });
    });

    // Second pass: organize into parent-child structure
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
  }
};

export default db;

