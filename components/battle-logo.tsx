"use client"

export default function BattleLogo({ showGlow = true }: { showGlow?: boolean }) {
  return (
    <div className="flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Megrim&display=swap');
        
        .megrim-text {
          font-family: 'Megrim', cursive;
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          -webkit-text-stroke: 0.5px currentColor;
          text-stroke: 0.5px currentColor;
        }
      `}</style>

      <div className="relative inline-flex items-center">
        {/* Enhanced glow effect with animation */}
        {showGlow && (
          <>
            <div
              className="absolute inset-0 blur-3xl opacity-60 animate-pulse"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(0, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0.3) 50%, transparent 70%)",
                transform: "scale(1.3)",
              }}
            />
            <div
              className="absolute inset-0 blur-2xl opacity-40"
              style={{
                background: "linear-gradient(90deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 127, 0.3))",
                transform: "scale(1.2)",
              }}
            />
          </>
        )}

        {/* Main logo container with premium styling */}
        <div
          className="relative flex items-center bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-full overflow-hidden shadow-2xl"
          style={{
            border: "3px solid transparent",
            backgroundImage: "linear-gradient(135deg, #000000, #1a1a1a), linear-gradient(135deg, #00FFFF, #FF007F)",
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
            boxShadow:
              "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          {/* BATTLE section with gradient text */}
          <div className="relative px-10 py-6 bg-transparent">
            <span
              className="megrim-text tracking-wider"
              style={{
                fontSize: "2.5rem",
                letterSpacing: "0.25em",
                background: "linear-gradient(135deg, #00FFFF 0%, #FF007F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 8px rgba(0, 255, 255, 0.5))",
                textShadow: "none",
              }}
            >
              BATTLE
            </span>
          </div>

          {/* Separator with gradient */}
          <div
            className="h-14 w-0.5 mx-2"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(0, 255, 255, 0.6), rgba(255, 0, 127, 0.6), transparent)",
            }}
          />

          {/* IDE section - premium pill with gradient */}
          <div
            className="relative px-10 py-6 rounded-full mx-2 my-2"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              boxShadow:
                "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              className="megrim-text tracking-wider"
              style={{
                fontSize: "2.5rem",
                letterSpacing: "0.25em",
                background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
              }}
            >
              IDE
            </span>
          </div>
        </div>

        {/* Corner accents */}
        <div
          className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg"
          style={{ borderColor: "rgba(0, 255, 255, 0.5)" }}
        />
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 rounded-br-lg"
          style={{ borderColor: "rgba(255, 0, 127, 0.5)" }}
        />
      </div>
    </div>
  )
}
