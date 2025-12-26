export function Logo7() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Infinity symbol with video elements */}
      <div className="relative w-40 h-32">
        <svg width="160" height="100" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Infinity symbol */}
          <path d="M40 50 C40 30, 20 30, 20 50 C20 70, 40 70, 40 50 M40 50 C40 30, 60 30, 60 50 M60 50 C60 30, 80 30, 80 50 M80 50 C80 30, 100 30, 100 50 C100 70, 120 70, 120 50 C120 30, 100 30, 100 50 M100 50 C100 70, 80 70, 80 50 M80 50 C80 70, 60 70, 60 50" 
                stroke="url(#gradient-infinity)" 
                strokeWidth="8" 
                strokeLinecap="round"
                fill="none"/>
          
          {/* Left play button */}
          <circle cx="40" cy="50" r="16" fill="url(#gradient-play1)"/>
          <path d="M35 42 L35 58 L48 50 Z" fill="white"/>
          
          {/* Right play button */}
          <circle cx="100" cy="50" r="16" fill="url(#gradient-play2)"/>
          <path d="M95 42 L95 58 L108 50 Z" fill="white"/>
          
          {/* Center "2" badge */}
          <circle cx="70" cy="50" r="14" fill="#F97316"/>
          <circle cx="70" cy="50" r="14" fill="white" opacity="0.2"/>
          <text x="70" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">2</text>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient-infinity" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="gradient-play1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="gradient-play2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline gap-0">
        <h1 className="font-bold text-5xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Watch
        </h1>
        <span className="font-bold text-5xl text-orange-500">2</span>
        <h1 className="font-bold text-5xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          gether
        </h1>
      </div>
    </div>
  );
}
