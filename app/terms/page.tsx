"use client"

import Link from "next/link"

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>

          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Battle IDE, you accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on
                Battle IDE for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Disclaimer</h2>
              <p>
                The materials on Battle IDE are provided on an 'as is' basis. Battle IDE makes no warranties, expressed
                or implied, and hereby disclaims and negates all other warranties including, without limitation, implied
                warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
                intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Limitations</h2>
              <p>
                In no event shall Battle IDE or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on Battle IDE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on Battle IDE could include technical, typographical, or photographic errors.
                Battle IDE does not warrant that any of the materials on its website are accurate, complete, or current.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
