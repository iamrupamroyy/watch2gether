export function Logo() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Logo Icon */}
      <div className="relative">
        {/* Main play button circle */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
          {/* Play triangle */}
          <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent ml-2"></div>
          
          {/* Sync circles indicator - top right */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </div>
          
          {/* User count indicator - bottom left */}
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-orange-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
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
