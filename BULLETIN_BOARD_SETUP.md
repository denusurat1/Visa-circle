# Visa Circle Bulletin Board System - Setup Guide

## Overview
This document outlines the setup for Phase 2 of the Visa Circle MVP, which adds a secure bulletin board system for visa milestone sharing behind a paywall.

## Database Setup

### 1. Run the SQL Script
Execute the `visa-updates-setup.sql` file in your Supabase SQL Editor to create the required tables:

```sql
-- This will create:
-- 1. visa_updates table
-- 2. update_reactions table
-- 3. Proper foreign key constraints
-- 4. Row Level Security (RLS) policies
-- 5. Performance indexes
```

### 2. Verify Tables Created
After running the script, verify that the following tables exist in your Supabase dashboard:
- `visa_updates`
- `update_reactions`

## New Features Implemented

### 1. Bulletin Board (`/board`)
- **Location**: `app/(protected)/board/page.tsx`
- **Access**: Only authenticated users with `has_paid = true`
- **Features**:
  - Display visa updates in chronological order
  - Filter by country, visa type, and milestone
  - Like/dislike reactions on each update
  - Responsive design with Tailwind CSS

### 2. New Update Form (`/board/new`)
- **Location**: `app/(protected)/board/new/page.tsx`
- **Access**: Only authenticated users with `has_paid = true`
- **Features**:
  - Form to submit new visa milestones
  - Validation for required fields
  - Success feedback and auto-redirect
  - Consistent styling with existing pages

### 3. Authentication & Access Control
- **Location**: `lib/authUtils.ts`
- **Features**:
  - Reusable authentication check function
  - Automatic redirects for unauthorized users
  - Consistent access control across protected pages

### 4. Reusable Components
- **Location**: `app/(protected)/board/components/VisaUpdateCard.tsx`
- **Features**:
  - Modular card component for visa updates
  - Built-in reaction functionality
  - Consistent styling and behavior

## Database Schema

### visa_updates Table
```sql
CREATE TABLE visa_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  country TEXT NOT NULL,
  center TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  milestone TEXT NOT NULL,
  date_of_event DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### update_reactions Table
```sql
CREATE TABLE update_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  update_id UUID REFERENCES visa_updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(update_id, user_id)
);
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies ensure users can only:
  - Read all visa updates and reactions
  - Insert their own updates and reactions
  - Update/delete their own reactions

### Access Control
- Frontend checks for authentication and paid status
- Automatic redirects to `/login` or `/checkout` as needed
- No reliance on middleware for this functionality

## User Experience

### Navigation
- Added "Bulletin Board" link in dashboard navigation
- Consistent navigation across all protected pages
- Clear breadcrumbs and back buttons

### Filtering & Search
- Filter by country route (e.g., "India → US")
- Filter by visa type (Student, Work, Tourist, etc.)
- Search milestones by keyword
- Clear and apply filter functionality

### Reactions System
- Like/dislike buttons on each update
- Visual feedback for user's current reaction
- Real-time count updates
- Toggle functionality (click same reaction to remove)
- Switch functionality (click different reaction to change)

## Technical Implementation

### TypeScript Types
Added new interfaces in `lib/supabaseClient.ts`:
- `VisaUpdate`
- `UpdateReaction`
- `VisaUpdateWithReactions`

### Date Handling
- Uses `date-fns` for human-readable timestamps
- Proper date formatting for display
- Default date set to today in new update form

### Error Handling
- Comprehensive error catching and logging
- User-friendly error messages
- Graceful fallbacks for failed operations

## Testing Checklist

### Database
- [ ] Tables created successfully
- [ ] Foreign key constraints working
- [ ] RLS policies functioning
- [ ] Indexes created for performance

### Authentication
- [ ] Unauthenticated users redirected to `/login`
- [ ] Unpaid users redirected to `/checkout`
- [ ] Paid users can access all features

### Functionality
- [ ] Can create new visa updates
- [ ] Can view all updates on board
- [ ] Can filter updates by various criteria
- [ ] Can like/dislike updates
- [ ] Reactions persist and update correctly
- [ ] Form validation works
- [ ] Success messages display correctly

### UI/UX
- [ ] Responsive design works on mobile/desktop
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Navigation is intuitive
- [ ] Consistent styling throughout

## Next Steps

1. **Run the SQL script** in Supabase
2. **Test the authentication flow** with different user types
3. **Create some test data** to verify functionality
4. **Test the filtering and reaction features**
5. **Verify mobile responsiveness**

## Support

If you encounter any issues during setup, check:
1. Supabase console for any SQL errors
2. Browser console for JavaScript errors
3. Network tab for API request failures
4. Environment variables are properly configured 