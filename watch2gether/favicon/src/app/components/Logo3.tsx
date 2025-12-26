export function Logo3() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Connected circles representing users watching together */}
      <div className="relative w-40 h-32">
        {/* Left circle (user 1) */}
        <div className="absolute left-4 top-8 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        
        {/* Right circle (user 2) */}
        <div className="absolute right-4 top-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        
        {/* Center play button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white z-10">
          <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
        </div>
        
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <line x1="36" y1="40" x2="70" y2="64" stroke="rgb(249, 115, 22)" strokeWidth="3" strokeDasharray="5,5" />
          <line x1="104" y1="40" x2="70" y2="64" stroke="rgb(249, 115, 22)" strokeWidth="3" strokeDasharray="5,5" />
        </svg>
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
