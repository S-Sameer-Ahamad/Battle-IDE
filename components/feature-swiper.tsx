"use client"

import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCoverflow, Pagination } from "swiper/modules"
import {
  Zap,
  Target,
  BarChart3,
  Shield,
  LineChart,
  Globe2,
} from "lucide-react" // 👈 Lucide icons

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"

const features = [
  {
    icon: <Zap className="w-12 h-12 text-cyan-400" />,
    title: "Real-Time Execution",
    description:
      "See your code run instantly with live output and error feedback during battles.",
    highlight: "cyan" as const,
  },
  {
    icon: <Target className="w-12 h-12 text-pink-500" />,
    title: "Smart Matchmaking",
    description:
      "Get paired with opponents at your skill level using our advanced Elo rating system.",
    highlight: "magenta" as const,
  },
  {
    icon: <BarChart3 className="w-12 h-12 text-cyan-400" />,
    title: "Live Leaderboard",
    description:
      "Climb the global rankings and earn badges as you dominate the competition.",
    highlight: "cyan" as const,
  },
  {
    icon: <Shield className="w-12 h-12 text-pink-500" />,
    title: "Secure Execution",
    description:
      "Battle with confidence knowing your code runs in isolated, sandboxed environments.",
    highlight: "magenta" as const,
  },
  {
    icon: <LineChart className="w-12 h-12 text-cyan-400" />,
    title: "Detailed Analytics",
    description:
      "Track your progress with comprehensive stats, win rates, and performance metrics.",
    highlight: "cyan" as const,
  },
  {
    icon: <Globe2 className="w-12 h-12 text-pink-500" />,
    title: "Global Community",
    description:
      "Connect with coders worldwide, share solutions, and learn from the best.",
    highlight: "magenta" as const,
  },
]

export default function FeatureSwiper() {
  return (
    <div className="relative py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white">
          Battle-Ready Features
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Everything you need to compete at the highest level
        </p>

        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 35,
            stretch: 0,
            depth: 200,
            modifier: 2,
            slideShadows: false,
          }}
          pagination={{ clickable: true }}
          modules={[EffectCoverflow, Pagination]}
          className="featureSwiper"
        >
          {features.map((feature, index) => (
            <SwiperSlide
              key={index}
              className="!w-[330px] sm:!w-[380px] md:!w-[420px] lg:!w-[460px]"
            >
              <div
                className="relative battle-card p-8 h-[320px] sm:h-[360px] md:h-[400px] rounded-2xl group hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col justify-center items-center text-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, #1F1F2E 0%, ${
                    feature.highlight === "cyan"
                      ? "rgba(0, 255, 255, 0.2)"
                      : "rgba(255, 0, 127, 0.2)"
                  } 100%)`,
                  border: `1px solid ${
                    feature.highlight === "cyan"
                      ? "rgba(0, 255, 255, 0.3)"
                      : "rgba(255, 0, 127, 0.3)"
                  }`,
                }}
              >
                <div className="mb-5 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-base text-gray-300 leading-relaxed px-4">
                  {feature.description}
                </p>

                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 30px ${
                      feature.highlight === "cyan"
                        ? "rgba(0, 255, 255, 0.35)"
                        : "rgba(255, 0, 127, 0.35)"
                    }`,
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
