-- Test script to verify database setup
-- Run this after running the main setup script

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE WHEN table_name IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'posts', 'feedback');

-- 2. Check RLS policies
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
  AND tablename IN ('users', 'posts', 'feedback')
ORDER BY tablename, policyname;

-- 3. Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 4. Test table structure
\d public.users;
\d public.posts;
\d public.feedback;

-- 5. Check permissions
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'posts', 'feedback')
ORDER BY table_name, grantee; 