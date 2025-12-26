export function Logo9() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Popcorn bucket with play button */}
      <div className="relative w-32 h-32">
        {/* Popcorn bucket */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 bg-gradient-to-b from-red-500 to-red-700 rounded-b-2xl shadow-xl" 
             style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
          {/* Stripes */}
          <div className="absolute inset-0 flex justify-around">
            <div className="w-1 h-full bg-white opacity-20"></div>
            <div className="w-1 h-full bg-white opacity-20"></div>
            <div className="w-1 h-full bg-white opacity-20"></div>
          </div>
        </div>
        
        {/* Popcorn pieces */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-5 h-5 bg-yellow-200 rounded-full shadow-md"></div>
          <div className="w-6 h-6 bg-yellow-100 rounded-full shadow-md -mt-2"></div>
          <div className="w-5 h-5 bg-yellow-200 rounded-full shadow-md"></div>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="w-4 h-4 bg-yellow-300 rounded-full shadow-md -ml-6"></div>
          <div className="w-5 h-5 bg-yellow-200 rounded-full shadow-md ml-8"></div>
        </div>
        
        {/* Central play button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-white z-10">
          <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
        </div>
        
        {/* "2" badge on bucket */}
        <div className="absolute bottom-6 right-2 w-10 h-10 bg-orange-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center z-20">
          <span className="text-white font-bold text-lg">2</span>
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
