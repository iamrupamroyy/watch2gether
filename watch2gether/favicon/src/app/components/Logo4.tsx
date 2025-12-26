export function Logo4() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo Icon - Minimalist geometric design */}
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer circle */}
          <circle cx="60" cy="60" r="55" stroke="url(#gradient1)" strokeWidth="4"/>
          
          {/* Play triangle */}
          <path d="M48 35 L48 85 L85 60 Z" fill="url(#gradient2)"/>
          
          {/* Number 2 in top right */}
          <circle cx="95" cy="25" r="18" fill="#F97316"/>
          <text x="95" y="34" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">2</text>
          
          {/* Sync arrows at bottom */}
          <g transform="translate(60, 95)">
            <path d="M-10,-5 L-10,0 L-15,0 M-10,-5 L-5,-5 M10,5 L10,0 L15,0 M10,5 L5,5" 
                  stroke="url(#gradient3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M-10,-5 C-10,-10 -5,-10 0,-10 C5,-10 10,-10 10,-5 M10,5 C10,10 5,10 0,10 C-5,10 -10,10 -10,5" 
                  stroke="url(#gradient3)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </g>
          
          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333EA" />
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
