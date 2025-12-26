export function Logo8() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Film strip design */}
      <div className="relative">
        <div className="w-40 h-28 bg-gray-800 rounded-lg shadow-2xl p-2 relative">
          {/* Film perforations - left */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-around py-2">
            {[...Array(5)].map((_, i) => (
              <div key={`left-${i}`} className="w-2 h-3 bg-purple-600 rounded-sm"></div>
            ))}
          </div>
          
          {/* Film perforations - right */}
          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-around py-2">
            {[...Array(5)].map((_, i) => (
              <div key={`right-${i}`} className="w-2 h-3 bg-blue-600 rounded-sm"></div>
            ))}
          </div>
          
          {/* Film frames */}
          <div className="absolute inset-0 mx-5 my-2 flex gap-1">
            {/* Frame 1 */}
            <div className="flex-1 bg-gradient-to-br from-purple-500 to-purple-700 rounded flex items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1"></div>
            </div>
            
            {/* Frame 2 */}
            <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-700 rounded flex items-center justify-center">
              <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
        
        {/* Overlay badge with "2" */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-10">
          <span className="text-white font-bold text-2xl">2</span>
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
