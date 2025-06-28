import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set(name, value)
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          req.cookies.set(name, '')
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set(name, '', { ...options, maxAge: -1 })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Only protect dashboard and checkout routes
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                          req.nextUrl.pathname.startsWith('/checkout')

  if (isProtectedRoute && !session) {
    // Redirect to login if accessing protected route without session
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Special handling for dashboard access - check payment status
  if (req.nextUrl.pathname.startsWith('/dashboard') && session) {
    const { data: userData } = await supabase
      .from('users')
      .select('has_paid')
      .eq('id', session.user.id)
      .single()

    if (!userData?.has_paid) {
      // Redirect to checkout if user hasn't paid
      return NextResponse.redirect(new URL('/checkout', req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/post/:path*',
  ],
}
