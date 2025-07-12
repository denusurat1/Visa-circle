// 🧪 This is a local test utility to simulate Stripe webhooks.
// Run manually for debugging only.


import { NextRequest, NextResponse } from 'next/server'
import { getStripeConfig, validateStripeEnvironment } from '@/lib/stripeConfig'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Test Webhook: Starting webhook test...')
    
    // Validate Stripe environment
    validateStripeEnvironment()
    
    // Get Stripe configuration
    const config = getStripeConfig()
    
    console.log('🔄 Test Webhook: Environment:', config.environment)
    console.log('🔄 Test Webhook: Webhook URL:', `${config.baseUrl}/api/stripe/webhook`)

    const body = await request.json()
    const { userId, sessionId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Create a test webhook event
    const testEvent = {
      id: 'evt_test_' + Date.now(),
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: sessionId || 'cs_test_' + Date.now(),
          object: 'checkout.session',
          amount_total: 100,
          currency: 'usd',
          customer: null,
          metadata: {
            userId: userId,
            environment: config.environment
          },
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: !config.isTestMode,
      pending_webhooks: 1,
      request: {
        id: 'req_test_' + Date.now(),
        idempotency_key: null
      },
      type: 'checkout.session.completed'
    }

    console.log('🔄 Test Webhook: Created test event:', testEvent.id)
    console.log('🔄 Test Webhook: Event type:', testEvent.type)
    console.log('🔄 Test Webhook: User ID:', userId)

    // Call the actual webhook handler
    const webhookResponse = await fetch(`${config.baseUrl}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature'
      },
      body: JSON.stringify(testEvent)
    })

    console.log('🔄 Test Webhook: Webhook response status:', webhookResponse.status)
    
    const webhookResult = await webhookResponse.text()
    console.log('🔄 Test Webhook: Webhook response:', webhookResult)

    return NextResponse.json({
      success: webhookResponse.ok,
      status: webhookResponse.status,
      result: webhookResult,
      testEvent: testEvent,
      environment: config.environment
    })

  } catch (error: any) {
    console.error('❌ Test Webhook: Error:', error)
    return NextResponse.json(
      { error: `Test webhook failed: ${error.message}` },
      { status: 500 }
    )
  }
} 