-- Feedback System Setup
-- Run this in your Supabase SQL Editor

-- 1. Create the feedback_posts table
CREATE TABLE IF NOT EXISTS public.feedback_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  country TEXT NOT NULL,
  milestone TEXT NOT NULL,
  date_of_event DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the feedback_reactions table
CREATE TABLE IF NOT EXISTS public.feedback_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Ensure one reaction per user per post
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.feedback_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read feedback posts" ON public.feedback_posts;
DROP POLICY IF EXISTS "Authenticated users can insert feedback posts" ON public.feedback_posts;
DROP POLICY IF EXISTS "Anyone can read feedback reactions" ON public.feedback_reactions;
DROP POLICY IF EXISTS "Authenticated users can insert feedback reactions" ON public.feedback_reactions;
DROP POLICY IF EXISTS "Authenticated users can update own feedback reactions" ON public.feedback_reactions;
DROP POLICY IF EXISTS "Authenticated users can delete own feedback reactions" ON public.feedback_reactions;

-- 5. Create RLS policies for feedback_posts table
CREATE POLICY "Anyone can read feedback posts" ON public.feedback_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert feedback posts" ON public.feedback_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Create RLS policies for feedback_reactions table
CREATE POLICY "Anyone can read feedback reactions" ON public.feedback_reactions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert feedback reactions" ON public.feedback_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own feedback reactions" ON public.feedback_reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own feedback reactions" ON public.feedback_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Grant necessary permissions
GRANT ALL ON public.feedback_posts TO anon, authenticated;
GRANT ALL ON public.feedback_reactions TO anon, authenticated;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_posts_user_id ON public.feedback_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_created_at ON public.feedback_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_country ON public.feedback_posts(country);
CREATE INDEX IF NOT EXISTS idx_feedback_posts_milestone ON public.feedback_posts(milestone);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_post_id ON public.feedback_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_user_id ON public.feedback_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reactions_reaction ON public.feedback_reactions(reaction);

-- 9. Verify the setup
SELECT 'Feedback system setup completed successfully!' as status; 