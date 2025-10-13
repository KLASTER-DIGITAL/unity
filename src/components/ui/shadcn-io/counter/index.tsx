'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps, type Transition } from 'framer-motion';

import { cn } from '../../utils';

type CounterProps = HTMLMotionProps<'div'> & {
  number: number;
  setNumber: (number: number) => void;
  className?: string;
  transition?: Transition;
};

function Counter({
  number,
  setNumber,
  className,
  transition = { type: 'spring', bounce: 0, stiffness: 300, damping: 30 },
  ...props
}: CounterProps) {
  return (
    <motion.div
      data-slot="counter"
      layout
      transition={transition}
      className={cn(
        'flex items-center gap-x-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800',
        className,
      )}
      {...props}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          onClick={() => setNumber(number - 1)}
          className="bg-white dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px] w-8 h-8 rounded-md flex items-center justify-center"
        >
          -
        </button>
      </motion.div>

      <div className="text-lg font-semibold min-w-[2rem] text-center">
        {number.toLocaleString()}
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <button
          onClick={() => setNumber(number + 1)}
          className="bg-white dark:bg-neutral-950 hover:bg-white/70 dark:hover:bg-neutral-950/70 text-neutral-950 dark:text-white text-2xl font-light pb-[3px] w-8 h-8 rounded-md flex items-center justify-center"
        >
          +
        </button>
      </motion.div>
    </motion.div>
  );
}

export { Counter, type CounterProps };
