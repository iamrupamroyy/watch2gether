export function Logo11() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Ticket/Movie pass design */}
      <div className="relative w-44 h-28">
        {/* Ticket shape */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-lg shadow-2xl">
          {/* Perforated edge in middle */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 flex flex-col justify-around py-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-1 h-2 bg-white rounded-full opacity-40"></div>
            ))}
          </div>
          
          {/* Left section */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1"></div>
            </div>
            <span className="text-white text-xs font-bold opacity-80">PLAY</span>
          </div>
          
          {/* Right section */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <span className="text-white text-xs font-bold opacity-80">SYNC</span>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white opacity-40 rounded-tl"></div>
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white opacity-40 rounded-tr"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white opacity-40 rounded-bl"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white opacity-40 rounded-br"></div>
        </div>
        
        {/* "2" badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-orange-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-10">
          <span className="text-white font-bold text-2xl">2</span>
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline gap-0 mt-2">
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
