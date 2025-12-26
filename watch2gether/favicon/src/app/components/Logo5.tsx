export function Logo5() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Overlapping screens showing sync */}
      <div className="relative w-48 h-32">
        {/* Back screen */}
        <div className="absolute left-8 top-6 w-32 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg transform rotate-3 opacity-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1 opacity-60"></div>
          </div>
        </div>
        
        {/* Front screen */}
        <div className="absolute left-4 top-2 w-32 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-2xl transform -rotate-3 border-4 border-white">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[13px] border-t-transparent border-b-[13px] border-b-transparent ml-1"></div>
          </div>
          
          {/* Live indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 px-2 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
        </div>
        
        {/* Connection badge */}
        <div className="absolute right-4 bottom-0 w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center border-4 border-white z-20 transform rotate-12">
          <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline gap-0 mt-4">
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
