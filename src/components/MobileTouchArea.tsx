import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface MobileTouchAreaProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  className?: string;
  minSwipeDistance?: number;
  minSwipeVelocity?: number;
  longPressDelay?: number;
}

const MobileTouchArea: React.FC<MobileTouchAreaProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  className = '',
  minSwipeDistance = 50,
  minSwipeVelocity = 0.3,
  longPressDelay = 500
}) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null);
  const [touchEnd, setTouchEnd] = useState<TouchPoint | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const touchAreaRef = useRef<HTMLDivElement>(null);

  const getTouchPoint = (event: React.TouchEvent): TouchPoint => ({
    x: event.touches[0].clientX,
    y: event.touches[0].clientY,
    timestamp: Date.now()
  });

  const handleTouchStart = (event: React.TouchEvent) => {
    const touchPoint = getTouchPoint(event);
    setTouchStart(touchPoint);
    setTouchEnd(null);
    setIsLongPress(false);

    // Start long press timer
    const timer = setTimeout(() => {
      setIsLongPress(true);
      onLongPress?.();
    }, longPressDelay);
    setLongPressTimer(timer);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    const touchPoint = getTouchPoint(event);
    setTouchEnd(touchPoint);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    if (!touchStart || !touchEnd) return;

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const timeDiff = touchEnd.timestamp - touchStart.timestamp;
    const velocity = Math.sqrt(distanceX ** 2 + distanceY ** 2) / timeDiff;

    // Check if it's a tap (small movement, short duration)
    const isTap = Math.abs(distanceX) < 10 && Math.abs(distanceY) < 10 && timeDiff < 300;
    
    if (isTap && !isLongPress) {
      onTap?.();
      return;
    }

    // Check if swipe distance and velocity meet minimum requirements
    if (Math.abs(distanceX) > minSwipeDistance || Math.abs(distanceY) > minSwipeDistance) {
      if (velocity > minSwipeVelocity) {
        // Determine swipe direction
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
          // Horizontal swipe
          if (distanceX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        } else {
          // Vertical swipe
          if (distanceY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  return (
    <div
      ref={touchAreaRef}
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};

export default MobileTouchArea; 