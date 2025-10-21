"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold neon-text-cyan">
            BATTLE IDE
          </Link>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
              <p>
                Battle IDE ("we", "our", or "us") operates the Battle IDE website and application. This page informs you
                of our policies regarding the collection, use, and disclosure of personal data when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Information Collection and Use</h2>
              <p>
                We collect several different types of information for various purposes to provide and improve our
                service to you.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Personal Data: Email address, username, profile information</li>
                <li>Usage Data: Browser type, IP address, pages visited, time spent</li>
                <li>Code Submissions: Your submitted code for battles and practice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Security of Data</h2>
              <p>
                The security of your data is important to us but remember that no method of transmission over the
                Internet or method of electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@battleide.com</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
