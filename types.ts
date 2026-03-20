
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  avatar?: string;
  age?: number;
  birthDate?: string;
  district?: string;
  gender?: 'male' | 'female' | 'transgender' | 'lesbian' | 'gay' | 'bisexual_male' | 'bisexual_female' | 'prefer_not_to_say';
  role: 'user' | 'admin';
  hasAcceptedTerms?: boolean;
  isProfileComplete?: boolean;
  created_at?: string;
  vibeScore?: number; // Calculated: events created + events joined + time spent on platform
  lastActiveAt?: string; // For time tracking
  totalTimeSpent?: number; // Total minutes spent on platform
  dailyVibeCount?: number; // Daily vibe creation count (max 3)
  lastVibeDate?: string; // Last date vibes were created
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image: string;
  category: 'club' | 'rave' | 'beach' | 'house' | 'street' | 'pub' | 'coffee' | 'other';
  created_at?: string;
  checkin_code?: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at?: string;
  checked_in?: boolean;
}

export interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  text: string;
  created_at: string;
  parent_comment_id?: string;
  // Join'den gelen user bilgisi
  users?: {
    username: string;
    avatar?: string;
  };
  // Nested replies
  replies?: Comment[];
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at?: string;
}

export interface EventGalleryPhoto {
  id: string;
  event_id: string;
  user_id: string;
  image_url: string;
  caption?: string;
  display_order?: number;
  created_at?: string;
}

export interface SiteGalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  created_by?: string;
  created_at?: string;
}

// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at'>;
        Update: Partial<Omit<Event, 'id' | 'created_at'>>;
      };
      event_participants: {
        Row: EventParticipant;
        Insert: Omit<EventParticipant, 'id' | 'joined_at'>;
        Update: Partial<Omit<EventParticipant, 'id' | 'joined_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'created_at' | 'users'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at' | 'users'>>;
      };
      friends: {
        Row: Friend;
        Insert: Omit<Friend, 'id' | 'created_at'>;
        Update: Partial<Omit<Friend, 'id' | 'created_at'>>;
      };
      event_gallery: {
        Row: EventGalleryPhoto;
        Insert: Omit<EventGalleryPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<EventGalleryPhoto, 'id' | 'created_at'>>;
      };
    };
  };
}

// ==================== ADMIN TYPES ====================

export interface BannedUser {
  id: string;
  user_id: string;
  banned_by?: string;
  reason?: string;
  banned_at: string;
  expires_at?: string;
  // Join'den gelen user bilgisi
  user?: User;
}

export interface BannedIP {
  id: string;
  ip_address: string;
  user_id?: string;
  banned_by?: string;
  reason?: string;
  banned_at: string;
  // Join'den gelen user bilgisi
  user?: User;
}

// ==================== CMS TYPES ====================

export type CMSModuleType =
  | 'text'           // Metin bloğu
  | 'heading'        // Başlık
  | 'image'          // Resim
  | 'button'         // Buton
  | 'spacer'         // Boşluk
  | 'card'           // Kart
  | 'hero'           // Hero bölümü
  | 'grid'           // Grid layout
  | 'video'          // Video embed
  | 'divider'        // Ayırıcı çizgi
  | 'accordion'      // Açılır kapanır
  | 'tabs'           // Sekmeler
  | 'gallery'        // Resim galerisi
  | 'testimonial'    // Referans/Yorum
  | 'pricing'        // Fiyat kartı
  | 'feature'        // Özellik kartı
  | 'cta'            // Call to action
  | 'social'         // Sosyal medya linkleri
  | 'html'           // Özel HTML
  | 'embed';         // iFrame embed

export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  show_in_menu: boolean;
  menu_order: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  modules?: CMSModule[];
}

export interface CMSModule {
  id: string;
  page_id: string;
  module_type: CMSModuleType;
  content: Record<string, any>;
  styles: CMSModuleStyles;
  order_index: number;
  created_at: string;
}

export interface CMSModuleStyles {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  border?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  maxWidth?: string;
  height?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  boxShadow?: string;
  opacity?: string;
  animation?: string;
  customCSS?: string;
}

