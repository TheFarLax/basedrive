import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  glowColor?: string;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glowColor, style, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn('glass-card rounded-2xl relative overflow-hidden', className)}
        style={{
          boxShadow: glowColor ? `0 0 20px ${glowColor}, inset 0 0 10px ${glowColor}` : undefined,
          ...style
        }}
        {...props}
      />
    );
  }
);
GlassCard.displayName = 'GlassCard';
