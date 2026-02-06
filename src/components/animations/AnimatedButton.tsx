import { motion, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from '@/components/ui/button';

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode;
}

export const AnimatedButton = ({ children, className, ...props }: AnimatedButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <Button className={className} {...props}>{children}</Button>;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Button className={className} {...props}>
        {children}
      </Button>
    </motion.div>
  );
};

interface AnimatedIconButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedIconButton = ({ children, className, onClick }: AnimatedIconButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ 
        scale: 1.1,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      {children}
    </motion.button>
  );
};
