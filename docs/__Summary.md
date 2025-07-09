# Visa Circle - Comprehensive Project Documentation
*A full-stack, production-ready web application for tracking visa progress in real-time, powered by the community.*

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Database Schema](#database-schema)
6. [Authentication & Security](#authentication--security)
7. [Payment Integration](#payment-integration)
8. [API Endpoints](#api-endpoints)
9. [Pages & Routes](#pages--routes)
10. [Components](#components)
11. [Setup & Installation](#setup--installation)
12. [Environment Variables](#environment-variables)
13. [Database Setup](#database-setup)
14. [Deployment](#deployment)
15. [Testing Checklist](#testing-checklist)
16. [Troubleshooting](#troubleshooting)
17. [Development Guidelines](#development-guidelines)

---

## 🎯 Project Overview

**Visa Circle** is a community-driven platform that allows users to track and share visa application progress in real-time. The application features a paywall system where the first 100 users get free access, followed by a $1/month subscription model.

### Key Value Propositions
- **Real-time Updates**: Community-driven visa milestone tracking
- **Verified Information**: Email forwards and VISA details verification
- **Community Feedback**: Like/dislike system for content quality
- **Secure Access**: Paywall-protected dashboard with Stripe integration

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

### Dependencies
```json
{
  "@stripe/stripe-js": "^2.2.0",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.0.10",
  "@supabase/supabase-js": "^2.38.5",
  "date-fns": "^2.30.0",
  "lucide-react": "^0.294.0",
  "next": "14.0.4",
  "react": "^18",
  "react-dom": "^18",
  "stripe": "^14.7.0"
}
```

---

## 🚀 Features

### Core Features
1. **User Authentication**
   - Email/password registration and login
   - Session management with Supabase Auth
   - Protected routes with middleware

2. **Payment System**
   - Stripe integration for $1/month subscription
   - Webhook handling for payment confirmation
   - Paywall protection for dashboard access

3. **Visa Updates Bulletin Board**
   - Community-driven visa milestone sharing
   - Filter by country, visa type, and milestone
   - Like/dislike reaction system
   - Real-time updates

4. **Feedback System**
   - User feedback posts with reactions
   - Sorting by net score (likes - dislikes)
   - Modal-based submission interface

5. **User Profiles**
   - Visa type and service center information
   - Country and embassy details
   - Profile management interface

### User Experience Features
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Comprehensive loading indicators
- **Error Handling**: Graceful error management
- **Real-time Updates**: Live reaction counts and sorting
- **Access Control**: Automatic redirects based on auth/payment status

---

## 🏗 Architecture

### Project Structure
```
Visa-Circle/
├── app/
│   ├── (protected)/           # Protected routes
│   │   ├── components/
│   │   ├── dashboard/         # Bulletin board
│   │   ├── feedback/          # Feedback feed
│   │   └── profile/           # User profile
│   ├── (public)/              # Public routes
│   │   └── login/             # Authentication
│   ├── api/                   # API routes
│   │   └── stripe/            # Payment endpoints
│   ├── auth/                  # Auth callbacks
│   ├── checkout/              # Payment page
│   ├── pricing/               # Pricing information
│   └── success/               # Payment success
├── lib/                       # Utility functions
├── middleware.ts              # Route protection
└── [config files]
```

### Key Libraries
- **`lib/supabaseClient.ts`**: Database client and TypeScript types
- **`lib/authUtils.ts`**: Authentication utilities
- **`lib/protectRoute.ts`**: Route protection helpers
- **`lib/stripe.ts`**: Stripe configuration

---

## 🗄 Database Schema

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  has_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. visa_updates
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

#### 3. update_reactions
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

#### 4. feedback_posts
```sql
CREATE TABLE feedback_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  country TEXT NOT NULL,
  milestone TEXT NOT NULL,
  date_of_event DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5. feedback_reactions
```sql
CREATE TABLE feedback_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feedback_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

#### 6. user_profiles
```sql
CREATE TABLE user_profiles (
  user_id UUID REFERENCES users(id) PRIMARY KEY,
  visa_type TEXT,
  service_center TEXT,
  country TEXT,
  embassy TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Triggers
```sql
-- Auto-create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, has_paid)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Performance Indexes
- `idx_visa_updates_user_id` - User-specific queries
- `idx_visa_updates_created_at` - Chronological sorting
- `idx_visa_updates_country` - Country filtering
- `idx_feedback_posts_user_id` - User-specific queries
- `idx_feedback_posts_created_at` - Chronological sorting
- `idx_feedback_reactions_post_id` - Reaction lookups

---

## 🔐 Authentication & Security

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

#### Users Table
```sql
-- Users can insert their own data (for signup)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Visa Updates & Feedback
```sql
-- Anyone can read updates and feedback
CREATE POLICY "Anyone can read updates" ON visa_updates
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read feedback" ON feedback_posts
  FOR SELECT USING (true);

-- Authenticated users can insert their own content
CREATE POLICY "Authenticated users can insert updates" ON visa_updates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert feedback" ON feedback_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Middleware Protection
```typescript
// middleware.ts - Route protection logic
const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                        req.nextUrl.pathname.startsWith('/checkout')

if (isProtectedRoute && !session) {
  return NextResponse.redirect(new URL('/login', req.url))
}

// Check payment status for dashboard access
if (req.nextUrl.pathname.startsWith('/dashboard') && session) {
  const { data: userData } = await supabase
    .from('users')
    .select('has_paid')
    .eq('id', session.user.id)
    .single()

  if (!userData?.has_paid) {
    return NextResponse.redirect(new URL('/checkout', req.url))
  }
}
```

---

## 💳 Payment Integration

### Stripe Configuration
- **Product**: $1/month subscription
- **Webhook Events**: `checkout.session.completed`
- **Payment Flow**: One-time payment for dashboard access

### Payment Flow
1. User clicks "Proceed to Secure Checkout"
2. Stripe Checkout session created with user metadata
3. User completes payment on Stripe
4. Webhook receives `checkout.session.completed` event
5. User's `has_paid` status updated in database
6. User redirected to dashboard

### Webhook Handler
```typescript
// app/api/stripe/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId) {
        await supabase
          .from('users')
          .update({ has_paid: true })
          .eq('id', userId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }
}
```

---

## 🔌 API Endpoints

### Stripe Endpoints
- **`POST /api/stripe/create-checkout-session`**: Create payment session
- **`POST /api/stripe/webhook`**: Handle payment confirmations

### Authentication Endpoints
- **`/auth/callback`**: Supabase auth callback handling

---

## 📱 Pages & Routes

### Public Routes
- **`/`**: Homepage with hero section and testimonials
- **`/pricing`**: Pricing tiers (free for first 100, then $1/month)
- **`/login`**: Authentication page (login/signup)
- **`/checkout`**: Payment page
- **`/success`**: Payment success confirmation

### Protected Routes
- **`/dashboard`**: Main bulletin board with visa updates
- **`/dashboard/new`**: Add new visa milestone
- **`/feedback`**: Feedback feed with reactions
- **`/profile`**: User profile management

### Route Protection
- **Authentication Required**: All protected routes
- **Payment Required**: Dashboard and feedback access
- **Automatic Redirects**: Login → Checkout → Dashboard flow

---

## 🧩 Components

### Core Components
- **`Navbar.tsx`**: Navigation with auth status
- **`VisaUpdateCard.tsx`**: Individual visa update display
- **`FeedbackCard.tsx`**: Individual feedback post display

### Utility Components
- **Loading Spinners**: Consistent loading states
- **Error Boundaries**: Graceful error handling
- **Modal Components**: Feedback submission interface

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account

### Installation Steps
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd visa-circle
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` with required variables

4. **Database Setup**
   Run SQL scripts in Supabase

5. **Development Server**
   ```bash
   npm run dev
   ```

---

## 🔧 Environment Variables

### Required Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Environment-Specific Configurations
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`
- **Staging**: `https://staging.your-domain.com`

---

## 🗄 Database Setup

### Setup Scripts
1. **`database-setup.sql`**: Core tables and RLS policies
2. **`visa-updates-setup.sql`**: Bulletin board system
3. **`feedback-setup.sql`**: Feedback system
4. **`profile-setup.sql`**: User profiles

### Setup Order
1. Run core database setup
2. Enable RLS on all tables
3. Create database triggers
4. Add performance indexes
5. Test authentication flow

### Verification Steps
- [ ] Tables created successfully
- [ ] Foreign key constraints working
- [ ] RLS policies functioning
- [ ] Triggers working correctly
- [ ] Indexes created for performance

---

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**
   - Add all required env vars in Vercel dashboard
   - Ensure production URLs are correct

3. **Deploy**
   - Vercel auto-detects Next.js
   - Automatic deployments on push

### Alternative Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with database
- **AWS Amplify**: Enterprise-grade hosting
- **DigitalOcean App Platform**: Scalable hosting

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] Stripe webhook endpoint updated
- [ ] Domain and SSL configured
- [ ] Performance monitoring enabled

---

## 🧪 Testing Checklist

### Database Testing
- [ ] Tables created successfully
- [ ] Foreign key constraints working
- [ ] CASCADE DELETE functioning
- [ ] Unique constraints preventing duplicates
- [ ] RLS policies functioning
- [ ] Indexes created for performance

### Authentication Testing
- [ ] User registration works
- [ ] User login works
- [ ] Session persistence works
- [ ] Logout functionality works
- [ ] Protected route access control
- [ ] Payment status checks

### Feature Testing
- [ ] Visa updates creation and display
- [ ] Feedback posts creation and display
- [ ] Reaction system (like/dislike)
- [ ] Toggle and switch reaction functionality
- [ ] Filtering and sorting features
- [ ] Form validation and error handling

### Payment Testing
- [ ] Stripe checkout session creation
- [ ] Payment completion flow
- [ ] Webhook handling
- [ ] User payment status updates
- [ ] Paywall protection

### UI/UX Testing
- [ ] Responsive design on mobile/desktop
- [ ] Loading states display correctly
- [ ] Error states handled gracefully
- [ ] Navigation is intuitive
- [ ] Consistent styling throughout
- [ ] Accessibility compliance

---

## 🔧 Troubleshooting

### Common Issues

#### Database Issues
1. **"column does not exist"**
   - Solution: Run the appropriate SQL setup script
   - Check table structure in Supabase dashboard

2. **RLS Policy Errors**
   - Verify policies are correctly applied
   - Check user authentication status
   - Test with authenticated vs unauthenticated users

#### Authentication Issues
1. **Session Not Persisting**
   - Check Supabase configuration
   - Verify environment variables
   - Clear browser cookies and retry

2. **Protected Route Access**
   - Verify middleware configuration
   - Check user payment status
   - Ensure proper redirect logic

#### Payment Issues
1. **Webhook Not Receiving Events**
   - Verify webhook endpoint URL
   - Check webhook secret configuration
   - Test with Stripe CLI

2. **Payment Status Not Updating**
   - Check webhook handler logic
   - Verify database update queries
   - Check user ID mapping

### Debug Steps
1. **Check Supabase Console**
   - SQL errors and query logs
   - Authentication events
   - Real-time subscriptions

2. **Check Browser Console**
   - JavaScript errors
   - Network request failures
   - Authentication state

3. **Check Network Tab**
   - API request/response details
   - Webhook delivery status
   - Authentication flow

4. **Environment Verification**
   - All required variables set
   - Correct URLs for environment
   - API keys valid and active

---

## 📝 Development Guidelines

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

### Git Workflow
1. **Feature Branches**: Create for new features
2. **Commit Messages**: Descriptive and conventional
3. **Pull Requests**: Required for main branch
4. **Testing**: All features must pass tests

### Performance Considerations
- **Database Queries**: Optimized with proper indexes
- **Frontend**: Efficient state management
- **Images**: Optimized and responsive
- **Bundle Size**: Minimal dependencies

### Security Best Practices
- **Environment Variables**: Never commit secrets
- **Input Validation**: Client and server-side
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Sanitize user inputs
- **CSRF Protection**: Implemented via Supabase

---

## 📞 Support & Resources

### Documentation
- **README.md**: Project overview and quick start
- **Setup Guides**: Detailed feature implementation
- **SQL Scripts**: Database schema and policies

### Contact Information
- **Email**: support@visacircle.com
- **Repository Issues**: GitHub issue tracker
- **Documentation**: Project wiki and guides

### External Resources
- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Documentation**: https://stripe.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## 📄 License

This project is licensed under the MIT License.

---

*Last Updated: [Current Date]*
*Version: 1.0.0*