import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getStripeConfig, validateStripeEnvironment } from '@/lib/stripeConfig'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔄 Webhook: Received webhook request at', new Date().toISOString())
  
  try {
    // Validate Stripe environment
    validateStripeEnvironment()
    
    // Get Stripe configuration
    const config = getStripeConfig()
    
    console.log('🔄 Webhook: Environment:', config.environment)
    console.log('🔄 Webhook: Test mode:', config.isTestMode)
    console.log('🔄 Webhook: Secret key prefix:', config.secretKey.substring(0, 7) + '...')
    console.log('🔄 Webhook: Webhook secret prefix:', config.webhookSecret.substring(0, 7) + '...')

    // Access Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    console.log('🔄 Webhook: Supabase URL exists:', !!supabaseUrl)
    console.log('🔄 Webhook: Service key exists:', !!supabaseServiceKey)

    // Validate Supabase environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Webhook: Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error - missing Supabase variables' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(config.secretKey, {
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

    console.log('🔄 Webhook: Request body length:', body.length)
    console.log('🔄 Webhook: Signature present:', !!signature)
    console.log('🔄 Webhook: Signature value:', signature ? signature.substring(0, 20) + '...' : 'null')

    if (!signature) {
      console.error('❌ Webhook: No signature provided')
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    let event

    try {
      console.log('🔄 Webhook: Attempting to verify signature...')
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.webhookSecret
      )
      console.log('✅ Webhook: Event verified successfully')
      console.log('✅ Webhook: Event type:', event.type)
      console.log('✅ Webhook: Event ID:', event.id)
      console.log('✅ Webhook: Environment:', config.environment)
    } catch (error: any) {
      console.error('❌ Webhook: Signature verification failed')
      console.error('❌ Webhook: Error message:', error.message)
      console.error('❌ Webhook: Error type:', error.type)
      console.error('❌ Webhook: Expected webhook secret prefix:', config.webhookSecret.substring(0, 7) + '...')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event.type === 'checkout.session.completed') {
      console.log('🔄 Webhook: Processing checkout.session.completed event')
      const session = event.data.object as any
      const userId = session.metadata?.userId
      const environment = session.metadata?.environment

      console.log('🔄 Webhook: Session metadata:', session.metadata)
      console.log('🔄 Webhook: User ID from metadata:', userId)
      console.log('🔄 Webhook: Environment from metadata:', environment)
      console.log('🔄 Webhook: Session ID:', session.id)
      console.log('🔄 Webhook: Payment status:', session.payment_status)
      console.log('🔄 Webhook: Session status:', session.status)

      if (!userId) {
        console.error('❌ Webhook: No userId found in session metadata')
        return NextResponse.json(
          { error: 'No userId found' },
          { status: 400 }
        )
      }

      // Validate environment consistency
      if (environment && environment !== config.environment) {
        console.warn('⚠️ Webhook: Environment mismatch - session:', environment, 'current:', config.environment)
      }

      try {
        console.log('🔄 Webhook: Updating user payment status for user:', userId)
        
        // First, check if user exists
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('id, has_paid, created_at, updated_at')
          .eq('id', userId)
          .single()

        if (checkError) {
          console.error('❌ Webhook: Error checking existing user:', checkError)
          console.error('❌ Webhook: Error code:', checkError.code)
          console.error('❌ Webhook: Error message:', checkError.message)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        console.log('✅ Webhook: User found')
        console.log('✅ Webhook: Current has_paid status:', existingUser.has_paid)
        console.log('✅ Webhook: User created at:', existingUser.created_at)
        console.log('✅ Webhook: User updated at:', existingUser.updated_at)

        // Update user's has_paid status
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ 
            has_paid: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (updateError) {
          console.error('❌ Webhook: Error updating user payment status:', updateError)
          console.error('❌ Webhook: Update error code:', updateError.code)
          console.error('❌ Webhook: Update error message:', updateError.message)
          return NextResponse.json(
            { error: 'Failed to update user status' },
            { status: 500 }
          )
        }

        console.log('✅ Webhook: User payment status updated successfully')
        console.log('✅ Webhook: Environment:', config.environment)
        
        // Verify the update
        const { data: updatedUser, error: verifyError } = await supabaseAdmin
          .from('users')
          .select('has_paid, updated_at')
          .eq('id', userId)
          .single()

        if (verifyError) {
          console.error('❌ Webhook: Error verifying update:', verifyError)
        } else {
          console.log('✅ Webhook: Verified update - has_paid is now:', updatedUser.has_paid)
          console.log('✅ Webhook: Updated timestamp:', updatedUser.updated_at)
        }

        const processingTime = Date.now() - startTime
        console.log('✅ Webhook: Processing completed in', processingTime, 'ms')

      } catch (error: any) {
        console.error('❌ Webhook: Error processing webhook:', error)
        console.error('❌ Webhook: Error stack:', error.stack)
        return NextResponse.json(
          { error: 'Failed to process webhook' },
          { status: 500 }
        )
      }
    } else {
      console.log('ℹ️ Webhook: Ignoring event type:', event.type)
    }

    console.log('✅ Webhook: Webhook processed successfully')
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook: Unexpected error:', error)
    console.error('❌ Webhook: Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 