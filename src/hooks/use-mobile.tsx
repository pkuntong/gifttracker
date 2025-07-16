import { useState, useEffect } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPWA: boolean;
  isStandalone: boolean;
  isOnline: boolean;
  isLandscape: boolean;
  screenSize: {
    width: number;
    height: number;
  };
}

export const useMobile = (): MobileState => {
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isPWA: false,
    isStandalone: false,
    isOnline: navigator.onLine,
    isLandscape: window.innerWidth > window.innerHeight,
    screenSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  });

  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Check if running as PWA
      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                   window.matchMedia('(display-mode: minimal-ui)').matches ||
                   (window.navigator as any).standalone === true;
      
      // Check if app is installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Determine device type
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const isLandscape = width > height;

      setMobileState({
        isMobile,
        isTablet,
        isDesktop,
        isPWA,
        isStandalone,
        isOnline: navigator.onLine,
        isLandscape,
        screenSize: { width, height },
      });
    };

    // Initial check
    updateMobileState();

    // Listen for resize events
    window.addEventListener('resize', updateMobileState);
    
    // Listen for online/offline events
    window.addEventListener('online', () => setMobileState(prev => ({ ...prev, isOnline: true })));
    window.addEventListener('offline', () => setMobileState(prev => ({ ...prev, isOnline: false })));

    // Listen for display mode changes (PWA installation)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      updateMobileState();
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, []);

  return mobileState;
};

// Hook for PWA-specific features
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Installation failed:', error);
      return false;
    }
  };

  return {
    isInstallable,
    installApp,
  };
};

// Hook for offline functionality
export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addOfflineData = (data: any) => {
    setOfflineData(prev => [...prev, { ...data, id: Date.now() }]);
  };

  const removeOfflineData = (id: number) => {
    setOfflineData(prev => prev.filter(item => item.id !== id));
  };

  const syncOfflineData = async () => {
    if (!isOnline || offlineData.length === 0) return;

    for (const data of offlineData) {
      try {
        // Attempt to sync with server
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        removeOfflineData(data.id);
      } catch (error) {
        console.error('Failed to sync data:', error);
      }
    }
  };

  return {
    isOnline,
    offlineData,
    addOfflineData,
    removeOfflineData,
    syncOfflineData,
  };
};

// Simple mobile detection hook for backward compatibility
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${768 - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < 768)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < 768)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
