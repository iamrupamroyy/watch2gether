export function Logo2() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon - Dual screens with play buttons */}
      <div className="relative w-40 h-32">
        {/* Left screen */}
        <div className="absolute left-0 top-4 w-20 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-xl transform -rotate-6 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
        </div>
        
        {/* Right screen */}
        <div className="absolute right-0 top-4 w-20 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-xl transform rotate-6 flex items-center justify-center">
          <div className="w-0 h-0 border-l-[16px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
        </div>
        
        {/* Center connecting element (number 2) */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-12 h-12 bg-orange-500 rounded-full shadow-xl flex items-center justify-center border-4 border-white z-10">
          <span className="text-white font-bold text-xl">2</span>
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
