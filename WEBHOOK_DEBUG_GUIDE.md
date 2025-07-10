# Webhook Debugging Guide

This guide helps you debug webhook issues and ensure payments are properly processed.

## 🔍 **Quick Debugging Steps**

### 1. **Check Stripe Dashboard**
- Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
- Click your webhook endpoint
- Check "Events" tab for recent deliveries
- Look for `checkout.session.completed` events
- Check if they're marked as "successful" or "failed"

### 2. **Check Vercel Function Logs**
- Go to Vercel Dashboard → Your Project → Functions
- Look for `/api/stripe/webhook` function
- Check recent invocations and their logs
- Look for these log messages:
  - `🔄 Webhook: Received webhook request`
  - `✅ Webhook: Event verified successfully`
  - `✅ Webhook: User payment status updated successfully`

### 3. **Check Supabase Database**
- Go to Supabase Dashboard → Table Editor
- Open `users` table
- Find your user by ID
- Check if `has_paid` is `true` and `updated_at` is recent

## 🧪 **Local Testing**

### Using the Test Script
```bash
# Test with your user ID
node scripts/test-webhook.js YOUR_USER_ID

# Test with specific session ID
node scripts/test-webhook.js YOUR_USER_ID cs_test_123456
```

### Using Stripe CLI (if installed)
```bash
# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

### Manual Testing from Success Page
1. Complete a test payment
2. On success page, click "Test Webhook (Debug)"
3. Check browser console for results
4. Click "Check Payment Status Manually"

## 🚨 **Common Issues & Solutions**

### Issue: Webhook Not Firing
**Symptoms:**
- No webhook events in Stripe dashboard
- No function logs in Vercel

**Solutions:**
1. Check webhook URL is correct in Stripe
2. Ensure webhook endpoint is accessible (ngrok for local, Vercel for production)
3. Verify webhook secret matches environment variables

### Issue: Signature Verification Failed
**Symptoms:**
- `❌ Webhook: Signature verification failed` in logs
- Webhook events marked as "failed" in Stripe

**Solutions:**
1. Check `STRIPE_WEBHOOK_SECRET` matches the one in Stripe dashboard
2. Ensure you're using the correct webhook secret for test/live mode
3. Verify webhook URL is correct

### Issue: User Not Found
**Symptoms:**
- `❌ Webhook: Error checking existing user` in logs
- User ID not found in Supabase

**Solutions:**
1. Check user ID is being passed correctly in checkout session metadata
2. Verify user exists in Supabase `users` table
3. Check Supabase service role key has proper permissions

### Issue: Update Failed
**Symptoms:**
- `❌ Webhook: Error updating user payment status` in logs
- `has_paid` not updated in Supabase

**Solutions:**
1. Check Supabase service role key permissions
2. Verify `users` table schema (ensure `has_paid` and `updated_at` columns exist)
3. Check for RLS (Row Level Security) policies blocking updates

## 📋 **Environment Checklist**

### Local Development
- [ ] `.env.local` has test Stripe keys (`sk_test_...`)
- [ ] `.env.local` has test webhook secret (`whsec_...`)
- [ ] ngrok is running and accessible
- [ ] Stripe test webhook points to ngrok URL
- [ ] Supabase service role key has proper permissions

### Production (Vercel)
- [ ] Vercel has live Stripe keys (`sk_live_...`)
- [ ] Vercel has live webhook secret (`whsec_...`)
- [ ] Stripe live webhook points to Vercel URL
- [ ] Supabase service role key has proper permissions

## 🔧 **Log Analysis**

### Successful Webhook Flow
```
🔄 Webhook: Received webhook request at 2024-01-01T12:00:00.000Z
🔄 Webhook: Environment: test
🔄 Webhook: Test mode: true
🔄 Webhook: Secret key prefix: sk_test...
🔄 Webhook: Webhook secret prefix: whsec_...
🔄 Webhook: Request body length: 1234
🔄 Webhook: Signature present: true
🔄 Webhook: Attempting to verify signature...
✅ Webhook: Event verified successfully
✅ Webhook: Event type: checkout.session.completed
✅ Webhook: Event ID: evt_123456
🔄 Webhook: Processing checkout.session.completed event
🔄 Webhook: User ID from metadata: user_123
✅ Webhook: User found
✅ Webhook: Current has_paid status: false
🔄 Webhook: Updating user payment status for user: user_123
✅ Webhook: User payment status updated successfully
✅ Webhook: Verified update - has_paid is now: true
✅ Webhook: Processing completed in 150ms
✅ Webhook: Webhook processed successfully
```

### Failed Webhook Flow
```
🔄 Webhook: Received webhook request at 2024-01-01T12:00:00.000Z
❌ Webhook: Signature verification failed
❌ Webhook: Error message: No signatures found matching the expected signature
❌ Webhook: Expected webhook secret prefix: whsec_...
```

## 🆘 **Getting Help**

If you're still having issues:

1. **Collect logs:**
   - Stripe webhook event details (success/failure, error message)
   - Vercel function logs for `/api/stripe/webhook`
   - Browser console logs from success page

2. **Check environment:**
   - Confirm which environment you're testing (test/live)
   - Verify all environment variables are set correctly
   - Ensure webhook URLs are accessible

3. **Test manually:**
   - Use the test script: `node scripts/test-webhook.js YOUR_USER_ID`
   - Use the manual check buttons on the success page
   - Check Supabase directly for user payment status 