# Visa Circle

A full-stack, production-ready web application for tracking visa progress in real-time, powered by the community.

## 🚀 Features

- **Authentication**: Supabase Auth with email/password
- **Payment Integration**: Stripe one-time $1 payment for dashboard access
- **Real-time Updates**: Community-driven visa milestone tracking
- **Modern UI**: Clean, professional design with Tailwind CSS
- **Responsive**: Mobile-friendly interface
- **Production Ready**: Vercel deployment compatible

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🗄 Database Setup

### Supabase Tables

1. **users** table:
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  has_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **posts** table:
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  country TEXT NOT NULL,
  milestone TEXT NOT NULL,
  date DATE NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **feedback** table:
```sql
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can insert their own data (for signup)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read posts
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT USING (true);

-- Authenticated users can insert posts
CREATE POLICY "Authenticated users can insert posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can insert feedback
CREATE POLICY "Authenticated users can insert feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Alternative: Database Trigger (Recommended)

Instead of manually inserting user records, you can create a database trigger that automatically creates a user record when someone signs up:

```sql
-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, has_paid)
  VALUES (new.id, new.email, false);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

If you use the trigger approach, you can remove the manual user insertion code from the login page and just rely on the trigger to handle it automatically.

## 🚀 Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd visa-circle
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Copy the example above and fill in your actual values.

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔗 Stripe Webhook Setup

1. **Create a webhook endpoint** in your Stripe dashboard
2. **Set the endpoint URL** to: `https://your-domain.com/api/stripe/webhook`
3. **Select events**: `checkout.session.completed`
4. **Copy the webhook secret** and add it to your `.env.local`

## 📱 Pages

- **`/`** - Homepage with hero section and testimonials
- **`/login`** - Authentication page (login/signup)
- **`/checkout`** - Payment page for $1 access
- **`/dashboard`** - Main application with milestone tracking

## 🔐 Authentication Flow

1. User signs up/logs in
2. System checks if user has paid (`has_paid` field)
3. If not paid, redirect to `/checkout`
4. After successful payment, webhook updates `has_paid = true`
5. User can access dashboard

## 💳 Payment Flow

1. User clicks "Proceed to Secure Checkout"
2. Stripe Checkout session created with user metadata
3. User completes payment on Stripe
4. Webhook receives `checkout.session.completed` event
5. User's `has_paid` status updated in database
6. User redirected to dashboard

## 🎨 Design System

- **Colors**: Primary blue (#3b82f6), neutral grays
- **Typography**: Inter font family
- **Components**: Rounded corners, subtle shadows, hover effects
- **Layout**: Responsive grid system with Tailwind CSS

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js

### Other Platforms

The app is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@visacircle.com or create an issue in the repository. 