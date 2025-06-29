# Profile Page Setup Documentation

## Overview

The Profile Page is a protected route that allows users to view and edit their account information and visa-related details. It's accessible through the navbar and provides a comprehensive user management interface with enhanced functionality including save/edit toggle, password management, and integration with other forms.

## Database Schema

### User Profiles Table

```sql
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  visa_type TEXT,
  service_center TEXT,
  country TEXT,
  embassy TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

- **View Policy**: Users can only view their own profile
- **Insert Policy**: Users can only insert their own profile
- **Update Policy**: Users can only update their own profile

## Frontend Structure

### Route Location
- **Path**: `/profile`
- **File**: `app/(protected)/profile/page.tsx`
- **Access**: Protected route requiring authentication

### Page Components

#### 1. Account Information Section (Read-only)
- **Email**: Displayed from user session (read-only)
- **Password**: Button to open password change modal with validation
- **Paid User Status**: Shows "Yes" or "No" based on `has_paid` field

#### 2. Visa Details Section (Editable with Toggle)
- **Visa Type**: Dropdown with options (IR1/CR1, K1, B1-B2)
- **US Service Center**: Dropdown with options (California, Texas)
- **Applicant's Country**: Dropdown with predefined countries
- **Consulate/Embassy**: Conditional dropdown based on selected country
- **Edit/Save Toggle**: Fields become read-only after saving, with Edit button to toggle back

### Form Validation & Behavior
- All fields are optional
- Embassy dropdown is disabled until country is selected
- Embassy options change dynamically based on country selection
- **Save/Edit Toggle**: After saving, form becomes read-only with Edit button
- **Cancel Functionality**: Cancel button resets form to last saved values

## Password Change Implementation

### Modal Interface
- **Trigger**: "Change Password" button in Account Information section
- **Fields**: New password and confirm password inputs
- **Validation**: 
  - Minimum 6 characters
  - Password confirmation match
  - Real-time error display

### Supabase Integration
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

### User Experience
- Success/error messages with auto-dismiss
- Loading states during password update
- Modal closes automatically on success

## Shared Navbar Component

### Component Location
- **File**: `components/Navbar.tsx`
- **Type**: Reusable React component with props

### Features
- **Profile Dropdown**: User icon with dropdown menu
- **Navigation Links**: Dashboard, Profile, Feedback
- **Logout Functionality**: Integrated logout with redirect
- **Responsive Design**: Mobile-friendly dropdown

### Props Interface
```typescript
interface NavbarProps {
  showNewUpdate?: boolean
  showProfile?: boolean
  showFeedback?: boolean
  showDashboard?: boolean
}
```

### Usage Across Pages
- **Dashboard**: `<Navbar showNewUpdate={true} />`
- **Feedback**: `<Navbar />`
- **Profile**: `<Navbar />`
- **New Update**: `<Navbar />`

## Form Integration with New Update Page

### Pre-fill Functionality
- **Country Field**: Pre-filled from `user_profiles.country`
- **Visa Type Field**: Pre-filled from `user_profiles.visa_type`
- **Read-only State**: Fields are disabled when profile data exists
- **User Guidance**: Helper text explains pre-filled values

### Implementation Details
```typescript
const fetchUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (data) {
    setSelectedCountry(data.country || '')
    setSelectedVisaType(data.visa_type || '')
  }
}
```

### User Experience
- Seamless integration between profile and form data
- Clear indication of pre-filled vs editable fields
- Consistent data across the application

## Supabase API Interactions

### TypeScript Types

```typescript
export interface UserProfile {
  user_id: string
  visa_type?: string
  service_center?: string
  country?: string
  embassy?: string
  updated_at?: string
}
```

### Database Operations

#### Fetch Profile
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single()
```

#### Update Profile
```typescript
const { error } = await supabase
  .from('user_profiles')
  .upsert(profileData)
  .eq('user_id', user.id)
```

#### Password Update
```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
})
```

## Auth & RLS Integration

### Authentication Check
- Uses `checkUserAccess()` utility function
- Redirects to login if not authenticated
- Fetches user data from `users` table

### Security Features
- RLS policies ensure users can only access their own profile
- All database operations are scoped to the authenticated user
- Form submissions include user ID validation
- Password changes use Supabase Auth API

## UI Navigation Design

