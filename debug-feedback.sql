-- Debug Feedback Posts - Run this in Supabase SQL Editor

-- 1. Check if feedback_posts table exists and has data
SELECT 
  'feedback_posts' as table_name,
  COUNT(*) as total_posts,
  MIN(created_at) as oldest_post,
  MAX(created_at) as newest_post
FROM feedback_posts;

-- 2. Show all feedback posts with details
SELECT 
  id,
  user_id,
  country,
  milestone,
  date_of_event,
  note,
  created_at
FROM feedback_posts
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if feedback_reactions table exists and has data
SELECT 
  'feedback_reactions' as table_name,
  COUNT(*) as total_reactions,
  COUNT(DISTINCT post_id) as posts_with_reactions,
  COUNT(DISTINCT user_id) as users_with_reactions
FROM feedback_reactions;

-- 4. Show reactions for each post
SELECT 
  fp.id as post_id,
  fp.milestone,
  fp.country,
  COUNT(fr.id) as total_reactions,
  COUNT(CASE WHEN fr.reaction = 'like' THEN 1 END) as likes,
  COUNT(CASE WHEN fr.reaction = 'dislike' THEN 1 END) as dislikes
FROM feedback_posts fp
LEFT JOIN feedback_reactions fr ON fp.id = fr.post_id
GROUP BY fp.id, fp.milestone, fp.country
ORDER BY fp.created_at DESC
LIMIT 10;

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('feedback_posts', 'feedback_reactions')
ORDER BY tablename, policyname;

-- 6. Test a simple query that should work
SELECT 
  fp.*,
  COALESCE(like_count.count, 0) as likes,
  COALESCE(dislike_count.count, 0) as dislikes
FROM feedback_posts fp
LEFT JOIN (
  SELECT post_id, COUNT(*) as count
  FROM feedback_reactions 
  WHERE reaction = 'like'
  GROUP BY post_id
) like_count ON fp.id = like_count.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as count
  FROM feedback_reactions 
  WHERE reaction = 'dislike'
  GROUP BY post_id
) dislike_count ON fp.id = dislike_count.post_id
ORDER BY fp.created_at DESC
LIMIT 5; 