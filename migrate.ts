/**
 * localStorage → Supabase Data Migration Script
 * 
 * ⚠️ DİKKAT: Bu dosyayı sadece BİR KERE çalıştırın, sonra silin!
 * 
 * Kullanım:
 * 1. App.tsx içinde import edin
 * 2. useEffect içinde migrateAllData() fonksiyonunu çağırın
 * 3. Konsolu kontrol edin
 * 4. Bu dosyayı silin
 */

import { supabase } from './lib/supabase';

interface OldEvent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  category: string;
  participants: string[];
}

interface OldComment {
  id: string;
  eventId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

// localStorage key'leri
const STORAGE_KEYS = {
  USERS: 'silius_users_v2',
  EVENTS: 'silius_events_v2',
  COMMENTS: 'silius_comments_v2',
  FRIENDS: 'silius_friends_v2_'
};

// Şifre çözme (eski sistemden)
const decrypt = (data: string) => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const migrateEvents = async (): Promise<boolean> => {
  try {
    const eventsData = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!eventsData) {
      console.log('📭 localStorage\'da event bulunamadı');
      return true;
    }

    const events: OldEvent[] = JSON.parse(eventsData);
    console.log(`📦 ${events.length} event bulundu, taşınıyor...`);

    for (const event of events) {
      // System eventlerini atlayabiliriz veya admin user'a atayabiliriz
      const { error } = await supabase.from('events').insert({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        image: event.image,
        category: event.category,
        // user_id: event.creatorId === 'system' ? null : event.creatorId
      });

      if (error) {
        console.error(`❌ Event taşıma hatası (${event.title}):`, error);
      } else {
        console.log(`✅ Event taşındı: ${event.title}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Events migration hatası:', error);
    return false;
  }
};

export const migrateComments = async (): Promise<boolean> => {
  try {
    const commentsData = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (!commentsData) {
      console.log('📭 localStorage\'da comment bulunamadı');
      return true;
    }

    const comments: OldComment[] = JSON.parse(commentsData);
    console.log(`💬 ${comments.length} comment bulundu, taşınıyor...`);

    for (const comment of comments) {
      const { error } = await supabase.from('comments').insert({
        text: comment.text,
        event_id: comment.eventId,
        // user_id: comment.userId
      });

      if (error) {
        console.error(`❌ Comment taşıma hatası:`, error);
      } else {
        console.log(`✅ Comment taşındı`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Comments migration hatası:', error);
    return false;
  }
};

export const migrateAllData = async () => {
  console.log('🚀 Migration başlıyor...');
  console.log('================================');
  
  const eventsSuccess = await migrateEvents();
  const commentsSuccess = await migrateComments();

  console.log('================================');
  if (eventsSuccess && commentsSuccess) {
    console.log('✅ Tüm veriler başarıyla taşındı!');
    console.log('⚠️ Şimdi bu dosyayı silebilirsiniz.');
    
    // İsteğe bağlı: localStorage'ı temizle
    // clearOldLocalStorage();
  } else {
    console.log('⚠️ Bazı veriler taşınamadı, logları kontrol edin.');
  }
};

export const clearOldLocalStorage = () => {
  // Sadece silius verilerini sil, theme gibi şeyleri koru
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.COMMENTS);
  
  // Friends key'leri temizle (prefix ile başlayanlar)
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_KEYS.FRIENDS))
    .forEach(key => localStorage.removeItem(key));
  
  localStorage.removeItem('silius_session_v2');
  
  console.log('🧹 Eski localStorage verileri temizlendi');
};
