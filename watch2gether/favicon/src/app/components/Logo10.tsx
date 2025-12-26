export function Logo10() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Globe/World connection with play */}
      <div className="relative w-32 h-32">
        {/* Globe circle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl border-4 border-white flex items-center justify-center">
          {/* Latitude lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
            <ellipse cx="56" cy="56" rx="50" ry="50" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <ellipse cx="56" cy="56" rx="50" ry="30" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <ellipse cx="56" cy="56" rx="50" ry="15" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <line x1="56" y1="6" x2="56" y2="106" stroke="white" strokeWidth="1" opacity="0.2"/>
            <line x1="6" y1="56" x2="106" y2="56" stroke="white" strokeWidth="1" opacity="0.2"/>
          </svg>
          
          {/* Play button */}
          <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[13px] border-t-transparent border-b-[13px] border-b-transparent ml-1 z-10"></div>
        </div>
        
        {/* User dots around globe */}
        <div className="absolute top-2 left-8 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
        <div className="absolute top-8 right-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-8 left-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-4 right-8 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* "2" badge */}
        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-orange-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20">
          <span className="text-white font-bold text-xl">2</span>
        </div>
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
