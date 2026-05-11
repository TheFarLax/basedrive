import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-base-blue focus:ring-offset-2 focus:ring-offset-base-dark',
          {
            'bg-base-blue text-white shadow-[0_0_15px_rgba(0,82,255,0.4)] hover:shadow-[0_0_25px_rgba(0,82,255,0.6)]': variant === 'primary',
            'bg-base-card border border-base-border text-white hover:bg-white/10': variant === 'secondary',
            'bg-transparent text-gray-300 hover:text-white hover:bg-white/5': variant === 'ghost',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-8 py-4 text-lg font-bold uppercase tracking-wider': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
