import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

// Fade in from bottom
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// Scale up
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

// Stagger container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Card hover effect
export const cardHover: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

interface MotionSectionProps extends HTMLMotionProps<'section'> {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const MotionSection = ({ children, className, delay = 0, ...props }: MotionSectionProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
};

interface MotionDivProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}

export const MotionDiv = ({ children, className, variants = fadeInUp, ...props }: MotionDivProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({ children, className, staggerDelay = 0.1, ...props }: StaggerContainerProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
