import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';
import Spinner from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-[#d63031] hover:bg-[#b71c1c] text-white shadow-sm hover:shadow-[0_4px_14px_rgba(214,48,49,0.35)]',
  secondary: 'bg-[#1a1a2e] hover:bg-[#2d2d44] text-white',
  outline:   'border-2 border-[#d63031] text-[#d63031] hover:bg-[#d63031] hover:text-white bg-transparent',
  ghost:     'text-[#d63031] hover:bg-red-50 bg-transparent',
  danger:    'bg-red-600 hover:bg-red-700 text-white',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:  'px-3 py-1.5 text-sm rounded-md',
  md:  'px-5 py-2.5 text-sm rounded-lg',
  lg:  'px-6 py-3 text-base rounded-lg',
  xl:  'px-8 py-4 text-lg rounded-xl',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  type='button',
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-[#d63031] focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        !disabled && !isLoading && 'hover:-translate-y-0.5 active:translate-y-0',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'red' : 'white'} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;