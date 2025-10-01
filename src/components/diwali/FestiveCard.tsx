import React from 'react';
import { useDiwaliTheme } from '@/contexts/DiwaliThemeContext';
import { cn } from '@/lib/utils';

interface FestiveCardProps {
  children: React.ReactNode;
  className?: string;
}

export const FestiveCard: React.FC<FestiveCardProps> = ({ children, className }) => {
  const { isDiwaliTheme } = useDiwaliTheme();

  return (
    <div className={cn(
      className,
      isDiwaliTheme && 'festive-card'
    )}>
      {children}
    </div>
  );
};
