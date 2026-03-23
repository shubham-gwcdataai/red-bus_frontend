import React from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'green' | 'orange' | 'blue' | 'gray' | 'yellow';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  red:    'bg-red-100 text-red-700',
  green:  'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  blue:   'bg-blue-100 text-blue-700',
  gray:   'bg-gray-100 text-gray-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'sm',
  className,
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full font-semibold',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variantClasses[variant],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;