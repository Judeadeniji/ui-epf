import React from 'react';
import { cn } from '@/lib/utils';

interface LinearProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
}

export const LinearProgressIndicator = React.forwardRef<
  HTMLDivElement,
  LinearProgressIndicatorProps
>(({ className, isLoading, ...props }, ref) => {
  if (!isLoading) {
    return null;
  }

  return (
    <>
      <div
        ref={ref}
        className={cn(
          'linear-progress-indicator-container',
          className
        )}
        {...props}
      >
        <div className="linear-progress-indicator-bar"></div>
      </div>
      <section className="absolute inset-0 z-10 bg-white/70" />
    </>
  );
});

LinearProgressIndicator.displayName = 'LinearProgressIndicator';
