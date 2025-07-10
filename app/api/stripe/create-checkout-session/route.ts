import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Stripe API: Starting checkout session creation...')
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

    console.log('🔄 Stripe API: Environment check - Stripe key exists:', !!stripeSecretKey)
    console.log('🔄 Stripe API: Environment check - Base URL exists:', !!baseUrl)
    console.log('🔄 Stripe API: Base URL value:', baseUrl)

    console.log('STRIPE_SECRET_KEY:', stripeSecretKey)
    console.log('NEXT_PUBLIC_BASE_URL:', baseUrl)


    // Validate environment variables
    if (!stripeSecretKey || !baseUrl) {
      console.error('❌ Stripe API: Missing required environment variables')
      console.error('❌ Stripe API: STRIPE_SECRET_KEY exists:', !!stripeSecretKey)
      console.error('❌ Stripe API: NEXT_PUBLIC_BASE_URL exists:', !!baseUrl)
      return NextResponse.json(
        { error: 'Server configuration error - missing environment variables' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    console.log('🔄 Stripe API: Stripe client initialized successfully')

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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Visa Circle Access',
              description: 'One-time payment for lifetime access to Visa Circle dashboard',
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?success=true`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      metadata: {
        userId: userId,
      },
    })

    console.log('✅ Stripe API: Checkout session created successfully')
    console.log('✅ Stripe API: Session ID:', session.id)
    console.log('✅ Stripe API: Checkout URL:', session.url)

    return NextResponse.json({ url: session.url })
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