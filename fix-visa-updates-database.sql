-- Fix for Visa Updates Database - Run this in your Supabase SQL Editor
-- This will create the missing update_reactions table and fix the relationship

-- 1. First, check if visa_updates table exists and has the right structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'visa_updates'
) as visa_updates_exists;

-- 2. Create the update_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.update_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(update_id, user_id)
);

-- 3. Add foreign key constraints if they don't exist
DO $$ 
BEGIN
  -- Add foreign key to visa_updates if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'update_reactions_update_id_fkey'
  ) THEN
    ALTER TABLE public.update_reactions 
    ADD CONSTRAINT update_reactions_update_id_fkey 
    FOREIGN KEY (update_id) REFERENCES public.visa_updates(id) ON DELETE CASCADE;
  END IF;
  
  -- Add foreign key to users if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'update_reactions_user_id_fkey'
  ) THEN
    ALTER TABLE public.update_reactions 
    ADD CONSTRAINT update_reactions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END $$;

-- 4. Enable Row Level Security
ALTER TABLE public.update_reactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read update reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can insert update reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can update own reactions" ON public.update_reactions;
DROP POLICY IF EXISTS "Authenticated users can delete own reactions" ON public.update_reactions;

-- 6. Create RLS policies
CREATE POLICY "Anyone can read update reactions" ON public.update_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert update reactions" ON public.update_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own reactions" ON public.update_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own reactions" ON public.update_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Grant permissions
GRANT ALL ON public.update_reactions TO anon, authenticated;

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_update_reactions_update_id ON public.update_reactions(update_id);
CREATE INDEX IF NOT EXISTS idx_update_reactions_user_id ON public.update_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_update_reactions_type ON public.update_reactions(type);

-- 9. Verify the setup
SELECT 
  'update_reactions table created successfully' as status,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'update_reactions';

-- 10. Test the relationship
SELECT 
  'Foreign key relationship test' as test_name,
  COUNT(*) as constraint_count
FROM information_schema.table_constraints 
WHERE table_name = 'update_reactions' 
AND constraint_type = 'FOREIGN KEY'; 