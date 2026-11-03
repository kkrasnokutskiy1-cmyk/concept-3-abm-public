/**
 * Авторские motion-токены. В Figma (get_motion_context) анимаций у Main-full нет,
 * поэтому всё ниже — сдержанные переходы для существующих слоёв: появление
 * секций, отклик на нажатие, смена состояния. Только transform/opacity.
 * Нажатия остаются короткими (≤ 150 мс), а появление блоков и смена состояний —
 * длиннее и с мягким замедлением, чтобы движение читалось, а не «дёргалось».
 */
import type { Transition, Variants } from 'motion/react';

/** Мягкое замедление в конце (easeOutQuint-подобная) — для появления и смены состояний */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
  press: 0.12,
  fast: 0.28,
  base: 0.42,
  reveal: 0.7,
} as const;

/** Часть блока, которая должна быть на экране, прежде чем он начнёт появляться */
export const REVEAL_AMOUNT = 0.25;
/** Нижняя граница срабатывания поднята: блок анимируется, когда уже заметно въехал в экран */
export const REVEAL_MARGIN = '0px 0px -12% 0px';

/** График сначала задерживается в зоне чтения, затем раскрывается один раз. */
export const CHART_AMOUNT = 0.65;
export const CHART_MARGIN = '-96px 0px -128px 0px';
export const CHART_DWELL_MS = 350;
export const chartTransition: Transition = { duration: 1.2, ease: [0.33, 1, 0.68, 1] };
export const chartStagger: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
};

/** Отклик на нажатие: лёгкое сжатие, без смены цвета/тени */
export const PRESS_SCALE = 0.97;
export const pressTransition: Transition = { duration: DURATION.press, ease: EASE_OUT };

/** Смена состояния внутри карточки (выбор дня, ползунок и т. п.) */
export const stateSpring: Transition = { type: 'spring', visualDuration: 0.4, bounce: 0 };

/** Появление секции при прокрутке */
export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_OUT, delayChildren: 0.08 } },
};

/** Поэтапное появление дочерних элементов (строки списков, столбики графиков) */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 10 },
  shown: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } },
};

/** Рост столбика графика снизу вверх */
export const barGrow: Variants = {
  hidden: { scaleY: 0 },
  shown: { scaleY: 1, transition: chartTransition },
};

export const chartFillGrow: Variants = {
  hidden: { scaleX: 0 },
  shown: { scaleX: 1, transition: chartTransition },
};

export const chartSegmentReveal: Variants = {
  hidden: { opacity: 0, scaleX: 0.9 },
  shown: { opacity: 1, scaleX: 1, transition: chartTransition },
};

export const chartCellReveal: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  shown: { opacity: 1, scale: 1, transition: chartTransition },
};

/** Токены прежнего прототипа (/?version=prev): src/components/screen/* */
export const motionTokens = {
  duration: {
    press: DURATION.press,
    state: DURATION.fast,
  },
  easeOut: EASE_OUT,
  easeInOut: EASE_IN_OUT,
};
