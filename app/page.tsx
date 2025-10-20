"use client"

import { useState } from "react"
import BattleLogo from "@/components/battle-logo"
import FeatureSwiper from "@/components/feature-swiper"

export default function Home() {
  const [hoveredCTA, setHoveredCTA] = useState<string | null>(null)

  return (
    <main className="battle-bg min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center text-background bg-black">
          <div className="text-xl font-bold neon-text-cyan">⚔️BATTLE IDE</div>
          <div className="flex gap-6 items-center">
            
            
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
                boxShadow: hoveredCTA === "nav-login" ? "0 0 20px rgba(0, 255, 255, 0.6)" : "none",
              }}
              onMouseEnter={() => setHoveredCTA("nav-login")}
              onMouseLeave={() => setHoveredCTA(null)}
            >
              Sign In
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #FF007F)",
                color: "#0A0A0F",
                boxShadow: hoveredCTA === "nav-login" ? "0 0 20px rgba(0, 255, 255, 0.6)" : "none",
              }}
              onMouseEnter={() => setHoveredCTA("nav-login")}
              onMouseLeave={() => setHoveredCTA(null)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(0, 255, 255, 0.8), transparent)",
              animation: "float 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute bottom-20 right-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(255, 0, 127, 0.8), transparent)",
              animation: "float 8s ease-in-out infinite 1s",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 float">
            <BattleLogo showGlow={true} />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-balance">
            <span className="neon-text-cyan">Code.</span> <span className="neon-text-magenta">Compete.</span>{" "}
            <span className="neon-text-cyan">Conquer.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
            Join live 1v1 coding battles with real-time execution, instant feedback, and competitive rankings. Challenge
            your skills against coders worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 neon-glow"
              style={{
                background: "linear-gradient(135deg, #00FFFF, #00CCFF)",
                color: "#0A0A0F",
                boxShadow:
                  hoveredCTA === "start-battle"
                    ? "0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.5)"
                    : "0 0 20px rgba(0, 255, 255, 0.5)",
              }}
              onMouseEnter={() => setHoveredCTA("start-battle")}
              onMouseLeave={() => setHoveredCTA(null)}
            >
              Start Your First Battle
            </button>
            <button
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 border-2"
              style={{
                borderColor: "#FF007F",
                color: "#FF007F",
                background: "transparent",
                boxShadow: hoveredCTA === "watch-demo" ? "0 0 20px rgba(255, 0, 127, 0.6)" : "none",
              }}
              onMouseEnter={() => setHoveredCTA("watch-demo")}
              onMouseLeave={() => setHoveredCTA(null)}
            >
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto">
            <div className="battle-card p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold neon-text-cyan">10K+</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">Active Coders</div>
            </div>
            <div className="battle-card p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold neon-text-magenta">50K+</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">Battles Fought</div>
            </div>
            <div className="battle-card p-4 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold neon-text-cyan">24/7</div>
              <div className="text-xs md:text-sm text-gray-400 mt-1">Live Matchmaking</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-black py-16">
        <FeatureSwiper />
      </section>
      /* How It Works Section - Proper Alternating Timeline */
<section id="how-it-works" className="relative py-20 px-4 border-t border-cyan-500/20">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-4xl md:text-5xl font-bold text-center mb-20 text-white">How It Works</h2>

    <div className="relative">
      {/* Central vertical line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 via-pink-500 to-orange-500"></div>

      {/* Steps */}
      {[
        {
          step: 1,
          title: "Create Your Profile",
          description:
            "Sign up with email or OAuth and set your coding preferences. Your Elo rating starts at 1200.",
          bgColor: "from-blue-600 to-cyan-500",
        },
        {
          step: 2,
          title: "Find an Opponent",
          description:
            'Click "Find Battle" and get matched with a similarly-skilled opponent in seconds.',
          bgColor: "from-purple-600 to-pink-500",
        },
        {
          step: 3,
          title: "Code & Compete",
          description:
            "Solve the challenge in your preferred language. Real-time execution shows your progress.",
          bgColor: "from-orange-600 to-red-500",
        },
        {
          step: 4,
          title: "Compare & Learn",
          description:
            "After the battle, review both solutions side-by-side and see how you performed.",
          bgColor: "from-amber-600 to-orange-500",
        },
      ].map((item, index) => {
        const isLeft = index % 2 === 0;
        return (
          <div key={item.step} className="relative mb-12 md:mb-16 flex items-stretch">
            {/* Left side container */}
            <div className={`w-0 md:w-5/12 flex ${isLeft ? "justify-end pr-6" : "justify-start"}`}>
              {isLeft && (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6 hover:border-slate-700/80 transition-all w-full max-w-xs">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>

            {/* Center circle and line segment */}
            <div className="w-full md:w-2/12 flex flex-col items-center relative">
              {/* Circle */}
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-white bg-gradient-to-br ${item.bgColor} shadow-lg border-4 border-black relative z-10 flex-shrink-0`}
              >
                <span className="text-lg md:text-xl">{item.step}</span>
              </div>
            </div>

            {/* Right side container */}
            <div className={`w-0 md:w-5/12 flex ${!isLeft ? "justify-start pl-6" : "justify-end"}`}>
              {!isLeft && (
                <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-6 hover:border-slate-700/80 transition-all w-full max-w-xs">
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>



      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Battle?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of coders competing in real-time battles. Your next challenge awaits.
          </p>
          <button
            className="px-10 py-4 rounded-lg font-bold text-lg transition-all duration-300 neon-glow pulse-glow"
            style={{
              background: "linear-gradient(135deg, #00FFFF, #FF007F)",
              color: "#0A0A0F",
            }}
          >
            Start Battling Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Leaderboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Status</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    System Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">© 2025 Battle IDE. All rights reserved.</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
