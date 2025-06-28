import Link from 'next/link'
import { Globe, Users, Clock, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Globe className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/login" className="btn-primary">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Track visa progress in real-time
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Powered by the community. Get insights from real people going through the same visa journey as you.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/login" className="btn-primary text-lg px-8 py-4">
                Get Started
              </Link>
              <Link href="/login" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why choose Visa Circle?
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of applicants tracking their visa journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">
                Real updates from people going through the same process as you
              </p>
            </div>
            
            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Get instant notifications about visa processing times and milestones
              </p>
            </div>
            
            <div className="card text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Community</h3>
              <p className="text-gray-600">
                One-time payment ensures a trusted, ad-free environment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What our community says
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <p className="text-gray-600 mb-4">
                "Visa Circle helped me understand the timeline for my US visa application. The community updates were incredibly helpful!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">A</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Alex from Mumbai</p>
                  <p className="text-sm text-gray-500">US Visa Approved</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <p className="text-gray-600 mb-4">
                "Finally found a reliable source for Canadian visa timelines. The real-time updates are exactly what I needed."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">S</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Sarah from Delhi</p>
                  <p className="text-sm text-gray-500">Canada PR Approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Globe className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold">Visa Circle</span>
            </div>
            <p className="text-gray-400">
              © 2024 Visa Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 