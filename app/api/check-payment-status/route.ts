import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Payment Status Check: Starting...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Payment Status Check: Missing environment variables')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const body = await request.json()
    const { userId } = body

    console.log('🔄 Payment Status Check: User ID:', userId)

    if (!userId) {
      console.error('❌ Payment Status Check: User ID is required')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check user's payment status
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('id, has_paid, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Payment Status Check: Error fetching user:', error)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ Payment Status Check: User found:', {
      id: userData.id,
      has_paid: userData.has_paid,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    })

    return NextResponse.json({
      userId: userData.id,
      hasPaid: userData.has_paid,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    })

  } catch (error: any) {
    console.error('❌ Payment Status Check: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 