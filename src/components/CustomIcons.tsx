import React from 'react';

export function CustomAppleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5 1.07 3.29 1.07.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.69 4.04-.02.07-.43 1.44-1.39 2.86M15.97 4.17c.66-.8 1.1-1.89.98-3.17-1.1.04-2.44.73-3.22 1.64-.66.77-1.24 1.88-1.09 3.14 1.23.09 2.48-.61 3.33-1.61z"/>
    </svg>
  );
}

export function CustomAndroidIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sleek minimal Android robot SVG representation */}
      <path d="M12 4a4.5 4.5 0 00-4.5 4.5h9A4.5 4.5 0 0012 4z"/>
      {/* Eyes */}
      <circle cx="10" cy="6.8" r="0.45" fill="black" />
      <circle cx="14" cy="6.8" r="0.45" fill="black" />
      {/* Antennas */}
      <path d="M9 4.2L7.6 2.8a.4.4 0 00-.56.56l1.4 1.4a.4.4 0 00.56-.56zM15 4.2l1.4-1.4a.4.4 0 00-.56-.56l-1.4 1.4a.4.4 0 00.56.56z"/>
      {/* Droid body */}
      <path d="M7.5 9.5a1 1 0 00-1 1v6a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-6a1 1 0 00-1-1H7.5z"/>
      {/* Legs */}
      <rect x="9.5" y="18" width="1.2" height="2.5" rx="0.6" />
      <rect x="13.3" y="18" width="1.2" height="2.5" rx="0.6" />
      {/* Arms */}
      <rect x="5.8" y="10" width="1.1" height="5.5" rx="0.55" />
      <rect x="17.1" y="10" width="1.1" height="5.5" rx="0.55" />
    </svg>
  );
}
