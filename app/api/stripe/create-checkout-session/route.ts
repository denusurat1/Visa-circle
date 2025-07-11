import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeConfig, validateStripeEnvironment } from '@/lib/stripeConfig'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Stripe API: Starting checkout session creation...')
    
    // Validate Stripe environment
    validateStripeEnvironment()
    
    // Get Stripe configuration
    const config = getStripeConfig()
    
    console.log('🔄 Stripe API: Using environment:', config.environment)
    console.log('🔄 Stripe API: Base URL:', config.baseUrl)
    console.log('🔄 Stripe API: Test mode:', config.isTestMode)

    const stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
    })

    console.log('✅ Stripe API: Stripe client initialized successfully')

    const body = await request.json()
    const { userId } = body

    console.log('🔄 Stripe API: Request body:', body)
    console.log('🔄 Stripe API: User ID:', userId)

    if (!userId) {
      console.error('❌ Stripe API: User ID is required but not provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Stripe API: Creating Stripe checkout session...')

    // Get checkout URLs
    const successUrl = `${config.baseUrl}/success?success=true&userId=${encodeURIComponent(userId)}`
    const cancelUrl = `${config.baseUrl}/checkout?canceled=true`
    console.log('🔄 Stripe API: Success URL:', successUrl)
    console.log('🔄 Stripe API: Cancel URL:', cancelUrl)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Visa Circle Premium Access',
              description: 'Subscription access to Visa Circle premium features',
            },
            unit_amount: 50, // $1.00 in cents (test amount)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        environment: config.environment, // Track which environment was used
      },
    })

    console.log('✅ Stripe API: Checkout session created successfully')
    console.log('✅ Stripe API: Session ID:', session.id)
    console.log('✅ Stripe API: Environment:', config.environment)
    console.log('✅ Stripe API: Success URL:', successUrl)
    console.log('✅ Stripe API: Cancel URL:', cancelUrl)
    console.log('✅ Stripe API: Checkout URL:', session.url)

    return NextResponse.json({ 
      url: session.url,
      environment: config.environment,
      sessionId: session.id
    })
  } catch (error: any) {
    console.error('❌ Stripe API: Error creating checkout session:', error)
    console.error('❌ Stripe API: Error message:', error.message)
    console.error('❌ Stripe API: Error stack:', error.stack)
    
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    )
  }
} 