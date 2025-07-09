import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  // Access environment variables only when function is called
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  // Validate environment variables
  if (!supabaseUrl || !supabaseServiceKey || !stripeSecretKey || !webhookSecret) {
    console.error('Missing required environment variables')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  })

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session.metadata?.userId

    if (!userId) {
      console.error('No userId found in session metadata')
      return NextResponse.json(
        { error: 'No userId found' },
        { status: 400 }
      )
    }

    try {
      // Update user's has_paid status
      const { error } = await supabaseAdmin
        .from('users')
        .update({ has_paid: true })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user payment status:', error)
        return NextResponse.json(
          { error: 'Failed to update user status' },
          { status: 500 }
        )
      }

      console.log(`User ${userId} payment completed successfully`)
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
} 