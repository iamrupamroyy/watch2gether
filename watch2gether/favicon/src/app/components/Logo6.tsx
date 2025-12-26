export function Logo6() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Retro TV with antenna */}
      <div className="relative">
        {/* TV body */}
        <div className="w-36 h-28 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-2xl border-8 border-gray-800 relative">
          {/* Screen */}
          <div className="absolute inset-4 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg flex items-center justify-center overflow-hidden">
            <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-1"></div>
          </div>
          
          {/* Control knobs */}
          <div className="absolute -right-3 top-8 flex flex-col gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-gray-800"></div>
            <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-gray-800"></div>
          </div>
          
          {/* Stand */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-800 rounded-b-lg"></div>
        </div>
        
        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="relative w-0 h-8">
            <div className="absolute bottom-0 left-0 w-1 h-8 bg-gray-800 transform -rotate-20 origin-bottom"></div>
            <div className="absolute bottom-0 left-0 w-1 h-8 bg-gray-800 transform rotate-20 origin-bottom"></div>
            {/* Signal waves */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="w-8 h-8 border-2 border-orange-500 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
        
        {/* "2" badge */}
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10">
          <span className="text-white font-bold text-lg">2</span>
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline gap-0 mt-6">
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
