'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState('')
  const router = useRouter()

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Supabase connection test failed:', error)
        } else {
          console.log('Supabase connection test successful')
        }
      } catch (err) {
        console.error('Supabase connection test error:', err)
      }
    }
    
    testConnection()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotification('')

    // Validate password for signup
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        console.log("Trying to log in with", email)
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          console.error("Login error:", error)
          throw error
        }
      } else {
        console.log("Trying to sign up with", email)
        
        // Add more detailed logging for signup
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Password length:", password.length)
        
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        
        if (error) {
          console.error("Signup error details:", {
            message: error.message,
            status: error.status,
            name: error.name
          })
          throw error
        }

        console.log("Signup response:", signUpData)

        // Handle different signup scenarios
        if (signUpData.user && !signUpData.session) {
          // Email confirmation required
          console.log("Email confirmation required")
          setNotification('Please check your email for a confirmation link to activate your account.')
          setLoading(false)
          return
        }

        if (signUpData.user) {
          console.log("Signup successful, user ID:", signUpData.user.id)
          
          // Try to create user record in users table
          // (This will fail gracefully if a trigger already handles it)
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: signUpData.user.id,
              email: signUpData.user.email,
              has_paid: false,
            })

          if (insertError) {
            console.log("User record insert result:", insertError.message)
            // If it's a duplicate key error, that means a trigger already created the record
            // If it's any other error, we'll still continue and let the flow handle it
            if (!insertError.message.includes('duplicate key') && 
                !insertError.message.includes('already exists')) {
              console.warn("Non-duplicate error during user creation:", insertError.message)
            }
          } else {
            console.log("User record created successfully")
          }
        } else {
          console.log("No user data in signup response")
        }
      }

      console.log("Auth Success")
      
      console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

      // Check if user has paid access and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("Checking user access for ID:", user.id)
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('has_paid')
          .eq('id', user.id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          
          // Check if it's a table not found error
          if (userError.code === 'PGRST116' || userError.message.includes('relation "users" does not exist')) {
            setError('Database setup incomplete. Please contact support.')
            setLoading(false)
            return
          }
          
          // Check if it's an RLS policy issue
          if (userError.code === 'PGRST301' || userError.message.includes('new row violates row-level security policy')) {
            setError('Access denied. Please contact support.')
            setLoading(false)
            return
          }
        }

        console.log("User has_paid?", userData?.has_paid)

        // Redirect based on payment status
        if (userData?.has_paid) {
          router.push('/dashboard')
        } else {
          console.log("Redirecting to checkout page")
          router.push('/checkout')
        }
      } else {
        console.log("User object not found")
      }
    } catch (error: any) {
      console.error("Full error object:", error)
      
      // Provide more specific error messages
      if (error.message) {
        setError(error.message)
      } else if (error.error_description) {
        setError(error.error_description)
      } else if (typeof error === 'string') {
        setError(error)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <Globe className="h-12 w-12 text-primary-600" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {isLogin ? 'Login to Visa Circle' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          {/* Toggle between login and signup */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {notification && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                <div className="font-medium">Verification Required</div>
                <div className="text-sm mt-1">{notification}</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="font-medium">Error</div>
                <div className="text-sm mt-1">{error}</div>
                {error.includes('500') && (
                  <div className="text-xs mt-2 p-2 bg-red-100 rounded">
                    <strong>Troubleshooting:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      <li>Check your Supabase project is active</li>
                      <li>Verify environment variables are correct</li>
                      <li>Ensure Auth settings allow email signup</li>
                      <li>Check if email confirmation is required</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
} 