import { motion } from 'motion/react';
import type { ComponentProps } from 'react';
import { REVEAL_AMOUNT, REVEAL_MARGIN, revealVariants } from './tokens';

type RevealProps = ComponentProps<typeof motion.div>;

/** Обёртка появления блока, когда он заметно въехал в экран. */
export default function Reveal({ children, ...rest }: RevealProps) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: REVEAL_AMOUNT, margin: REVEAL_MARGIN }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
