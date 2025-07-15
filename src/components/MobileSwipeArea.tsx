import React, { useState } from 'react';
import MobileTouchArea from './MobileTouchArea';

interface MobileSwipeAreaProps {
  children: React.ReactNode;
  onPageChange?: (page: string) => void;
  currentPage?: string;
  pages?: string[];
}

const MobileSwipeArea: React.FC<MobileSwipeAreaProps> = ({
  children,
  onPageChange,
  currentPage = 'dashboard',
  pages = ['dashboard', 'gifts', 'people', 'occasions', 'analytics']
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const index = pages.indexOf(currentPage);
    return index >= 0 ? index : 0;
  });

  const handleSwipeLeft = () => {
    if (currentIndex < pages.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onPageChange?.(pages[newIndex]);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onPageChange?.(pages[newIndex]);
    }
  };

  return (
    <MobileTouchArea
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className="h-full w-full"
    >
      <div className="relative h-full w-full">
        {/* Page indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {pages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="h-full w-full">
          {children}
        </div>

        {/* Swipe hints */}
        <div className="absolute bottom-20 left-4 right-4 z-10">
          <div className="flex justify-between text-xs text-gray-400">
            {currentIndex > 0 && (
              <div className="flex items-center gap-1">
                <span>←</span>
                <span>{pages[currentIndex - 1]}</span>
              </div>
            )}
            {currentIndex < pages.length - 1 && (
              <div className="flex items-center gap-1 ml-auto">
                <span>{pages[currentIndex + 1]}</span>
                <span>→</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileTouchArea>
  );
};

export default MobileSwipeArea; 