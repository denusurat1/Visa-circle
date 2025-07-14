'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Globe, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/app/(protected)/components/Navbar'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

export default function VisaDetailsPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setLoggedIn(!!data.session)
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setLoggedIn(Boolean(session))
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      {loggedIn ? (
        <Navbar />
      ) : (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Globe className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">Visa Circle</span>
              </Link>

              <div className="flex space-x-4">
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/login?mode=signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Page Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 text-gray-900">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary-600" />
            U.S. i-130 Visa Process & Milestone Overview
          </h1>
          <p className="text-gray-700 mb-8">
            Learn what to expect at each stage of the i-130 process. Track progress with confidence and stay informed with real milestones shared by others.
          </p>

          {/* Visa Types Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Visa Types & Key Details</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-100">
                    {[
                      'Visa Type', 'Sponsor', 'Relationship', 'Marriage Length',
                      'Residency Status', 'Renewal/Conditions', 'Processing Time', 'Notes'
                    ].map(header => (
                      <th key={header} className="border px-3 py-2">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['IR1', 'U.S. Citizen', 'Spouse', '2+ years', 'Unconditional PR', '10-year validity', '15 months', 'Direct path to unconditional residency.'],
                    ['CR1', 'U.S. Citizen / LPR', 'Spouse', '< 2 years', 'Conditional PR', '2-year validity, I-751 required', '9 months+', 'File I-751 to remove conditions.'],
                    ['IR2', 'U.S. Citizen', 'Unmarried Child (<21)', 'N/A', 'Permanent Resident', '10-year validity', 'Faster', 'For children of U.S. citizens.'],
                    ['F2A', 'LPR', 'Spouse & Child (<21)', 'N/A', 'Family Preference', 'Quota-limited', '35 months', 'Longer due to caps.'],
                    ['K1', 'U.S. Citizen', 'Fiancé(e)', 'N/A', 'Nonimmigrant', '90 days + AOS', '8–11 months', 'Faster entry, longer overall path.'],
                  ].map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, i) => (
                        <td key={i} className="border px-3 py-2 align-top">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Milestones Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Key i-130 Milestones (Email/Notification Focus)</h2>
            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-100">
                    {['Milestone', 'Description', 'When You See It', 'Action'].map(header => (
                      <th key={header} className="border px-3 py-2">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Priority Date', 'USCIS receives and accepts Form I-130. Case number and PD assigned.', 'You receive Receipt Notice (Form I-797C) by mail or email/text.', 'Save PD and receipt for future reference.'],
                    ['USCIS RFE (Optional)', 'Request for more evidence by USCIS.', 'You receive RFE notice online or by mail.', 'Respond fully by deadline to avoid delays.'],
                    ['USCIS Approval', 'USCIS approves your I-130 petition.', 'You get Approval Notice (Form I-797) by mail.', 'Wait for NVC Welcome Letter if a visa is available.'],
                    ['NVC Received', 'NVC creates case and sends Welcome Letter.', 'Email or mail with CEAC login and case number.', 'Pay fees and upload DS-260, I-864, and documents.'],
                    ['NVC RFE (Optional)', 'NVC requests corrections or missing documents.', 'You receive checklist email in CEAC.', 'Fix issues and resubmit promptly.'],
                    ['Documentarily Qualified', 'NVC accepts all documents; case is complete.', 'You get DQ confirmation email.', 'Wait for interview scheduling.'],
                    ['Interview Scheduled', 'Embassy schedules your interview.', 'You receive interview appointment email.', 'Prepare documents, medical, and attend interview.'],
                    ['Visa Issued', 'Visa approved and passport returned.', 'You get notification to pick up or receive by courier.', 'Pay USCIS Immigrant Fee, enter U.S. before expiration.'],
                  ].map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, i) => (
                        <td key={i} className="border px-3 py-2 align-top">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {!loggedIn && (
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold mb-6">
                Join our growing community to track your journey, see real timelines, and get personalized insights!
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-md border border-primary-600 text-primary-600 hover:bg-primary-50 transition"
                >
                  Pricing
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-6 py-3 rounded-md bg-primary-600 text-white hover:bg-primary-700 transition"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">© 2025 Visa Circle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
