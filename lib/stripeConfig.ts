// Stripe Configuration Utility
// This file provides environment detection and validation for Stripe integration

export interface StripeConfig {
  isTestMode: boolean
  secretKey: string
  webhookSecret: string
  baseUrl: string
  environment: 'test' | 'live'
}

export function getStripeConfig(): StripeConfig {
  const secretKey = process.env.STRIPE_SECRET_KEY!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  // Detect environment based on Stripe key prefix
  const isTestMode = secretKey.startsWith('sk_test_')
  const environment = isTestMode ? 'test' : 'live'
  
  // Determine base URL
  let baseUrl: string
  
  if (process.env.VERCEL_URL) {
    // Production on Vercel
    baseUrl = `https://${process.env.VERCEL_URL}`
  } else {
    // Local development
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
  
  // Validate environment variables
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is required')
  }
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is required')
  }
  
  if (!baseUrl) {
    throw new Error('Base URL could not be determined')
  }
  
  // Log configuration for debugging
  console.log('🔧 Stripe Config: Environment detected:', environment)
  console.log('🔧 Stripe Config: Test mode:', isTestMode)
  console.log('🔧 Stripe Config: Base URL:', baseUrl)
  console.log('🔧 Stripe Config: Secret key prefix:', secretKey.substring(0, 7) + '...')
  console.log('🔧 Stripe Config: Webhook secret prefix:', webhookSecret.substring(0, 7) + '...')
  
  return {
    isTestMode,
    secretKey,
    webhookSecret,
    baseUrl,
    environment
  }
}

export function validateStripeEnvironment(): void {
  try {
    const config = getStripeConfig()
    
    // Additional validation
    if (process.env.NODE_ENV === 'production' && config.isTestMode) {
      console.warn('⚠️ WARNING: Using test keys in production environment!')
    }
    
    if (process.env.NODE_ENV === 'development' && !config.isTestMode) {
      console.warn('⚠️ WARNING: Using live keys in development environment!')
    }
    
    console.log('✅ Stripe Config: Environment validation passed')
  } catch (error) {
    console.error('❌ Stripe Config: Environment validation failed:', error)
    throw error
  }
}

// Helper function to get webhook URL for current environment
export function getWebhookUrl(): string {
  const config = getStripeConfig()
  return `${config.baseUrl}/api/stripe/webhook`
}

// Helper function to get success/cancel URLs
export function getCheckoutUrls(): { successUrl: string; cancelUrl: string } {
  const config = getStripeConfig()
  return {
    successUrl: `${config.baseUrl}/success?success=true`,
    cancelUrl: `${config.baseUrl}/checkout?canceled=true`
  }
} 