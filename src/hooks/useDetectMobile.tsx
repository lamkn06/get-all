import { useState, useEffect } from 'react';

enum EWindowWidth {
  mobile = 480,
  tablet = 768,
  desktop = 1920,
}

export const useDetectMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < EWindowWidth.mobile);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