### Navbar Integration
Profile link has been added to all protected pages:
- Dashboard (`/dashboard`)
- Feedback (`/feedback`) 
- New Update (`/dashboard/new`)
- Profile (`/profile`)

### Navigation Structure
```
Navbar
├── Logo/Brand
├── Navigation Links
│   ├── Dashboard
│   ├── New Update (conditional)
│   └── Feedback
└── Profile Dropdown
    ├── Profile
    ├── Feedback
    └── Logout
```

### Responsive Design
- Mobile-friendly layout with grid system
- Responsive form controls
- Consistent styling with existing pages
- Dropdown menu with click-outside-to-close

## Data Flow

### Initial Load
1. Check user authentication
2. Fetch user data from `users` table
3. Fetch profile data from `user_profiles` table
4. Populate form fields with existing data
5. Set edit mode based on profile existence

### Save Operation
1. Validate form data
2. Prepare profile data object
3. Upsert to database (insert or update)
4. Show success message
5. Switch to read-only mode
6. Refresh profile data

### Edit Operation
1. User clicks Edit button
2. Form fields become editable
3. Show Save/Cancel buttons
4. User can modify data or cancel

## Error Handling

### Database Errors
- Graceful handling of missing profiles
- Error logging for debugging
- User-friendly error messages

### Validation Errors
- Form validation before submission
- Required field checking
- Data type validation
- Password validation with specific requirements

### Password Change Errors
- Real-time validation feedback
- Clear error messages
- Graceful error recovery

## Integration Points

### Existing Features
- **Bulletin Board**: Profile data can be used for filtering
- **Feedback System**: User context from profile
- **Authentication**: Seamless integration with existing auth flow
- **New Update Form**: Pre-filled data from profile

### Future Enhancements
- Profile picture upload
- Additional visa-related fields
- Export profile data
- Profile completion percentage
- Integration with external visa tracking APIs

## Testing Checklist

- [ ] Profile page loads correctly
- [ ] User can edit and save visa information
- [ ] Save/edit toggle functionality works
- [ ] Password change modal opens and functions
- [ ] Account information section renders from session
- [ ] Navbar dropdown shows "Profile" correctly
- [ ] No broken functionality on other pages
- [ ] RLS security works (users can't access others' profiles)
- [ ] Responsive on desktop and mobile
- [ ] Form validation works correctly
- [ ] Success messages display properly
- [ ] New update form pre-fills from profile
- [ ] Pre-filled fields are read-only with helper text
- [ ] Cancel button resets form correctly
- [ ] Password validation works (min 6 chars, confirmation match)

## File Dependencies

### Core Files
- `app/(protected)/profile/page.tsx` - Main profile page
- `components/Navbar.tsx` - Shared navigation component
- `lib/supabaseClient.ts` - Database client and types
- `lib/authUtils.ts` - Authentication utilities

### Database Files
- `profile-setup.sql` - Database schema and RLS policies

### Updated Files
- `app/(protected)/dashboard/page.tsx` - Uses shared Navbar
- `app/(protected)/feedback/page.tsx` - Uses shared Navbar
- `app/(protected)/dashboard/new/page.tsx` - Uses shared Navbar + profile integration
- `app/(protected)/profile/page.tsx` - Uses shared Navbar + enhanced functionality

## Security Considerations

1. **RLS Policies**: All database access is protected by row-level security
2. **User Isolation**: Users can only access their own profile data
3. **Input Validation**: Form data is validated before database operations
4. **Authentication**: All profile operations require valid user session
5. **Password Security**: Password changes use Supabase Auth API
6. **CORS**: Proper CORS configuration for API endpoints
7. **XSS Prevention**: Input sanitization and proper React practices

## Performance Optimizations

1. **Indexing**: Database indexes on `user_id` and `updated_at`
2. **Caching**: Profile data is cached in component state
3. **Lazy Loading**: Profile data is loaded only when needed
4. **Efficient Queries**: Single query for profile data with proper error handling
5. **Component Reuse**: Shared Navbar reduces code duplication
6. **Conditional Rendering**: UI elements render only when needed

## Migration Notes

### From Previous Version
- All pages now use shared Navbar component
- Profile page has enhanced save/edit functionality
- Password change is now fully functional
- New update form integrates with profile data
- Improved error handling and user feedback

### Breaking Changes
- None - all existing functionality preserved
- Enhanced features are additive only 