import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

export const AnimatedText = ({ 
  children, 
  className, 
  delay = 0,
  as = 'p' 
}: AnimatedTextProps) => {
  const prefersReducedMotion = useReducedMotion();
  const Component = motion[as];

  if (prefersReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Component
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

interface AnimatedHeadingProps {
  children: string;
  className?: string;
  delay?: number;
}

export const AnimatedHeading = ({ children, className, delay = 0 }: AnimatedHeadingProps) => {
  const prefersReducedMotion = useReducedMotion();
  const words = children.split(' ');

  if (prefersReducedMotion) {
    return <h2 className={className}>{children}</h2>;
  }

  return (
    <motion.h2
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                duration: 0.4, 
                delay: delay + index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94]
              }
            }
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.h2>
  );
};
