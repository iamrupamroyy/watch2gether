interface Watch2getherLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Watch2getherLogo({ size = 'large' }: Watch2getherLogoProps) {
  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-20 h-20',
      globe: 'w-20 h-20',
      text: 'text-2xl',
      badge: 'w-8 h-8',
      badgeText: 'text-sm',
      dot: 'w-2 h-2',
      border: 'border-2',
      playBorder: 'border-l-[10px] border-t-[7px] border-b-[7px]',
      gap: 'gap-2'
    },
    medium: {
      container: 'w-24 h-24',
      globe: 'w-24 h-24',
      text: 'text-3xl',
      badge: 'w-10 h-10',
      badgeText: 'text-base',
      dot: 'w-2.5 h-2.5',
      border: 'border-3',
      playBorder: 'border-l-[14px] border-t-[10px] border-b-[10px]',
      gap: 'gap-3'
    },
    large: {
      container: 'w-32 h-32',
      globe: 'w-28 h-28',
      text: 'text-5xl',
      badge: 'w-12 h-12',
      badgeText: 'text-xl',
      dot: 'w-3 h-3',
      border: 'border-4',
      playBorder: 'border-l-[18px] border-t-[13px] border-b-[13px]',
      gap: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center ${config.gap}`}>
      {/* Logo Icon - Globe/World connection with play */}
      <div className={`relative ${config.container}`}>
        {/* Globe circle */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 ${config.globe} bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl ${config.border} border-white flex items-center justify-center`}>
          {/* Latitude/Longitude lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 112 112">
            <ellipse cx="56" cy="56" rx="50" ry="50" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <ellipse cx="56" cy="56" rx="50" ry="30" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <ellipse cx="56" cy="56" rx="50" ry="15" fill="none" stroke="white" strokeWidth="1" opacity="0.2"/>
            <line x1="56" y1="6" x2="56" y2="106" stroke="white" strokeWidth="1" opacity="0.2"/>
            <line x1="6" y1="56" x2="106" y2="56" stroke="white" strokeWidth="1" opacity="0.2"/>
          </svg>
          
          {/* Play button */}
          <div className={`w-0 h-0 ${config.playBorder} border-l-white border-t-transparent border-b-transparent ml-1 z-10`}></div>
        </div>
        
        {/* User dots around globe - representing connected viewers */}
        <div className={`absolute top-2 left-8 ${config.dot} bg-orange-500 rounded-full ${config.border} border-white shadow-lg animate-pulse`}></div>
        <div className={`absolute top-8 right-4 ${config.dot} bg-orange-500 rounded-full ${config.border} border-white shadow-lg animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`absolute bottom-8 left-4 ${config.dot} bg-orange-500 rounded-full ${config.border} border-white shadow-lg animate-pulse`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-4 right-8 ${config.dot} bg-orange-500 rounded-full ${config.border} border-white shadow-lg animate-pulse`} style={{ animationDelay: '1.5s' }}></div>
        
        {/* "2" badge - representing "together" */}
        <div className={`absolute -bottom-1 -right-1 ${config.badge} bg-orange-500 rounded-full ${config.border} border-white shadow-xl flex items-center justify-center z-20`}>
          <span className={`text-white font-bold ${config.badgeText}`}>2</span>
        </div>
      </div>
      
      {/* Logo Text */}
      <div className="flex items-baseline gap-0">
        <h1 className={`font-bold ${config.text} bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
          Watch
        </h1>
        <span className={`font-bold ${config.text} text-orange-500`}>2</span>
        <h1 className={`font-bold ${config.text} bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
          gether
        </h1>
      </div>
    </div>
  );
}
