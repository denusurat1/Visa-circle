# Database Setup Guide for Visa Circle MVP

## 🚨 Current Issue
The dashboard is not showing visa updates because the `update_reactions` table is missing from your Supabase database.

## ✅ Immediate Fix Applied
I've temporarily modified the dashboard to work without reactions. You should now see your visa updates displayed as cards.

## 🔧 Complete Database Setup

### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Visa Circle project
4. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Database Setup Script
1. Copy the entire contents of `fix-visa-updates-database.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the script

### Step 3: Verify the Setup
After running the script, you should see:
- ✅ "update_reactions table created successfully"
- ✅ "Foreign key relationship test" with constraint count > 0

### Step 4: Test the Dashboard
1. Refresh your dashboard page
2. You should now see:
   - ✅ All visa updates displayed as cards
   - ✅ Like/dislike buttons working
   - ✅ Reaction counts updating

## 📋 What the Script Does
The `fix-visa-updates-database.sql` script will:
1. Create the missing `update_reactions` table
2. Add proper foreign key relationships
3. Set up Row Level Security policies
4. Create necessary indexes
5. Grant proper permissions

## 🎯 Expected Result
After running the script, your dashboard will have full functionality:
- ✅ Display all visa updates
- ✅ Working reaction system (like/dislike)
- ✅ Proper filtering and sorting
- ✅ Real-time updates

## 🆘 If You Still Have Issues
1. Check the SQL Editor for any error messages
2. Verify that both `visa_updates` and `update_reactions` tables exist in the Table Editor
3. Make sure the foreign key constraints are properly set up

## 📞 Need Help?
If you encounter any issues during the setup, please share:
1. Any error messages from the SQL Editor
2. Screenshots of your table structure
3. The specific step where you're stuck 