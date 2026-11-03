import { motion } from 'motion/react';
import type { ComponentProps } from 'react';
import { PRESS_SCALE, pressTransition } from '../../motion/tokens';

/** Кнопка с единым откликом на нажатие (scale 0.97, 120 мс) */
export default function PressButton({ type = 'button', ...rest }: ComponentProps<typeof motion.button>) {
  return <motion.button type={type} whileTap={{ scale: PRESS_SCALE }} transition={pressTransition} {...rest} />;
}
