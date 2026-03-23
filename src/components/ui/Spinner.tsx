import React from 'react';
import { cn } from '@/utils/helpers';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'white' | 'gray';
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
const colorMap = {
  red:   'border-[#d63031] border-t-transparent',
  white: 'border-white border-t-transparent',
  gray:  'border-gray-400 border-t-transparent',
};

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'red' }) => (
  <div
    className={cn(
      'rounded-full border-2 animate-spin',
      sizeMap[size],
      colorMap[color]
    )}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;