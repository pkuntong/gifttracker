import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (variant === 'skeleton') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        {text && (
          <p className="mt-2 text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <div className="flex space-x-1">
          <div className={cn('bg-primary rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '0ms' }}></div>
          <div className={cn('bg-primary rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '150ms' }}></div>
          <div className={cn('bg-primary rounded-full animate-bounce', sizeClasses[size])} style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && (
          <p className="mt-3 text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 