-- =============================================
-- SILIUS COMMUNITY PLATFORM - SUPABASE SCHEMA
-- =============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

-- 1. USERS TABLOSU (Profil bilgileri)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  "firstName" text not null,
  "lastName" text not null,
  username text unique not null,
  bio text default 'Silius''ta yeni bir macera başlıyor...',
  avatar text,
  gender text check (gender in ('male', 'female', 'transgender', 'lesbian', 'gay', 'bisexual_male', 'bisexual_female', 'prefer_not_to_say')),
  role text default 'user' check (role in ('user', 'admin')),
  "hasAcceptedTerms" boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. EVENTS TABLOSU
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  date date not null,
  location text not null,
  image text not null,
  category text not null check (category in ('club', 'rave', 'beach', 'house', 'street', 'pub', 'coffee', 'other')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. EVENT_PARTICIPANTS TABLOSU (Etkinlik katılımcıları)
create table if not exists public.event_participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

-- 4. COMMENTS TABLOSU
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. FRIENDS TABLOSU
create table if not exists public.friends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  friend_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =============================================
-- NOT: Tüm policy'ler "varsa atla" mantığıyla çalışır (idempotent)

-- USERS RLS
alter table public.users enable row level security;

DO $$ BEGIN
  CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EVENTS RLS
alter table public.events enable row level security;

DO $$ BEGIN
  CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete any event" ON public.events FOR DELETE USING (
    exists (select 1 from public.users where users.id = auth.uid() and users.role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- EVENT_PARTICIPANTS RLS
alter table public.event_participants enable row level security;

DO $$ BEGIN
  CREATE POLICY "Participants are viewable by everyone" ON public.event_participants FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can join events" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can leave events" ON public.event_participants FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- COMMENTS RLS
alter table public.comments enable row level security;

DO $$ BEGIN
  CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- FRIENDS RLS
alter table public.friends enable row level security;

DO $$ BEGIN
  CREATE POLICY "Friends are viewable by everyone" ON public.friends FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated users can add friends" ON public.friends FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can remove own friendships" ON public.friends FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- İNDEKSLER (Performans için)
-- =============================================

create index if not exists idx_events_user_id on public.events(user_id);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_date on public.events(date);
create index if not exists idx_event_participants_event_id on public.event_participants(event_id);
create index if not exists idx_event_participants_user_id on public.event_participants(user_id);
create index if not exists idx_comments_event_id on public.comments(event_id);
create index if not exists idx_friends_user_id on public.friends(user_id);
create index if not exists idx_friends_friend_id on public.friends(friend_id);

-- =============================================
-- ADMIN KULLANICI OLUŞTURMA (Opsiyonel)
-- =============================================
-- Bir kullanıcıyı admin yapmak için:
-- update public.users set role = 'admin' where email = 'admin@example.com';
