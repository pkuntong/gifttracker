import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useMobile } from '@/hooks/use-mobile';
import MobileNavigation from './MobileNavigation';
import MobileSwipeArea from './MobileSwipeArea';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isPWA } = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    return path;
  });

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    navigate(`/${page}`);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <MobileSwipeArea
          currentPage={currentPage}
          onPageChange={handlePageChange}
        >
          <div className="flex-1 pb-16">
            {children}
          </div>
        </MobileSwipeArea>
        <MobileNavigation 
          currentPage={currentPage}
          onNavigate={handlePageChange}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout; 