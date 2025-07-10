# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for both local development (test mode) and production (live mode) environments.

## 🏗️ Environment Configuration

### Local Development (.env.local)

Create or update your `.env.local` file with **test** keys:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe TEST Configuration (for local development)
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here

# Local Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Production (Vercel Environment Variables)

Set these environment variables in your Vercel dashboard:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe LIVE Configuration (for production)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

## 🔧 Stripe Dashboard Setup

### 1. Test Mode (for local development)

1. Go to [Stripe Dashboard → Test Mode](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Test Secret Key** (starts with `sk_test_`)
3. Go to [Webhooks → Test Mode](https://dashboard.stripe.com/test/webhooks)
4. Click "Add endpoint"
5. Set endpoint URL to your ngrok URL: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
6. Select event: `checkout.session.completed`
7. Copy the **Webhook Signing Secret** (starts with `whsec_`)

### 2. Live Mode (for production)

1. Go to [Stripe Dashboard → Live Mode](https://dashboard.stripe.com/apikeys)
2. Copy your **Live Secret Key** (starts with `sk_live_`)
3. Go to [Webhooks → Live Mode](https://dashboard.stripe.com/webhooks)
4. Click "Add endpoint"
5. Set endpoint URL to your Vercel domain: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
6. Select event: `checkout.session.completed`
7. Copy the **Webhook Signing Secret** (starts with `whsec_`)

## 🚀 Local Development Setup

### 1. Install ngrok (if not already installed)

```bash
npm install -g ngrok
```

### 2. Start your Next.js app

```bash
npm run dev
```

### 3. In a new terminal, start ngrok

```bash
ngrok http 3000
```

### 4. Update Stripe webhook endpoint

Use the ngrok URL (e.g., `https://abcd1234.ngrok.io`) in your Stripe test webhook configuration.

## 🧪 Testing the Integration

### Local Testing (Test Mode)

1. **Start your app**: `npm run dev`
2. **Start ngrok**: `ngrok http 3000`
3. **Update webhook URL** in Stripe test dashboard
4. **Test payment flow**:
   - Go to checkout page
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Check console logs for environment detection
   - Verify webhook fires and updates `has_paid` in Supabase

### Production Testing (Live Mode)

1. **Deploy to Vercel**
2. **Update webhook URL** in Stripe live dashboard
3. **Test with real payment** (small amount)
4. **Verify webhook fires** and updates `has_paid` in Supabase

## 🔍 Debugging

### Console Logs

The application now provides detailed logging:

- **Environment Detection**: Shows whether test or live mode is active
- **Stripe Configuration**: Logs which keys and URLs are being used
- **Webhook Processing**: Detailed logs for webhook events
- **Payment Status**: Tracks payment confirmation process

### Common Issues

1. **Webhook not firing**:
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check ngrok is running (local) or Vercel is deployed (production)

2. **Environment mismatch**:
   - Ensure test keys in `.env.local`
   - Ensure live keys in Vercel environment variables
   - Check console logs for environment detection

3. **Payment not updating**:
   - Check Supabase service role key
   - Verify webhook is processing `checkout.session.completed` events
   - Check webhook logs in Stripe dashboard

## 📋 Checklist

### Local Development
- [ ] `.env.local` has test Stripe keys
- [ ] ngrok is running and accessible
- [ ] Stripe test webhook points to ngrok URL
- [ ] Test payment flow works
- [ ] Webhook updates `has_paid` in Supabase

### Production
- [ ] Vercel has live Stripe keys
- [ ] Stripe live webhook points to Vercel URL
- [ ] Live payment flow works
- [ ] Webhook updates `has_paid` in Supabase

## 🔒 Security Notes

- **Never commit** `.env.local` to git
- **Never use live keys** in local development
- **Never use test keys** in production
- **Keep webhook secrets secure**
- **Use environment-specific webhook URLs**

## 📞 Support

If you encounter issues:

1. Check console logs for detailed error messages
2. Verify environment variables are set correctly
3. Confirm webhook URLs are accessible
4. Test with Stripe's webhook testing tool
5. Check Vercel function logs for server-side errors 