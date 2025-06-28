-- Visa Updates Bulletin Board System Setup
-- Run this in your Supabase SQL Editor

-- 1. Create the visa_updates table
CREATE TABLE IF NOT EXISTS public.visa_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  country TEXT NOT NULL,
  center TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  milestone TEXT NOT NULL,
  date_of_event DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the update_reactions table
CREATE TABLE IF NOT EXISTS public.update_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES public.visa_updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(update_id, user_id) -- Ensure one reaction per user per update
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.visa_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read visa updates" ON public.visa_updates;
DROP POLICY IF EXISTS "Authenticated users can insert visa updates" ON public.visa_updates;
DROP POLICY IF EXISTS "Anyone can read update reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can insert update reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can update own reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can delete own reactions" ON public.update_reactions;

-- 5. Create RLS policies for visa_updates table
CREATE POLICY "Anyone can read visa updates" ON public.visa_updates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert visa updates" ON public.visa_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create RLS policies for update_reactions table
CREATE POLICY "Anyone can read update reactions" ON public.update_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert update reactions" ON public.update_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own reactions" ON public.update_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own reactions" ON public.update_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Grant necessary permissions
GRANT ALL ON public.visa_updates TO anon, authenticated;
GRANT ALL ON public.update_reactions TO anon, authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visa_updates_user_id ON public.visa_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_visa_updates_created_at ON public.visa_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_visa_updates_country ON public.visa_updates(country);
CREATE INDEX IF NOT EXISTS idx_visa_updates_visa_type ON public.visa_updates(visa_type);
CREATE INDEX IF NOT EXISTS idx_update_reactions_update_id ON public.update_reactions(update_id);
CREATE INDEX IF NOT EXISTS idx_update_reactions_user_id ON public.update_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_update_reactions_type ON public.update_reactions(type);

-- 9. Verify the setup
SELECT 'Visa updates bulletin board setup completed successfully!' as status; 